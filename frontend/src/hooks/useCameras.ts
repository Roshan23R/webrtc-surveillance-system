import { useState, useCallback } from "react";
import {
  getCameras as fetchCameras,
  createCamera,
  updateCamera,
  deleteCamera,
  startCamera,
  stopCamera,
} from "../services/api";
import type { Camera } from "../types/camera";

export function useCameras(token: string | null) {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [camerasLoading, setCamerasLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const getCameras = useCallback(async () => {
    if (!token) return;
    setCamerasLoading(true);
    setCameraError("");
    try {
      const data = await fetchCameras();
      setCameras(data || []);
    } catch (err: any) {
      console.error(err);
      setCameraError("Failed to fetch cameras.");
    } finally {
      setCamerasLoading(false);
    }
  }, [token]);

  const handleAddCamera = async (cameraData: any) => {
    try {
      const newCam = await createCamera(cameraData);
      setCameras((prev) => [...prev, newCam]);
      return newCam;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message);
    }
  };

  const handleEditCamera = async (id: string, cameraData: any) => {
    try {
      const updated = await updateCamera(id, cameraData);
      setCameras((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteCamera = async (id: string) => {
    try {
      await deleteCamera(id);
      setCameras((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message);
    }
  };

  const handleStartCamera = async (id: string) => {
    try {
      await startCamera(id);
      setCameras((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "running" } : c))
      );
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message);
    }
  };

  const handleStopCamera = async (id: string) => {
    try {
      await stopCamera(id);
      setCameras((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "stopped" } : c))
      );
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message);
    }
  };

  return {
    cameras,
    camerasLoading,
    cameraError,
    getCameras,
    handleAddCamera,
    handleEditCamera,
    handleDeleteCamera,
    handleStartCamera,
    handleStopCamera,
  };
}
