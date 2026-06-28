import { Hono } from "hono";
import { createAlertController, getAlertsController } from "../controllers/alert.controller";

const alertRouter = new Hono();

alertRouter.post("/", createAlertController);
alertRouter.get("/", getAlertsController);

export default alertRouter;