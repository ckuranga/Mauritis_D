import type { ReactNode } from "react";
import Link from "next/link";
import { eq, count } from "drizzle-orm";
import { ExternalLink, LogOut } from "lucide-react";
import { getDb } from "@/db";
import { inquiries } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { logout } from "../login/actions";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const me = await requireAdmin();
  const [{ n }] = await getDb().select({ n: count() }).from(inquiries).where(eq(inquiries.status, "new"));

  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[15rem_1fr]">
      <aside className="bg-navy-950 px-3 py-4 text-slate-200 lg:sticky lg:top-0 lg:h-screen lg:py-6">
        <div className="mb-4 flex items-center justify-between px-3 lg:mb-6 lg:block">
          <p className="font-sans text-sm font-semibold text-white">School administration</p>
          <Link href="/" target="_blank" className="mt-0 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white lg:mt-1">
            View public site <ExternalLink className="h-3 w-3" aria-hidden /><span className="sr-only">(opens in a new tab)</span>
          </Link>
        </div>
        <AdminNav newInquiries={n} />
        <div className="mt-6 hidden border-t border-white/10 px-3 pt-4 lg:absolute lg:bottom-6 lg:left-3 lg:right-3 lg:block">
          <p className="truncate text-sm font-medium text-white">{me.name}</p>
          <p className="truncate text-xs text-slate-400">{me.email}</p>
          <form action={logout} className="mt-3">
            <button className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
              <LogOut className="h-4 w-4" aria-hidden /> Sign out
            </button>
          </form>
        </div>
      </aside>
      <main id="main" className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
        <form action={logout} className="mt-10 lg:hidden">
          <button className="inline-flex items-center gap-2 text-sm text-slate-600 underline">
            <LogOut className="h-4 w-4" aria-hidden /> Sign out ({me.name})
          </button>
        </form>
      </main>
    </div>
  );
}
