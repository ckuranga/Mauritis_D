"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { ensureReady } from "@/db/bootstrap";
import { adminUsers } from "@/db/schema";
import { clientIp, startSession, endSession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { clearLimit, rateLimit } from "@/lib/rate-limit";

export type LoginState = { error?: string } | null;

// Used so a missing account takes as long to reject as a wrong password.
const DUMMY_HASH = hashPassword("not-a-real-password");

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase().slice(0, 200);
  const password = String(formData.get("password") || "").slice(0, 200);
  if (!email || !password) return { error: "Enter your email and password." };

  const key = `login:${await clientIp()}:${email}`;
  if (!rateLimit(key, 5, 15 * 60 * 1000)) {
    return { error: "Too many attempts. Wait 15 minutes and try again." };
  }

  await ensureReady();
  const [user] = await getDb().select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  const ok = await verifyPassword(password, user ? user.passwordHash : await DUMMY_HASH);
  if (!user || !ok) return { error: "That email and password do not match." };

  clearLimit(key);
  await getDb().update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, user.id));
  await startSession(user);
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}
