import { createAlert, getAlerts } from "../services/alert.service";

export async function createAlertController(c: any) {
  try {
    const body = await c.req.json();

    const alert = await createAlert(body);

    return c.json(
      {
        success: true,
        alert,
      },
      201
    );
  } catch (err: any) {
    console.error(err);

    return c.json(
      {
        success: false,
        message: err.message,
        error: err
      },
      400
    );
}
}

export async function getAlertsController(c: any) {
  const cameraId = c.req.query("cameraId");
  const startDate = c.req.query("startDate");
  const endDate = c.req.query("endDate");
  const page = c.req.query("page") ? parseInt(c.req.query("page")) : undefined;
  const limit = c.req.query("limit") ? parseInt(c.req.query("limit")) : undefined;

  const data = await getAlerts({
    cameraId,
    startDate,
    endDate,
    page,
    limit,
  });

  return c.json({
    success: true,
    alerts: data,
  });
}