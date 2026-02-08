"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { apiFetch } from "@/lib/api";

export function BookingRequestForm({
  company_slug,
  car_slug,
}: {
  company_slug: string;
  car_slug?: string;
}) {
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState(false);

  const [form, setForm] = React.useState({
    requester_name: "",
    requester_phone: "",
    date_from: "",
    date_to: "",
    message: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(false);
    setLoading(true);
    try {
      await apiFetch("/api/public/booking-request", {
        method: "POST",
        body: JSON.stringify({
          company_slug,
          car_slug: car_slug || null,
          requester_name: form.requester_name,
          requester_phone: form.requester_phone,
          date_from: form.date_from || null,
          date_to: form.date_to || null,
          message: form.message || null,
        }),
      });
      setOk(true);
      setForm({ requester_name: "", requester_phone: "", date_from: "", date_to: "", message: "" });
    } catch (e: any) {
      setErr(e?.message ?? "Ndodhi një gabim");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      {err ? <Alert>{err}</Alert> : null}
      {ok ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          Kërkesa u dërgua. Do ju kontaktojmë së shpejti.
        </div>
      ) : null}

      <div className="grid gap-2 md:grid-cols-2">
        <Input
          placeholder="Emri"
          value={form.requester_name}
          onChange={(e) => setForm((s) => ({ ...s, requester_name: e.target.value }))}
          required
          minLength={2}
        />
        <Input
          placeholder="Telefoni"
          value={form.requester_phone}
          onChange={(e) => setForm((s) => ({ ...s, requester_phone: e.target.value }))}
          required
          minLength={5}
        />
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <Input
          type="date"
          value={form.date_from}
          onChange={(e) => setForm((s) => ({ ...s, date_from: e.target.value }))}
        />
        <Input
          type="date"
          value={form.date_to}
          onChange={(e) => setForm((s) => ({ ...s, date_to: e.target.value }))}
        />
      </div>

      <Textarea
        placeholder="Mesazh (opsionale)"
        value={form.message}
        onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
        maxLength={1000}
      />

      <Button disabled={loading}>{loading ? "Duke dërguar..." : "Dërgo kërkesën"}</Button>
    </form>
  );
}
