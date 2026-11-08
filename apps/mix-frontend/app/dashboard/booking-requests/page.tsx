import { DashboardShell } from "@/components/dashboard-shell";
import { BookingRequestsTable } from "@/components/tables";
import { SectionTitle } from "@/components/ui";
import { bookingRequestsApi } from "@/lib/api";

export default async function BookingRequestsPage() {
  const requests = await bookingRequestsApi.list().catch(() => ({ items: [] }));
  return (
    <DashboardShell>
      <SectionTitle title="Kërkesat nga tregu" subtitle="Njerëzit që duan të rezervojnë nga faqja publike." />
      <BookingRequestsTable requests={requests.items} />
    </DashboardShell>
  );
}
