import cv2
import threading
import time
import asyncio
from detection.detector import Detector
from alerts.alert_engine import AlertEngine
from services.backend_client import BackendClient
from streaming.frame_buffer import FrameBuffer

class CameraProcessor:

    # Run YOLO detection only every Nth frame; use last results for frames in between.
    DETECT_EVERY_N_FRAMES = 3

    def __init__(self, camera_id, stream_url):
        self.camera_id = camera_id
        self.stream_url = stream_url
        self.running = False
        self.thread = None
        self.detector = Detector()
        self.alert_engine = AlertEngine()
        self.backend = BackendClient()
        self.frame_buffer = FrameBuffer()

        # Latest raw frame shared between capture thread and processing loop
        self._latest_frame = None
        self._frame_lock = threading.Lock()
        
        # WebRTC & Stats tracking
        self.peer_connections = set()
        self.frames_processed = 0
        self.last_stats_time = time.time()
        self.detection_timestamps = []
        self.detecting_in_window = False
        self.max_conf_in_window = 0.0

    # Dedicated capture thread: continuously grabs the latest frame from #
    # the stream and discards stale buffered frames. #
    def _capture_loop(self, cap):
        while self.running:
            ret = cap.grab()   
            if not ret:
                time.sleep(0.005)
                continue
            ret, frame = cap.retrieve()
            if ret:
                with self._frame_lock:
                    self._latest_frame = frame

    def process_camera(self):

        cap = cv2.VideoCapture(self.stream_url)

        if not cap.isOpened():
            print(f"❌ Cannot open camera {self.camera_id}")
            return

        # Keep only 1 frame in the internal OpenCV buffer to minimise latency
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

        print(f"✅ Camera {self.camera_id} connected")
        
        self.last_stats_time = time.time()
        self.frames_processed = 0

        # Start the dedicated capture thread so frame-reading never stalls
        capture_thread = threading.Thread(target=self._capture_loop, args=(cap,), daemon=True)
        capture_thread.start()

        last_results = None
        frame_counter = 0

        while self.running:

            # Grab the most-recent decoded frame (non-blocking)
            with self._frame_lock:
                frame = self._latest_frame

            if frame is None:
                time.sleep(0.005)
                continue

            self.frames_processed += 1
            current_time = time.time()
            frame_counter += 1

            # ---- Detection (throttled) -------------------------------- #
            if frame_counter % self.DETECT_EVERY_N_FRAMES == 0 or last_results is None:
                last_results = self.detector.detect(frame)

                # Single scan: find highest-confidence person above threshold
                CONF_THRESHOLD = 0.6
                person_found = False
                max_conf = 0.0
                for box in last_results[0].boxes:
                    if int(box.cls[0]) == 0:          # COCO class 0 = person
                        conf = float(box.conf[0])
                        if conf > CONF_THRESHOLD and conf > max_conf:
                            person_found = True
                            max_conf = conf

                # Update stats window
                if person_found:
                    self.detecting_in_window = True
                    if max_conf > self.max_conf_in_window:
                        self.max_conf_in_window = max_conf

                # Alert engine receives pre-computed results — no duplicate scan
                alert = self.alert_engine.process(person_found, max_conf)

                if alert:
                    print("🚨 ALERT GENERATED")
                    self.detection_timestamps.append(current_time)
                    threading.Thread(
                        target=self.backend.send_alert,
                        args=(self.camera_id, alert),
                        daemon=True
                    ).start()

            # Always annotate and push the latest frame (reuses last boxes)
            annotated = last_results[0].plot()
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
                
                threading.Thread(
                    target=self.backend.send_stats,
                    args=(self.camera_id, stats),
                    daemon=True
                ).start()
                
                self.detecting_in_window = False
                self.max_conf_in_window = 0.0
                self.frames_processed = 0
                self.last_stats_time = current_time

        cap.release()

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