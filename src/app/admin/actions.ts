"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, ne } from "drizzle-orm";
import { getDb } from "@/db";
import {
  activities,
  adminUsers,
  inquiries,
  mediaAssets,
  newsPosts,
  schoolSettings,
} from "@/db/schema";
import { requireAdmin, startSession } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/password";

export type FormState = { ok?: boolean; error?: string; message?: string } | null;

const str = (f: FormData, k: string, max = 500) => String(f.get(k) ?? "").trim().slice(0, max);
const bool = (f: FormData, k: string) => f.get(k) === "on" || f.get(k) === "true";
const idOf = (f: FormData) => {
  const n = Number(f.get("id"));
  return Number.isInteger(n) && n > 0 ? n : null;
};
const refresh = () => revalidatePath("/", "layout");

/** Resolve the cover picker: "keep" | "none" | "<media id>". */
function pickCover(f: FormData, key = "cover") {
  const v = str(f, key, 20);
  if (v === "keep" || v === "") return undefined;
  if (v === "none") return { mediaId: null, url: null };
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? { mediaId: n, url: null } : undefined;
}

// ───────── Site settings ─────────
export async function saveSettings(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const db = getDb();
  const [existing] = await db.select({ id: schoolSettings.id }).from(schoolSettings).limit(1);
  if (!existing) return { error: "Settings record is missing." };
  const hero = pickCover(f, "heroCover");
  const head = pickCover(f, "headCover");
  await db
    .update(schoolSettings)
    .set({
      schoolName: str(f, "schoolName", 120) || "School name",
      motto: str(f, "motto", 120),
      foundedYear: str(f, "foundedYear", 8),
      announcementActive: bool(f, "announcementActive"),
      announcementLabel: str(f, "announcementLabel", 40),
      announcementText: str(f, "announcementText", 240),
      heroTitle: str(f, "heroTitle", 160),
      heroSubtitle: str(f, "heroSubtitle", 400),
      ...(hero ? { heroMediaId: hero.mediaId, heroImageUrl: hero.url } : {}),
      headName: str(f, "headName", 120),
      headTitle: str(f, "headTitle", 120),
      headQuote: str(f, "headQuote", 400),
      headMessage: str(f, "headMessage", 4000),
      ...(head ? { headMediaId: head.mediaId, headImageUrl: head.url } : {}),
      statRatio: str(f, "statRatio", 40),
      statMatriculation: str(f, "statMatriculation", 40),
      statAthletics: str(f, "statAthletics", 40),
      statClubs: str(f, "statClubs", 40),
      admissionsDeadline: str(f, "admissionsDeadline", 200),
      tuitionDay: str(f, "tuitionDay", 80),
      tuitionBoarding: str(f, "tuitionBoarding", 80),
      financialAid: str(f, "financialAid", 400),
      address: str(f, "address", 240),
      phone: str(f, "phone", 60),
      email: str(f, "email", 160),
      admissionsEmail: str(f, "admissionsEmail", 160),
      officeHours: str(f, "officeHours", 240),
      updatedAt: new Date(),
    })
    .where(eq(schoolSettings.id, existing.id));
  refresh();
  return { ok: true, message: "Site settings saved." };
}

// ───────── Media library ─────────
export async function updateMedia(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const id = idOf(f);
  if (!id) return { error: "Missing item." };
  const title = str(f, "title", 160);
  if (!title) return { error: "A title is required." };
  const date = str(f, "eventDate", 10);
  await getDb()
    .update(mediaAssets)
    .set({
      title,
      eventName: str(f, "eventName", 160),
      category: str(f, "category", 80) || "Campus life",
      caption: str(f, "caption", 600),
      altText: str(f, "altText", 300) || title,
      eventDate: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().slice(0, 10),
      location: str(f, "location", 160),
      featured: bool(f, "featured"),
      published: bool(f, "published"),
    })
    .where(eq(mediaAssets.id, id));
  refresh();
  return { ok: true, message: "Changes saved." };
}

export async function deleteMedia(f: FormData) {
  await requireAdmin();
  const id = idOf(f);
  if (id) await getDb().delete(mediaAssets).where(eq(mediaAssets.id, id)); // blobs cascade
  refresh();
}

