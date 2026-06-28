import httpx

class BackendClient:

    def __init__(self):
        self.backend_url = "http://localhost:4000"

    def send_alert(self, camera_id, alert):
        payload = {
            "cameraId": camera_id,
            "eventType": alert["type"],
            "confidence": alert["confidence"],
            "timestamp": alert["timestamp"],
        }

        try:
            response = httpx.post(
                f"{self.backend_url}/alerts",
                json=payload,
                timeout=5
            )

            print("✅ Alert sent to backend")
            return response.json()

        except Exception as e:

            print("❌ Backend Error:", e)

    def send_stats(self, camera_id, stats):
        try:
            httpx.post(
                f"{self.backend_url}/cameras/{camera_id}/stats",
                json=stats,
                timeout=1
            )
        except Exception:
            pass