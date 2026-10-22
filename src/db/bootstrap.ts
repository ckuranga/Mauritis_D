import { randomBytes } from "node:crypto";
import { count } from "drizzle-orm";
import { getDb, getPool } from "@/db";
import {
  adminUsers,
  schoolSettings,
  mediaAssets,
  newsPosts,
  activities,
} from "@/db/schema";
import { MEDIA_SEED, NEWS_SEED, ACTIVITY_SEED } from "@/db/seed-data";
import { hashPassword } from "@/lib/password";

const DDL = `
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Site administrator',
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP
);
CREATE TABLE IF NOT EXISTS school_settings (
  id SERIAL PRIMARY KEY,
  school_name TEXT NOT NULL, motto TEXT NOT NULL, founded_year TEXT NOT NULL,
  announcement_text TEXT NOT NULL DEFAULT '', announcement_label TEXT NOT NULL DEFAULT '',
  announcement_active BOOLEAN NOT NULL DEFAULT FALSE,
  hero_title TEXT NOT NULL, hero_subtitle TEXT NOT NULL, hero_media_id INTEGER, hero_image_url TEXT,
  head_name TEXT NOT NULL, head_title TEXT NOT NULL, head_quote TEXT NOT NULL, head_message TEXT NOT NULL,
  head_media_id INTEGER, head_image_url TEXT,
  stat_ratio TEXT NOT NULL DEFAULT '', stat_matriculation TEXT NOT NULL DEFAULT '',
  stat_athletics TEXT NOT NULL DEFAULT '', stat_clubs TEXT NOT NULL DEFAULT '',
  admissions_deadline TEXT NOT NULL DEFAULT '', tuition_day TEXT NOT NULL DEFAULT '',
  tuition_boarding TEXT NOT NULL DEFAULT '', financial_aid TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '',
  admissions_email TEXT NOT NULL DEFAULT '', office_hours TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS media_assets (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL, event_name TEXT NOT NULL DEFAULT '', category TEXT NOT NULL DEFAULT 'Campus life',
  kind TEXT NOT NULL, source TEXT NOT NULL DEFAULT 'upload', mime_type TEXT,
  byte_size INTEGER NOT NULL DEFAULT 0, width INTEGER, height INTEGER, duration_seconds INTEGER,
  has_thumb BOOLEAN NOT NULL DEFAULT FALSE, external_url TEXT, external_thumb_url TEXT,
  caption TEXT NOT NULL DEFAULT '', alt_text TEXT NOT NULL DEFAULT '',
  event_date TEXT NOT NULL, location TEXT NOT NULL DEFAULT '', uploaded_by TEXT NOT NULL DEFAULT '',
  featured BOOLEAN NOT NULL DEFAULT FALSE, published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS media_assets_listing_idx ON media_assets (published, event_date DESC, id DESC);
CREATE TABLE IF NOT EXISTS media_blobs (
  asset_id INTEGER PRIMARY KEY REFERENCES media_assets(id) ON DELETE CASCADE,
  data BYTEA NOT NULL, thumb_data BYTEA, thumb_mime TEXT
);
CREATE TABLE IF NOT EXISTS news_posts (
  id SERIAL PRIMARY KEY, slug TEXT NOT NULL UNIQUE, kind TEXT NOT NULL, category TEXT NOT NULL,
  title TEXT NOT NULL, summary TEXT NOT NULL, body TEXT NOT NULL,
  cover_media_id INTEGER, cover_url TEXT,
  event_date TEXT NOT NULL, event_time TEXT NOT NULL DEFAULT '', location TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT '', featured BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL,
  season TEXT NOT NULL DEFAULT '', advisor TEXT NOT NULL DEFAULT '', schedule TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '', description TEXT NOT NULL, achievements TEXT NOT NULL DEFAULT '',
  cover_media_id INTEGER, image_url TEXT, member_count INTEGER,
  published BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS inquiries (
  id SERIAL PRIMARY KEY, kind TEXT NOT NULL, full_name TEXT NOT NULL, email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '', student_grade TEXT NOT NULL DEFAULT '', topic TEXT NOT NULL DEFAULT '',
  preferred_date TEXT NOT NULL DEFAULT '', message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new', created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;

let ready: Promise<void> | null = null;

/** Creates tables and first-run content once per server process. */
export function ensureReady(): Promise<void> {
  if (!ready) {
    ready = init().catch((err) => {
      ready = null; // retry on the next request
      throw err;
    });
  }
  return ready;
}

async function init() {
  const pool = getPool();
  const db = getDb();
  // Advisory lock: safe if several instances start at the same time.
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock(8421001)");
    await client.query(DDL);

    const [{ value: admins }] = await db.select({ value: count() }).from(adminUsers);
    if (admins === 0) await seedAdmin();

    const [{ value: settings }] = await db.select({ value: count() }).from(schoolSettings);
    if (settings === 0) await seedSettings();

    const [{ value: media }] = await db.select({ value: count() }).from(mediaAssets);
    const [{ value: news }] = await db.select({ value: count() }).from(newsPosts);
    const [{ value: acts }] = await db.select({ value: count() }).from(activities);
    if (settings === 0 && media === 0 && news === 0 && acts === 0) {
      await db.insert(mediaAssets).values(
        MEDIA_SEED.map((m) => ({
          ...m,
          source: "external",
          hasThumb: true,
          altText: m.title,
          mimeType: m.kind === "video" ? "video/mp4" : "image/jpeg",
        }))
      );
      await db.insert(newsPosts).values(
        NEWS_SEED.map(({ content, ...n }) => ({ ...n, body: content }))
      );
      await db.insert(activities).values(ACTIVITY_SEED);
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock(8421001)").catch(() => {});
    client.release();
  }
}

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  let password = process.env.ADMIN_PASSWORD || "";
  const isProd = process.env.NODE_ENV === "production";

  if (!email || !password) {
    if (isProd) {
      console.warn(
        "[setup] No administrator created. Set ADMIN_EMAIL and ADMIN_PASSWORD, then restart."
      );
      return;
    }
    password = randomBytes(9).toString("base64url") + "Aa1";
    console.warn(
      `\n[setup] Development administrator created\n        email:    admin@school.local\n        password: ${password}\n        Sign in at /admin/login. Set ADMIN_EMAIL / ADMIN_PASSWORD to choose your own.\n`
    );
  }
  await getDb()
    .insert(adminUsers)
    .values({
      email: email || "admin@school.local",
      name: process.env.ADMIN_NAME || "Site Administrator",
      title: "Site administrator",
      passwordHash: await hashPassword(password),
    });
}

async function seedSettings() {
  await getDb().insert(schoolSettings).values({
    schoolName: "Westminster Heritage Academy",
    motto: "Veritas • Virtus • Scientia",
    foundedYear: "1894",
    announcementLabel: "Admissions",
    announcementText:
      "Applications for the 2027–2028 academic year open this autumn. Join us at the Autumn Open House.",
    announcementActive: true,
    heroTitle: "Scholarship, character and purpose since 1894",
    heroSubtitle:
      "A K–12 day and boarding school that pairs classical liberal arts with laboratory research, the performing arts and a full athletics programme.",
    heroImageUrl:
      "https://images.pexels.com/photos/2305098/pexels-photo-2305098.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1800",
    headName: "Dr. Alistair Sterling",
    headTitle: "Headmaster",
    headQuote:
      "Education should not only fill the mind; it should kindle a lifelong devotion to truth, honourable leadership and generous service.",
    headMessage:
      "Since our founding in 1894, Westminster Heritage Academy has held one conviction: young people flourish when rigorous inquiry is matched by committed mentorship. Our students learn to argue ideas with grace, run real experiments, perform with confidence and compete with integrity.\n\nI invite you to visit, to sit in on a class and to meet the teachers who make this school what it is.",
    headImageUrl:
      "https://images.pexels.com/photos/39714016/pexels-photo-39714016.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=900",
    statRatio: "7 : 1",
    statMatriculation: "",
    statAthletics: "",
    statClubs: "65+",
    admissionsDeadline: "January 15, 2027 (Early Action: November 15, 2026)",
    tuitionDay: "$36,400 per year",
    tuitionBoarding: "$58,900 per year",
    financialAid: "Merit and need-based aid is available. Ask the admissions office for current figures.",
    address: "1894 Heritage Quadrangle, Kensington Park, MA 02138",
    phone: "+1 (617) 555-1894",
    email: "office@westminsterheritage.edu",
    admissionsEmail: "admissions@westminsterheritage.edu",
    officeHours: "Monday to Friday, 7:30 am – 5:30 pm. Saturday tours, 9:00 am – 1:00 pm.",
  });
}
