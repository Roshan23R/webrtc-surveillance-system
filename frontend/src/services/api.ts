import axios from "axios";
import type { Alert } from "../types/alert";
import type { Camera } from "../types/camera";

export const api = axios.create({
  baseURL: "http://localhost:4000",
});

// Configure token in axios headers
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

// Automatically load token if stored
const storedToken = localStorage.getItem("token");
if (storedToken) {
  setAuthToken(storedToken);
}

// Authentication
export async function login(username: string, password: string): Promise<string> {
  const response = await api.post("/auth/login", { username, password });
  const token = response.data.token;
  localStorage.setItem("token", token);
  setAuthToken(token);
  return token;
}

export async function signup(username: string, password: string): Promise<any> {
  const response = await api.post("/auth/signup", { username, password });
  return response.data;
}

export function logout() {
  localStorage.removeItem("token");
  setAuthToken(null);
}

// Camera CRUD
export async function getCameras(): Promise<Camera[]> {
  const response = await api.get("/cameras");
  return response.data.cameras;
}

export async function createCamera(cameraData: {
  name: string;
  rtspUrl: string;
  location?: string;
  enabled?: boolean;
}): Promise<Camera> {
  const response = await api.post("/cameras", cameraData);
  return response.data.camera;
}

export async function updateCamera(
  id: string,
  cameraData: {
    name?: string;
    rtspUrl?: string;
    location?: string;
    enabled?: boolean;
  }
): Promise<Camera> {
  const response = await api.put(`/cameras/${id}`, cameraData);
  return response.data.camera;
}

export async function deleteCamera(id: string): Promise<Camera> {
  const response = await api.delete(`/cameras/${id}`);
  return response.data.camera;
}

// Worker Control
export async function startCamera(id: string): Promise<any> {
  const response = await api.post(`/cameras/${id}/start`);
  return response.data;
}

export async function stopCamera(id: string): Promise<any> {
  const response = await api.post(`/cameras/${id}/stop`);
  return response.data;
}

export async function negotiateOffer(id: string, offerSdp: { sdp: string; type: string }): Promise<any> {
  const response = await api.post(`/cameras/${id}/offer`, offerSdp);
  return response.data;
}

// Alerts
export async function getAlerts(filters?: {
  cameraId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<Alert[]> {
  const response = await api.get("/alerts", { params: filters });
  return response.data.alerts;
}