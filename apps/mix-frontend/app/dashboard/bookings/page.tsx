import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { BookingsTable } from "@/components/tables";
import { Button, SectionTitle } from "@/components/ui";
import { bookingsApi } from "@/lib/api";

export default async function BookingsPage() {
  const bookings = await bookingsApi.list().catch(() => ({ items: [] }));
  return (
    <DashboardShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <SectionTitle title="Rezervimet" subtitle="Datat e konfirmuara të flotës." />
        <Link href="/dashboard/bookings/new"><Button>Rezervim i ri</Button></Link>
      </div>
      <BookingsTable bookings={bookings.items} />
    </DashboardShell>
  );
}
