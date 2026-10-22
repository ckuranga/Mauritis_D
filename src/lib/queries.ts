import { cache } from "react";
import { and, asc, desc, eq, sql, count } from "drizzle-orm";
import { getDb } from "@/db";
import { ensureReady } from "@/db/bootstrap";
import { schoolSettings, mediaAssets, newsPosts, activities } from "@/db/schema";

export const GALLERY_PAGE_SIZE = 24;

export const getSettings = cache(async () => {
  await ensureReady();
  const [s] = await getDb().select().from(schoolSettings).limit(1);
  return s;
});

export async function getGallery(opts: { kind?: string; category?: string; page?: number }) {
  await ensureReady();
  const db = getDb();
  const filters = [eq(mediaAssets.published, true)];
  if (opts.kind === "image" || opts.kind === "video") filters.push(eq(mediaAssets.kind, opts.kind));
  if (opts.category) filters.push(eq(mediaAssets.category, opts.category));
  const where = and(...filters);
  const page = Math.max(1, opts.page ?? 1);
  const [{ total }] = await db.select({ total: count() }).from(mediaAssets).where(where);
  const items = await db
    .select()
    .from(mediaAssets)
    .where(where)
    .orderBy(desc(mediaAssets.eventDate), desc(mediaAssets.id))
    .limit(GALLERY_PAGE_SIZE)
    .offset((page - 1) * GALLERY_PAGE_SIZE);
  return { items, total, page, pages: Math.max(1, Math.ceil(total / GALLERY_PAGE_SIZE)) };
}

export async function getGalleryCategories(): Promise<string[]> {
  await ensureReady();
  const rows = await getDb()
    .selectDistinct({ category: mediaAssets.category })
    .from(mediaAssets)
    .where(eq(mediaAssets.published, true))
    .orderBy(asc(mediaAssets.category));
  return rows.map((r) => r.category);
}

export async function getFeaturedMedia(limit = 6) {
  await ensureReady();
  return getDb()
    .select()
    .from(mediaAssets)
    .where(and(eq(mediaAssets.published, true), eq(mediaAssets.featured, true)))
    .orderBy(desc(mediaAssets.eventDate), desc(mediaAssets.id))
    .limit(limit);
}

export async function getPosts(opts: { kind?: "news" | "event"; limit?: number } = {}) {
  await ensureReady();
  const filters = [eq(newsPosts.published, true)];
  if (opts.kind) filters.push(eq(newsPosts.kind, opts.kind));
  const q = getDb()
    .select()
    .from(newsPosts)
    .where(and(...filters))
    .orderBy(desc(newsPosts.eventDate), desc(newsPosts.id));
  return opts.limit ? q.limit(opts.limit) : q;
}

export async function getUpcomingEvents(limit = 3) {
  await ensureReady();
  const today = new Date().toISOString().slice(0, 10);
  return getDb()
    .select()
    .from(newsPosts)
    .where(and(eq(newsPosts.published, true), eq(newsPosts.kind, "event"), sql`${newsPosts.eventDate} >= ${today}`))
    .orderBy(asc(newsPosts.eventDate))
    .limit(limit);
}

export async function getPost(slug: string) {
  await ensureReady();
  const [post] = await getDb()
    .select()
    .from(newsPosts)
    .where(and(eq(newsPosts.slug, slug), eq(newsPosts.published, true)))
    .limit(1);
  return post ?? null;
}

export async function getActivities() {
  await ensureReady();
  return getDb()
    .select()
    .from(activities)
    .where(eq(activities.published, true))
    .orderBy(asc(activities.category), asc(activities.name));
}
