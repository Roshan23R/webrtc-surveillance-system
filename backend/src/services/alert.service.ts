import { db } from "../db/connection"
import { alerts } from "../db/schema"
import { broadcast } from "../websocket/ws"
import { desc, and, eq, gte, lte } from "drizzle-orm";

export async function createAlert(data: any) {
  const inserted = await db
    .insert(alerts)
    .values({
      cameraId: data.cameraId,
      eventType: data.eventType,
      confidence: String(data.confidence),
    })
    .returning()
    broadcast({
      type: "NEW_ALERT",
      data: inserted[0],
    })

  return inserted[0]
}

export async function getAlerts(filters: {
  cameraId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  const { cameraId, startDate, endDate, page = 1, limit = 10 } = filters;
  
  const conditions = [];
  
  if (cameraId) {
    conditions.push(eq(alerts.cameraId, cameraId));
  }
  
  if (startDate) {
    conditions.push(gte(alerts.createdAt, new Date(startDate)));
  }
  
  if (endDate) {
    conditions.push(lte(alerts.createdAt, new Date(endDate)));
  }

  const offset = (page - 1) * limit;

  const baseQuery = db
    .select()
    .from(alerts)
    .orderBy(desc(alerts.createdAt))
    .limit(limit)
    .offset(offset);

  if (conditions.length > 0) {
    baseQuery.where(and(...conditions));
  }

  return await baseQuery;
}