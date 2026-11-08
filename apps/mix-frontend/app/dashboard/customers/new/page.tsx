import { DashboardShell } from "@/components/dashboard-shell";
import { CustomerForm } from "@/components/forms";
import { Card, SectionTitle } from "@/components/ui";

export default function NewCustomerPage() {
  return (
    <DashboardShell>
      <SectionTitle title="Klient i ri" />
      <Card><CustomerForm /></Card>
    </DashboardShell>
  );
}
