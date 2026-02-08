"use client";

import * as React from "react";
import { Shell } from "@/components/dashboard/Shell";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import type { CompanyResponse, CompanyUpdate } from "@/types/api";

export default function CompanyPage() {
  const [company, setCompany] = React.useState<CompanyResponse | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    apiFetch<CompanyResponse>("/api/company").then(setCompany).catch(() => {});
  }, []);

  async function save() {
    if (!company) return;
    setSaving(true);
    try {
      const payload: CompanyUpdate = {
        name: company.name,
        slug: company.slug,
        city: company.city,
        description: company.description ?? null,
        phone: company.phone ?? null,
        whatsapp: company.whatsapp ?? null,
        website_url: company.website_url ?? null,
        is_published: company.is_published,
      };
      const updated = await apiFetch<CompanyResponse>("/api/company", { method: "PATCH", body: JSON.stringify(payload) });
      setCompany(updated);
    } finally {
      setSaving(false);
    }
  }

  if (!company) {
    return (
      <Shell>
        <Card className="p-6">Duke ngarkuar...</Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <div>
        <div className="text-sm text-zinc-400">Dashboard</div>
        <h1 className="mt-1 text-3xl font-bold">Kompania</h1>
      </div>

      <Card className="mt-6 p-6">
        <div className="grid gap-3 md:grid-cols-2">
          <Input value={company.name} onChange={(e) => setCompany((s) => s ? ({ ...s, name: e.target.value }) : s)} placeholder="Emri" />
          <Input value={company.city} onChange={(e) => setCompany((s) => s ? ({ ...s, city: e.target.value }) : s)} placeholder="Qyteti" />
          <Input value={company.slug} onChange={(e) => setCompany((s) => s ? ({ ...s, slug: e.target.value }) : s)} placeholder="Slug" />
          <Input value={company.phone ?? ""} onChange={(e) => setCompany((s) => s ? ({ ...s, phone: e.target.value }) : s)} placeholder="Telefon" />
          <Input value={company.whatsapp ?? ""} onChange={(e) => setCompany((s) => s ? ({ ...s, whatsapp: e.target.value }) : s)} placeholder="WhatsApp" />
          <Input value={company.website_url ?? ""} onChange={(e) => setCompany((s) => s ? ({ ...s, website_url: e.target.value }) : s)} placeholder="Website" />
        </div>

        <div className="mt-3">
          <Textarea
            value={company.description ?? ""}
            onChange={(e) => setCompany((s) => s ? ({ ...s, description: e.target.value }) : s)}
            placeholder="Përshkrim"
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={company.is_published}
              onChange={(e) => setCompany((s) => s ? ({ ...s, is_published: e.target.checked }) : s)}
            />
            Publiko profilin
          </label>

          <Button onClick={save} disabled={saving}>
            {saving ? "Duke ruajtur..." : "Ruaj"}
          </Button>
        </div>
      </Card>
    </Shell>
  );
}
