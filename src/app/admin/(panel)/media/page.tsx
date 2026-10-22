import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { Film, Pencil } from "lucide-react";
import { getDb } from "@/db";
import { mediaAssets } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { MEDIA_LIMITS, formatBytes, formatDuration, mediaThumb } from "@/lib/media";
import { MEDIA_CATEGORIES, formatDate } from "@/lib/format";
import { Uploader } from "@/components/admin/Uploader";
import { ActionForm, AreaField, CheckField, DeleteForm, SelectField, TextField } from "@/components/admin/ui";
import { PageHeader } from "@/components/admin/PageHeader";
import { deleteMedia, updateMedia } from "../../actions";

export const metadata = { title: "Photos & videos" };
const PAGE = 48;

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ kind?: string; page?: string }> }) {
  await requireAdmin();
  const { kind, page: p } = await searchParams;
  const page = Math.max(1, parseInt(p || "1", 10) || 1);
  const filter = kind === "image" || kind === "video" ? eq(mediaAssets.kind, kind) : undefined;
  const rows = await getDb()
    .select()
    .from(mediaAssets)
    .where(and(filter))
    .orderBy(desc(mediaAssets.id))
    .limit(PAGE + 1)
    .offset((page - 1) * PAGE);
  const items = rows.slice(0, PAGE);

  const tab = (value: string | undefined, label: string) => (
    <Link
      href={value ? `/admin/media?kind=${value}` : "/admin/media"}
      aria-current={kind === value || (!kind && !value) ? "page" : undefined}
      className={`rounded-full px-3 py-1 text-sm ${kind === value || (!kind && !value) ? "bg-navy-800 text-white" : "bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"}`}
    >
      {label}
    </Link>
  );

  return (
    <>
      <PageHeader title="Photos & videos" description="Everything uploaded here is stored in the school database and appears in the public gallery." />
      <Uploader
        categories={MEDIA_CATEGORIES}
        maxVideoMB={Math.round(MEDIA_LIMITS.videoBytes / 1048576)}
        maxVideoSeconds={MEDIA_LIMITS.videoSeconds}
        maxImageMB={Math.round(MEDIA_LIMITS.imageBytes / 1048576)}
      />

      <div className="mb-3 mt-8 flex items-center gap-2" role="group" aria-label="Filter library">
        {tab(undefined, "All")}
        {tab("image", "Photos")}
        {tab("video", "Videos")}
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">No items yet. Drag files into the box above to add the first one.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((m) => (
            <li key={m.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="relative aspect-[4/3] bg-slate-100">
                {mediaThumb(m) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaThumb(m)} alt={m.altText || m.title} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <Film className="absolute inset-0 m-auto h-8 w-8 text-slate-400" aria-hidden />
                )}
                <div className="absolute left-2 top-2 flex flex-wrap gap-1 text-[11px] font-semibold">
                  {m.kind === "video" && <span className="rounded bg-black/70 px-1.5 py-0.5 text-white">Video {formatDuration(m.durationSeconds)}</span>}
                  {m.featured && <span className="rounded bg-gold-400 px-1.5 py-0.5 text-navy-950">Featured</span>}
                  {!m.published && <span className="rounded bg-slate-800 px-1.5 py-0.5 text-white">Hidden</span>}
                  {m.source === "external" && <span className="rounded bg-sky-100 px-1.5 py-0.5 text-sky-900">Sample</span>}
                </div>
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-medium text-slate-900">{m.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {formatDate(m.eventDate, { month: "short", day: "numeric", year: "numeric" })}
                  {m.source === "upload" && ` · ${formatBytes(m.byteSize)}`}
                </p>
                <details className="group mt-2">
                  <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-medium text-navy-800 marker:hidden">
                    <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit details
                  </summary>
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <ActionForm action={updateMedia} className="space-y-3">
                      <input type="hidden" name="id" value={m.id} />
                      <TextField label="Title" name="title" defaultValue={m.title} required />
                      <TextField label="Event" name="eventName" defaultValue={m.eventName} />
                      <SelectField label="Category" name="category" defaultValue={m.category} options={MEDIA_CATEGORIES.includes(m.category) ? MEDIA_CATEGORIES : [m.category, ...MEDIA_CATEGORIES]} />
                      <TextField label="Date" name="eventDate" type="date" defaultValue={m.eventDate} />
                      <TextField label="Location" name="location" defaultValue={m.location} />
                      <AreaField label="Caption" name="caption" rows={3} defaultValue={m.caption} maxLength={600} />
                      <TextField label="Description for screen readers" name="altText" defaultValue={m.altText} hint="Briefly say what the photo or video shows." />
                      <CheckField label="Featured on the home page" name="featured" defaultChecked={m.featured} />
                      <CheckField label="Visible to the public" name="published" defaultChecked={m.published} />
                    </ActionForm>
                    <div className="mt-2 border-t border-slate-100 pt-2">
                      <DeleteForm action={deleteMedia} id={m.id} label="Delete permanently" confirmText={`Delete “${m.title}”? This cannot be undone.`} />
                    </div>
                  </div>
                </details>
              </div>
            </li>
          ))}
        </ul>
      )}

      <nav className="mt-6 flex justify-between text-sm" aria-label="Pagination">
        {page > 1 ? <Link className="underline" href={`/admin/media?${kind ? `kind=${kind}&` : ""}page=${page - 1}`}>Newer</Link> : <span />}
        {rows.length > PAGE && <Link className="underline" href={`/admin/media?${kind ? `kind=${kind}&` : ""}page=${page + 1}`}>Older</Link>}
      </nav>
    </>
  );
}
