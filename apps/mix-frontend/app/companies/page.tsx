import { PublicShell } from "@/components/public-shell";
import { MarketSearch } from "@/components/search";
import { CompanyGrid } from "@/components/tables";
import { publicApi } from "@/lib/api";

export default async function CompaniesPage({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  const params = await (searchParams || Promise.resolve({} as Record<string, string>));
  const companies = await publicApi.companies({ q: params.q, city: params.city, page: params.page || 1 }).catch(() => ({ items: [] }));

  return (
    <PublicShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold md:text-3xl">Kompanitë rent-a-car</h1>
        <p className="mt-1 text-sm text-muted">Zgjidhni një kompani dhe shikoni flotën e saj.</p>
      </div>
      <div className="mb-6">
        <MarketSearch action="/companies" q={params.q} city={params.city} compact />
      </div>
      <CompanyGrid companies={companies.items} />
    </PublicShell>
  );
}
