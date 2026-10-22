"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, X, Film, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { inputCls } from "./ui";

type Item = {
  key: string;
  file: File;
  title: string;
  alt: string;
  kind: "image" | "video";
  preview: string;
  status: "ready" | "processing" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
};

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

function cleanTitle(name: string) {
  const t = name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : "Untitled";
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (webp) => {
        if (webp && webp.type === "image/webp") return resolve(webp);
        canvas.toBlob((jpg) => resolve(jpg), "image/jpeg", quality);
      },
      "image/webp",
      quality
    );
  });
}

function drawScaled(source: CanvasImageSource, w: number, h: number, max: number) {
  const scale = Math.min(1, max / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** Shrinks a photo to web size (long edge 2400px) and makes a 640px preview. */
async function processImage(file: File) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const full = drawScaled(bitmap, bitmap.width, bitmap.height, 2400);
  const small = drawScaled(bitmap, bitmap.width, bitmap.height, 640);
  bitmap.close();
  const [main, thumb] = await Promise.all([canvasBlob(full, 0.86), canvasBlob(small, 0.8)]);
  if (!main) throw new Error("This photo could not be processed.");
  return { main, thumb, width: full.width, height: full.height };
}

/** Reads length and a preview frame from a video, entirely in the browser. */
function inspectVideo(file: File): Promise<{ duration: number; thumb: Blob | null; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.playsInline = true;
    const done = (fn: () => void) => {
      URL.revokeObjectURL(url);
      fn();
    };
    v.onerror = () => done(() => reject(new Error("This video cannot be read by the browser. Try MP4 (H.264).")));
    v.onloadedmetadata = () => {
      const duration = Math.round(v.duration);
      const width = v.videoWidth;
      const height = v.videoHeight;
      v.currentTime = Math.min(1, v.duration / 2);
      v.onseeked = async () => {
        try {
          const canvas = drawScaled(v, width, height, 640);
          const thumb = await canvasBlob(canvas, 0.8);
          done(() => resolve({ duration, thumb, width, height }));
        } catch {
          done(() => resolve({ duration, thumb: null, width, height }));
        }
      };
    };
    v.src = url;
  });
}

function send(form: FormData, onProgress: (p: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/media");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let msg = "Upload failed.";
      try {
        msg = JSON.parse(xhr.responseText).error || msg;
      } catch {}
      reject(new Error(msg));
    };
    xhr.onerror = () => reject(new Error("Network error. Check your connection and retry."));
    xhr.send(form);
  });
}

