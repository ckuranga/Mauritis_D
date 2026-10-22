import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const siteUrl = process.env.SITE_URL || "http://localhost:3001";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Westminster Heritage Academy",
    template: "%s | Westminster Heritage Academy",
  },
  description:
    "Westminster Heritage Academy is a K–12 day and boarding school, founded in 1894, combining classical liberal arts with research, the arts and athletics.",
  openGraph: { type: "website", siteName: "Westminster Heritage Academy", locale: "en_US" },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "./" },
};

export const viewport: Viewport = {
  themeColor: "#0d1f35",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
