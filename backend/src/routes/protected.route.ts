import { Hono } from "hono";

import { authMiddleware } from "../middleware/auth.middleware";

const protectedRouter = new Hono();

protectedRouter.use("*", authMiddleware);

protectedRouter.get(
  "/profile",
  (c) => {
    const user = c.get("user");
    return c.json({
      message: "Protected route",
      user,
    });
  },
);

export default protectedRouter;
