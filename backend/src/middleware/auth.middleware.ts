import jwt from "jsonwebtoken";

export async function authMiddleware(c: any, next: any) {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader) {
      return c.json(
        {
          message: "Token missing",
        },
        401,
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return c.json(
        {
          message: "Invalid token",
        },
        401,
      );
    }

    const decoded = jwt.verify(
      token,

      process.env.JWT_SECRET!,
    );

    c.set(
      "user",

      decoded,
    );

    await next();
  } catch (error) {
    return c.json(
      {
        message: "Unauthorized",
      },
      401,
    );
  }
}
