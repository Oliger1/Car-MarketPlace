import { DashboardShell } from "@/components/dashboard-shell";
import { BookingForm } from "@/components/forms";
import { Card, SectionTitle } from "@/components/ui";

export default function NewBookingPage() {
  return (
    <DashboardShell>
      <SectionTitle title="Rezervim i ri" subtitle="Zgjidhni makinën, datat dhe klientin." />
      <Card><BookingForm defaults={{ currency: "EUR", status: "confirmed" }} /></Card>
    </DashboardShell>
  );
}
