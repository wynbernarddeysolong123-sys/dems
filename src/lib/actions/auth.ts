"use server";

import bcrypt from "bcryptjs";
import { signIn } from "next-auth/react";
import {
  findUserByEmail,
  emailExists,
  createUser,
} from "@/lib/repositories/auth.repository";

// ── Register Action ───────────────────────────────────────
export async function registerAction(formData: {
  name: string;
  email: string;
  password: string;
}) {
  const { name, email, password } = formData;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  // ← repository handles the query
  const exists = await emailExists(email);
  if (exists) {
    return { error: "Email already in use" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // ← repository handles the insert
  await createUser({ name: name ?? null, email, password });

  return { success: true };
}

// ── Login Action ──────────────────────────────────────────
export async function loginAction(formData: {
  email: string;
  password: string;
}) {
  const { email, password } = formData;

  // ← repository handles the query
  const user = await findUserByEmail(email);

  if (!user) {
    return { error: "Invalid email or password" };
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return { error: "Invalid email or password" };
  }
}
