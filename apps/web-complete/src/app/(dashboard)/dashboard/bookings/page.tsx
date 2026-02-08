"use client";

import * as React from "react";
import { Shell } from "@/components/dashboard/Shell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import type { BookingResponse } from "@/types/api";
import { apiFetch } from "@/lib/api";

type BookingsResponse = {
  data?: BookingResponse[];
  items?: BookingResponse[];
  total?: number;
};

export default function BookingsPage() {
  const [bookings, setBookings] = React.useState<BookingResponse[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  React.useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  async function loadBookings() {
    try {
      setLoading(true);
      const url =
        statusFilter === "all"
          ? "/api/bookings?limit=100"
          : `/api/bookings?status=${statusFilter}&limit=100`;

      const resp: BookingsResponse = await apiFetch(url);
      const data = resp.data ?? resp.items ?? [];
      setBookings(data);
    } catch (e) {
      console.error("Failed to load bookings", e);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(bookingId: string, newStatus: string) {
    try {
      await apiFetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      await loadBookings();
    } catch (e: any) {
      alert(e?.message ?? "Failed to update");
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

  const stats = {
    total: bookings.length,
    active: bookings.filter((b) => b.status === "active").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    requested: bookings.filter((b) => b.status === "requested").length,
  };

  return (
    <Shell>
      <div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-sm text-zinc-400">Dashboard</div>
            <h1 className="mt-1 text-3xl font-bold">Rezervimet</h1>
          </div>
          <Button onClick={() => loadBookings()} variant="outline">
            Rifresko
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <Card className="p-4">
            <div className="text-sm text-zinc-400">Total</div>
            <div className="mt-1 text-2xl font-bold">{stats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-zinc-400">Aktive</div>
            <div className="mt-1 text-2xl font-bold text-emerald-400">
              {stats.active}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-zinc-400">Të konfirmuara</div>
            <div className="mt-1 text-2xl font-bold text-blue-400">
              {stats.confirmed}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-zinc-400">Në pritje</div>
            <div className="mt-1 text-2xl font-bold text-orange-400">
              {stats.requested}
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mt-6 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm font-medium">Filtro:</div>
            <Select
              value={statusFilter}
              onChange={(v) => setStatusFilter(v)}
              options={[
                { label: "Të gjitha", value: "all" as const },
                { label: "Në pritje", value: "requested" as const },
                { label: "Të konfirmuara", value: "confirmed" as const },
                { label: "Aktive", value: "active" as const },
                { label: "Të përfunduara", value: "completed" as const },
                { label: "Të anuluara", value: "cancelled" as const },
              ]}
            />
          </div>
        </Card>

        {/* Bookings List */}
        <div className="mt-6 grid gap-4">
          {loading ? (
            <Card className="p-8 text-center text-zinc-400">
              Duke ngarkuar...
            </Card>
          ) : bookings.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-zinc-400">
                Nuk ka rezervime{" "}
                {statusFilter !== "all" && `me status "${statusFilter}"`}
              </div>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-semibold">
                        Booking #{booking.id.slice(0, 8)}
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {getStatusLabel(booking.status)}
                      </Badge>
                    </div>
                    <div className="mt-2 grid gap-2 text-sm">
                      <div>
                        <span className="text-zinc-400">Datat:</span>{" "}
                        {new Date(booking.date_from).toLocaleDateString("sq-AL")}{" "}
                        → {new Date(booking.date_to).toLocaleDateString("sq-AL")}
                      </div>
                      {booking.price_total && (
                        <div>
                          <span className="text-zinc-400">Çmimi:</span>{" "}
                          <span className="font-semibold">
                            {booking.price_total} {booking.currency}
                          </span>
                        </div>
                      )}
                      {booking.notes && (
                        <div>
                          <span className="text-zinc-400">Shënime:</span>{" "}
                          {booking.notes}
                        </div>
                      )}
                      <div className="text-xs text-zinc-500">
                        Krijuar: {new Date(booking.created_at).toLocaleString("sq-AL")}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {booking.status === "requested" && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(booking.id, "confirmed")}
                      >
                        Konfirmo
                      </Button>
                    )}
                    {booking.status === "confirmed" && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(booking.id, "active")}
                      >
                        Aktivizo
                      </Button>
                    )}
                    {booking.status === "active" && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(booking.id, "completed")}
                      >
                        Përfundo
                      </Button>
                    )}
                    {(booking.status === "requested" ||
                      booking.status === "confirmed") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(booking.id, "cancelled")}
                      >
                        Anulo
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Shell>
  );
}
