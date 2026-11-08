"use client";

import { useMemo, useState } from "react";
import { GripVertical, ImagePlus, ExternalLink } from "lucide-react";
import { companyApi } from "@/lib/api";
import { companyOrigin } from "@/lib/tenant";
import { CompanyResponse, PageSection } from "@/lib/types";
import { SECTION_LABEL, normalizeSections } from "@/lib/storefront";
import { resolveFileUrl } from "@/lib/utils";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";

const PRIMARY_PALETTE = [
  "#0f6e6a",
  "#0e7490",
  "#1d4ed8",
  "#1e3a5f",
  "#166534",
  "#7c2d12",
  "#9f1239",
  "#1c1917",
];

const ACCENT_PALETTE = [
  "#e07a3d",
  "#f59e0b",
  "#ea580c",
  "#dc2626",
  "#db2777",
  "#7c3aed",
  "#0f766e",
  "#ca8a04",
];

type Draft = {
  name: string;
  city: string;
  description: string;
  phone: string;
  whatsapp: string;
  hero_title: string;
  hero_subtitle: string;
  brand_primary: string;
  brand_accent: string;
  is_published: boolean;
  listed_on_market: boolean;
  logo_path: string | null;
  cover_path: string | null;
  page_sections: PageSection[];
};

function toDraft(c: CompanyResponse): Draft {
  return {
    name: c.name || "",
    city: c.city || "",
    description: c.description || "",
    phone: c.phone || "",
    whatsapp: c.whatsapp || "",
    hero_title: c.hero_title || "",
    hero_subtitle: c.hero_subtitle || "",
    brand_primary: c.brand_primary || "#0f6e6a",
    brand_accent: c.brand_accent || "#e07a3d",
    is_published: Boolean(c.is_published),
    listed_on_market: Boolean(c.listed_on_market),
    logo_path: c.logo_path || null,
    cover_path: c.cover_path || null,
    page_sections: normalizeSections(c.page_sections),
  };
}

