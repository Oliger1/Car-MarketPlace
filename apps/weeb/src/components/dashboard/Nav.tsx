"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/cars", label: "Makinat" },
  { href: "/dashboard/bookings", label: "Rezervimet" },
  { href: "/dashboard/requests", label: "Kërkesat" },
  { href: "/dashboard/company", label: "Kompania" },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  async function doLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur md:flex-row md:items-center md:justify-between">
      <Link href="/" className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-blue-500/80 via-violet-500/70 to-emerald-500/70 shadow-lg" />
        <div>
          <div className="font-semibold leading-5">Mix</div>
          <div className="text-xs text-zinc-400">Private dashboard</div>
        </div>
      </Link>

      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "rounded-2xl px-3 py-2 text-sm transition",
              pathname === l.href ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/7 hover:text-white"
            )}
          >
            {l.label}
          </Link>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={doLogout}>
        Dil
      </Button>
    </div>
  );
}
