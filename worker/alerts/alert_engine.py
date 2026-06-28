import time

class AlertEngine:

    # Seconds between alerts for the same camera
    COOLDOWN = 10

    # Consecutive detection frames required before an alert fires.
    CONFIRM_FRAMES = 3

    # Consecutive missed-detection frames before "person present" is cleared.
    GRACE_FRAMES = 5

    def __init__(self):
        self.person_present = False
        self.last_alert_time = 0
        self._confirm_count = 0   # consecutive frames with person detected
        self._miss_count = 0      # consecutive frames without person detected

    def process(self, person_found: bool, max_conf: float) -> dict | None:
        """
        Call once per detection frame.

        Args:
            person_found: True if a person box exceeded the confidence threshold.
            max_conf:     Highest confidence among detected persons (0.0 if none).

        Returns an alert dict when a new person appearance is confirmed, else None.
        """
        current_time = time.time()

        if person_found:
            self._confirm_count += 1
            self._miss_count = 0

            # Require N consecutive detection frames before triggering
            if (
                self._confirm_count >= self.CONFIRM_FRAMES
                and not self.person_present
                and current_time - self.last_alert_time > self.COOLDOWN
            ):
                self.person_present = True
                self.last_alert_time = current_time
                return {
                    "type": "PERSON_DETECTED",
                    "confidence": round(max_conf, 2),
                    "timestamp": current_time,
                }
        else:
            self._miss_count += 1
            self._confirm_count = 0
            # Allow a few missed frames before declaring person gone
            if self._miss_count >= self.GRACE_FRAMES:
                self.person_present = False

        return None