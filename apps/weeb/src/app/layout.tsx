import "@/styles/globals.css";
import type { Metadata } from "next";
import { site } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: ["/og.svg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq">
      <body>
        <div className="pointer-events-none fixed inset-0 noise opacity-[0.25]" />
        {children}
      </body>
    </html>
  );
}
