import { Hono } from "hono";

import {
  signupController,
  loginController,
} from "../controllers/auth.controller";

const authRouter = new Hono();

authRouter.post("/signup", signupController);

authRouter.post("/login", loginController);

export default authRouter;
