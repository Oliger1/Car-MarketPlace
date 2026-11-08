import { DashboardShell } from "@/components/dashboard-shell";
import { BillingStudio } from "@/components/premium";
import { SectionTitle } from "@/components/ui";
import { billingApi } from "@/lib/api";

export default async function BillingPage() {
  const [subscription, plans, invoices] = await Promise.all([
    billingApi.subscription().catch(() => null),
    billingApi.plans().catch(() => []),
    billingApi.invoices().catch(() => ({ items: [] })),
  ]);
  const planList = Array.isArray(plans) ? plans : [];

  return (
    <DashboardShell>
      <SectionTitle
        title="Abonimi"
        subtitle="Plani juaj caktohet nga administratori i Mix. Pagesa është cash."
      />
      <BillingStudio
        plans={planList}
        currentPlan={subscription?.plan_id}
        subscriptionStatus={subscription?.status}
        invoices={invoices.items}
      />
    </DashboardShell>
  );
}
