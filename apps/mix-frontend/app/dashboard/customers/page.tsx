import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { CustomersTable } from "@/components/tables";
import { Button, SectionTitle } from "@/components/ui";
import { customersApi } from "@/lib/api";

export default async function CustomersPage() {
  const customers = await customersApi.list().catch(() => ({ items: [] }));
  return (
    <DashboardShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <SectionTitle title="Klientët" subtitle="Personat që kanë rezervuar ose që i keni shtuar ju." />
        <Link href="/dashboard/customers/new"><Button>Klient i ri</Button></Link>
      </div>
      <CustomersTable customers={customers.items} />
    </DashboardShell>
  );
}
