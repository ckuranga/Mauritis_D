"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";

export type GalleryItem = {
  id: number;
  kind: "image" | "video";
  src: string;
  thumb: string;
  title: string;
  alt: string;
  caption: string;
  meta: string;
  duration: string;
};

/** Thumbnail grid that opens photos and videos in an accessible lightbox. */
export function Gallery({ items, columns = "grid-cols-2 md:grid-cols-3 xl:grid-cols-4" }: { items: GalleryItem[]; columns?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [index, setIndex] = useState<number | null>(null);

  const show = (i: number, el?: HTMLElement) => {
    if (el) openerRef.current = el;
    setIndex(i);
    if (!dialogRef.current?.open) dialogRef.current?.showModal();
  };
  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);
  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + items.length) % items.length)),
    [items.length]
  );

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const onClose = () => {
      setIndex(null);
      openerRef.current?.focus();
    };
    dlg.addEventListener("close", onClose);
    return () => dlg.removeEventListener("close", onClose);
  }, []);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, step]);

  const current = index === null ? null : items[index];

  return (
    <>
      <ul className={`grid gap-3 ${columns}`}>
        {items.map((m, i) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={(e) => show(i, e.currentTarget)}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded bg-linen text-left"
              aria-label={`${m.kind === "video" ? "Play video" : "View photo"}: ${m.title}`}
            >
              {m.thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.thumb} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              ) : (
                <span className="absolute inset-0 bg-navy-800" />
              )}
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/85 to-transparent p-3 pt-10 text-sm font-medium text-white">
                <span className="line-clamp-2">{m.title}</span>
              </span>
              {m.kind === "video" && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-navy-950/80 px-2 py-1 text-xs font-semibold text-white">
                  <Play className="h-3 w-3 fill-current" aria-hidden /> {m.duration || "Video"}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={current ? current.title : "Media viewer"}
        className="m-auto h-[100dvh] max-h-none w-full max-w-none bg-transparent p-0 text-white sm:h-auto sm:max-h-[94dvh] sm:w-[min(1100px,96vw)]"
        onClick={(e) => e.target === dialogRef.current && close()}
      >
        {current && (
          <div className="flex h-full flex-col bg-navy-950 sm:rounded-lg">
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <p className="min-w-0 truncate font-serif text-lg">{current.title}</p>
              <button type="button" onClick={close} className="rounded p-2 hover:bg-white/10" autoFocus>
                <X className="h-5 w-5" aria-hidden />
                <span className="sr-only">Close</span>
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black">
              {current.kind === "video" ? (
                <video key={current.id} controls autoPlay playsInline preload="metadata" poster={current.thumb || undefined} className="max-h-[70dvh] w-full">
                  <source src={current.src} />
                  Your browser cannot play this video. <a href={current.src}>Download it instead</a>.
                </video>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={current.id} src={current.src} alt={current.alt} className="max-h-[70dvh] w-full object-contain" />
              )}
              {items.length > 1 && (
                <>
                  <button type="button" onClick={() => step(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-navy-950/70 p-2 hover:bg-navy-950">
                    <ChevronLeft className="h-6 w-6" aria-hidden />
                    <span className="sr-only">Previous</span>
                  </button>
                  <button type="button" onClick={() => step(1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-navy-950/70 p-2 hover:bg-navy-950">
                    <ChevronRight className="h-6 w-6" aria-hidden />
                    <span className="sr-only">Next</span>
                  </button>
                </>
              )}
            </div>
            <div className="px-4 py-3 text-sm text-white/80" aria-live="polite">
              {current.caption && <p className="max-w-3xl text-white">{current.caption}</p>}
              <p className="mt-1 text-white/60">{current.meta}</p>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
