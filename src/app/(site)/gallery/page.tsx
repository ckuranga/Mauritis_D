import Link from "next/link";
import type { Metadata } from "next";
import { getGallery, getGalleryCategories } from "@/lib/queries";
import { formatDuration, mediaSrc, mediaThumb } from "@/lib/media";
import { formatDate } from "@/lib/format";
import { Gallery, type GalleryItem } from "@/components/site/Gallery";
import { PageIntro, Section } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photographs and short films from events and everyday life at the school.",
};

type SP = { kind?: string; category?: string; page?: string };

export default async function GalleryPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const kind = sp.kind === "image" || sp.kind === "video" ? sp.kind : undefined;
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const [{ items, total, pages }, categories] = await Promise.all([
    getGallery({ kind, category: sp.category, page }),
    getGalleryCategories(),
  ]);

  const href = (over: Partial<SP>) => {
    const q = new URLSearchParams();
    const m = { kind, category: sp.category, page: undefined as string | undefined, ...over };
    for (const [k, v] of Object.entries(m)) if (v) q.set(k, String(v));
    const s = q.toString();
    return `/gallery${s ? `?${s}` : ""}`;
  };
  const chip = (label: string, target: string, active: boolean) => (
    <Link key={label} href={target} aria-current={active ? "page" : undefined}
      className={`rounded-full px-4 py-2 text-sm font-medium ${active ? "bg-navy-900 text-white" : "bg-white text-ink ring-1 ring-line hover:bg-linen"}`}>
      {label}
    </Link>
  );

  const list: GalleryItem[] = items.map((m) => ({
    id: m.id,
    kind: m.kind === "video" ? "video" : "image",
    src: mediaSrc(m),
    thumb: mediaThumb(m),
    title: m.title,
    alt: m.altText || m.title,
    caption: m.caption,
    meta: [m.eventName, formatDate(m.eventDate), m.location].filter(Boolean).join(" · "),
    duration: formatDuration(m.durationSeconds),
  }));

  return (
    <>
      <PageIntro title="Gallery" lead="Photographs and short films from events and everyday life on campus." />
      <Section>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <nav aria-label="Media type" className="flex gap-2">
            {chip("All", href({ kind: undefined }), !kind)}
            {chip("Photos", href({ kind: "image" }), kind === "image")}
            {chip("Videos", href({ kind: "video" }), kind === "video")}
          </nav>
          {categories.length > 1 && (
            <nav aria-label="Category" className="flex flex-wrap gap-2">
              {chip("All topics", href({ category: undefined }), !sp.category)}
              {categories.map((c) => chip(c, href({ category: c }), sp.category === c))}
            </nav>
          )}
        </div>
        <p className="mt-6 text-sm text-muted" role="status">{total} {total === 1 ? "item" : "items"}</p>

        {list.length === 0 ? (
          <p className="mt-6 text-lg text-muted">No photos or videos match these filters. <Link className="underline" href="/gallery">Show everything</Link>.</p>
        ) : (
          <div className="mt-4"><Gallery items={list} /></div>
        )}

        {pages > 1 && (
          <nav aria-label="Pages" className="mt-10 flex items-center justify-between">
            {page > 1 ? <Link className="font-medium text-navy-800 underline underline-offset-4" href={href({ page: String(page - 1) })}>Previous page</Link> : <span />}
            <span className="text-sm text-muted">Page {page} of {pages}</span>
            {page < pages ? <Link className="font-medium text-navy-800 underline underline-offset-4" href={href({ page: String(page + 1) })}>Next page</Link> : <span />}
          </nav>
        )}
      </Section>
    </>
  );
}
