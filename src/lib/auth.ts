import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { ensureReady } from "@/db/bootstrap";
import { adminUsers, type AdminUser } from "@/db/schema";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createToken,
  fingerprint,
  readToken,
} from "@/lib/session";

/** The signed-in administrator, or null. Cached per request. */
export const getAdmin = cache(async (): Promise<AdminUser | null> => {
  const store = await cookies();
  const payload = readToken(store.get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  await ensureReady();
  const [user] = await getDb()
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.id, payload.uid))
    .limit(1);
  if (!user || fingerprint(user.passwordHash) !== payload.ph) return null;
  return user;
});

/** For admin pages and server actions: redirects to the login screen when signed out. */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdmin();
  if (!user) redirect("/admin/login");
  return user;
}

export async function startSession(user: AdminUser) {
  const store = await cookies();
  store.set(SESSION_COOKIE, createToken(user.id, user.passwordHash), {
    httpOnly: true,
    sameSite: "lax",
    // Secure cookies need HTTPS; COOKIE_SECURE=false allows plain http://localhost testing.
    secure: process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Best-effort client address for rate limiting (works behind a trusted proxy). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "local").trim();
}

/** CSRF guard for route handlers that change data. */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
