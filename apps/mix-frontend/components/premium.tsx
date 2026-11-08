"use client";

import Link from "next/link";
import { Badge, Button, Card, Metric } from "@/components/ui";
import { BookingRequestResponse, BookingResponse, CarResponse, CompanyResponse } from "@/lib/types";
import { badgeTone, formatDate, money, statusLabel } from "@/lib/utils";

export function PremiumDashboard({
  company,
  cars,
  bookings,
  requests,
  planName,
}: {
  company: CompanyResponse | null;
  cars: CarResponse[];
  bookings: BookingResponse[];
  requests: BookingRequestResponse[];
  planName: string;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Paneli</p>
          <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">{company?.name || "Kompania juaj"}</h1>
          <p className="mt-2 max-w-xl text-muted">Makinat, rezervimet dhe kërkesat nga tregu — në një vend.</p>
        </div>
        <Link href="/dashboard/bookings/new"><Button>Rezervim i ri</Button></Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Makina" value={cars.length} hint="Në flotë" />
        <Metric label="Rezervime" value={bookings.length} hint="Të fundit" />
        <Metric label="Kërkesa" value={requests.length} hint="Nga tregu" />
        <Metric label="Plani" value={planName} hint="Abonimi" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Rezervimet e fundit</h3>
            <Link href="/dashboard/bookings" className="text-sm font-semibold text-accent">Të gjitha</Link>
          </div>
          <div className="space-y-2">
            {bookings.slice(0, 5).map((b) => (
              <Link key={b.id} href={`/dashboard/bookings/${b.id}`} className="flex items-center justify-between rounded-xl border border-line bg-background px-4 py-3">
                <span className="text-sm">{formatDate(b.date_from)} → {formatDate(b.date_to)}</span>
                <Badge tone={badgeTone(b.status)}>{statusLabel(b.status)}</Badge>
              </Link>
            ))}
            {!bookings.length ? <p className="text-sm text-muted">Asnjë rezervim ende.</p> : null}
          </div>
        </Card>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Kërkesa të reja</h3>
            <Link href="/dashboard/booking-requests" className="text-sm font-semibold text-accent">Të gjitha</Link>
          </div>
          <div className="space-y-2">
            {requests.slice(0, 5).map((r) => (
              <Link key={r.id} href={`/dashboard/booking-requests/${r.id}`} className="block rounded-xl border border-line bg-background px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{r.requester_name}</p>
                  <Badge tone={badgeTone(r.status)}>{statusLabel(r.status)}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted">{r.requester_phone}{r.date_from ? ` · ${formatDate(r.date_from)}` : ""}</p>
              </Link>
            ))}
            {!requests.length ? <p className="text-sm text-muted">Asnjë kërkesë e re.</p> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function BillingStudio({
  plans,
  currentPlan,
  subscriptionStatus,
  invoices,
}: {
  plans: { id: string; name: string; price_monthly: string; car_limit: number }[];
  currentPlan?: string;
  subscriptionStatus?: string;
  invoices: Record<string, unknown>[];
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Pagesa është <strong>cash</strong>. Planet caktohen nga administratori i Mix — nuk ka pagesë online.
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => {
          const active = currentPlan === plan.id;
          return (
            <div key={plan.id} className={`rounded-xl border p-6 shadow-soft ${active ? "border-accent bg-accent-soft" : "border-line bg-surface"}`}>
              {active ? <p className="mb-3 text-xs font-bold uppercase tracking-widest text-accent">Plani aktual{subscriptionStatus ? ` · ${subscriptionStatus}` : ""}</p> : null}
              <h3 className="font-display text-xl font-bold">{plan.name}</h3>
              <p className="mt-3 font-display text-3xl font-bold">€{plan.price_monthly}<span className="text-base font-medium text-muted">/muaj</span></p>
              <p className="mt-2 text-sm text-muted">Deri në {plan.car_limit} makina</p>
            </div>
          );
        })}
      </div>
      <Card>
        <h3 className="mb-4 font-display text-lg font-bold">Faturat (cash)</h3>
        {invoices.length ? invoices.map((invoice, i) => (
          <div key={i} className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-3 text-sm first:border-0">
            <span>{formatDate(String(invoice.issued_at || invoice.created_at || ""))}</span>
            <span className="text-muted">{String(invoice.status || "")}{invoice.notes ? ` · ${String(invoice.notes)}` : ""}</span>
            <span className="font-semibold text-accent">{money(invoice.amount as string || invoice.total as string)}</span>
          </div>
        )) : <p className="text-sm text-muted">Nuk ka fatura ende. Admin i Mix i regjistron pas pagesës cash.</p>}
      </Card>
    </div>
  );
}
