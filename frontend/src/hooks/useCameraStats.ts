import { useEffect, useState } from "react";

interface CameraStats {
  fps: number;
  dpm: number;
  detecting?: boolean;
  confidence?: number;
}

export function useCameraStats() {
  const [stats, setStats] = useState<Record<string, CameraStats>>({});

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    function connect() {
      ws = new WebSocket("ws://localhost:4000");

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "CAMERA_STATS") {
            setStats((prev) => ({
              ...prev,
              [message.cameraId]: message.data
            }));
          }
        } catch (err) {
          console.error("Failed to parse stats message:", err);
        }
      };

      ws.onclose = () => {
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        ws?.close();
      };
    }

    connect();

    return () => {
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  return stats;
}
