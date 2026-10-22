import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = (process.env.SITE_URL || "http://localhost:3001").replace(/\/$/, "");
  const pages = ["", "/about", "/admissions", "/academics", "/activities", "/news", "/gallery", "/contact", "/privacy"];
  const posts = await getPosts().catch(() => []);
  return [
    ...pages.map((p) => ({ url: `${site}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...posts.map((p) => ({ url: `${site}/news/${p.slug}`, lastModified: new Date(p.eventDate), priority: 0.6 })),
  ];
}
