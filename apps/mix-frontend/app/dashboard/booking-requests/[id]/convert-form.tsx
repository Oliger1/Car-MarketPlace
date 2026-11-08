"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { bookingRequestsApi } from "@/lib/api";
import { Button, Field, Input } from "@/components/ui";

export default function ConvertForm({ id, hasCar }: { id: string; hasCar: boolean }) {
  const router = useRouter();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!hasCar) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-amber-800">
          Kjo kërkesë nuk ka makinë të lidhur. Konvertimi nuk është i mundur — klienti duhet të zgjedhë një makinë nga storefront, ose hapni një rezervim të ri manualisht.
        </p>
        <Button disabled className="w-full" type="button">
          Konverto (pa makinë)
        </Button>
      </div>
    );
  }

  async function convert() {
    setLoading(true);
    setError(null);
    try {
      await bookingRequestsApi.convert(id, { date_from: dateFrom, date_to: dateTo });
      router.push("/dashboard/bookings");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nuk u konvertua.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">Ktheje në rezervim të konfirmuar.</p>
      <Field label="Nga"><Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></Field>
      <Field label="Deri"><Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></Field>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <Button onClick={convert} disabled={loading || !dateFrom || !dateTo} className="w-full">
        {loading ? "Duke ruajtur..." : "Konverto"}
      </Button>
    </div>
  );
}
