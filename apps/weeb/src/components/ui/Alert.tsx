import { cn } from "@/lib/utils";

export function Alert({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200", className)} {...props} />
  );
}
