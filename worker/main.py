from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from camera.camera_manager import CameraManager
from streaming.webrtc_manager import create_offer_handler

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = CameraManager()

class CameraRequest(BaseModel):
    camera_id: str
    rtsp_url: str = ""

class OfferRequest(BaseModel):
    sdp: str
    type: str

@app.get("/")
def home():
    return {
        "message": "Worker running"
    }


@app.post("/start")
def start_camera(payload: CameraRequest):

    success = manager.start_camera(
        payload.camera_id,
        payload.rtsp_url
    )

    return {
        "success": success,
        "running": manager.get_running_cameras()
    }


@app.post("/stop")
def stop_camera(payload: CameraRequest):
    success = manager.stop_camera(payload.camera_id)
    return {
        "success": success,
        "running": manager.get_running_cameras()
    }


@app.post("/cameras/{camera_id}/offer")
async def handle_offer(camera_id: str, payload: OfferRequest):
    processor = manager.running_cameras.get(camera_id)
    if not processor:
        raise HTTPException(status_code=404, detail="Camera stream is not running")

    try:
        answer = await create_offer_handler(processor, payload.sdp, payload.type)
        return answer
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"WebRTC negotiation failed: {e}")