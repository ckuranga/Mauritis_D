import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s | Administration" },
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: undefined },
};

export const dynamic = "force-dynamic";

export default function AdminRoot({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-slate-100 font-sans text-slate-900">{children}</div>;
}
