"use client";

import * as React from "react";
import { Shell } from "@/components/dashboard/Shell";
import { DataTable } from "@/components/dashboard/DataTable";
import { apiFetch } from "@/lib/api";
import type { BookingRequestResponse } from "@/types/api";
import { dateISO } from "@/lib/format";

export default function RequestsPage() {
  const [items, setItems] = React.useState<BookingRequestResponse[]>([]);

  React.useEffect(() => {
    apiFetch<any>("/api/booking-requests?limit=100").then((d) => setItems(Array.isArray(d) ? d : (d.items ?? []))).catch(() => {});
  }, []);

  return (
    <Shell>
      <div>
        <div className="text-sm text-zinc-400">Dashboard</div>
        <h1 className="mt-1 text-3xl font-bold">Kërkesat</h1>
      </div>

      <div className="mt-6">
        <DataTable
          columns={[
            { key: "name", label: "Klienti" },
            { key: "dates", label: "Datat" },
            { key: "status", label: "Status" },
          ]}
          rows={items.map((r) => ({
            name: `${r.requester_name} (${r.requester_phone})`,
            dates: `${dateISO(r.date_from)} → ${dateISO(r.date_to)}`,
            status: r.status,
          }))}
          empty="Nuk ka kërkesa."
        />
      </div>
    </Shell>
  );
}
