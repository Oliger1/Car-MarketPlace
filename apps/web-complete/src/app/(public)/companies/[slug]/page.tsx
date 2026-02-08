import { CarCard } from "@/components/public/CarCard";
import { Card } from "@/components/ui/Card";
import type { CompanyPublic, CarPublic } from "@/types/api";

type CarsResponse = {
  data: CarPublic[];
  total: number;
  page: number;
  limit: number;
};

async function getCompany(slug: string): Promise<CompanyPublic | null> {
  const base = process.env.API_URL ?? "http://localhost:8000";
  const res = await fetch(`${base}/api/public/company/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return await res.json();
}

async function getCars(slug: string): Promise<CarsResponse> {
  const base = process.env.API_URL ?? "http://localhost:8000";
  const res = await fetch(
    `${base}/api/public/company/${encodeURIComponent(slug)}/cars?limit=60`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return { data: [], total: 0, page: 1, limit: 60 };
  }

  const json = await res.json();

  // Defensive: nëse backend kthen array direkt
  if (Array.isArray(json)) {
    return { data: json, total: json.length, page: 1, limit: 60 };
  }

  const data = Array.isArray(json?.data) ? json.data : [];
  return {
    data,
    total: typeof json?.total === "number" ? json.total : data.length,
    page: typeof json?.page === "number" ? json.page : 1,
    limit: typeof json?.limit === "number" ? json.limit : 60,
  };
}

export default async function CompanyPublicPage({
  params,
}: {
  params: { slug: string };
}) {
  const company = await getCompany(params.slug);
  const carsResp = await getCars(params.slug);
  const cars = carsResp.data; // ✅ KJO është array

  if (!company) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <Card className="p-6">Kompania nuk u gjet.</Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <a href="/companies" className="text-sm text-zinc-300 hover:text-white">
          ← Kompanitë
        </a>

        <div className="mt-3">
          <div className="text-sm text-zinc-400">{company.city}</div>
          <h1 className="mt-1 text-3xl font-bold">{company.name}</h1>
          <p className="mt-3 text-zinc-300">{company.description || "Pa përshkrim."}</p>
        </div>

        <div className="mt-8 flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold">Makinat</h2>
          <div className="text-sm text-zinc-400">{carsResp.total} total</div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cars.length === 0 ? (
            <div className="col-span-full py-8 text-center text-zinc-400">
              Kjo kompani nuk ka makina të publikuara ende.
            </div>
          ) : (
            cars.map((car) => (
              <CarCard
                key={car.slug}
                companySlug={company.slug}
                car={car}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
