import type { CSSProperties } from "react";
import type { CompanyPublic, PageSection } from "@/lib/types";

export const DEFAULT_SECTIONS: PageSection[] = [
  { id: "hero", on: true },
  { id: "about", on: true },
  { id: "fleet", on: true },
  { id: "contact", on: true },
];

export const SECTION_LABEL: Record<PageSection["id"], string> = {
  hero: "Kopertina / hero",
  about: "Rreth nesh",
  fleet: "Flota",
  contact: "Formulari i kontaktit",
};

export function normalizeSections(raw?: PageSection[] | null): PageSection[] {
  if (!Array.isArray(raw) || !raw.length) return DEFAULT_SECTIONS.map((s) => ({ ...s }));
  const seen = new Set<string>();
  const out: PageSection[] = [];
  for (const item of raw) {
    if (!item?.id || seen.has(item.id) || !(item.id in SECTION_LABEL)) continue;
    seen.add(item.id);
    out.push({ id: item.id, on: item.on !== false });
  }
  for (const s of DEFAULT_SECTIONS) {
    if (!seen.has(s.id)) out.push({ ...s });
  }
  return out;
}

export function brandStyle(company: Pick<CompanyPublic, "brand_primary" | "brand_accent">): CSSProperties {
  const primary = company.brand_primary || "#0f6e6a";
  const accent = company.brand_accent || "#e07a3d";
  return {
    ["--accent" as string]: primary,
    ["--accent-dark" as string]: primary,
    ["--accent-soft" as string]: `${primary}22`,
    ["--signal" as string]: accent,
    ["--price" as string]: accent,
  };
}
