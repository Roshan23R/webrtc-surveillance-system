import asyncio
import logging
from aiortc import VideoStreamTrack, RTCPeerConnection, RTCSessionDescription
from av import VideoFrame

logger = logging.getLogger("webrtc")

class CameraVideoStreamTrack(VideoStreamTrack):
    def __init__(self, processor):
        super().__init__()
        self.processor = processor

    async def recv(self):
        pts, time_base = await self.next_timestamp()

        # Fetch frame from processor's buffer
        frame = self.processor.frame_buffer.get()
        
        while frame is None:
            await asyncio.sleep(0.01)
            frame = self.processor.frame_buffer.get()

        # Convert BGR frame from OpenCV to AV VideoFrame
        video_frame = VideoFrame.from_ndarray(frame, format="bgr24")
        video_frame.pts = pts
        video_frame.time_base = time_base
        return video_frame

async def create_offer_handler(processor, sdp, type_):
    pc = RTCPeerConnection()
    processor.peer_connections.add(pc)

    @pc.on("iceconnectionstatechange")
    async def on_iceconnectionstatechange():
        if pc.iceConnectionState in ["failed", "closed"]:
            await pc.close()
            processor.peer_connections.discard(pc)

    @pc.on("connectionstatechange")
    async def on_connectionstatechange():
        if pc.connectionState in ["failed", "closed"]:
            await pc.close()
            processor.peer_connections.discard(pc)

    # Attach camera video track
    track = CameraVideoStreamTrack(processor)
    pc.addTrack(track)

    # Configure session descriptions
    offer = RTCSessionDescription(sdp=sdp, type=type_)
    await pc.setRemoteDescription(offer)

    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return {
        "sdp": pc.localDescription.sdp,
        "type": pc.localDescription.type
    }
