# Real-Time AI Surveillance System

Monorepo for a camera surveillance platform with:

- React frontend dashboard
- Bun + Hono backend API/WebSocket server
- Python FastAPI worker for detection and WebRTC
- PostgreSQL
- Docker Compose for local development

## Folder Structure

```text
Surveillance_System/
├─ backend/                 # Bun + Hono API and WebSocket server
│  ├─ src/
│  │  ├─ controllers/
│  │  ├─ db/
│  │  ├─ middleware/
│  │  ├─ routes/
│  │  ├─ services/
│  │  ├─ websocket/
│  │  └─ index.ts
│  ├─ package.json
│  ├─ drizzle.config.ts
│  └─ README.md
├─ frontend/                # React + Vite dashboard
│  ├─ src/
│  │  ├─ components/
│  │  ├─ hooks/
│  │  ├─ pages/
│  │  ├─ services/
│  │  ├─ types/
│  │  ├─ utils/
│  │  ├─ App.tsx
│  │  └─ main.tsx
│  ├─ package.json
│  └─ README.md
├─ worker/                  # FastAPI worker (YOLO, alerts, WebRTC)
│  ├─ alerts/
│  ├─ camera/
│  ├─ detection/
│  ├─ services/
│  ├─ streaming/
│  ├─ main.py
│  ├─ requirements.txt
│  └─ README.md
├─ docker-compose.yml       # PostgreSQL + MediaMTX
├─ mediamtx.yml             # MediaMTX config
└─ README.md
```

## Services and Default Ports

- Frontend (Vite): `http://localhost:5173`
- Backend (Hono): `http://localhost:4000`
- Worker (FastAPI): `http://localhost:8000`
- PostgreSQL: `localhost:5432`

## ⚙️ Architecture & Data Pipelines

### 1. Video Capture & YOLOv8 Detection Pipeline

```
┌──────────────────┐      ┌───────────────┐      ┌───────────────┐      ┌────────────────┐
│   Camera Feed    │      │  OpenCV Frame │      │ YOLOv8 Model  │      │  Thread-Safe   │
│ (RTSP / Webcam)  ├─────►│  Extraction   ├─────►│   Inference   ├─────►│  FrameBuffer   │
└──────────────────┘      └───────────────┘      └───────┬───────┘      └────────────────┘
                                                         │
                                                         ▼
                                                 ┌───────────────┐
                                                 │ Alert Engine  │
                                                 │ (Person Filter)│
                                                 └───────────────┘
```

- **Frame Extraction**: When a camera is started, the Python worker allocates a dedicated `threading.Thread` executing the `CameraProcessor` loop. It uses OpenCV (`cv2.VideoCapture`) to ingest frames continuously.
- **Object Inference**: Each frame is processed by an Ultralytics `YOLOv8n` model to extract bounding box coordinates, class IDs, and confidence levels.
- **Annotated Overlay**: Bounding box frames are plotted (`results[0].plot()`) and stored in a thread-safe `FrameBuffer`, making them immediately available for WebRTC streaming.

### 2. Alert Engine and Storage Flow

- **Trigger Conditions**: The model predictions are passed to `AlertEngine.process()`. It scans for `cls == 0` (person) with a confidence score above `0.6`.
- **Asynchronous Alerts**: To prevent stream processing freezes, alerts are dispatched to the Bun backend (`POST /alerts`) asynchronously within a dedicated background daemon thread.
- **Database Storage**: The backend's `createAlertController` writes the record to PostgreSQL via Drizzle ORM.
- **WebSocket Pushes**: Once stored, the backend broadcasts a `NEW_ALERT` payload:
  ```json
  {
    "type": "NEW_ALERT",
    "data": {
      "id": "uuid",
      "cameraId": "uuid",
      "eventType": "PERSON_DETECTED",
      "confidence": "0.96",
      "createdAt": "2026-06-25T00:00:00Z"
    }
  }
  ```
  Connected frontend clients immediately capture this event, appending the alert block dynamically to the sidebar.

### 3. WebRTC Live Video Streaming Pipeline

To eliminate high latency, the application streams annotated frames directly to the client browser over WebRTC:

