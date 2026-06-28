from ultralytics import YOLO

class Detector:

    def __init__(self):
        print("Loading YOLO model...")
        self.model = YOLO("yolov8n.pt")
        print("YOLO loaded!")

    def detect(self, frame):
        # imgsz=320 is ~2x faster than default 640 with minimal accuracy loss
        return self.model(frame, verbose=False, imgsz=320)

    def get_class_name(self, cls_id):
        return self.model.names[cls_id]