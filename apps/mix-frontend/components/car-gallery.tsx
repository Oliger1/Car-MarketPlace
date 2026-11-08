"use client";

import { useState } from "react";
import { resolveFileUrl } from "@/lib/utils";

export function CarGallery({ photos, title }: { photos: { path: string; alt_text?: string | null }[]; title: string }) {
  const items = photos.filter((p) => p.path);
  const [active, setActive] = useState(0);
  if (!items.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-[28px] bg-[linear-gradient(160deg,#1c1917,#0f6e6a)] text-sm font-medium text-white/80">
        Pa foto
      </div>
    );
  }
  const current = items[Math.min(active, items.length - 1)];
  return (
    <div>
      <div className="overflow-hidden rounded-[28px] bg-ink shadow-soft">
        <img
          src={resolveFileUrl(current.path) || undefined}
          alt={current.alt_text || title}
          className="h-[280px] w-full object-cover sm:h-[420px]"
        />
      </div>
      {items.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {items.map((photo, i) => (
            <button
              key={photo.path + i}
              type="button"
              onClick={() => setActive(i)}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 ${i === active ? "border-ink" : "border-transparent opacity-70"}`}
            >
              <img src={resolveFileUrl(photo.path) || undefined} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