```
React (Browser)                 Bun (Hono Backend)              Python (Worker)
      │                                 │                              │
      │ 1. Create Connection            │                              │
      │    Add transceiver (recvonly)   │                              │
      │    Create Local Offer (SDP)     │                              │
      ├────────────────────────────────>│                              │
      │                                 │ 2. Forward Offer             │
      │                                 ├─────────────────────────────>│
      │                                 │                              │ 3. Init RTCPeerConnection
      │                                 │                              │    Add CameraVideoStreamTrack
      │                                 │                              │    Generate Answer (SDP)
      │                                 │                              │<─────────────────────────────
      │                                 │ 4. Forward Answer            │
      │                                 │<─────────────────────────────┘
      │ 5. Set Remote Description (SDP) │
      │<────────────────────────────────┘
      │
      ├────────────────────── ( WebRTC Media Stream ) ────────────────>
```

1. **SDP Exchange**: The browser initializes an `RTCPeerConnection` with a receive-only video transceiver and generates an SDP offer.
2. **Proxy Routing**: Hono receives the offer and proxies it to the worker (`POST /cameras/:id/offer`).
3. **Stream Pipeline**: The worker registers a custom `CameraVideoStreamTrack`. It translates BGR NumPy frames from the `FrameBuffer` into `av.VideoFrame` objects and yields them to the WebRTC connection track. The server responds with an SDP answer, binding the video stream directly to the browser.

### 4. Telemetry Metrics Flow (WebSocket)

- **Worker Calculation**: Every `0.5` seconds, the processor calculates the camera processing loop speed (FPS), a rolling 60s window of Detections Per Minute (DPM), active presence flags (`detecting`), and max confidence score.
- **Broadcasting**: The worker posts this data to the backend `/cameras/:id/stats` endpoint. Hono receives the payload and broadcasts it immediately to all connected WebSocket clients under the `CAMERA_STATS` type.
- **Frontend Presentation**: The `useCameraStats.ts` hook receives the payload. Active cameras with `detecting: true` immediately trigger the pulsing red borders and display a glowing overlay badge showing `"🚨 PERSON DETECTED (0.96)"` in real-time.

---

## 🚀 Installation & Setup

### 1. Database Setup

Ensure PostgreSQL is running, then configure your `.env` in the `backend/` directory:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/surveillance"
JWT_SECRET="your-super-secret-jwt-key"
WORKER_URL="http://localhost:8001"
```

Run database migrations:
```bash
cd backend
bun install or npm install
bunx drizzle-kit push:pg
```

### 2. Start the Backend (Hono + WebSocket Server)

```bash
cd backend
bun run dev
```
*HTTP and WebSocket processes bind to `http://localhost:8000`.*

### 3. Start the AI Worker (FastAPI + YOLO + WebRTC)

Use a virtual environment to manage dependencies:

```bash
cd worker
py -3.10 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
or pip install -r requirements.txt --trusted-host pypi.org --trusted-host files.pythonhosted.org
uvicorn main:app --reload --port 4001
```
*Binds FastAPI to `http://localhost:4001`.*

### 4. Start the Frontend (Vite React Client)

```bash
cd frontend
npm install
npm run dev
```
*Launches Vite client on `http://localhost:5173`.*

## API Overview (Backend)

- Auth:
  - `POST /auth/signup`
  - `POST /auth/login`
- Cameras:
  - `GET /cameras`
  - `POST /cameras`
  - `PUT /cameras/:id`
  - `DELETE /cameras/:id`
  - `POST /cameras/:id/start`
  - `POST /cameras/:id/stop`
  - `POST /cameras/:id/offer`
  - `POST /cameras/:id/stats` (worker stats endpoint)
- Alerts:
  - `POST /alerts` (worker alert ingestion)
  - `GET /alerts`

## Worker Endpoints

- `POST /start`
- `POST /stop`
- `POST /cameras/{camera_id}/offer`

For worker-specific details, see `worker/README.md`.

## Notes

- Alerts and camera stats are sent by worker to backend.
- Backend broadcasts updates via WebSocket to frontend clients.
- WebRTC SDP negotiation is proxied through backend to worker.


## Docker Based Deployment

### Build and run all services

```bash
docker compose up -d --build
```

### Build only services 

```bash
docker compose build worker backend frontend
```

### Run only services 

```bash
docker compose up -d worker backend frontend
```
