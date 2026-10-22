"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV } from "@/lib/nav";


export function SiteNav() {
  const path = usePathname();
  // The menu is "open for" a specific path, so navigating closes it without an effect.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === path;
  const setOpen = (v: boolean) => setOpenFor(v ? path : null);

  const active = (href: string) => path === href || path.startsWith(href + "/");
  return (
    <>
      <nav aria-label="Main" className="hidden items-center gap-1 xl:flex">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active(n.href) ? "page" : undefined}
            className={`rounded px-3 py-2 text-[0.9rem] font-medium transition-colors ${
              active(n.href) ? "text-gold-300" : "text-white/90 hover:text-gold-300"
            }`}
          >
            {n.label}
          </Link>
        ))}
        <Link href="/admissions#visit" className="ml-3 rounded bg-gold-400 px-4 py-2 text-[0.9rem] font-semibold text-navy-950 hover:bg-gold-300">
          Book a visit
        </Link>
      </nav>

      <button
        type="button"
        className="rounded p-2 text-white xl:hidden"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>

      {open && (
        <nav id="mobile-menu" aria-label="Main (mobile)" className="absolute inset-x-0 top-full border-t border-white/10 bg-navy-950 px-4 pb-5 pt-3 xl:hidden">
          <ul className="mx-auto max-w-6xl">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={active(n.href) ? "page" : undefined} className={`block border-b border-white/10 py-3 text-base ${active(n.href) ? "text-gold-300" : "text-white"}`}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/admissions#visit" className="mx-auto mt-4 block max-w-6xl rounded bg-gold-400 px-4 py-3 text-center font-semibold text-navy-950">
            Book a visit
          </Link>
        </nav>
      )}
    </>
  );
}
