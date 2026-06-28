from ultralytics import YOLO

class Detector:

    def __init__(self):
        print("Loading YOLO model...")
        self.model = YOLO("yolov8n.pt")
        print("YOLO loaded!")

    def detect(self, frame):
        return self.model(frame, verbose=False)

    def get_class_name(self, cls_id):
        return self.model.names[cls_id]