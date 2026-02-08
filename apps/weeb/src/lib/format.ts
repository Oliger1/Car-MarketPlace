export function money(amount: string | number | null | undefined, currency: string = "EUR") {
  if (amount === null || amount === undefined) return "-";
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(n)) return String(amount);
  return new Intl.NumberFormat("sq-AL", { style: "currency", currency }).format(n);
}

export function dateISO(d: string | null | undefined) {
  if (!d) return "-";
  // backend uses YYYY-MM-DD; keep it readable
  return new Intl.DateTimeFormat("sq-AL", { dateStyle: "medium" }).format(new Date(d));
}
