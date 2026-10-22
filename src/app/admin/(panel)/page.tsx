import Link from "next/link";
import { count, desc, eq, sql } from "drizzle-orm";
import { Images, Film, Newspaper, CalendarDays, Inbox, HardDrive, Upload } from "lucide-react";
import { getDb } from "@/db";
import { activities, inquiries, mediaAssets, newsPosts } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { formatBytes, mediaThumb } from "@/lib/media";
import { formatDate } from "@/lib/format";
import { Card, PageHeader } from "@/components/admin/PageHeader";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const me = await requireAdmin();
  const db = getDb();
  const [[photos], [videos], [bytes], [news], [events], [acts], [fresh], recentMedia, recentInq] = await Promise.all([
    db.select({ n: count() }).from(mediaAssets).where(eq(mediaAssets.kind, "image")),
    db.select({ n: count() }).from(mediaAssets).where(eq(mediaAssets.kind, "video")),
    db.select({ n: sql<number>`coalesce(sum(${mediaAssets.byteSize}), 0)::bigint` }).from(mediaAssets).where(eq(mediaAssets.source, "upload")),
    db.select({ n: count() }).from(newsPosts).where(eq(newsPosts.kind, "news")),
    db.select({ n: count() }).from(newsPosts).where(eq(newsPosts.kind, "event")),
    db.select({ n: count() }).from(activities),
    db.select({ n: count() }).from(inquiries).where(eq(inquiries.status, "new")),
    db.select().from(mediaAssets).orderBy(desc(mediaAssets.id)).limit(6),
    db.select().from(inquiries).orderBy(desc(inquiries.id)).limit(5),
  ]);

  const stats = [
    { label: "Photos", value: photos.n, icon: Images, href: "/admin/media" },
    { label: "Videos", value: videos.n, icon: Film, href: "/admin/media?kind=video" },
    { label: "News stories", value: news.n, icon: Newspaper, href: "/admin/news" },
    { label: "Events", value: events.n, icon: CalendarDays, href: "/admin/news" },
    { label: "New inquiries", value: fresh.n, icon: Inbox, href: "/admin/inquiries" },
    { label: "Stored in database", value: formatBytes(Number(bytes.n)), icon: HardDrive, href: "/admin/media" },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome, ${me.name.split(" ")[0]}`}
        description="Everything visitors see on the website is managed from here."
        actions={
          <Link href="/admin/media" className="inline-flex items-center gap-2 rounded-md bg-navy-800 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700">
            <Upload className="h-4 w-4" aria-hidden /> Upload photos or videos
          </Link>
        }
      />
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <li key={label}>
            <Link href={href} className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300">
              <Icon className="h-4 w-4 text-slate-500" aria-hidden />
              <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
              <p className="text-xs text-slate-600">{label}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-sans text-base font-semibold">Latest uploads</h2>
          {recentMedia.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">Nothing yet. <Link className="underline" href="/admin/media">Upload the first photo or video.</Link></p>
          ) : (
            <ul className="mt-3 grid grid-cols-3 gap-2">
              {recentMedia.map((m) => (
                <li key={m.id} className="aspect-[4/3] overflow-hidden rounded bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaThumb(m)} alt={m.altText || m.title} loading="lazy" className="h-full w-full object-cover" />
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="font-sans text-base font-semibold">Recent inquiries</h2>
          {recentInq.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No messages yet. Contact and admissions forms on the website arrive here.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {recentInq.map((q) => (
                <li key={q.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0 truncate">
                    <span className="font-medium text-slate-900">{q.fullName}</span>
                    <span className="text-slate-500"> · {q.kind === "admissions" ? "Admissions" : "Contact"}</span>
                  </span>
                  <span className="shrink-0 text-xs text-slate-500">{formatDate(q.createdAt.toISOString().slice(0, 10), { month: "short", day: "numeric" })}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/inquiries" className="mt-3 inline-block text-sm font-medium text-navy-800 underline">Open inbox</Link>
        </Card>
      </div>
    </>
  );
}
