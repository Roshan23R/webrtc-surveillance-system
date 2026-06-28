# Worker Service

Python worker for real-time camera processing, person detection (YOLO), alert generation, and WebRTC stream negotiation.

## What It Does

- Starts/stops camera processing jobs
- Reads frames from RTSP/webcam/IP-camera sources via a dedicated capture thread
- Runs YOLO detection on frames (throttled — every 3rd frame by default)
- Generates person-detected alerts
- Sends alerts and stats to backend
- Serves WebRTC SDP answer for live streaming

## Project Structure

- `main.py` - FastAPI app + worker HTTP routes
- `camera/camera_manager.py` - starts/stops processors per camera
- `camera/camera_processor.py` - frame loop, detection, stats, alert pipeline
- `detection/detector.py` - YOLO model loading and inference
- `alerts/alert_engine.py` - temporal confirmation, cooldown, and grace-period logic
- `streaming/webrtc_manager.py` - WebRTC offer/answer handling
- `services/backend_client.py` - posts alerts/stats to backend

## Requirements

- Python 3.10+ (recommended)
- pip (latest)
- Internet connection for first YOLO model download (`yolov8n.pt`)

Dependencies are listed in `requirements.txt`.

## Setup

Run from repo root (`Surveillance_System`):


```bash
cd worker
python -m venv .venv
```

Activate virtual environment:

Windows (PowerShell):

```powershell
.\.venv\Scripts\Activate.ps1 
```

Linux/macOS:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

## Run Worker

Run from repo root (`Surveillance_System`) so package imports resolve correctly:

```bash
uvicorn main:app --host 0.0.0.0 --port 4001 --reload
```

Health check:

```bash
GET http://localhost:4001/
```

Expected response:

```json
{ "message": "Worker running" }
```

## API Endpoints

### Start Camera

```http
POST /start
Content-Type: application/json

{
  "camera_id": "camera-1",
  "rtsp_url": "rtsp://..."
}
```

### Stop Camera

```http
POST /stop
Content-Type: application/json

{
  "camera_id": "camera-1"
}
```

### WebRTC Offer

```http
POST /cameras/{camera_id}/offer
Content-Type: application/json

{
  "sdp": "...",
  "type": "offer"
}
```

## Backend Integration

Worker sends data to backend at:

- Alerts: `POST http://localhost:4000/alerts`
- Stats: `POST http://localhost:4000/cameras/{cameraId}/stats`

Backend must be running on port `4000` unless you change `worker/services/backend_client.py`.

Backend calls worker using its `WORKER_URL` setting (example: `http://localhost:8000`).

## Notes

- Person detection checks COCO class `0` (`person`) with confidence `> 0.6` (set via `CONF_THRESHOLD` in `camera/camera_processor.py`).
- An alert fires only after **3 consecutive detection frames** confirm the person (`CONFIRM_FRAMES` in `alerts/alert_engine.py`).
- Alert cooldown between repeat alerts is **10 s** (`COOLDOWN` in `alerts/alert_engine.py`).
- After a person disappears, `person_present` is not cleared until **5 consecutive missed frames** (`GRACE_FRAMES`) — prevents flicker caused by throttled detection.
- Stats are sent roughly every `0.5 s`.
- The box scan runs **once per detection frame** in `camera_processor.py`; `alert_engine` receives pre-computed `(person_found, max_conf)` — no duplicate scanning.

## Alert Engine Tuning

All knobs live at the top of `alerts/alert_engine.py`:

```python
COOLDOWN      = 10   # seconds between repeat alerts for the same camera
CONFIRM_FRAMES = 3   # consecutive detections required — raise to reduce false positives
GRACE_FRAMES   = 5   # consecutive misses before "person gone" — raise if detection is sparse
```

Confidence threshold is in `camera/camera_processor.py`:

```python
CONF_THRESHOLD = 0.6   # minimum confidence to count a detection (0.0 – 1.0)
```

## Performance Tuning

### Detection throttle (`camera/camera_processor.py`)

YOLO runs only every **N-th frame** to keep the processing loop fast. Intermediate frames are annotated with the last known bounding boxes.

```python
DETECT_EVERY_N_FRAMES = 3   # lower = more accurate, higher = faster
```

### YOLO input size (`detection/detector.py`)

Inference uses `imgsz=320` (default YOLO is 640). This roughly **halves inference time** with minimal accuracy loss for typical surveillance scenes. Change to `416` or `640` if you need higher precision.

### Low-latency capture (`camera/camera_processor.py`)

A dedicated background thread continuously calls `cap.grab()` to drain the stream buffer, so the processing loop always picks up the **latest frame** instead of buffered-up stale ones. `CAP_PROP_BUFFERSIZE` is also set to `1` for the same reason.

### IP Webcam app tips (Android/iOS)

If you are using an app such as IP Webcam on a smartphone:

- Set **Quality to 30–40 %** and **Resolution to 1080*720** 
- Set **FPS to 15–20** for smoother streaming and lower CPU load.
- Keep phone and PC on the **same Wi-Fi band (5 GHz preferred)**.

## Troubleshooting

- `ModuleNotFoundError: No module named 'worker'`
  - Start with `uvicorn worker.main:app ...` from repo root, not from inside `worker/`.

- Camera does not start
  - Verify RTSP URL and camera reachability.
  - Ensure OpenCV can open the stream.

- No alerts in dashboard
  - Confirm backend is running on `http://localhost:4000`.
  - Check worker terminal for backend post errors.

- Slow first startup
  - YOLO model download/initialization can take time on first run.
