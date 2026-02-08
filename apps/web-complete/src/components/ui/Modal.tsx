"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className={cn("w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b1220] p-5 shadow-2xl")}>
          <div className="flex items-center justify-between gap-3">
            <div className="text-base font-semibold text-zinc-100">{title}</div>
            <button
              onClick={onClose}
              className="rounded-xl px-3 py-2 text-sm text-zinc-300 hover:bg-white/10"
            >
              Mbyll
            </button>
          </div>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
