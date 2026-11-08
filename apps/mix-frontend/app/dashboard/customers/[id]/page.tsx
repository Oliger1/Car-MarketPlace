import { DashboardShell } from "@/components/dashboard-shell";
import { CustomerForm } from "@/components/forms";
import { Card, SectionTitle } from "@/components/ui";
import { customersApi } from "@/lib/api";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await customersApi.get(id);
  return (
    <DashboardShell>
      <SectionTitle title={customer.name} />
      <Card><CustomerForm defaults={customer} customerId={id} /></Card>
    </DashboardShell>
  );
}
