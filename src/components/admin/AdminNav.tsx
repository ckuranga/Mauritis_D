"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Images, Newspaper, Trophy, Inbox, Settings, UserCog } from "lucide-react";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/media", label: "Photos & videos", icon: Images },
  { href: "/admin/news", label: "News & events", icon: Newspaper },
  { href: "/admin/activities", label: "Activities", icon: Trophy },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox, badge: true },
  { href: "/admin/settings", label: "Site settings", icon: Settings },
  { href: "/admin/account", label: "My account", icon: UserCog },
];

export function AdminNav({ newInquiries }: { newInquiries: number }) {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto lg:flex-col">
      {items.map(({ href, label, icon: Icon, exact, badge }) => {
        const active = exact ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
              active ? "bg-white/12 text-white" : "text-slate-300 hover:bg-white/8 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden />
            <span>{label}</span>
            {badge && newInquiries > 0 && (
              <span className="ml-auto rounded-full bg-gold-400 px-2 py-0.5 text-xs font-bold text-navy-950">
                <span className="sr-only">{newInquiries} new</span>
                <span aria-hidden>{newInquiries}</span>
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
