import type { MediaAsset } from "@/db/schema";

export const MEDIA_LIMITS = {
  imageBytes: 10 * 1024 * 1024,
  videoBytes: Number(process.env.MAX_VIDEO_MB || 40) * 1024 * 1024,
  videoSeconds: 90,
};

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

/** Identify a file by its first bytes instead of trusting the browser's claim. */
export function sniffMime(b: Buffer): string | null {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return "image/png";
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP")
    return "image/webp";
  if (b.toString("ascii", 4, 8) === "ftyp") {
    const brand = b.toString("ascii", 8, 12);
    return brand === "qt  " ? "video/quicktime" : "video/mp4";
  }
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return "video/webm";
  return null;
}

type MediaLike = Pick<MediaAsset, "id" | "source" | "externalUrl" | "externalThumbUrl" | "kind" | "hasThumb">;

export function mediaSrc(m: MediaLike): string {
  return m.source === "upload" ? `/media/${m.id}` : (m.externalUrl ?? "");
}

export function mediaThumb(m: MediaLike): string {
  if (m.source === "upload") return m.hasThumb || m.kind === "image" ? `/media/${m.id}/thumb` : "";
  return m.externalThumbUrl || (m.kind === "image" ? (m.externalUrl ?? "") : "");
}

/** Resolve a cover that may be a stored upload or an external address. */
export function coverSrc(mediaId: number | null, url: string | null): string | null {
  if (mediaId) return `/media/${mediaId}`;
  return url || null;
}

export function formatBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(n / 1024))} KB`;
}

export function formatDuration(s: number | null): string {
  if (!s && s !== 0) return "";
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