// ───────── News & events ─────────
export async function savePost(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const db = getDb();
  const id = idOf(f);
  const title = str(f, "title", 200);
  const summary = str(f, "summary", 400);
  const body = str(f, "body", 12000);
  if (!title || !summary || !body) return { error: "Title, summary and full text are required." };
  const kind = f.get("kind") === "event" ? "event" : "news";
  const date = str(f, "eventDate", 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Choose a date." };
  const cover = pickCover(f);

  const values = {
    kind,
    category: str(f, "category", 60) || "Announcements",
    title,
    summary,
    body,
    eventDate: date,
    eventTime: str(f, "eventTime", 60),
    location: str(f, "location", 160),
    author: str(f, "author", 120),
    featured: bool(f, "featured"),
    published: bool(f, "published"),
    ...(cover ? { coverMediaId: cover.mediaId, coverUrl: cover.url } : {}),
  };

  if (id) {
    await db.update(newsPosts).set(values).where(eq(newsPosts.id, id));
  } else {
    let slug = slugify(title);
    const clash = await db.select({ id: newsPosts.id }).from(newsPosts).where(eq(newsPosts.slug, slug)).limit(1);
    if (clash.length) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    await db.insert(newsPosts).values({ ...values, slug });
  }
  refresh();
  redirect("/admin/news?saved=1");
}

export async function deletePost(f: FormData) {
  await requireAdmin();
  const id = idOf(f);
  if (id) await getDb().delete(newsPosts).where(eq(newsPosts.id, id));
  refresh();
}

// ───────── Activities ─────────
export async function saveActivity(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const id = idOf(f);
  const name = str(f, "name", 160);
  const description = str(f, "description", 2000);
  if (!name || !description) return { error: "Name and description are required." };
  const members = parseInt(str(f, "memberCount", 6), 10);
  const cover = pickCover(f);
  const values = {
    name,
    category: str(f, "category", 80) || "Academic societies",
    season: str(f, "season", 80),
    advisor: str(f, "advisor", 120),
    schedule: str(f, "schedule", 160),
    location: str(f, "location", 160),
    description,
    achievements: str(f, "achievements", 400),
    memberCount: Number.isFinite(members) && members > 0 ? members : null,
    published: bool(f, "published"),
    ...(cover ? { coverMediaId: cover.mediaId, imageUrl: cover.url } : {}),
  };
  const db = getDb();
  if (id) await db.update(activities).set(values).where(eq(activities.id, id));
  else await db.insert(activities).values(values);
  refresh();
  redirect("/admin/activities?saved=1");
}

export async function deleteActivity(f: FormData) {
  await requireAdmin();
  const id = idOf(f);
  if (id) await getDb().delete(activities).where(eq(activities.id, id));
  refresh();
}

// ───────── Inquiries ─────────
export async function setInquiryStatus(f: FormData) {
  await requireAdmin();
  const id = idOf(f);
  const status = str(f, "status", 20);
  if (id && ["new", "in_progress", "resolved"].includes(status))
    await getDb().update(inquiries).set({ status }).where(eq(inquiries.id, id));
  revalidatePath("/admin", "layout");
}

export async function deleteInquiry(f: FormData) {
  await requireAdmin();
  const id = idOf(f);
  if (id) await getDb().delete(inquiries).where(eq(inquiries.id, id));
  revalidatePath("/admin", "layout");
}

// ───────── Account ─────────
export async function updateProfile(_: FormState, f: FormData): Promise<FormState> {
  const me = await requireAdmin();
  const name = str(f, "name", 120);
  const email = str(f, "email", 200).toLowerCase();
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter your name and a valid email." };
  const db = getDb();
  const clash = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(and(eq(adminUsers.email, email), ne(adminUsers.id, me.id)))
    .limit(1);
  if (clash.length) return { error: "Another administrator already uses that email." };
  await db
    .update(adminUsers)
    .set({ name, email, title: str(f, "title", 120) || "Site administrator" })
    .where(eq(adminUsers.id, me.id));
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Profile updated." };
}

export async function changePassword(_: FormState, f: FormData): Promise<FormState> {
  const me = await requireAdmin();
  const current = String(f.get("current") ?? "");
  const next = String(f.get("next") ?? "");
  const confirm = String(f.get("confirm") ?? "");
  if (!(await verifyPassword(current, me.passwordHash))) return { error: "Your current password is not correct." };
  const problem = passwordProblem(next);
  if (problem) return { error: problem };
  if (next !== confirm) return { error: "The new passwords do not match." };
  const passwordHash = await hashPassword(next);
  const [updated] = await getDb()
    .update(adminUsers)
    .set({ passwordHash })
    .where(eq(adminUsers.id, me.id))
    .returning();
  await startSession(updated); // keep this browser signed in; other sessions end
  return { ok: true, message: "Password changed. Other devices have been signed out." };
}
