import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.REACT_APP_API_URL,
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
