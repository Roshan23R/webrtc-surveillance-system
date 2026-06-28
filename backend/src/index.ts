import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { cors } from "hono/cors"
import { WebSocketServer } from "ws"
import { addClient, removeClient } from "./websocket/ws"

const app = new Hono();

app.use("*", cors());

app.get("/", (c) => {
  return c.json({
    message: "Backend running 🚀",
  })
});

const server = serve({
  fetch: app.fetch,
  port: parseInt(process.env.PORT || "4000"),
}) as any;

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  addClient(ws as any)

  ws.on("close", () => {
    removeClient(ws as any)
  })
});

console.log(`Server running on port ${process.env.PORT || 4000}`);
