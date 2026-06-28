import { db } from "../db/connection";
import { cameras } from "../db/schema";
import { eq, and } from "drizzle-orm";

export async function createCamera(
  userId: string,

  cameraData: {
    name: string;

    rtspUrl: string;

    location?: string;

    enabled?: boolean;
  },
) {
  const camera = await db

    .insert(cameras)

    .values({
      userId,

      name: cameraData.name,

      rtspUrl: cameraData.rtspUrl,

      location: cameraData.location,

      enabled: cameraData.enabled,
    })

    .returning();

  return camera[0];
}

export async function getCameras(userId: string) {
  const userCameras = await db

    .select()

    .from(cameras)

    .where(
      eq(
        cameras.userId,

        userId,
      ),
    );

  return userCameras;
}

export async function updateCamera(
  userId: string,
  cameraId: string,
  cameraData: any,
) {
  const updatedCamera = await db

    .update(cameras)

    .set({
      name: cameraData.name,

      location: cameraData.location,

      enabled: cameraData.enabled,

      rtspUrl: cameraData.rtspUrl,
    })

    .where(
      and(
        eq(cameras.id, cameraId),

        eq(cameras.userId, userId),
      ),
    )

    .returning();

  if (!updatedCamera.length) {
    throw new Error("Camera not found");
  }

  return updatedCamera[0];
}

export async function deleteCamera(userId: string, cameraId: string) {
  const deletedCamera = await db

    .delete(cameras)

    .where(
      and(
        eq(cameras.id, cameraId),

        eq(cameras.userId, userId),
      ),
    )

    .returning();

  if (!deletedCamera.length) {
    throw new Error("Camera not found");
  }

  return deletedCamera[0];
}

export async function getCamera(userId: string, cameraId: string) {
  const camera = await db
    .select()
    .from(cameras)
    .where(and(eq(cameras.id, cameraId), eq(cameras.userId, userId)));
  return camera[0];
}

export async function updateCameraStatus(cameraId: string, status: string) {
  const result = await db
    .update(cameras)
    .set({ status })
    .where(eq(cameras.id, cameraId))
    .returning();
  return result[0];
}
