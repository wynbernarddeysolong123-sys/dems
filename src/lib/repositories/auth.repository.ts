import { db } from "@/server/db/connection";
import type { Users } from "@/types/auth.types";

// ── Find user by email ────────────────────────────────────
export async function findUserByEmail(email: string): Promise<Users | null> {
  const user = await db("admin_table").where({ email }).first();
  return user ?? null;
}

// ── Find user by id ───────────────────────────────────────
export async function findUserById(id: string): Promise<Users> {
  const user = await db("admin_table").where({ id }).first();

  return user ?? null;
}

// ── Create user ───────────────────────────────────────────
export async function createUser(data: {
  name: string | null;
  email: string;
  password: string;
  role?: string;
}): Promise<{ id: string }> {
  const id = crypto.randomUUID();

  await db("admin_table").insert({
    id,
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role,
    created_at: new Date(),
    updated_at: new Date(),
  });

  return { id };
}

// ── Check if email exists ─────────────────────────────────
export async function emailExists(email: string): Promise<boolean> {
  const user = await db("admin_table").where({ email }).first();

  return !!user;
}
