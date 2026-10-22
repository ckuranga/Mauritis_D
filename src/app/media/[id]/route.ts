import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { ensureReady } from "@/db/bootstrap";
import { mediaAssets, mediaBlobs } from "@/db/schema";
import { getAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const SAFE_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy": "default-src 'none'; sandbox",
  "Cross-Origin-Resource-Policy": "same-origin",
};

/** Streams a stored photo or video from PostgreSQL, with HTTP range support for video seeking. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return new Response("Not found", { status: 404 });

  await ensureReady();
  const db = getDb();
  const [asset] = await db
    .select({
      mimeType: mediaAssets.mimeType,
      byteSize: mediaAssets.byteSize,
      published: mediaAssets.published,
      source: mediaAssets.source,
    })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, id))
    .limit(1);

  if (!asset || asset.source !== "upload") return new Response("Not found", { status: 404 });
  if (!asset.published && !(await getAdmin())) return new Response("Not found", { status: 404 });

  const etag = `"m${id}-${asset.byteSize}"`;
  const headers: Record<string, string> = {
    ...SAFE_HEADERS,
    "Content-Type": asset.mimeType || "application/octet-stream",
    "Accept-Ranges": "bytes",
    ETag: etag,
    // Files are immutable (a replacement is a new id), so they cache for a year.
    "Cache-Control": asset.published ? "public, max-age=31536000, immutable" : "private, no-store",
  };

  if (req.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers });

  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") || "");
  if (range && asset.byteSize > 0) {
    let start = range[1] ? parseInt(range[1], 10) : NaN;
    let end = range[2] ? parseInt(range[2], 10) : NaN;
    if (Number.isNaN(start)) {
      // suffix range: last N bytes
      start = Math.max(0, asset.byteSize - (Number.isNaN(end) ? 0 : end));
      end = asset.byteSize - 1;
    } else if (Number.isNaN(end) || end >= asset.byteSize) {
      end = Math.min(asset.byteSize - 1, start + 2 * 1024 * 1024 - 1);
    }
    if (start > end || start >= asset.byteSize) {
      return new Response(null, {
        status: 416,
        headers: { ...headers, "Content-Range": `bytes */${asset.byteSize}` },
      });
    }
    const [row] = await db
      .select({ chunk: sql<Buffer>`substring(${mediaBlobs.data} from ${start + 1} for ${end - start + 1})` })
      .from(mediaBlobs)
      .where(eq(mediaBlobs.assetId, id));
    if (!row) return new Response("Not found", { status: 404 });
    return new Response(new Uint8Array(row.chunk), {
      status: 206,
      headers: {
        ...headers,
        "Content-Range": `bytes ${start}-${end}/${asset.byteSize}`,
        "Content-Length": String(end - start + 1),
      },
    });
  }

  const [row] = await db.select({ data: mediaBlobs.data }).from(mediaBlobs).where(eq(mediaBlobs.assetId, id));
  if (!row) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(row.data), {
    headers: { ...headers, "Content-Length": String(row.data.length) },
  });
}
