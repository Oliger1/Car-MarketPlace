"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button, Card, Field, Input, SectionTitle, Select } from "@/components/ui";
import {
  AdminCar,
  AdminCompany,
  AdminInvoice,
  AdminStats,
  adminApi,
  authApi,
} from "@/lib/api";
import type { PlanResponse } from "@/lib/types";
import { cn, formatDate, money } from "@/lib/utils";

type Tab = "overview" | "companies" | "market" | "slugs" | "invoices" | "plans" | "admins";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Pasqyra" },
  { id: "companies", label: "Kompanitë" },
  { id: "market", label: "Moderimi" },
  { id: "slugs", label: "Slug" },
  { id: "invoices", label: "Faturat" },
  { id: "plans", label: "Planet" },
  { id: "admins", label: "Adminë" },
];

const VIS: Record<string, string> = {
  public: "Në treg",
  private: "Vetëm subdomain",
  draft: "Draft",
  suspended: "Pezulluar",
  deleted: "Fshirë",
};

export default function AdminPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [companyQ, setCompanyQ] = useState("");
  const [visibility, setVisibility] = useState("");
  const [cars, setCars] = useState<AdminCar[]>([]);
  const [carQ, setCarQ] = useState("");
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [admins, setAdmins] = useState<{ env: string[]; extra: string[]; all: string[] } | null>(null);
  const [slugs, setSlugs] = useState<{ builtin: string[]; blocked: string[]; all: string[] } | null>(null);

  async function loadCore() {
    const [s, p] = await Promise.all([adminApi.stats(), adminApi.plans()]);
    setStats(s);
    setPlans(p);
  }

  async function loadCompanies() {
    const c = await adminApi.companies({
      limit: 50,
      q: companyQ || undefined,
      visibility: visibility || undefined,
    });
    setCompanies(c.items);
  }

  async function loadCars() {
    const c = await adminApi.cars({ limit: 50, q: carQ || undefined });
    setCars(c.items);
  }

  async function loadInvoices() {
    const inv = await adminApi.invoices({ limit: 50 });
    setInvoices(inv.items);
  }

  async function loadAdmins() {
    setAdmins(await adminApi.admins());
  }

  async function loadSlugs() {
    setSlugs(await adminApi.slugs());
  }

  async function refresh() {
    setError(null);
    await loadCore();
    if (tab === "companies" || tab === "plans") await loadCompanies();
    if (tab === "market") await loadCars();
    if (tab === "invoices") await loadInvoices();
    if (tab === "admins") await loadAdmins();
    if (tab === "slugs") await loadSlugs();
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await authApi.me();
        if (cancelled) return;
        if (!me.is_platform_admin) {
          setAllowed(false);
          router.replace("/dashboard");
          return;
        }
        setAllowed(true);
      } catch {
        if (cancelled) return;
        setAllowed(false);
        router.replace("/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!allowed) return;
    refresh().catch((e) => setError(e instanceof Error ? e.message : "Gabim"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, allowed]);

  function flash(ok: string) {
    setMessage(ok);
    setError(null);
  }

  if (allowed === null) {
    return (
      <DashboardShell>
        <p className="text-sm text-muted">Duke ngarkuar…</p>
      </DashboardShell>
    );
  }
  if (!allowed) return null;

  return (
    <DashboardShell>
      <SectionTitle title="Admin Mix" subtitle="Platforma, tregu, slug, fatura cash dhe adminët." />
      {message ? <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-bold",
              tab === t.id ? "bg-ink text-white" : "border border-line bg-surface text-ink hover:bg-background",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && stats ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Kompani", stats.companies_total],
            ["Live", stats.companies_live],
            ["Në treg", stats.companies_on_market],
            ["Pezulluar", stats.companies_suspended],
            ["Makina në treg", stats.cars_on_market],
            ["Kërkesa / 7 ditë", stats.requests_last_7_days],
            ["Fatura hapur", stats.invoices_open],
          ].map(([k, v]) => (
            <Card key={String(k)}>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">{k}</p>
              <p className="mt-1 font-display text-3xl">{v}</p>
            </Card>
          ))}
        </div>
      ) : null}

      {tab === "companies" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input value={companyQ} onChange={(e) => setCompanyQ(e.target.value)} placeholder="Kërko emër / slug / qytet" className="max-w-xs" />
            <Select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="max-w-[180px]">
              <option value="">Të gjitha aktive</option>
              <option value="public">Në treg</option>
              <option value="private">Vetëm subdomain</option>
              <option value="draft">Draft</option>
              <option value="suspended">Pezulluar</option>
              <option value="deleted">Fshirë</option>
            </Select>
            <Button type="button" onClick={() => loadCompanies().catch((e) => setError(e.message))}>Filtro</Button>
          </div>
          <div className="space-y-3">
            {companies.map((c) => (
              <Card key={c.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-muted">
                      {c.slug} · {c.city}
                      {c.owner_email ? ` · ${c.owner_email}` : ""}
                    </p>
                    <p className="mt-1 text-xs">
                      <span className="rounded-full bg-background px-2 py-0.5 font-bold">{VIS[c.visibility] || c.visibility}</span>
                      {" · "}
                      {c.plan_name || "pa plan"}
                      {c.subscription_status ? ` (${c.subscription_status})` : ""}
                      {c.active_until ? ` · deri ${formatDate(c.active_until)}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="secondary" onClick={async () => { await adminApi.patchCompany(c.id, { is_published: true }); flash("Faqja live."); await loadCompanies(); }}>Live</Button>
                    <Button type="button" variant="secondary" onClick={async () => { await adminApi.patchCompany(c.id, { listed_on_market: true, is_published: true }); flash("Në treg."); await loadCompanies(); }}>Në treg</Button>
                    <Button type="button" variant="secondary" onClick={async () => { await adminApi.patchCompany(c.id, { listed_on_market: false }); flash("Jashtë tregut."); await loadCompanies(); }}>Hiq nga tregu</Button>
                    <Button type="button" variant="secondary" onClick={async () => { await adminApi.patchCompany(c.id, { is_suspended: !c.is_suspended }); flash(c.is_suspended ? "Rihapur." : "Pezulluar."); await loadCompanies(); }}>{c.is_suspended ? "Hiq pezullimin" : "Pezullo"}</Button>
                    <Button type="button" variant="danger" onClick={async () => { await adminApi.patchCompany(c.id, { soft_delete: !c.deleted_at }); flash(c.deleted_at ? "Rikthyer." : "Fshirë (soft)."); await loadCompanies(); }}>{c.deleted_at ? "Rikthe" : "Fshi"}</Button>
                  </div>
                </div>
                <form
                  className="mt-4 grid gap-2 border-t border-line pt-3 sm:grid-cols-[1fr_1fr_auto]"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const slug = String(fd.get("slug") || "").trim();
                    const withInvoice = fd.get("create_invoice") === "on";
                    if (slug && slug !== c.slug) await adminApi.patchCompany(c.id, { slug });
                    await adminApi.assignSubscription(c.id, {
                      plan_id: String(fd.get("plan_id")),
                      status: String(fd.get("status") || "active"),
                      create_invoice: withInvoice,
                      invoice_notes: "Pagesë cash",
                    });
                    if (withInvoice) {
                      flash("Plan u ruajt · fatura cash u krijua.");
                      setTab("invoices");
                      await loadInvoices();
                    } else {
                      flash("U përditësua.");
                      await loadCompanies();
                    }
                  }}
                >
                  <Field label="Slug"><Input name="slug" defaultValue={c.slug} /></Field>
                  <Field label="Plan">
                    <Select name="plan_id" defaultValue={c.plan_id || plans[0]?.id || ""}>
                      {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </Select>
                  </Field>
                  <div className="flex flex-col justify-end gap-2">
                    <Select name="status" defaultValue={c.subscription_status === "trialing" ? "active" : (c.subscription_status || "active")}>
                      <option value="active">Active</option>
                      <option value="trialing">Trial</option>
                      <option value="past_due">Past due</option>
                      <option value="suspended">Suspended</option>
                    </Select>
                    <label className="flex items-center gap-2 text-xs text-muted">
                      <input type="checkbox" name="create_invoice" defaultChecked /> Faturë cash
                    </label>
                    <Button type="submit">Ruaj</Button>
                  </div>
                </form>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      {tab === "market" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input value={carQ} onChange={(e) => setCarQ(e.target.value)} placeholder="Kërko makinë / kompani" className="max-w-xs" />
            <Button type="button" onClick={() => loadCars().catch((e) => setError(e.message))}>Kërko</Button>
          </div>
          <div className="space-y-2">
            {cars.map((car) => (
              <Card key={car.id} className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{car.title}</p>
                  <p className="text-xs text-muted">
                    {car.company_name} · {car.company_slug}
                    {car.city ? ` · ${car.city}` : ""} · {money(car.price_per_day)}/ditë
                  </p>
                  <p className="mt-1 text-xs font-bold">{car.is_published ? "Publike" : "E fshehur nga tregu"}</p>
                </div>
                <Button
                  type="button"
                  variant={car.is_published ? "danger" : "secondary"}
                  onClick={async () => {
                    await adminApi.patchCar(car.id, { is_published: !car.is_published });
                    flash(car.is_published ? "Makina u fsheh." : "Makina u publikua.");
                    await loadCars();
                  }}
                >
                  {car.is_published ? "Fsheh nga Mix" : "Shfaq në Mix"}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      {tab === "slugs" && slugs ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="font-display text-lg">Të rezervuara (sistem)</h3>
            <p className="mt-2 flex flex-wrap gap-2 text-xs">
              {slugs.builtin.map((s) => (
                <span key={s} className="rounded-full bg-background px-2 py-1 font-mono">{s}</span>
              ))}
            </p>
          </Card>
          <Card>
            <h3 className="font-display text-lg">Të bllokuara nga ti</h3>
            <ul className="mt-3 space-y-2">
              {slugs.blocked.map((s) => (
                <li key={s} className="flex items-center justify-between text-sm">
                  <span className="font-mono">{s}</span>
                  <Button type="button" variant="danger" onClick={async () => { await adminApi.unblockSlug(s); flash("U çbllokua."); await loadSlugs(); }}>Hiq</Button>
                </li>
              ))}
              {!slugs.blocked.length ? <p className="text-sm text-muted">Asnjë.</p> : null}
            </ul>
            <form
              className="mt-4 flex gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                await adminApi.blockSlug(String(fd.get("slug")));
                flash("Slug u bllokua.");
                e.currentTarget.reset();
                await loadSlugs();
              }}
            >
              <Input name="slug" placeholder="p.sh. rezervuar" required />
              <Button type="submit">Blloko</Button>
            </form>
          </Card>
        </div>
      ) : null}

      {tab === "invoices" ? (
        <div className="space-y-2">
          <p className="text-xs text-muted">Krijohet nga <strong>Kompanitë → Ruaj</strong> me «Faturë cash» të ndezur.</p>
          {invoices.map((inv) => (
            <Card key={inv.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{inv.company_name}</p>
                <p className="text-xs text-muted">
                  {money(inv.amount, inv.currency)} · {inv.status} · {formatDate(inv.issued_at)}
                  {inv.active_until ? ` · plan deri ${formatDate(inv.active_until)}` : ""}
                </p>
                {inv.notes ? <p className="mt-1 text-xs text-muted">{inv.notes}</p> : null}
              </div>
              {inv.status !== "paid" ? (
                <Button type="button" onClick={async () => { await adminApi.markInvoicePaid(inv.id); flash("Shënuar e paguar."); await loadInvoices(); }}>
                  Shëno paguar
                </Button>
              ) : (
                <span className="text-xs font-bold text-emerald-700">PAID{inv.paid_at ? ` · ${formatDate(inv.paid_at)}` : ""}</span>
              )}
            </Card>
          ))}
          {!invoices.length ? <p className="text-sm text-muted">Nuk ka fatura ende.</p> : null}
        </div>
      ) : null}

      {tab === "plans" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="mb-4 font-display text-lg">Planet</h3>
            <ul className="space-y-2 text-sm">
              {plans.map((p) => (
                <li key={p.id} className="flex justify-between border-b border-line py-2">
                  <span><strong>{p.name}</strong> <span className="text-muted">({p.id})</span></span>
                  <span>€{p.price_monthly}/muaj · {p.car_limit} makina</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <form
              onSubmit={async (e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                await adminApi.createPlan({
                  id: String(fd.get("id")),
                  name: String(fd.get("name")),
                  car_limit: Number(fd.get("car_limit")),
                  price_monthly: Number(fd.get("price_monthly")),
                  is_active: true,
                });
                flash("Plani u krijua.");
                e.currentTarget.reset();
                await loadCore();
              }}
              className="space-y-3"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Plan i ri</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="ID"><Input name="id" placeholder="p50" required /></Field>
                <Field label="Emri"><Input name="name" placeholder="Business" required /></Field>
                <Field label="Limit makinash"><Input name="car_limit" type="number" min={1} defaultValue={20} required /></Field>
                <Field label="Çmim mujor €"><Input name="price_monthly" type="number" min={0} step="0.01" defaultValue={49} required /></Field>
              </div>
              <Button type="submit">Krijo plan</Button>
            </form>
          </Card>
        </div>
      ) : null}

      {tab === "admins" && admins ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="font-display text-lg">Nga .env</h3>
            <ul className="mt-3 space-y-1 text-sm">
              {admins.env.map((e) => <li key={e} className="font-mono">{e}</li>)}
            </ul>
            <p className="mt-2 text-xs text-muted">Nuk hiqen nga UI.</p>
          </Card>
          <Card>
            <h3 className="font-display text-lg">Shtesë</h3>
            <ul className="mt-3 space-y-2">
              {admins.extra.map((e) => (
                <li key={e} className="flex items-center justify-between text-sm">
                  <span className="font-mono">{e}</span>
                  <Button type="button" variant="danger" onClick={async () => { await adminApi.removeAdmin(e); flash("U hoq."); await loadAdmins(); }}>Hiq</Button>
                </li>
              ))}
              {!admins.extra.length ? <p className="text-sm text-muted">Asnjë.</p> : null}
            </ul>
            <form
              className="mt-4 flex gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                await adminApi.addAdmin(String(fd.get("email")));
                flash("Admin u shtua.");
                e.currentTarget.reset();
                await loadAdmins();
              }}
            >
              <Input name="email" type="email" placeholder="ops@mix.al" required />
              <Button type="submit">Shto</Button>
            </form>
          </Card>
        </div>
      ) : null}
    </DashboardShell>
  );
}
