import { db } from "../db/connection";
import { users } from "../db/schema";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

export async function signupUser(username: string, password: string) {
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.username, username));

  if (existingUser.length) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db
    .insert(users)
    .values({
      username,

      password: hashedPassword,
    })
    .returning();

  return user[0];
}

export async function loginUser(username: string, password: string) {
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.username, username));

  if (!existingUser.length) {
    throw new Error("Invalid credentials");
  }

  const user = existingUser[0] as any;

  const isMatch = await bcrypt.compare(
    password,

    user.password,
  );

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    {
      id: user.id,

      username: user.username,
    },

    process.env.JWT_SECRET!,

    {
      expiresIn: "7d",
    },
  );

  return token;
}
