import type { ReactNode } from "react";
import Link from "next/link";
import { Photo } from "./Photo";

export function PageIntro({ title, lead }: { title: string; lead?: string }) {
  return (
    <div className="bg-navy-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="max-w-3xl text-4xl sm:text-5xl">{title}</h1>
        {lead && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/85">{lead}</p>}
      </div>
    </div>
  );
}

export function Section({ children, tone = "paper", className = "" }: { children: ReactNode; tone?: "paper" | "linen" | "navy"; className?: string }) {
  const bg = tone === "linen" ? "bg-linen" : tone === "navy" ? "bg-navy-900 text-white" : "bg-paper";
  return (
    <section className={`${bg} ${className}`}>
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">{children}</div>
    </section>
  );
}

export function Paragraphs({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={className}>
      {text.split(/\n{2,}/).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

export function PostCard({ href, title, summary, meta, image, alt = "" }: { href: string; title: string; summary: string; meta: string; image: string | null; alt?: string }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded border border-line bg-white">
      <div className="relative aspect-[16/10] bg-linen">
        {image && <Photo src={image} alt={alt} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" />}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm text-muted">{meta}</p>
        <h3 className="mt-1 text-xl">
          <Link href={href} className="after:absolute after:inset-0 hover:underline focus-visible:underline">
            {title}
          </Link>
        </h3>
        <p className="mt-2 text-muted">{summary}</p>
      </div>
    </article>
  );
}