export function Uploader({
  categories,
  maxVideoMB,
  maxVideoSeconds,
  maxImageMB,
}: {
  categories: string[];
  maxVideoMB: number;
  maxVideoSeconds: number;
  maxImageMB: number;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [shared, setShared] = useState({
    eventName: "",
    category: categories[0],
    eventDate: new Date().toISOString().slice(0, 10),
    location: "",
    published: true,
  });

  const patch = (key: string, p: Partial<Item>) =>
    setItems((list) => list.map((i) => (i.key === key ? { ...i, ...p } : i)));

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const next: Item[] = [];
      for (const file of Array.from(files)) {
        const isImage = IMAGE_TYPES.includes(file.type);
        const isVideo = VIDEO_TYPES.includes(file.type);
        const key = `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 6)}`;
        let error: string | undefined;
        if (!isImage && !isVideo) error = "Use JPG, PNG or WebP photos, or MP4, WebM or MOV videos.";
        else if (isVideo && file.size > maxVideoMB * 1048576) error = `Videos must be under ${maxVideoMB} MB.`;
        else if (isImage && file.size > 40 * 1048576) error = "This photo is too large (over 40 MB).";
        next.push({
          key,
          file,
          title: cleanTitle(file.name),
          alt: "",
          kind: isVideo ? "video" : "image",
          preview: isImage ? URL.createObjectURL(file) : "",
          status: error ? "error" : "ready",
          progress: 0,
          error,
        });
      }
      setItems((cur) => [...cur, ...next]);
    },
    [maxVideoMB]
  );

  const remove = (key: string) =>
    setItems((list) => {
      const gone = list.find((i) => i.key === key);
      if (gone?.preview) URL.revokeObjectURL(gone.preview);
      return list.filter((i) => i.key !== key);
    });

  async function uploadAll() {
    setBusy(true);
    for (const item of items.filter((i) => i.status === "ready" || (i.status === "error" && !i.error?.startsWith("Use ") && !i.error?.includes("under")))) {
      try {
        patch(item.key, { status: "processing", error: undefined, progress: 0 });
        const form = new FormData();
        if (item.kind === "image") {
          let main: Blob = item.file;
          let thumb: Blob | null = null;
          let width = 0;
          let height = 0;
          try {
            const r = await processImage(item.file);
            main = r.main;
            thumb = r.thumb;
            width = r.width;
            height = r.height;
          } catch {
            if (item.file.size > maxImageMB * 1048576) throw new Error(`This photo could not be resized and is over ${maxImageMB} MB.`);
          }
          form.append("file", new File([main], item.file.name, { type: main.type }));
          if (thumb) form.append("thumb", new File([thumb], "thumb", { type: thumb.type }));
          if (width) form.append("width", String(width));
          if (height) form.append("height", String(height));
          form.append("altText", item.alt || item.title);
        } else {
          const info = await inspectVideo(item.file);
          if (info.duration > maxVideoSeconds)
            throw new Error(`Videos must be ${maxVideoSeconds} seconds or shorter (this one is ${info.duration}s).`);
          form.append("file", item.file);
          if (info.thumb) {
            form.append("thumb", new File([info.thumb], "thumb", { type: info.thumb.type }));
            patch(item.key, { preview: URL.createObjectURL(info.thumb) });
          }
          form.append("durationSeconds", String(info.duration));
          form.append("width", String(info.width));
          form.append("height", String(info.height));
          form.append("altText", item.alt || item.title);
        }
        form.append("title", item.title);
        form.append("eventName", shared.eventName);
        form.append("category", shared.category);
        form.append("eventDate", shared.eventDate);
        form.append("location", shared.location);
        form.append("published", String(shared.published));
        patch(item.key, { status: "uploading" });
        await send(form, (p) => patch(item.key, { progress: p }));
        patch(item.key, { status: "done", progress: 1 });
      } catch (e) {
        patch(item.key, { status: "error", error: e instanceof Error ? e.message : "Upload failed." });
      }
    }
    setBusy(false);
    router.refresh();
  }

  const pending = items.filter((i) => i.status === "ready" || (i.status === "error" && !i.error?.startsWith("Use ") && !i.error?.includes("under"))).length;
  const doneCount = items.filter((i) => i.status === "done").length;

  return (
    <section aria-labelledby="upload-heading" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 id="upload-heading" className="font-sans text-base font-semibold text-slate-900">
        Add photos and short videos
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Photos are resized automatically. Videos can be up to {maxVideoSeconds} seconds and {maxVideoMB} MB.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        }}
        className={`mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
          dragging ? "border-navy-700 bg-navy-700/5" : "border-slate-300 bg-slate-50"
        }`}
      >
        <UploadCloud className="h-8 w-8 text-slate-400" aria-hidden />
        <p className="mt-2 text-sm text-slate-700">Drag files here, or</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Choose files
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={[...IMAGE_TYPES, ...VIDEO_TYPES].join(",")}
          className="sr-only"
          aria-label="Choose photos or videos"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {items.length > 0 && (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-800">Event</span>
              <input className={inputCls} value={shared.eventName} onChange={(e) => setShared({ ...shared, eventName: e.target.value })} placeholder="e.g. Founders’ Day" />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-800">Category</span>
              <select className={inputCls} value={shared.category} onChange={(e) => setShared({ ...shared, category: e.target.value })}>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-800">Date</span>
              <input type="date" className={inputCls} value={shared.eventDate} onChange={(e) => setShared({ ...shared, eventDate: e.target.value })} />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-800">Location</span>
              <input className={inputCls} value={shared.location} onChange={(e) => setShared({ ...shared, location: e.target.value })} placeholder="e.g. Main quadrangle" />
            </label>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-slate-800">
            <input type="checkbox" checked={shared.published} onChange={(e) => setShared({ ...shared, published: e.target.checked })} className="h-4 w-4 rounded border-slate-300" />
            Show on the public gallery immediately
          </label>

          <ul className="mt-5 divide-y divide-slate-200 rounded-lg border border-slate-200">
            {items.map((item) => (
              <li key={item.key} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded bg-slate-100">
                  {item.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.preview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Film className="absolute inset-0 m-auto h-6 w-6 text-slate-400" aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    aria-label={`Title for ${item.file.name}`}
                    className={inputCls}
                    value={item.title}
                    disabled={item.status === "uploading" || item.status === "done"}
                    onChange={(e) => patch(item.key, { title: e.target.value })}
                  />
                  {item.kind === "image" && item.status !== "done" && (
                    <input
                      aria-label={`Describe ${item.file.name} for screen readers`}
                      className={inputCls}
                      placeholder="Describe what the photo shows (for screen readers)"
                      value={item.alt}
                      onChange={(e) => patch(item.key, { alt: e.target.value })}
                    />
                  )}
                  {(item.status === "uploading" || item.status === "processing") && (
                    <div className="flex items-center gap-2 text-xs text-slate-600" role="status">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                      {item.status === "processing" ? "Preparing…" : `Uploading ${Math.round(item.progress * 100)}%`}
                      <progress value={item.progress} max={1} className="h-1.5 w-32" aria-label="Upload progress" />
                    </div>
                  )}
                  {item.status === "done" && (
                    <p className="flex items-center gap-1.5 text-xs text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Uploaded
                    </p>
                  )}
                  {item.status === "error" && (
                    <p role="alert" className="flex items-start gap-1.5 text-xs text-red-700">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> {item.error}
                    </p>
                  )}
                </div>
                {!busy && item.status !== "uploading" && (
                  <button type="button" onClick={() => remove(item.key)} className="self-start rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800" aria-label={`Remove ${item.file.name}`}>
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={uploadAll}
              disabled={busy || pending === 0}
              className="rounded-md bg-navy-800 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Uploading…" : `Upload ${pending} file${pending === 1 ? "" : "s"}`}
            </button>
            {doneCount > 0 && !busy && (
              <button type="button" onClick={() => setItems((l) => l.filter((i) => i.status !== "done"))} className="text-sm text-slate-600 underline">
                Clear finished
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
