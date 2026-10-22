"use server";

import { getDb } from "@/db";
import { ensureReady } from "@/db/bootstrap";
import { inquiries } from "@/db/schema";
import { clientIp } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export type InquiryState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
} | null;

const clean = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max);

export async function submitInquiry(_: InquiryState, f: FormData): Promise<InquiryState> {
  // Hidden field that people never see; bots fill it in. Pretend success.
  if (clean(f, "website", 200)) return { ok: true };

  const kind = f.get("kind") === "admissions" ? "admissions" : "contact";
  const values = {
    fullName: clean(f, "fullName", 120),
    email: clean(f, "email", 200),
    phone: clean(f, "phone", 40),
    studentGrade: clean(f, "studentGrade", 80),
    topic: clean(f, "topic", 120),
    preferredDate: clean(f, "preferredDate", 10),
    message: clean(f, "message", 3000),
  };

  const fieldErrors: Record<string, string> = {};
  if (values.fullName.length < 2) fieldErrors.fullName = "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) fieldErrors.email = "Enter a valid email address.";
  if (values.message.length < 10) fieldErrors.message = "Write a message of at least 10 characters.";
  if (f.get("consent") !== "on") fieldErrors.consent = "Please agree so we can contact you.";
  if (Object.keys(fieldErrors).length) return { fieldErrors, values, error: "Please fix the highlighted fields." };

  if (!rateLimit(`inquiry:${await clientIp()}`, 5, 60 * 60 * 1000)) {
    return { values, error: "You have sent several messages recently. Please try again later or call the office." };
  }

  try {
    await ensureReady();
    await getDb().insert(inquiries).values({ kind, ...values });
  } catch (e) {
    console.error("Inquiry could not be saved", e);
    return { values, error: "Something went wrong on our side. Please try again or call the office." };
  }
  return { ok: true };
}
