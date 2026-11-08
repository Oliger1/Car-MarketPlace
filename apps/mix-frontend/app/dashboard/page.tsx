import { DashboardShell } from "@/components/dashboard-shell";
import { PremiumDashboard } from "@/components/premium";
import { billingApi, bookingsApi, bookingRequestsApi, carsApi, companyApi } from "@/lib/api";

export default async function DashboardPage() {
  const [company, cars, bookings, requests, subscription] = await Promise.all([
    companyApi.get().catch(() => null),
    carsApi.list({ limit: 8 }).catch(() => ({ items: [] })),
    bookingsApi.list({ limit: 8 }).catch(() => ({ items: [] })),
    bookingRequestsApi.list({ limit: 6 }).catch(() => ({ items: [] })),
    billingApi.subscription().catch(() => null),
  ]);

  return (
    <DashboardShell>
      <PremiumDashboard
        company={company}
        cars={cars.items}
        bookings={bookings.items}
        requests={requests.items}
        planName={subscription?.plan?.name || "Pa plan"}
      />
    </DashboardShell>
  );
}
