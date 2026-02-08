"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function CarGallery({ photos, alt }: { photos: { path: string; id: string }[]; alt: string }) {
  const [active, setActive] = React.useState(0);
  const list = photos?.length ? photos : [];

  const src = list[active]?.path ? `/api/files/${list[active].path}` : null;

  return (
    <div className="grid gap-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        {src ? <Image src={src} alt={alt} fill className="object-cover" /> : null}
      </div>

      {list.length > 1 ? (
        <div className="flex gap-2 overflow-auto pb-1">
          {list.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setActive(idx)}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-2xl border bg-white/5",
                idx === active ? "border-blue-400/60" : "border-white/10 hover:border-white/20"
              )}
            >
              <Image src={`/api/files/${p.path}`} alt={alt} fill className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
