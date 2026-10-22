import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { ensureReady } from "@/db/bootstrap";
import { mediaAssets, mediaBlobs } from "@/db/schema";
import { getAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Small preview image used in grids. Falls back to the original for photos. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return new Response("Not found", { status: 404 });

  await ensureReady();
  const db = getDb();
  const [asset] = await db
    .select({ kind: mediaAssets.kind, mimeType: mediaAssets.mimeType, published: mediaAssets.published, source: mediaAssets.source, byteSize: mediaAssets.byteSize })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, id))
    .limit(1);
  if (!asset || asset.source !== "upload") return new Response("Not found", { status: 404 });
  if (!asset.published && !(await getAdmin())) return new Response("Not found", { status: 404 });

  const etag = `"t${id}-${asset.byteSize}"`;
  const baseHeaders = {
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; sandbox",
    ETag: etag,
    "Cache-Control": asset.published ? "public, max-age=31536000, immutable" : "private, no-store",
  };
  if (req.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers: baseHeaders });

  const [row] = await db
    .select({ data: mediaBlobs.data, thumbData: mediaBlobs.thumbData, thumbMime: mediaBlobs.thumbMime })
    .from(mediaBlobs)
    .where(eq(mediaBlobs.assetId, id));
  if (!row) return new Response("Not found", { status: 404 });

  if (row.thumbData) {
    return new Response(new Uint8Array(row.thumbData), {
      headers: { ...baseHeaders, "Content-Type": row.thumbMime || "image/jpeg" },
    });
  }
  if (asset.kind === "image") {
    return new Response(new Uint8Array(row.data), {
      headers: { ...baseHeaders, "Content-Type": asset.mimeType || "image/jpeg" },
    });
  }
  return new Response("Not found", { status: 404 });
}
