import {
  pgTable,
  serial,
  text,
  boolean,
  integer,
  timestamp,
  customType,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

/** Administrators who may sign in at /admin. Passwords are scrypt-hashed. */
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  title: text("title").notNull().default("Site administrator"),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
});

/** One row of editable public-site content and contact details. */
export const schoolSettings = pgTable("school_settings", {
  id: serial("id").primaryKey(),
  schoolName: text("school_name").notNull(),
  motto: text("motto").notNull(),
  foundedYear: text("founded_year").notNull(),
  announcementText: text("announcement_text").notNull().default(""),
  announcementLabel: text("announcement_label").notNull().default(""),
  announcementActive: boolean("announcement_active").notNull().default(false),
  heroTitle: text("hero_title").notNull(),
  heroSubtitle: text("hero_subtitle").notNull(),
  heroMediaId: integer("hero_media_id"),
  heroImageUrl: text("hero_image_url"),
  headName: text("head_name").notNull(),
  headTitle: text("head_title").notNull(),
  headQuote: text("head_quote").notNull(),
  headMessage: text("head_message").notNull(),
  headMediaId: integer("head_media_id"),
  headImageUrl: text("head_image_url"),
  statRatio: text("stat_ratio").notNull().default(""),
  statMatriculation: text("stat_matriculation").notNull().default(""),
  statAthletics: text("stat_athletics").notNull().default(""),
  statClubs: text("stat_clubs").notNull().default(""),
  admissionsDeadline: text("admissions_deadline").notNull().default(""),
  tuitionDay: text("tuition_day").notNull().default(""),
  tuitionBoarding: text("tuition_boarding").notNull().default(""),
  financialAid: text("financial_aid").notNull().default(""),
  address: text("address").notNull().default(""),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  admissionsEmail: text("admissions_email").notNull().default(""),
  officeHours: text("office_hours").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Metadata for every photo and short video. Listing queries only ever touch
 * this table; the heavy bytes live in `media_blobs`.
 */
export const mediaAssets = pgTable("media_assets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  eventName: text("event_name").notNull().default(""),
  category: text("category").notNull().default("Campus life"),
  kind: text("kind").notNull(), // 'image' | 'video'
  source: text("source").notNull().default("upload"), // 'upload' | 'external'
  mimeType: text("mime_type"),
  byteSize: integer("byte_size").notNull().default(0),
  width: integer("width"),
  height: integer("height"),
  durationSeconds: integer("duration_seconds"),
  hasThumb: boolean("has_thumb").notNull().default(false),
  externalUrl: text("external_url"),
  externalThumbUrl: text("external_thumb_url"),
  caption: text("caption").notNull().default(""),
  altText: text("alt_text").notNull().default(""),
  eventDate: text("event_date").notNull(),
  location: text("location").notNull().default(""),
  uploadedBy: text("uploaded_by").notNull().default(""),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** The actual file bytes, stored in PostgreSQL. */
export const mediaBlobs = pgTable("media_blobs", {
  assetId: integer("asset_id")
    .primaryKey()
    .references(() => mediaAssets.id, { onDelete: "cascade" }),
  data: bytea("data").notNull(),
  thumbData: bytea("thumb_data"),
  thumbMime: text("thumb_mime"),
});

export const newsPosts = pgTable("news_posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  kind: text("kind").notNull(), // 'news' | 'event'
  category: text("category").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  body: text("body").notNull(),
  coverMediaId: integer("cover_media_id"),
  coverUrl: text("cover_url"),
  eventDate: text("event_date").notNull(),
  eventTime: text("event_time").notNull().default(""),
  location: text("location").notNull().default(""),
  author: text("author").notNull().default(""),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  season: text("season").notNull().default(""),
  advisor: text("advisor").notNull().default(""),
  schedule: text("schedule").notNull().default(""),
  location: text("location").notNull().default(""),
  description: text("description").notNull(),
  achievements: text("achievements").notNull().default(""),
  coverMediaId: integer("cover_media_id"),
  imageUrl: text("image_url"),
  memberCount: integer("member_count"),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull(), // 'contact' | 'admissions'
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  studentGrade: text("student_grade").notNull().default(""),
  topic: text("topic").notNull().default(""),
  preferredDate: text("preferred_date").notNull().default(""),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"), // new | in_progress | resolved
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type SchoolSettings = typeof schoolSettings.$inferSelect;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type NewsPost = typeof newsPosts.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
