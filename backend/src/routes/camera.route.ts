import { Hono } from "hono"

import { authMiddleware } from "../middleware/auth.middleware"

import {
  createCameraController,
  getCamerasController,
  updateCameraController,
  deleteCameraController,
  startCameraController,
  stopCameraController,
  offerCameraController,
  statsCameraController,
} from "../controllers/camera.controller"

const cameraRouter = new Hono()

// Public endpoint for worker stats
cameraRouter.post(
  "/:id/stats",
  statsCameraController,
)

cameraRouter.use(
  "*",
  authMiddleware,
)

cameraRouter.post(
  "/",
  createCameraController,
)

cameraRouter.get(
  "/",
  getCamerasController,
)

cameraRouter.put(
  "/:id",
  updateCameraController,
)

cameraRouter.delete(
  "/:id",
  deleteCameraController,
)

cameraRouter.post(
  "/:id/start",
  startCameraController,
)

cameraRouter.post(
  "/:id/stop",
  stopCameraController,
)

cameraRouter.post(
  "/:id/offer",
  offerCameraController,
)

export default cameraRouter
