import { CompanyCard } from "@/components/public/CompanyCard";
import { Card } from "@/components/ui/Card";
import type { CompanyPublic } from "@/types/api";

type CompaniesResponse = {
  data?: CompanyPublic[];
  items?: CompanyPublic[];
  total?: number;
  page?: number;
  limit?: number;
};

async function getCompanies(): Promise<{
  data: CompanyPublic[];
  total: number;
  page: number;
  limit: number;
}> {
  const base = process.env.API_URL ?? "http://localhost:8000";

  const res = await fetch(`${base}/api/public/companies?limit=30`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return { data: [], total: 0, page: 1, limit: 30 };
  }

  const json = await res.json();

  // Defensive: nëse backend kthen array direkt
  if (Array.isArray(json)) {
    return { data: json as CompanyPublic[], total: json.length, page: 1, limit: 30 };
  }

  const data: CompanyPublic[] =
    Array.isArray(json?.data) ? json.data :
    Array.isArray(json?.items) ? json.items :
    [];

  return {
    data,
    total: typeof json?.total === "number" ? json.total : data.length,
    page: typeof json?.page === "number" ? json.page : 1,
    limit: typeof json?.limit === "number" ? json.limit : 30,
  };
}

export default async function CompaniesPage() {
  const resp = await getCompanies();
  const companies = resp.data ?? [];

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-sm text-zinc-400">Marketplace</div>
            <h1 className="mt-1 text-3xl font-bold">Kompanitë</h1>
          </div>
          <a href="/" className="text-sm text-zinc-300 hover:text-white">
            Home
          </a>
        </div>

        <Card className="mt-6 p-4">
          <p className="text-sm text-zinc-400">
            Këtu shfaqen kompanitë publike.
          </p>
        </Card>

        <div className="mt-3 text-sm text-zinc-400">
          {resp.total ?? companies.length} total
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {companies.length === 0 ? (
            <div className="col-span-full py-10 text-center text-zinc-400">
              Nuk ka kompani për t’u shfaqur.
            </div>
          ) : (
            companies.map((c) => (
              <CompanyCard key={c.slug} company={c} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