export function StorefrontEditor({ company }: { company: CompanyResponse }) {
  const [draft, setDraft] = useState(() => toDraft(company));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const storeUrl = useMemo(() => companyOrigin(company.slug), [company.slug]);

  function patch<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function onDropFile(kind: "logo" | "cover", file?: File | null) {
    if (!file) return;
    setError(null);
    try {
      const res = kind === "logo" ? await companyApi.uploadLogo(file) : await companyApi.uploadCover(file);
      patch(kind === "logo" ? "logo_path" : "cover_path", (res as { path: string }).path);
      setMessage(kind === "logo" ? "Logo u ngarkua." : "Kopertina u ngarkua.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ngarkimi dështoi.");
    }
  }

  function reorder(targetId: string) {
    if (!dragId || dragId === targetId) return;
    setDraft((d) => {
      const list = [...d.page_sections];
      const from = list.findIndex((s) => s.id === dragId);
      const to = list.findIndex((s) => s.id === targetId);
      if (from < 0 || to < 0) return d;
      const [item] = list.splice(from, 1);
      list.splice(to, 0, item);
      return { ...d, page_sections: list };
    });
    setDragId(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await companyApi.update({
        name: draft.name,
        city: draft.city,
        description: draft.description || null,
        phone: draft.phone || null,
        whatsapp: draft.whatsapp || null,
        hero_title: draft.hero_title || null,
        hero_subtitle: draft.hero_subtitle || null,
        brand_primary: draft.brand_primary,
        brand_accent: draft.brand_accent,
        is_published: draft.is_published,
        listed_on_market: draft.is_published ? draft.listed_on_market : false,
        page_sections: draft.page_sections,
      });
      setDraft(toDraft(updated));
      setMessage("U ruajt.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ruajtja dështoi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={draft.is_published}
                onChange={(e) => {
                  const on = e.target.checked;
                  setDraft((d) => ({ ...d, is_published: on, listed_on_market: on ? d.listed_on_market : false }));
                }}
                className="h-4 w-4 accent-[var(--accent,#0f6e6a)]"
              />
              Faqja live
            </label>
            <label className={`flex items-center gap-2 text-sm font-semibold ${draft.is_published ? "cursor-pointer" : "cursor-not-allowed opacity-45"}`}>
              <input
                type="checkbox"
                checked={draft.listed_on_market}
                disabled={!draft.is_published}
                onChange={(e) => patch("listed_on_market", e.target.checked)}
                className="h-4 w-4 accent-[var(--accent,#0f6e6a)]"
              />
              Në tregun Mix
            </label>
          </div>
          <a href={storeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-bold hover:bg-background">
            <ExternalLink className="h-4 w-4" /> Hap faqen
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <DropZone
            label="Logo"
            hint="Tërhiq ose kliko · PNG/JPG"
            preview={draft.logo_path}
            onFile={(f) => onDropFile("logo", f)}
          />
          <DropZone
            label="Kopertina"
            hint="Tërhiq ose kliko · foto e gjerë"
            preview={draft.cover_path}
            wide
            onFile={(f) => onDropFile("cover", f)}
          />
        </div>

        <div className="rounded-[24px] border border-line bg-surface p-5 shadow-soft">
          <h3 className="font-display text-xl">Teksti & ngjyrat</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Emri i kompanisë"><Input value={draft.name} onChange={(e) => patch("name", e.target.value)} /></Field>
            <Field label="Qyteti"><Input value={draft.city} onChange={(e) => patch("city", e.target.value)} /></Field>
            <Field label="Titulli i hero-it"><Input value={draft.hero_title} placeholder={draft.name} onChange={(e) => patch("hero_title", e.target.value)} /></Field>
            <Field label="Nëntitulli"><Input value={draft.hero_subtitle} placeholder="Makina me qira, pa surpriza" onChange={(e) => patch("hero_subtitle", e.target.value)} /></Field>
            <Field label="Telefon"><Input value={draft.phone} onChange={(e) => patch("phone", e.target.value)} /></Field>
            <Field label="WhatsApp"><Input value={draft.whatsapp} onChange={(e) => patch("whatsapp", e.target.value)} /></Field>
            <div className="md:col-span-2">
              <Field label="Ngjyra kryesore">
                <ColorPalette value={draft.brand_primary} colors={PRIMARY_PALETTE} onChange={(hex) => patch("brand_primary", hex)} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Ngjyra e theksit">
                <ColorPalette value={draft.brand_accent} colors={ACCENT_PALETTE} onChange={(hex) => patch("brand_accent", hex)} />
              </Field>
            </div>
          </div>
          <div className="mt-4">
            <Field label="Përshkrimi"><Textarea rows={4} value={draft.description} onChange={(e) => patch("description", e.target.value)} /></Field>
          </div>
        </div>

        <div className="rounded-[24px] border border-line bg-surface p-5 shadow-soft">
          <h3 className="font-display text-xl">Seksionet (tërhiq për të renditur)</h3>
          <p className="mt-1 text-sm text-muted">Si te Booqable: rendit dhe ndiz/fik blloqet e faqes sate.</p>
          <ul className="mt-4 space-y-2">
            {draft.page_sections.map((section) => (
              <li
                key={section.id}
                draggable
                onDragStart={() => setDragId(section.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => reorder(section.id)}
                className="flex items-center gap-3 rounded-2xl border border-line bg-background px-3 py-3"
              >
                <GripVertical className="h-4 w-4 shrink-0 text-muted" />
                <span className="flex-1 text-sm font-semibold">{SECTION_LABEL[section.id]}</span>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted">
                  <input
                    type="checkbox"
                    checked={section.on}
                    onChange={(e) =>
                      patch(
                        "page_sections",
                        draft.page_sections.map((s) => (s.id === section.id ? { ...s, on: e.target.checked } : s)),
                      )
                    }
                  />
                  Aktiv
                </label>
              </li>
            ))}
          </ul>
        </div>

        {message ? <p className="text-sm font-semibold text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
        <Button type="button" onClick={save} disabled={saving} className="w-full sm:w-auto">
          {saving ? "Duke ruajtur..." : "Ruaj faqen e partnerit"}
        </Button>
      </div>

      <Preview draft={draft} slug={company.slug} />
    </div>
  );
}

function ColorPalette({
  value,
  colors,
  onChange,
}: {
  value: string;
  colors: string[];
  onChange: (hex: string) => void;
}) {
  const selected = value?.toLowerCase();
  const extras = selected && !colors.some((c) => c.toLowerCase() === selected) ? [value] : [];
  return (
    <div className="flex flex-wrap gap-2">
      {[...colors, ...extras].map((hex) => {
        const active = hex.toLowerCase() === selected;
        return (
          <button
            key={hex}
            type="button"
            title={hex}
            aria-label={`Ngjyra ${hex}`}
            aria-pressed={active}
            onClick={() => onChange(hex)}
            className={cn(
              "h-9 w-9 rounded-full border-2 transition",
              active ? "scale-110 border-ink shadow-soft" : "border-white ring-1 ring-line hover:scale-105",
            )}
            style={{ backgroundColor: hex }}
          />
        );
      })}
    </div>
  );
}

function DropZone({
  label,
  hint,
  preview,
  wide,
  onFile,
}: {
  label: string;
  hint: string;
  preview?: string | null;
  wide?: boolean;
  onFile: (file: File) => void;
}) {
  return (
    <label
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onFile(e.dataTransfer.files?.[0]);
      }}
      className="block cursor-pointer overflow-hidden rounded-[24px] border border-dashed border-line bg-surface shadow-soft"
    >
      <div className={`relative bg-[linear-gradient(145deg,#1c1917,#0f6e6a)] ${wide ? "aspect-[16/9]" : "aspect-square"}`}>
        {preview ? <img src={resolveFileUrl(preview) || undefined} alt="" className="h-full w-full object-cover" /> : null}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/35 p-4 text-center text-white">
          <ImagePlus className="h-6 w-6" />
          <p className="text-sm font-bold">{label}</p>
          <p className="text-xs text-white/80">{hint}</p>
        </div>
      </div>
      <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] as File)} />
    </label>
  );
}

