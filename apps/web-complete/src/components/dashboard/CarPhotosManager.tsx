"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import type { CarPhotoResponse } from "@/types/api";

export function CarPhotosManager({ carId }: { carId: string }) {
  const [photos, setPhotos] = React.useState<CarPhotoResponse[]>([]);
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Fetch photos on mount
  React.useEffect(() => {
    async function fetchPhotos() {
      try {
        const res = await fetch(`/api/cars/${carId}`, {
          credentials: "include",
        });
        if (res.ok) {
          const car = await res.json();
          setPhotos(car.photos || []);
        }
      } catch (e) {
        console.error("Failed to fetch photos", e);
      }
    }
    fetchPhotos();
  }, [carId]);

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

      // Refresh photos
      window.location.reload();
    } catch (e: any) {
      setErr(e?.message ?? "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function deletePhoto(photoId: string) {
    if (!confirm("Fshi foton?")) return;
    try {
      await fetch(`/api/cars/${carId}/photos/${photoId}`, {
        method: "DELETE",
        credentials: "include",
      });
      window.location.reload();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to delete");
    }
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold">Fotot e makinës</h2>
      <div className="mt-3 grid gap-3">
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
            <Button disabled={loading}>
              {loading ? "Duke ngarkuar..." : "Ngarko foto"}
            </Button>
          </label>
          <div className="text-sm text-zinc-400">
            Maks 5 foto (sipas planit të biznesit).
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {photos.length === 0 ? (
            <div className="col-span-full py-8 text-center text-zinc-400">
              Nuk ka foto ende. Ngarko fotot e para.
            </div>
          ) : (
            photos.map((p) => (
              <Card key={p.id} className="overflow-hidden">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={`/api/files/${p.path}`}
                    alt={p.alt_text || "car photo"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deletePhoto(p.id)}
                  >
                    Fshi
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
