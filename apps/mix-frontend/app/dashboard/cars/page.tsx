import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { CarsTable } from "@/components/tables";
import { Button, SectionTitle } from "@/components/ui";
import { carsApi } from "@/lib/api";

export default async function CarsDashboardPage() {
  const cars = await carsApi.list().catch(() => ({ items: [] }));
  return (
    <DashboardShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <SectionTitle title="Makinat" subtitle="Flota juaj — çmimi, statusi dhe publikimi në treg." />
        <Link href="/dashboard/cars/new"><Button>Makina e re</Button></Link>
      </div>
      <CarsTable cars={cars.items} />
    </DashboardShell>
  );
}