function Preview({ draft, slug }: { draft: Draft; slug: string }) {
  const style = {
    ["--accent" as string]: draft.brand_primary,
    ["--signal" as string]: draft.brand_accent,
  } as React.CSSProperties;
  const title = draft.hero_title || draft.name;
  const subtitle = draft.hero_subtitle || draft.description || "Makina me qira nga kompania jote.";

  return (
    <div className="xl:sticky xl:top-6 xl:self-start">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-muted">Pamje e gjallë</p>
      <div style={style} className="overflow-hidden rounded-[28px] border border-line bg-[#f4efe8] shadow-soft">
        <div className="flex items-center gap-3 border-b border-line bg-white/70 px-4 py-3">
          {draft.logo_path ? (
            <img src={resolveFileUrl(draft.logo_path) || undefined} alt="" className="h-9 w-9 rounded-xl object-cover" />
          ) : (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-sm font-bold text-white">{draft.name.slice(0, 1) || "M"}</span>
          )}
          <div>
            <p className="text-sm font-bold">{draft.name || "Kompania"}</p>
            <p className="text-[11px] text-muted">{slug}.localhost</p>
          </div>
        </div>
        {draft.page_sections.filter((s) => s.on).map((section) => {
          if (section.id === "hero") {
            return (
              <div key={section.id} className="relative h-40 bg-[linear-gradient(145deg,#1c1917,#0f6e6a)] bg-cover bg-center" style={{ backgroundImage: draft.cover_path ? `url(${resolveFileUrl(draft.cover_path)})` : undefined }}>
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-ink/10" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="font-display text-2xl leading-none">{title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-white/80">{subtitle}</p>
                </div>
              </div>
            );
          }
          if (section.id === "about") {
            return (
              <div key={section.id} className="border-b border-line px-4 py-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--accent)]">Rreth nesh</p>
                <p className="mt-1 text-sm text-muted">{draft.description || "Shto një përshkrim të shkurtër."}</p>
              </div>
            );
          }
          if (section.id === "fleet") {
            return (
              <div key={section.id} className="border-b border-line px-4 py-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--accent)]">Flota</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[1, 2].map((n) => (
                    <div key={n} className="rounded-xl border border-line bg-white p-3">
                      <div className="mb-2 h-16 rounded-lg bg-gradient-to-br from-ink to-[var(--signal)]" />
                      <p className="text-xs font-bold">Makina {n}</p>
                      <p className="text-xs font-bold text-[var(--signal)]">€__/ditë</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <div key={section.id} className="px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--accent)]">Kontakt</p>
              <button type="button" className="mt-2 w-full rounded-full px-4 py-2.5 text-sm font-bold text-white" style={{ background: draft.brand_primary }}>
                Dërgo kërkesë
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
