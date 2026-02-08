"use client";

import * as React from "react";
import { Shell } from "@/components/dashboard/Shell";
import { DataTable } from "@/components/dashboard/DataTable";
import { apiFetch } from "@/lib/api";
import type { BookingResponse } from "@/types/api";
import { dateISO, money } from "@/lib/format";

export default function BookingsPage() {
  const [items, setItems] = React.useState<BookingResponse[]>([]);

  React.useEffect(() => {
    apiFetch<any>("/api/bookings?limit=100").then((d) => setItems(Array.isArray(d) ? d : (d.items ?? []))).catch(() => {});
  }, []);

  return (
    <Shell>
      <div>
        <div className="text-sm text-zinc-400">Dashboard</div>
        <h1 className="mt-1 text-3xl font-bold">Rezervimet</h1>
      </div>

      <div className="mt-6">
        <DataTable
          columns={[
            { key: "dates", label: "Datat" },
            { key: "status", label: "Status" },
            { key: "price", label: "Totali" },
          ]}
          rows={items.map((b) => ({
            dates: `${dateISO(b.date_from)} → ${dateISO(b.date_to)}`,
            status: b.status,
            price: money(b.price_total, b.currency),
          }))}
          empty="Nuk ka rezervime."
        />
      </div>
    </Shell>
  );
}
