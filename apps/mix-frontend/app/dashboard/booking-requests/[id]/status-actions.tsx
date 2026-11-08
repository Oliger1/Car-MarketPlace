"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { bookingRequestsApi } from "@/lib/api";
import { Button } from "@/components/ui";

export default function StatusActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(next: "contacted" | "spam") {
    setLoading(next);
    setError(null);
    try {
      await bookingRequestsApi.update(id, { status: next });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nuk u përditësua.");
    } finally {
      setLoading(null);
    }
  }

  if (status === "converted" || status === "spam") return null;

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">Veprime</p>
      <div className="flex flex-col gap-2">
        {status !== "contacted" ? (
          <Button
            type="button"
            variant="secondary"
            disabled={!!loading}
            onClick={() => setStatus("contacted")}
            className="w-full"
          >
            {loading === "contacted" ? "Duke ruajtur..." : "Shëno si kontaktuar"}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          disabled={!!loading}
          onClick={() => setStatus("spam")}
          className="w-full"
        >
          {loading === "spam" ? "Duke ruajtur..." : "Shëno si spam"}
        </Button>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
