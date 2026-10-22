import Link from "next/link";
import type { ReactNode } from "react";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { getSettings } from "@/lib/queries";
import { Crest } from "@/components/site/Crest";
import { SiteNav } from "@/components/site/SiteNav";
import { NAV } from "@/lib/nav";
import { JsonLd } from "@/components/site/JsonLd";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const s = await getSettings();
  const site = process.env.SITE_URL || "http://localhost:3001";

  return (
    <>
      <a href="#main" className="sr-only z-[100] rounded bg-gold-400 px-4 py-2 font-semibold text-navy-950 focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Skip to main content
      </a>

      {s.announcementActive && s.announcementText && (
        <div className="bg-navy-950 text-sm text-white/90">
          <p className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
            {s.announcementLabel && <strong className="mr-2 font-semibold text-gold-300">{s.announcementLabel}</strong>}
            {s.announcementText}
          </p>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-gold-400/60 bg-navy-900">
        <div className="relative mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3 text-white" aria-label={`${s.schoolName}, home`}>
            <Crest className="h-11 w-10 shrink-0" />
            <span>
              <span className="block font-serif text-xl font-semibold leading-none sm:text-[1.4rem]">{s.schoolName}</span>
              <span className="mt-1 block text-xs text-gold-300">Est. {s.foundedYear}</span>
            </span>
          </Link>
          <SiteNav />
        </div>
      </header>

      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>

      <footer className="bg-navy-950 text-white/85">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-3">
              <Crest className="h-12 w-11" />
              <p className="font-serif text-xl font-semibold text-white">{s.schoolName}</p>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed">{s.motto} · Founded {s.foundedYear}</p>
          </div>
          <nav aria-label="Footer">
            <p className="font-serif text-lg text-white">Explore</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm md:grid-cols-1">
              {NAV.map((n) => (
                <li key={n.href}><Link href={n.href} className="hover:text-gold-300 hover:underline">{n.label}</Link></li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="font-serif text-lg text-white">Visit and contact</p>
            <address className="mt-3 space-y-2.5 text-sm not-italic">
              {s.address && <p className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden />{s.address}</p>}
              {s.phone && <p className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden /><a href={`tel:${s.phone.replace(/[^+\d]/g, "")}`} className="hover:underline">{s.phone}</a></p>}
              {s.email && <p className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden /><a href={`mailto:${s.email}`} className="hover:underline">{s.email}</a></p>}
              {s.officeHours && <p className="flex gap-2"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden />{s.officeHours}</p>}
            </address>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-sm text-white/70 sm:px-6">
            <p>© {new Date().getFullYear()} {s.schoolName}</p>
            <Link href="/privacy" className="hover:text-gold-300 hover:underline">Privacy policy</Link>
          </div>
        </div>
      </footer>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: s.schoolName,
          url: site,
          foundingDate: s.foundedYear,
          telephone: s.phone || undefined,
          email: s.email || undefined,
          address: s.address ? { "@type": "PostalAddress", streetAddress: s.address } : undefined,
        }}
      />
    </>
  );
}
