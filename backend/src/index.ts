import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { cors } from "hono/cors"

const app = new Hono()

app.use("*", cors())

app.get("/", (c) => {
  return c.json({
    message: "Backend running 🚀",
  })
})

const server = serve({
  fetch: app.fetch,
  port: parseInt(process.env.PORT || "4000"),
})

console.log(`Server running on port ${process.env.PORT || 4000}`)
