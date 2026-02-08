import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur",
        className
      )}
      {...props}
    />
  );
}
