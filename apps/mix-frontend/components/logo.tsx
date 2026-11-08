import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  name,
  light = false,
  imageSrc,
}: {
  href?: string;
  name?: string;
  light?: boolean;
  imageSrc?: string | null;
}) {
  const label = name || "Mix";
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", light ? "text-white" : "text-ink")}>
      {imageSrc ? (
        <span className="relative inline-flex h-9 w-9 overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
          <img src={imageSrc} alt="" className="h-full w-full object-cover" />
        </span>
      ) : (
        <span className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-2xl bg-ink text-white shadow-soft">
          <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden>
            <path d="M6 20c4-8 7-8 10 0s6 8 10 0" fill="none" stroke="#f4efe8" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="10" cy="21" r="2.2" fill="#e07a3d" />
            <circle cx="22" cy="21" r="2.2" fill="#e07a3d" />
          </svg>
        </span>
      )}
      <span className="font-display text-[1.35rem] font-semibold leading-none tracking-[-0.04em]">
        {label}
        {!name ? <span className="text-signal">.</span> : null}
      </span>
    </Link>
  );
}
