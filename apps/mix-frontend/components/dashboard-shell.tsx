"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Building2, CalendarDays, CarFront, CreditCard, Inbox, LayoutDashboard, LogOut, Menu, Palette, Search, Shield, Users, X } from "lucide-react";
import { authApi } from "@/lib/api";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Paneli", icon: LayoutDashboard },
  { href: "/dashboard/cars", label: "Makinat", icon: CarFront },
  { href: "/dashboard/bookings", label: "Rezervimet", icon: CalendarDays },
  { href: "/dashboard/booking-requests", label: "Kërkesat", icon: Inbox },
  { href: "/dashboard/customers", label: "Klientët", icon: Users },
  { href: "/dashboard/company", label: "Kompania", icon: Building2 },
  { href: "/dashboard/storefront", label: "Faqja ime", icon: Palette },
  { href: "/dashboard/billing", label: "Abonimi", icon: CreditCard },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    authApi.me().then((r) => setIsAdmin(Boolean(r.is_platform_admin))).catch(() => setIsAdmin(false));
  }, []);

  async function logout() {
    try { await authApi.logout(); } catch {}
    router.push("/login");
    router.refresh();
  }

  const items = isAdmin
    ? [...nav, { href: "/dashboard/admin", label: "Admin", icon: Shield }]
    : nav;

  return (
    <div className="grid min-h-screen bg-background md:grid-cols-[232px_1fr]">
      {open ? <button className="fixed inset-0 z-30 bg-ink/25 md:hidden" onClick={() => setOpen(false)} aria-label="Mbyll menunë" /> : null}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-[232px] border-r border-line bg-surface p-4 transition md:static md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      )}>
        <div className="mb-7 flex items-center justify-between">
          <Logo />
          <button className="md:hidden" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
        </div>
        <nav className="space-y-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
                  active ? "bg-accent text-white" : "text-ink/75 hover:bg-accent-soft hover:text-accent",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-5 space-y-0.5 border-t border-line pt-4">
          <Link href="/cars" prefetch className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-accent-soft hover:text-accent">
            <Search className="h-4 w-4" /> Tregu
          </Link>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-accent-soft hover:text-accent">
            <LogOut className="h-4 w-4" /> Dil
          </button>
        </div>
      </aside>
      <div className="min-w-0">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-surface px-4 py-3 md:hidden">
          <button onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
          <Logo />
          <span className="w-5" />
        </div>
        <main className="p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
