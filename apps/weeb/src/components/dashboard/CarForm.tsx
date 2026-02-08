"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { CarCreate, CarResponse } from "@/types/api";
import { apiFetch } from "@/lib/api";

const TRANSMISSION = [
  { label: "Manual", value: "manual" as const },
  { label: "Automatik", value: "automatic" as const },
];

const FUEL = [
  { label: "Benzinë", value: "petrol" as const },
  { label: "Naftë", value: "diesel" as const },
  { label: "Hibrid", value: "hybrid" as const },
  { label: "Elektrik", value: "electric" as const },
];

const CURRENCY = [
  { label: "EUR", value: "EUR" as const },
  { label: "ALL", value: "ALL" as const },
  { label: "USD", value: "USD" as const },
];

const STATUS = [
  { label: "Aktive", value: "active" as const },
  { label: "Jo aktive", value: "inactive" as const },
  { label: "Maintenance", value: "maintenance" as const },
];

export function CarForm({ onCreated }: { onCreated?: (c: CarResponse) => void }) {
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const [form, setForm] = React.useState<CarCreate>({
    title: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    transmission: "automatic",
    fuel: "petrol",
    seats: 5,
    price_per_day: 30,
    deposit_amount: 200,
    currency: "EUR",
    slug: "",
    description: "",
    location_text: "",
    status: "active",
  });

  function autoSlug(s: string) {
    return s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const created = await apiFetch<CarResponse>("/api/cars", {
        method: "POST",
        body: JSON.stringify(form),
      });
      onCreated?.(created);
      setForm((s) => ({ ...s, title: "", slug: "" }));
    } catch (e: any) {
      setErr(e?.message ?? "Gabim gjatë krijimit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      {err ? <Alert>{err}</Alert> : null}
      <div className="grid gap-2 md:grid-cols-2">
        <Input
          placeholder="Titulli (p.sh. Mercedes E220)"
          value={form.title}
          onChange={(e) => setForm((s) => ({ ...s, title: e.target.value, slug: s.slug || autoSlug(e.target.value) }))}
          required
        />
        <Input
          placeholder="Slug (p.sh. mercedes-e220)"
          value={form.slug}
          onChange={(e) => setForm((s) => ({ ...s, slug: autoSlug(e.target.value) }))}
          required
        />
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <Input placeholder="Make" value={form.make} onChange={(e) => setForm((s) => ({ ...s, make: e.target.value }))} required />
        <Input placeholder="Model" value={form.model} onChange={(e) => setForm((s) => ({ ...s, model: e.target.value }))} required />
        <Input
          type="number"
          placeholder="Viti"
          value={form.year}
          onChange={(e) => setForm((s) => ({ ...s, year: Number(e.target.value) }))}
          required
          min={1900}
          max={2100}
        />
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <Select
          value={form.transmission}
          onChange={(v) => setForm((s) => ({ ...s, transmission: v }))}
          options={TRANSMISSION}
        />
        <Select
          value={form.fuel}
          onChange={(v) => setForm((s) => ({ ...s, fuel: v }))}
          options={FUEL}
        />
        <Input
          type="number"
          placeholder="Vende"
          value={form.seats}
          onChange={(e) => setForm((s) => ({ ...s, seats: Number(e.target.value) }))}
          required
          min={1}
          max={20}
        />
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <Input
          type="number"
          placeholder="Çmimi / ditë"
          value={Number(form.price_per_day)}
          onChange={(e) => setForm((s) => ({ ...s, price_per_day: Number(e.target.value) }))}
          required
          min={0}
        />
        <Input
          type="number"
          placeholder="Depozita"
          value={Number(form.deposit_amount)}
          onChange={(e) => setForm((s) => ({ ...s, deposit_amount: Number(e.target.value) }))}
          required
          min={0}
        />
        <Select
          value={form.currency ?? "EUR"}
          onChange={(v) => setForm((s) => ({ ...s, currency: v }))}
          options={CURRENCY}
        />
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <Input
          placeholder="Lokacion (opsional)"
          value={form.location_text ?? ""}
          onChange={(e) => setForm((s) => ({ ...s, location_text: e.target.value }))}
        />
        <Select
          value={form.status ?? "active"}
          onChange={(v) => setForm((s) => ({ ...s, status: v }))}
          options={STATUS}
        />
      </div>

      <Textarea
        placeholder="Përshkrim (opsional)"
        value={form.description ?? ""}
        onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
      />

      <Button disabled={loading}>{loading ? "Duke ruajtur..." : "Krijo makinë"}</Button>
    </form>
  );
}
