import { DashboardShell } from "@/components/dashboard-shell";
import { BookingForm } from "@/components/forms";
import { Card, SectionTitle } from "@/components/ui";
import { bookingsApi } from "@/lib/api";

export default async function EditBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = await bookingsApi.get(id);
  return (
    <DashboardShell>
      <SectionTitle title="Ndrysho rezervimin" />
      <Card><BookingForm defaults={booking} bookingId={id} /></Card>
    </DashboardShell>
  );
}
