import { CSSProperties, ReactNode } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { mainOrigin } from "@/lib/tenant";
import { brandStyle } from "@/lib/storefront";
import { resolveFileUrl } from "@/lib/utils";

export async function PublicShell({
  children,
  flush = false,
  companyName,
  brand,
}: {
  children: ReactNode;
  flush?: boolean;
  companyName?: string;
  brand?: {
    logo_path?: string | null;
    brand_primary?: string | null;
    brand_accent?: string | null;
  } | null;
}) {
  const h = await headers();
  const tenant = h.get("x-tenant-slug");
  const market = mainOrigin();
  const style = tenant && brand ? brandStyle(brand) : undefined;

  return (
    <div className="min-h-screen" style={style as CSSProperties | undefined}>
      <SiteNav
        tenant={tenant}
        companyName={companyName}
        market={market}
        logoSrc={tenant && brand?.logo_path ? resolveFileUrl(brand.logo_path) : null}
      />
      {flush ? children : <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>}
      <footer className="mt-16 border-t border-line bg-surface/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6 px-4 py-10 sm:px-6">
          <div>
            <p className="font-display text-3xl text-ink">
              {tenant ? companyName || tenant : <>Mix<span className="text-signal">.</span></>}
            </p>
            <p className="mt-2 max-w-xs text-sm text-muted">
              {tenant ? "Faqja e kompanisë, e ndërtuar mbi Mix." : "Makina me qira nga kompani lokale, pa ndërmjetës."}
            </p>
          </div>
          <div className="flex gap-5 text-sm font-semibold">
            {tenant ? (
              <a href={market} className="hover:text-accent">Kthehu te Mix</a>
            ) : (
              <>
                <Link href="/cars" className="hover:text-accent">Makinat</Link>
                <Link href="/companies" className="hover:text-accent">Kompanitë</Link>
                <Link href="/login" className="hover:text-accent">Paneli</Link>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
