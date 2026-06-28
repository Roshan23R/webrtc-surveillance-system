import { useEffect, useState } from "react";
import { getAlerts } from "../services/api";
import type { Alert } from "../types/alert";

export function useAlerts(filters?: {
  cameraId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    getAlerts(filters).then(setAlerts);
  }, [
    filters?.cameraId,
    filters?.startDate,
    filters?.endDate,
    filters?.page,
    filters?.limit
  ]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    function connect() {
      ws = new WebSocket("ws://localhost:4000");

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "NEW_ALERT") {
            const alertData = message.data;
            // Filter live alert matches if a camera filter is active
            if (filters?.cameraId && alertData.cameraId !== filters.cameraId) {
              return;
            }
            setAlerts((prev) => [alertData, ...prev]);
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected. Reconnecting in 3 seconds...");
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
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
  }, [filters?.cameraId]);

  return alerts;
}