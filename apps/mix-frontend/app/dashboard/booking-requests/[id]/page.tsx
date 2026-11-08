import { DashboardShell } from "@/components/dashboard-shell";
import { Card, SectionTitle, Badge } from "@/components/ui";
import { bookingRequestsApi } from "@/lib/api";
import { badgeTone, formatDate, statusLabel } from "@/lib/utils";
import ConvertForm from "./convert-form";
import StatusActions from "./status-actions";

export default async function BookingRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const request = await bookingRequestsApi.get(id);
  return (
    <DashboardShell>
      <SectionTitle title={request.requester_name} subtitle="Kërkesë nga tregu publik." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="space-y-3 text-sm">
          <p><span className="text-muted">Telefoni:</span> {request.requester_phone}</p>
          <p><span className="text-muted">Email:</span> {request.requester_email || "—"}</p>
          <p><span className="text-muted">Datat:</span> {formatDate(request.date_from)} → {formatDate(request.date_to)}</p>
          <p><span className="text-muted">Mesazhi:</span> {request.message || "—"}</p>
        </Card>
        <Card>
          <p className="mb-3 text-xs uppercase tracking-[0.14em] text-muted">Statusi</p>
          <Badge tone={badgeTone(request.status)}>{statusLabel(request.status)}</Badge>
          <StatusActions id={id} status={request.status} />
          {request.status !== "converted" && request.status !== "spam" ? (
            <div className="mt-6">
              <ConvertForm id={id} hasCar={Boolean(request.car_id)} />
            </div>
          ) : null}
        </Card>
      </div>
    </DashboardShell>
  );
}
