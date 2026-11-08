import { clsx } from "clsx";

export function cn(...classes: Array<string | false | null | undefined>) {
  return clsx(classes);
}

export function formatDate(date?: string | null) {
  if (!date) return "—";
  // Deterministic (no Intl locale) to avoid SSR/client hydration mismatches
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  if (iso) return `${iso[3]}.${iso[2]}.${iso[1]}`;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}

export function money(amount?: string | number | null, currency = "EUR") {
  if (amount === null || amount === undefined || amount === "") return "—";
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(value)) return `${amount} ${currency}`;
  // Fixed format — avoids en/sq ICU differences between Node and browser
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  if (currency === "EUR") return `€${formatted}`;
  if (currency === "ALL") return `${formatted} L`;
  return `${formatted} ${currency}`;
}

export function resolveFileUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return path.startsWith("/") ? path : `/uploads/${path}`;
}

export const STATUS_L: Record<string, string> = {
  active: "Aktive",
  inactive: "Jo aktive",
  maintenance: "Mirëmbajtje",
  requested: "Kërkuar",
  confirmed: "Konfirmuar",
  completed: "Përfunduar",
  cancelled: "Anuluar",
  new: "E re",
  contacted: "Kontaktuar",
  converted: "Konvertuar",
  spam: "Spam",
  trial: "Provë",
  expired: "Skaduar",
};

export const FUEL_L: Record<string, string> = {
  petrol: "Benzinë",
  diesel: "Dizël",
  hybrid: "Hibrid",
  electric: "Elektrik",
};

export const TRANS_L: Record<string, string> = {
  manual: "Manual",
  automatic: "Automatik",
};

export function statusLabel(value?: string | null) {
  if (!value) return "—";
  return STATUS_L[value] || value;
}

export function badgeTone(status?: string | null): "default" | "success" | "warning" | "danger" {
  if (!status) return "default";
  if (["active", "confirmed", "converted", "completed"].includes(status)) return "success";
  if (["requested", "new", "contacted", "maintenance", "trial"].includes(status)) return "warning";
  if (["cancelled", "spam", "expired", "inactive"].includes(status)) return "danger";
  return "default";
}
