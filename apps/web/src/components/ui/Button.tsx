"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
};

export function Button({ className, variant = "primary", size = "md", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 disabled:opacity-60 disabled:pointer-events-none",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-11 px-4 text-sm",
        size === "lg" && "h-12 px-5 text-base",
        variant === "primary" &&
          "bg-white text-black hover:bg-zinc-200 shadow-[0_10px_30px_rgba(255,255,255,0.08)]",
        variant === "ghost" && "bg-transparent text-zinc-100 hover:bg-white/10",
        variant === "outline" &&
          "bg-transparent border border-white/15 text-zinc-100 hover:bg-white/10",
        className
      )}
      {...props}
    />
  );
}
