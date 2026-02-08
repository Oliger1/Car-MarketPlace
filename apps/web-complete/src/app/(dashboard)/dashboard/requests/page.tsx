"use client";

import * as React from "react";
import { Shell } from "@/components/dashboard/Shell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import type { BookingRequestResponse, BookingRequestConvert } from "@/types/api";
import { apiFetch } from "@/lib/api";

type RequestsResponse = {
  data?: BookingRequestResponse[];
  items?: BookingRequestResponse[];
  total?: number;
};

export default function RequestsPage() {
  const [requests, setRequests] = React.useState<BookingRequestResponse[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [convertModal, setConvertModal] = React.useState<string | null>(null);
  const [convertForm, setConvertForm] = React.useState<BookingRequestConvert>({
    date_from: "",
    date_to: "",
    price_total: null,
    deposit_amount: null,
    customer_id: null,
  });

  React.useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  async function loadRequests() {
    try {
      setLoading(true);
      const url =
        statusFilter === "all"
          ? "/api/booking-requests?limit=100"
          : `/api/booking-requests?status=${statusFilter}&limit=100`;

      const resp: RequestsResponse = await apiFetch(url);
      const data = resp.data ?? resp.items ?? [];
      setRequests(data);
    } catch (e) {
      console.error("Failed to load requests", e);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(requestId: string, newStatus: "new" | "contacted" | "converted" | "spam") {
    try {
      await apiFetch(`/api/booking-requests/${requestId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      await loadRequests();
    } catch (e: any) {
      alert(e?.message ?? "Failed to update");
    }
  }

  async function convertToBooking(requestId: string) {
    try {
      await apiFetch(`/api/booking-requests/${requestId}/convert`, {
        method: "POST",
        body: JSON.stringify(convertForm),
      });
      setConvertModal(null);
      await loadRequests();
      alert("Kërkesa u konvertua në rezervim!");
    } catch (e: any) {
      alert(e?.message ?? "Failed to convert");
    }
  }

  function openConvertModal(request: BookingRequestResponse) {
    setConvertForm({
      date_from: request.date_from || "",
      date_to: request.date_to || "",
      price_total: null,
      deposit_amount: null,
      customer_id: null,
    });
    setConvertModal(request.id);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "new":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "contacted":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "converted":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "spam":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "new":
        return "E re";
      case "contacted":
        return "Kontaktuar";
      case "converted":
        return "Konvertuar";
      case "spam":
        return "Spam";
      default:
        return status;
    }
  }

  const stats = {
    total: requests.length,
    new: requests.filter((r) => r.status === "new").length,
    contacted: requests.filter((r) => r.status === "contacted").length,
    converted: requests.filter((r) => r.status === "converted").length,
  };

  const currentRequest = requests.find((r) => r.id === convertModal);

  return (
    <Shell>
      <div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-sm text-zinc-400">Dashboard</div>
            <h1 className="mt-1 text-3xl font-bold">Kërkesat për Rezervim</h1>
          </div>
          <Button onClick={() => loadRequests()} variant="outline">
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
            <div className="text-sm text-zinc-400">Të reja</div>
            <div className="mt-1 text-2xl font-bold text-blue-400">
              {stats.new}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-zinc-400">Kontaktuar</div>
            <div className="mt-1 text-2xl font-bold text-purple-400">
              {stats.contacted}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-zinc-400">Konvertuar</div>
            <div className="mt-1 text-2xl font-bold text-emerald-400">
              {stats.converted}
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
                { label: "Të reja", value: "new" as const },
                { label: "Kontaktuar", value: "contacted" as const },
                { label: "Konvertuar", value: "converted" as const },
                { label: "Spam", value: "spam" as const },
              ]}
            />
          </div>
        </Card>

        {/* Requests List */}
        <div className="mt-6 grid gap-4">
          {loading ? (
            <Card className="p-8 text-center text-zinc-400">
              Duke ngarkuar...
            </Card>
          ) : requests.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-zinc-400">
                Nuk ka kërkesa{" "}
                {statusFilter !== "all" && `me status "${statusFilter}"`}
              </div>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-semibold">
                        {request.requester_name}
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </div>
                    <div className="mt-2 grid gap-2 text-sm">
                      <div>
                        <span className="text-zinc-400">Telefoni:</span>{" "}
                        <a
                          href={`tel:${request.requester_phone}`}
                          className="font-medium hover:text-blue-400"
                        >
                          {request.requester_phone}
                        </a>
                      </div>
                      {request.date_from && request.date_to && (
                        <div>
                          <span className="text-zinc-400">Datat:</span>{" "}
                          {new Date(request.date_from).toLocaleDateString("sq-AL")}{" "}
                          → {new Date(request.date_to).toLocaleDateString("sq-AL")}
                        </div>
                      )}
                      {request.message && (
                        <div>
                          <span className="text-zinc-400">Mesazhi:</span>{" "}
                          {request.message}
                        </div>
                      )}
                      <div className="text-xs text-zinc-500">
                        Krijuar: {new Date(request.created_at).toLocaleString("sq-AL")}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {request.status === "new" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateStatus(request.id, "contacted")}
                        >
                          Shëno si kontaktuar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openConvertModal(request)}
                        >
                          Konverto në rezervim
                        </Button>
                      </>
                    )}
                    {request.status === "contacted" && (
                      <Button
                        size="sm"
                        onClick={() => openConvertModal(request)}
                      >
                        Konverto në rezervim
                      </Button>
                    )}
                    {(request.status === "new" ||
                      request.status === "contacted") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(request.id, "spam")}
                      >
                        Spam
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Convert to Booking Modal */}
      <Modal
        open={!!convertModal}
        onClose={() => setConvertModal(null)}
        title="Konverto në Rezervim"
      >
        {currentRequest && (
          <div className="grid gap-4">
            <div>
              <div className="text-sm font-medium text-zinc-400">Klienti</div>
              <div className="mt-1 text-lg font-semibold">
                {currentRequest.requester_name}
              </div>
              <div className="text-sm text-zinc-400">
                {currentRequest.requester_phone}
              </div>
            </div>

            <div className="grid gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Data nga
                </label>
                <Input
                  type="date"
                  value={convertForm.date_from}
                  onChange={(e) =>
                    setConvertForm((s) => ({ ...s, date_from: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Data deri
                </label>
                <Input
                  type="date"
                  value={convertForm.date_to}
                  onChange={(e) =>
                    setConvertForm((s) => ({ ...s, date_to: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Çmimi total (opsional)
                </label>
                <Input
                  type="number"
                  placeholder="p.sh. 150"
                  value={convertForm.price_total ?? ""}
                  onChange={(e) =>
                    setConvertForm((s) => ({
                      ...s,
                      price_total: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Depozita (opsional)
                </label>
                <Input
                  type="number"
                  placeholder="p.sh. 50"
                  value={convertForm.deposit_amount ?? ""}
                  onChange={(e) =>
                    setConvertForm((s) => ({
                      ...s,
                      deposit_amount: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => convertToBooking(currentRequest.id)}
                disabled={!convertForm.date_from || !convertForm.date_to}
              >
                Konfirmo konvertimin
              </Button>
              <Button variant="outline" onClick={() => setConvertModal(null)}>
                Anulo
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Shell>
  );
}
