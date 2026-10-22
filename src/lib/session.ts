import { createHmac, timingSafeEqual, createHash } from "node:crypto";

export const SESSION_COOKIE = "wha_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set (32+ characters) in production");
  }
  return "development-only-secret-do-not-use-in-production!!";
}

type Payload = { uid: number; exp: number; ph: string };

/** Short fingerprint of the password hash: changing the password signs out old sessions. */
export function fingerprint(passwordHash: string): string {
  return createHash("sha256").update(passwordHash).digest("hex").slice(0, 16);
}

function sign(body: string): string {
  return createHmac("sha256", secret()).update(body).digest("base64url");
}

export function createToken(uid: number, passwordHash: string): string {
  const payload: Payload = {
    uid,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
    ph: fingerprint(passwordHash),
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function readToken(token: string | undefined): Payload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as Payload;
    if (typeof payload.uid !== "number" || payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}
