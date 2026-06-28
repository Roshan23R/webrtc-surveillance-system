# Worker Service

Python worker for real-time camera processing, person detection (YOLO), alert generation, and WebRTC stream negotiation.

## What It Does

- Starts/stops camera processing jobs
- Reads frames from RTSP/webcam sources
- Runs YOLO detection on frames
- Generates person-detected alerts
- Sends alerts and stats to backend
- Serves WebRTC SDP answer for live streaming

## Project Structure

- `main.py` - FastAPI app + worker HTTP routes
- `camera/camera_manager.py` - starts/stops processors per camera
- `camera/camera_processor.py` - frame loop, detection, stats, alert pipeline
- `detection/detector.py` - YOLO model loading and inference
- `alerts/alert_engine.py` - alert cooldown/state logic
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

- Person detection currently checks COCO class `0` (`person`) with confidence `> 0.6`.
- Alert cooldown is `10s` (`alerts/alert_engine.py`).
- Stats are sent roughly every `0.5s`.

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
