import { DashboardShell } from "@/components/dashboard-shell";
import { StorefrontEditor } from "@/components/storefront-editor";
import { SectionTitle } from "@/components/ui";
import { companyApi } from "@/lib/api";

export default async function StorefrontPage() {
  const company = await companyApi.get();
  return (
    <DashboardShell>
      <SectionTitle title="Faqja ime" subtitle="Logo, kopertinë, ngjyra dhe seksionet e faqes sate." />
      <StorefrontEditor company={company} />
    </DashboardShell>
  );
}
