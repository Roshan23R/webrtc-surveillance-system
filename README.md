# Real-Time AI Surveillance System

Monorepo for a camera surveillance platform with:

- React frontend dashboard
- Bun + Hono backend API/WebSocket server
- Python FastAPI worker for detection and WebRTC
- PostgreSQL + MediaMTX via Docker

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
- MediaMTX RTSP: `localhost:8554`

## Quick Start

## 1) Start infrastructure

From repo root:

```bash
docker compose up -d
```

This starts PostgreSQL and MediaMTX.

## 2) Start backend

```bash
cd backend
bun install
bun run dev
```

Backend env file (`backend/.env`) should include:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/surveillance_db
JWT_SECRET=your-secret
WORKER_URL=http://localhost:8000
PORT=4000
```

Optional DB commands:

```bash
bun run db:generate
bun run db:migrate
bun run db:push
```

## 3) Start worker

From repo root (recommended for imports):

```bash
cd worker
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install and run:

```bash
pip install -r requirements.txt
cd ..
uvicorn main:app --host 0.0.0.0 --port 4001 --reload
```

Health check:

- `GET http://localhost:4001/` -> `{"message": "Worker running"}`

## 4) Start frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend API currently points to backend at `http://localhost:4000` in `frontend/src/services/api.ts`.

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
