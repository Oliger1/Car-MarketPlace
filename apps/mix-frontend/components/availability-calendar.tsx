"use client";

import { useEffect, useMemo, useState } from "react";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isBefore, isSameDay, isSameMonth, isWithinInterval, parseISO, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type DateRange = { from: string; to: string };

function parseDay(iso: string) {
  return startOfDay(parseISO(iso.length === 10 ? `${iso}T12:00:00` : iso));
}

function dayBlocked(day: Date, ranges: DateRange[]) {
  return ranges.some((r) => {
    try {
      return isWithinInterval(day, { start: parseDay(r.from), end: parseDay(r.to) });
    } catch {
      return false;
    }
  });
}

function rangeOverlapsBlocked(from: Date, to: Date, ranges: DateRange[]) {
  const start = isBefore(from, to) ? from : to;
  const end = isBefore(from, to) ? to : from;
  return eachDayOfInterval({ start, end }).some((d) => dayBlocked(d, ranges));
}

const WEEKDAYS = ["Hën", "Mar", "Mër", "Enj", "Pre", "Sht", "Die"];
const MONTHS = [
  "Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor",
  "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor",
];

export function AvailabilityCalendar({
  unavailable = [],
  selectedFrom,
  selectedTo,
  onChange,
}: {
  unavailable?: DateRange[];
  selectedFrom?: string;
  selectedTo?: string;
  onChange: (next: { date_from: string; date_to: string }) => void;
}) {
  const [today] = useState(() => startOfDay(new Date()));
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const fromDate = selectedFrom ? parseDay(selectedFrom) : null;
  const toDate = selectedTo ? parseDay(selectedTo) : null;

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  function pick(day: Date) {
    if (isBefore(day, today)) return;
    if (dayBlocked(day, unavailable)) return;

    const iso = format(day, "yyyy-MM-dd");

    // First click or reset after complete range
    if (!fromDate || (fromDate && toDate)) {
      onChange({ date_from: iso, date_to: "" });
      return;
    }

    // Second click
    if (isSameDay(day, fromDate)) {
      onChange({ date_from: iso, date_to: iso });
      return;
    }

    const start = isBefore(day, fromDate) ? day : fromDate;
    const end = isBefore(day, fromDate) ? fromDate : day;
    if (rangeOverlapsBlocked(start, end, unavailable)) {
      // Can't span blocked days — start a new selection
      onChange({ date_from: iso, date_to: "" });
      return;
    }
    onChange({
      date_from: format(start, "yyyy-MM-dd"),
      date_to: format(end, "yyyy-MM-dd"),
    });
  }

  if (!ready) {
    return <div className="h-72 animate-pulse rounded-xl border border-line bg-background" />;
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          className="rounded-lg p-1.5 text-muted hover:bg-background hover:text-ink"
          onClick={() => setMonth((m) => addMonths(m, -1))}
          aria-label="Muaji i kaluar"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="font-display text-sm font-bold">{MONTHS[month.getMonth()]} {month.getFullYear()}</p>
        <button
          type="button"
          className="rounded-lg p-1.5 text-muted hover:bg-background hover:text-ink"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          aria-label="Muaji tjetër"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wide text-muted">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = isSameMonth(day, month);
          const blocked = dayBlocked(day, unavailable);
          const past = isBefore(day, today);
          const disabled = blocked || past;
          const isFrom = fromDate && isSameDay(day, fromDate);
          const isTo = toDate && isSameDay(day, toDate);
          const inSelected =
            fromDate &&
            toDate &&
            isWithinInterval(day, {
              start: isBefore(fromDate, toDate) ? fromDate : toDate,
              end: isBefore(fromDate, toDate) ? toDate : fromDate,
            });

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => pick(day)}
              title={blocked ? "E zënë" : past ? "E kaluar" : format(day, "dd.MM.yyyy")}
              aria-disabled={disabled || undefined}
              className={cn(
                "aspect-square rounded-lg text-xs font-semibold transition",
                !inMonth && "opacity-30",
                disabled && "pointer-events-none cursor-not-allowed",
                blocked && "bg-red-100 text-red-500 line-through decoration-red-400 ring-1 ring-inset ring-red-200",
                past && !blocked && "bg-transparent text-muted/35",
                !disabled && !inSelected && "hover:bg-accent-soft hover:text-accent",
                inSelected && !blocked && "bg-accent-soft text-accent",
                (isFrom || isTo) && "bg-accent text-white hover:bg-accent-dark hover:text-white",
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-red-100 ring-1 ring-red-200" /> E zënë
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-accent" /> Zgjedhur
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-accent-soft ring-1 ring-accent/30" /> Interval
        </span>
      </div>
    </div>
  );
}
