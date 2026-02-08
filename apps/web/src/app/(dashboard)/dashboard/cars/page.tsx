"use client";

import * as React from "react";
import { Shell } from "@/components/dashboard/Shell";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/dashboard/DataTable";
import { CarForm } from "@/components/dashboard/CarForm";
import { apiFetch } from "@/lib/api";
import type { CarResponse } from "@/types/api";
import { money } from "@/lib/format";

export default function CarsPage() {
  const [cars, setCars] = React.useState<CarResponse[]>([]);
  const [open, setOpen] = React.useState(false);

  async function load() {
    const data = await apiFetch<any>("/api/cars?limit=100");
    setCars(Array.isArray(data) ? data : (data.items ?? []));
  }

  React.useEffect(() => {
    load().catch(() => {});
  }, []);

  return (
    <Shell>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-sm text-zinc-400">Dashboard</div>
          <h1 className="mt-1 text-3xl font-bold">Makinat</h1>
        </div>
        <Button onClick={() => setOpen(true)}>+ Shto makinë</Button>
      </div>

      <div className="mt-6">
        <DataTable
          columns={[
            { key: "title", label: "Titulli" },
            { key: "meta", label: "Info" },
            { key: "price", label: "Çmimi" },
            { key: "actions", label: "", className: "text-right" },
          ]}
          rows={cars.map((c) => ({
            title: c.title,
            meta: `${c.make} ${c.model} • ${c.year} • ${c.transmission}`,
            price: money(c.price_per_day, c.currency) + " / ditë",
            actions: (
              <a className="text-sm text-blue-300 hover:text-blue-200" href={`/dashboard/cars/${c.id}`}>
                Hap
              </a>
            ),
          }))}
          empty="Nuk ka makina ende."
        />
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Shto makinë">
        <CarForm
          onCreated={() => {
            setOpen(false);
            load();
          }}
        />
      </Modal>

      <Card className="mt-6 p-4 text-sm text-zinc-400">
        Nëse të del 401 këtu, shko te /auth/login dhe bëj login.
      </Card>
    </Shell>
  );
}
