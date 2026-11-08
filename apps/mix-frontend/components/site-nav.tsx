"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";

export function SiteNav({
  tenant,
  companyName,
  market,
  logoSrc,
}: {
  tenant: string | null;
  companyName?: string;
  market: string;
  logoSrc?: string | null;
}) {
  const [open, setOpen] = useState(false);

  const links = tenant
    ? [
        { href: `${market}/cars`, label: "Tregu Mix", external: true },
        { href: `${market}/companies`, label: "Kompanitë", external: true },
      ]
    : [
        { href: "/cars", label: "Makinat", external: false },
        { href: "/companies", label: "Kompanitë", external: false },
        { href: "/login", label: "Hyr", external: false },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-[#f4efe8]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Logo href="/" name={tenant ? companyName || tenant : undefined} imageSrc={tenant ? logoSrc : undefined} />
        <nav className="hidden items-center gap-1 text-sm font-semibold text-ink/80 md:flex">
          {links.map((item) =>
            item.external ? (
              <a key={item.href} href={item.href} className="rounded-full px-3 py-2 hover:bg-white hover:text-ink">
                {item.label}
              </a>
            ) : (
              <Link key={item.href} href={item.href} className="rounded-full px-3 py-2 hover:bg-white hover:text-ink">
                {item.label}
              </Link>
            ),
          )}
          {tenant ? (
            <a href={`${market}/login`} className="ml-1 rounded-full bg-ink px-4 py-2 text-white hover:bg-accent">
              Hyr
            </a>
          ) : (
            <Link href="/register" className="ml-1 rounded-full bg-ink px-4 py-2 text-white hover:bg-accent">
              Hap kompaninë
            </Link>
          )}
        </nav>
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Mbyll menunë" : "Hap menunë"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-line bg-[#f4efe8] px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1 text-sm font-semibold">
            {links.map((item) =>
              item.external ? (
                <a key={item.href} href={item.href} className="rounded-xl px-3 py-3 hover:bg-white" onClick={() => setOpen(false)}>
                  {item.label}
                </a>
              ) : (
                <Link key={item.href} href={item.href} className="rounded-xl px-3 py-3 hover:bg-white" onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              ),
            )}
            {tenant ? (
              <a href={`${market}/login`} className="mt-1 rounded-xl bg-ink px-3 py-3 text-center text-white">
                Hyr
              </a>
            ) : (
              <Link href="/register" className="mt-1 rounded-xl bg-ink px-3 py-3 text-center text-white" onClick={() => setOpen(false)}>
                Hap kompaninë
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
