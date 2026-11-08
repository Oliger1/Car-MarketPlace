import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-xl border border-line bg-surface p-5 shadow-soft", className)}>
      {children}
    </div>
  );
}

export function SectionTitle({ title, subtitle, eyebrow }: { title: string; subtitle?: string; eyebrow?: string }) {
  return (
    <div className="mb-5">
      {eyebrow ? <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-accent">{eyebrow}</p> : null}
      <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">{title}</h2>
      {subtitle ? <p className="mt-1.5 max-w-2xl text-sm text-muted md:text-base">{subtitle}</p> : null}
    </div>
  );
}

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) {
  const { className, variant = "primary", ...rest } = props;
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-accent text-white hover:bg-accent-dark",
        variant === "secondary" && "border border-line bg-surface text-ink hover:bg-background",
        variant === "danger" && "bg-red-50 text-red-700 hover:bg-red-100",
        variant === "ghost" && "text-muted hover:bg-background hover:text-ink",
        className,
      )}
      {...rest}
    />
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-accent", props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-accent", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn("w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-accent", props.className)} />;
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-muted">{label}</span>
      {children}
      {error ? <span className="text-xs text-red-600">{error}</span> : hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "success" | "warning" | "danger" }) {
  return (
    <span className={cn(
      "inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold",
      tone === "default" && "border-line bg-background text-ink",
      tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
      tone === "warning" && "border-amber-200 bg-amber-50 text-amber-800",
      tone === "danger" && "border-red-200 bg-red-50 text-red-700",
    )}>{children}</span>
  );
}

export function Empty({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-surface px-6 py-14 text-center">
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {desc ? <p className="mt-2 text-sm text-muted">{desc}</p> : null}
    </div>
  );
}

export function Metric({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4 shadow-soft">
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted">{label}</p>
      <div className="mt-1.5 font-display text-2xl font-bold text-ink md:text-3xl">{value}</div>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}
