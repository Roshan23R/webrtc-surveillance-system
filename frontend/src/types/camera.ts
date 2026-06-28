export interface Camera {
  id: string;
  userId: string;
  name: string;
  rtspUrl: string;
  location: string | null;
  enabled: boolean;
  status: "running" | "stopped";
  createdAt: string;
}
