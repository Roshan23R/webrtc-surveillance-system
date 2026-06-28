import time

class AlertEngine:

    def __init__(self):
        self.person_present = False
        self.last_alert_time = 0
        self.cooldown = 10  # seconds


    def process(self, results):
        person_found = False

        for box in results[0].boxes:
            cls = int(box.cls[0])
            confidence = float(box.conf[0])

            # COCO class 0 = person
            if cls == 0 and confidence > 0.6:
                person_found = True
                break

        current_time = time.time()

        # First appearance
        if (
            person_found
            and not self.person_present
            and current_time - self.last_alert_time > self.cooldown
        ):

            self.person_present = True
            self.last_alert_time = current_time

            return {
                "type": "PERSON_DETECTED",
                "confidence": confidence,
                "timestamp": current_time,
            }

        # Person disappeared
        if not person_found:
            self.person_present = False

        return None