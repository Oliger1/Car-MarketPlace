import { DashboardShell } from "@/components/dashboard-shell";
import { CarForm } from "@/components/forms";
import { Card, SectionTitle } from "@/components/ui";
import { carsApi } from "@/lib/api";

export default async function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await carsApi.get(id);
  return (
    <DashboardShell>
      <SectionTitle title={car.title} subtitle="Ndryshoni të dhënat e makinës." />
      <Card><CarForm defaults={car} carId={id} /></Card>
    </DashboardShell>
  );
}
