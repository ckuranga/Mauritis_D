import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { ensureReady } from "@/db/bootstrap";
import { mediaAssets, mediaBlobs } from "@/db/schema";
import { getAdmin, isSameOrigin } from "@/lib/auth";
import { IMAGE_TYPES, VIDEO_TYPES, MEDIA_LIMITS, sniffMime } from "@/lib/media";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const text = (v: FormDataEntryValue | null, max: number) =>
  (typeof v === "string" ? v.trim() : "").slice(0, max);
const int = (v: FormDataEntryValue | null) => {
  const n = typeof v === "string" ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) && n > 0 && n < 100000 ? n : null;
};
const fail = (error: string, status = 400) => Response.json({ error }, { status });

/** Administrator-only: validates and stores one photo or short video in PostgreSQL. */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return fail("Request origin not allowed.", 403);
  const admin = await getAdmin();
  if (!admin) return fail("Sign in again to upload.", 401);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("The upload could not be read. Try a smaller file.");
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return fail("Choose a photo or video to upload.");

  const data = Buffer.from(await file.arrayBuffer());
  const mime = sniffMime(data);
  if (!mime || ![...IMAGE_TYPES, ...VIDEO_TYPES].includes(mime))
    return fail("Unsupported file. Use JPG, PNG or WebP photos, or MP4, WebM or MOV videos.");

  const kind = IMAGE_TYPES.includes(mime) ? "image" : "video";
  const limit = kind === "image" ? MEDIA_LIMITS.imageBytes : MEDIA_LIMITS.videoBytes;
  if (data.length > limit)
    return fail(`That ${kind} is too large. The limit is ${Math.round(limit / 1048576)} MB.`, 413);

  let thumb: Buffer | null = null;
  let thumbMime: string | null = null;
  const thumbFile = form.get("thumb");
  if (thumbFile instanceof File && thumbFile.size > 0 && thumbFile.size <= 800 * 1024) {
    const t = Buffer.from(await thumbFile.arrayBuffer());
    const tm = sniffMime(t);
    if (tm && IMAGE_TYPES.includes(tm)) {
      thumb = t;
      thumbMime = tm;
    }
  }

  const title = text(form.get("title"), 160);
  if (!title) return fail("Add a title.");
  const date = text(form.get("eventDate"), 10);
  const eventDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().slice(0, 10);
  const duration = kind === "video" ? Math.min(int(form.get("durationSeconds")) ?? 0, 3600) : null;
  if (kind === "video" && duration && duration > MEDIA_LIMITS.videoSeconds + 5)
    return fail(`Videos must be ${MEDIA_LIMITS.videoSeconds} seconds or shorter.`);

  const db = getDb();
  await ensureReady();
  const created = await db.transaction(async (tx) => {
    const [asset] = await tx
      .insert(mediaAssets)
      .values({
        title,
        eventName: text(form.get("eventName"), 160),
        category: text(form.get("category"), 80) || "Campus life",
        kind,
        source: "upload",
        mimeType: mime,
        byteSize: data.length,
        width: int(form.get("width")),
        height: int(form.get("height")),
        durationSeconds: duration,
        hasThumb: Boolean(thumb),
        caption: text(form.get("caption"), 600),
        altText: text(form.get("altText"), 300) || title,
        eventDate,
        location: text(form.get("location"), 160),
        uploadedBy: admin.name,
        featured: form.get("featured") === "true",
        published: form.get("published") !== "false",
      })
      .returning();
    await tx.insert(mediaBlobs).values({ assetId: asset.id, data, thumbData: thumb, thumbMime });
    return asset;
  });

  revalidatePath("/gallery");
  revalidatePath("/");
  return Response.json({ id: created.id }, { status: 201 });
}
