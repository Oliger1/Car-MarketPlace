"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { BookingResponse } from "@/types/api";

export default function BookingStatusPage() {
  const [bookingId, setBookingId] = React.useState("");
  const [booking, setBooking] = React.useState<BookingResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function checkStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingId.trim()) return;

    setLoading(true);
    setError(null);
    setBooking(null);

    try {
      // Try to fetch booking by ID
      const res = await fetch(`/api/bookings/${bookingId}`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Rezervimi nuk u gjet. Kontrolloni numrin.");
      }

      const data = await res.json();
      setBooking(data);
    } catch (e: any) {
      setError(e?.message ?? "Ndodhi një gabim");
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "confirmed":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "active":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "completed":
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "requested":
        return "Në pritje";
      case "confirmed":
        return "E konfirmuar";
      case "active":
        return "Aktive";
      case "completed":
        return "E përfunduar";
      case "cancelled":
        return "E anuluar";
      default:
        return status;
    }
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link
          href="/"
          className="text-sm text-zinc-300 hover:text-white"
        >
          ← Kthehu në home
        </Link>

        <div className="mt-6">
          <h1 className="text-3xl font-bold">Kontroll Rezervimi</h1>
          <p className="mt-2 text-zinc-400">
            Fut numrin e rezervimit për të kontrolluar statusin
          </p>
        </div>

        <form onSubmit={checkStatus} className="mt-8">
          <Card className="p-6">
            <div className="grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Numri i Rezervimit (Booking ID)
                </label>
                <Input
                  placeholder="p.sh. 550e8400-e29b-41d4-a716-446655440000"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  required
                />
                <p className="mt-1 text-sm text-zinc-500">
                  Numri i rezervimit u dërgua në email pas konfirmimit
                </p>
              </div>

              <Button disabled={loading}>
                {loading ? "Duke kërkuar..." : "Kontrollo Statusin"}
              </Button>
            </div>
          </Card>
        </form>

        {error && (
          <Card className="mt-4 border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </Card>
        )}

        {booking && (
          <div className="mt-6 grid gap-4">
            <Card className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Rezervimi juaj</h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    ID: {booking.id}
                  </p>
                </div>
                <Badge className={getStatusColor(booking.status)}>
                  {getStatusLabel(booking.status)}
                </Badge>
              </div>

              <div className="mt-6 grid gap-4">
                <div className="grid gap-2">
                  <div className="text-sm text-zinc-400">Datat</div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm">
                      <span className="font-medium">Nga:</span>{" "}
                      {new Date(booking.date_from).toLocaleDateString("sq-AL")}
                    </div>
                    <div className="text-zinc-600">→</div>
                    <div className="text-sm">
                      <span className="font-medium">Deri:</span>{" "}
                      {new Date(booking.date_to).toLocaleDateString("sq-AL")}
                    </div>
                  </div>
                </div>

                {booking.price_total && (
                  <div className="grid gap-2">
                    <div className="text-sm text-zinc-400">Çmimi Total</div>
                    <div className="text-2xl font-bold">
                      {booking.price_total} {booking.currency}
                    </div>
                  </div>
                )}

                {booking.deposit_amount && (
                  <div className="grid gap-2">
                    <div className="text-sm text-zinc-400">Depozita</div>
                    <div className="text-lg font-semibold">
                      {booking.deposit_amount} {booking.currency}
                    </div>
                  </div>
                )}

                {booking.notes && (
                  <div className="grid gap-2">
                    <div className="text-sm text-zinc-400">Shënime</div>
                    <p className="text-sm text-zinc-300">{booking.notes}</p>
                  </div>
                )}

                <div className="mt-4 grid gap-2 border-t border-white/10 pt-4">
                  <div className="text-sm text-zinc-400">Krijuar më</div>
                  <div className="text-sm">
                    {new Date(booking.created_at).toLocaleString("sq-AL")}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-blue-500/5 p-4">
              <p className="text-sm text-zinc-300">
                <strong>Njoftim:</strong> Për çdo ndryshim ose anulim, ju
                lutem kontaktoni kompaninë direkt.
              </p>
            </Card>
          </div>
        )}

        {!booking && !error && (
          <Card className="mt-6 p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <svg
                className="h-8 w-8 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="mt-4 text-zinc-400">
              Fut numrin e rezervimit për të filluar
            </p>
          </Card>
        )}
      </div>
    </main>
  );
}
