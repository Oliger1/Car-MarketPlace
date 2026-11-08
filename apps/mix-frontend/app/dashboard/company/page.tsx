import { DashboardShell } from "@/components/dashboard-shell";
import { CompanyForm } from "@/components/forms";
import { Card, SectionTitle } from "@/components/ui";
import { companyApi } from "@/lib/api";

export default async function CompanyPage() {
  const company = await companyApi.get();
  return (
    <DashboardShell>
      <SectionTitle title="Profili i kompanisë" subtitle="Këto të dhëna shfaqen në tregun publik kur e publikoni kompaninë." />
      <Card><CompanyForm defaults={company} /></Card>
    </DashboardShell>
  );
}
