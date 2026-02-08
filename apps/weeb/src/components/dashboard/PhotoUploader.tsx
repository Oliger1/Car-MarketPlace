"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";

export function PhotoUploader({ carId, photos }: { carId: string; photos: { id: string; path: string }[] }) {
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function upload(file: File) {
    setErr(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch(`/api/cars/${carId}/photos`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Upload failed");
      }

      // easiest: refresh page
      window.location.reload();
    } catch (e: any) {
      setErr(e?.message ?? "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-3">
      {err ? <Alert>{err}</Alert> : null}
      <div className="flex items-center gap-3">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
            }}
          />
          <Button disabled={loading}>{loading ? "Duke ngarkuar..." : "Ngarko foto"}</Button>
        </label>
        <div className="text-sm text-zinc-400">Maks 5 foto (sipas planit të biznesit).</div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {photos?.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <div className="relative aspect-[4/3]">
              <Image src={`/api/files/${p.path}`} alt="car photo" fill className="object-cover" />
            </div>
            <div className="p-3">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!confirm("Fshi foton?")) return;
                  await fetch(`/api/cars/${carId}/photos/${p.id}`, { method: "DELETE", credentials: "include" });
                  window.location.reload();
                }}
              >
                Fshi
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
