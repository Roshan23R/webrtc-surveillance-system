import { useEffect, useRef, useState } from "react";
import { negotiateOffer } from "../services/api";

interface CameraVideoProps {
  cameraId: string;
  onStateChange: (state: "connecting" | "live" | "stopped" | "error") => void;
}

export function CameraVideo({ cameraId, onStateChange }: CameraVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    let active = true;

    async function startWebRTC() {
      try {
        onStateChange("connecting");
        setErrorMsg("");

        // Initialize Peer Connection
        const pc = new RTCPeerConnection();
        pcRef.current = pc;

        // Add receive-only video transceiver
        pc.addTransceiver("video", { direction: "recvonly" });

        // Listen for remote tracks
        pc.ontrack = (event) => {
          if (!active) return;
          if (videoRef.current && event.streams && event.streams[0]) {
            videoRef.current.srcObject = event.streams[0];
            onStateChange("live");
          }
        };

        // Create WebRTC Offer SDP
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Exchange offer with the server
        const answer = await negotiateOffer(cameraId, {
          sdp: pc.localDescription?.sdp || "",
          type: pc.localDescription?.type || "offer",
        });

        if (!active) return;

        // Set WebRTC Answer SDP
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err: any) {
        console.error("WebRTC initialization error:", err);
        if (active) {
          setErrorMsg(err.response?.data?.message || err.message || "Failed to establish video stream");
          onStateChange("error");
        }
      }
    }

    startWebRTC();

    return () => {
      active = false;
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      onStateChange("stopped");
    };
  }, [cameraId]);

  if (errorMsg) {
    return (
      <div className="w-full aspect-video bg-zinc-950 flex flex-col items-center justify-center p-4 border border-rose-500/20 rounded-xl text-rose-400">
        <svg className="w-7 h-7 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span className="text-[10px] font-semibold mt-2 text-center">{errorMsg}</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-black rounded-xl overflow-hidden aspect-video border border-zinc-100 dark:border-zinc-900 shadow-inner relative flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-900/80 backdrop-blur-sm text-[10px] text-zinc-300 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        WebRTC Live
      </div>
    </div>
  );
}
