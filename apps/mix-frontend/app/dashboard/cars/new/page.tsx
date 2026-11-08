import { DashboardShell } from "@/components/dashboard-shell";
import { CarForm } from "@/components/forms";
import { Card, SectionTitle } from "@/components/ui";

export default function NewCarPage() {
  return (
    <DashboardShell>
      <SectionTitle title="Makina e re" subtitle="Plotësoni të dhënat. Më pas mund të ngarkoni foto." />
      <Card><CarForm defaults={{ currency: "EUR", status: "active", transmission: "automatic", fuel: "petrol" }} /></Card>
    </DashboardShell>
  );
}
