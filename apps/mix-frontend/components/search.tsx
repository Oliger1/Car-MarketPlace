import { CalendarRange, MapPin, Search } from "lucide-react";

export function MarketSearch({
  action = "/cars",
  q,
  city,
  dateFrom,
  dateTo,
  compact = false,
}: {
  action?: string;
  q?: string;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
  compact?: boolean;
}) {
  return (
    <form
      action={action}
      className={
        compact
          ? "grid gap-2 rounded-[24px] border border-line bg-surface p-3 shadow-soft lg:grid-cols-[1fr_1fr_0.7fr_0.7fr_auto]"
          : "search-shell grid gap-0 overflow-hidden rounded-[28px] border border-white/50 bg-surface lg:grid-cols-[1.1fr_1fr_0.7fr_0.7fr_auto]"
      }
    >
      <label className="flex items-center gap-3 border-b border-line px-4 py-3.5 lg:border-b-0 lg:border-r">
        <MapPin className="h-5 w-5 shrink-0 text-accent" />
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted">Ku</span>
          <input name="city" defaultValue={city} placeholder="Tiranë, Durrës, Vlorë" className="w-full bg-transparent text-sm font-semibold text-ink placeholder:font-medium placeholder:text-muted/70" />
        </span>
      </label>
      <label className="flex items-center gap-3 border-b border-line px-4 py-3.5 lg:border-b-0 lg:border-r">
        <Search className="h-5 w-5 shrink-0 text-accent" />
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted">Makina</span>
          <input name="q" defaultValue={q} placeholder="Opsionale" className="w-full bg-transparent text-sm font-semibold text-ink placeholder:font-medium placeholder:text-muted/70" />
        </span>
      </label>
      <label className="flex items-center gap-3 border-b border-line px-4 py-3.5 lg:border-b-0 lg:border-r">
        <CalendarRange className="h-5 w-5 shrink-0 text-accent" />
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted">Nga</span>
          <input type="date" name="date_from" defaultValue={dateFrom} className="w-full bg-transparent text-sm font-semibold text-ink" />
        </span>
      </label>
      <label className="flex items-center gap-3 border-b border-line px-4 py-3.5 lg:border-b-0 lg:border-r">
        <CalendarRange className="h-5 w-5 shrink-0 text-accent" />
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted">Deri</span>
          <input type="date" name="date_to" defaultValue={dateTo} className="w-full bg-transparent text-sm font-semibold text-ink" />
        </span>
      </label>
      <div className="p-2 lg:min-w-[180px]">
        <button type="submit" className="h-full w-full rounded-2xl bg-signal px-6 py-3.5 text-base font-bold text-white hover:bg-[#c45f24]">
          Shiko çmimet
        </button>
      </div>
    </form>
  );
}
