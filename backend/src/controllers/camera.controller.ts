import {
  createCamera,
  getCameras,
  updateCamera,
  deleteCamera,
  getCamera,
  updateCameraStatus,
} from "../services/camera.service";

import {
  startWorkerCamera,
  stopWorkerCamera,
  negotiateOffer,
} from "../services/worker.service";
import { broadcast } from "../websocket/ws";

export async function createCameraController(c: any) {
  try {
    const user = c.get("user");

    const body = await c.req.json();

    const camera = await createCamera(
      user.id,

      body,
    );

    return c.json(
      {
        message: "Camera created",

        camera,
      },

      201,
    );
  } catch (error: any) {
    return c.json(
      {
        message: error.message,
      },

      400,
    );
  }
}

export async function getCamerasController(c: any) {
  try {
    const user = c.get("user");

    const cameraList = await getCameras(user.id);

    return c.json({
      cameras: cameraList,
    });
  } catch (error: any) {
    return c.json(
      {
        message: error.message,
      },
      400,
    );
  }
}

export async function updateCameraController(c: any) {
  try {
    const user = c.get("user");

    const cameraId = c.req.param("id");

    const body = await c.req.json();

    const camera = await updateCamera(
      user.id,

      cameraId,

      body,
    );

    return c.json({
      message: "Camera updated",

      camera,
    });
  } catch (error: any) {
    return c.json(
      {
        message: error.message,
      },
      400,
    );
  }
}

export async function deleteCameraController(c: any) {
  try {
    const user = c.get("user");

    const cameraId = c.req.param("id");

    const camera = await deleteCamera(
      user.id,

      cameraId,
    );

    return c.json({
      message: "Camera deleted",

      camera,
    });
  } catch (error: any) {
    return c.json(
      {
        message: error.message,
      },
      400,
    );
  }
}

export async function startCameraController(c: any) {
  try {
    const user = c.get("user");
    const cameraId = c.req.param("id");

    const camera = await getCamera(user.id, cameraId);
    if (!camera) {
      return c.json({ message: "Camera not found" }, 404);
    }

    const worker = await startWorkerCamera(cameraId, camera.rtspUrl);
    await updateCameraStatus(cameraId, "running");

    return c.json({
      message: "Camera started",
      worker,
    });
  } catch (error: any) {
    return c.json(
      {
        message: error.message,
      },
      400,
    );
  }
}

export async function stopCameraController(c: any) {
  try {
    const user = c.get("user");
    const cameraId = c.req.param("id");

    const camera = await getCamera(user.id, cameraId);
    if (!camera) {
      return c.json({ message: "Camera not found" }, 404);
    }

    const worker = await stopWorkerCamera(cameraId);
    await updateCameraStatus(cameraId, "stopped");

    return c.json({
      message: "Camera stopped",
      worker,
    });
  } catch (error: any) {
    return c.json(
      {
        message: error.message,
      },
      400,
    );
  }
}

export async function offerCameraController(c: any) {
  try {
    const user = c.get("user");
    const cameraId = c.req.param("id");
    const offerSdp = await c.req.json();

    const camera = await getCamera(user.id, cameraId);
    if (!camera) {
      return c.json({ message: "Camera not found" }, 404);
    }

    const answer = await negotiateOffer(cameraId, offerSdp);
    return c.json(answer);
  } catch (error: any) {
    return c.json({ message: error.message }, 400);
  }
}

export async function statsCameraController(c: any) {
  try {
    const cameraId = c.req.param("id");
    const stats = await c.req.json();

    broadcast({
      type: "CAMERA_STATS",
      cameraId,
      data: stats,
    });

    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ message: error.message }, 400);
  }
}
