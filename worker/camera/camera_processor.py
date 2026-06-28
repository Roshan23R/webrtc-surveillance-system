import cv2
import threading
import time
import asyncio
from detection.detector import Detector
from alerts.alert_engine import AlertEngine
from services.backend_client import BackendClient
from streaming.frame_buffer import FrameBuffer

class CameraProcessor:

    def __init__(self, camera_id, stream_url):
        self.camera_id = camera_id
        self.stream_url = stream_url
        self.running = False
        self.thread = None
        self.detector = Detector()
        self.alert_engine = AlertEngine()
        self.backend = BackendClient()
        self.frame_buffer = FrameBuffer()
        
        # WebRTC & Stats tracking
        self.peer_connections = set()
        self.frames_processed = 0
        self.last_stats_time = time.time()
        self.detection_timestamps = []
        self.detecting_in_window = False
        self.max_conf_in_window = 0.0

    def process_camera(self):

        cap = cv2.VideoCapture(self.stream_url)

        if not cap.isOpened():
            print(f"❌ Cannot open camera {self.camera_id}")
            return

        print(f"✅ Camera {self.camera_id} connected")
        
        self.last_stats_time = time.time()
        self.frames_processed = 0

        while self.running:

            ret, frame = cap.read()

            if not ret:
                print("Frame read failed")
                break

            self.frames_processed += 1
            current_time = time.time()

            results = self.detector.detect(frame)

            # Check for person detection in the current frame
            person_found = False
            max_conf = 0.0
            for box in results[0].boxes:
                cls = int(box.cls[0])
                conf = float(box.conf[0])
                if cls == 0 and conf > 0.6:
                    person_found = True
                    if conf > max_conf:
                        max_conf = conf

            if person_found:
                self.detecting_in_window = True
                if max_conf > self.max_conf_in_window:
                    self.max_conf_in_window = max_conf

            alert = self.alert_engine.process(results)

            if alert:
                print("🚨 ALERT GENERATED")
                self.detection_timestamps.append(current_time)
                # Send alert asynchronously to prevent processing loop freeze
                threading.Thread(
                    target=self.backend.send_alert,
                    args=(self.camera_id, alert),
                    daemon=True
                ).start()

            # Continuously update the frame buffer with current detections and boxes
            annotated = results[0].plot()
            self.frame_buffer.update(annotated)

            # Every 0.5 seconds, send performance stats to backend
            if current_time - self.last_stats_time >= 0.5:
                fps = self.frames_processed / (current_time - self.last_stats_time)
                
                # Filter rolling window of detections (last 60 seconds)
                self.detection_timestamps = [t for t in self.detection_timestamps if current_time - t <= 60.0]
                dpm = len(self.detection_timestamps)
                
                stats = {
                    "fps": round(fps, 1),
                    "dpm": dpm,
                    "detecting": self.detecting_in_window,
                    "confidence": round(self.max_conf_in_window, 2)
                }
                
                # Send stats in a daemon thread so it doesn't block the loop
                threading.Thread(
                    target=self.backend.send_stats,
                    args=(self.camera_id, stats),
                    daemon=True
                ).start()
                
                # Reset window properties
                self.detecting_in_window = False
                self.max_conf_in_window = 0.0
                
                self.frames_processed = 0
                self.last_stats_time = current_time

            if cv2.waitKey(1) & 0xFF == ord("q"):
                self.running = False

        cap.release()
        cv2.destroyAllWindows()

    def start(self):

        if self.running:
            return

        self.running = True

        self.thread = threading.Thread(
            target=self.process_camera,
            daemon=True,
        )

        self.thread.start()

    def stop(self):
        self.running = False
        
        # Safely close WebRTC peer connections on the FastAPI event loop
        try:
            loop = asyncio.get_event_loop()
            for pc in list(self.peer_connections):
                loop.call_soon_threadsafe(lambda p=pc: asyncio.create_task(p.close()))
        except Exception:
            pass
        self.peer_connections.clear()