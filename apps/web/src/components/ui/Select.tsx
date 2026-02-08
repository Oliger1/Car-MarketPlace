"use client";

import { cn } from "@/lib/utils";

type Option = { label: string; value: string };

export function Select({
  value,
  onChange,
  options,
  className,
}: {
  value?: string;
  onChange?: (v: string) => void;
  options: Option[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={cn(
        "h-11 w-full rounded-2xl bg-white/5 border border-white/10 px-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-400/60",
        className
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-[#0b1220]">
          {o.label}
        </option>
      ))}
    </select>
  );
}
