import { signupUser, loginUser } from "../services/auth.service";

export async function signupController(c: any) {
  try {
    const body = await c.req.json();

    const { username, password } = body;

    const user = await signupUser(username, password);

    return c.json(
      {
        message: "User created",

        user,
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

export async function loginController(c: any) {
  try {
    const body = await c.req.json();

    const {
      username,

      password,
    } = body;

    const token = await loginUser(
      username,

      password,
    );

    return c.json({
      message: "Login success",

      token,
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
