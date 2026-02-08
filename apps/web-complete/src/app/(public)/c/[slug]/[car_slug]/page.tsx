import { Card } from "@/components/ui/Card";

async function getCar(companySlug: string, carSlug: string) {
  const base = process.env.API_URL ?? "http://localhost:8000";

  const url = `${base}/api/public/company/${encodeURIComponent(companySlug)}/car/${encodeURIComponent(carSlug)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return await res.json();
}

export default async function CarPublicPage({
  params,
}: {
  params: { slug: string; car_slug: string };
}) {
  const companySlug = params.slug;
  const carSlug = params.car_slug;

  const car = await getCar(companySlug, carSlug);

  if (!car) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <Card className="p-6">Makina nuk u gjet.</Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <a
          href={`/companies/${companySlug}`}
          className="text-sm text-zinc-300 hover:text-white"
        >
          ← Kthehu te kompania
        </a>

        <div className="mt-4">
          <div className="text-sm text-zinc-400">
            {car.make} {car.model} • {car.year}
          </div>
          <h1 className="mt-1 text-3xl font-bold">{car.title}</h1>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Card className="p-4">
              <div className="text-sm text-zinc-400">Çmimi / ditë</div>
              <div className="mt-1 text-xl font-semibold">
                {car.price_per_day} {car.currency}
              </div>
              <div className="mt-3 text-sm text-zinc-400">Depozita</div>
              <div className="mt-1 font-medium">
                {car.deposit_amount} {car.currency}
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-sm text-zinc-400">Spec</div>
              <div className="mt-2 space-y-1 text-sm">
                <div>
                  Transmisioni:{" "}
                  <span className="text-zinc-200">{car.transmission}</span>
                </div>
                <div>
                  Karburanti: <span className="text-zinc-200">{car.fuel}</span>
                </div>
                <div>
                  Vendet: <span className="text-zinc-200">{car.seats}</span>
                </div>
                <div>
                  Vendndodhja:{" "}
                  <span className="text-zinc-200">
                    {car.location_text ?? "-"}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          <Card className="mt-4 p-4">
            <div className="text-sm text-zinc-400">Përshkrimi</div>
            <p className="mt-2 text-zinc-200">{car.description || "Pa përshkrim."}</p>
          </Card>
        </div>
      </div>
    </main>
  );
}
