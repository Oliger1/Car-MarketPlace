import { PublicShell } from "@/components/public-shell";
import { MarketSearch } from "@/components/search";
import { PublicCarsGrid } from "@/components/tables";
import { publicApi } from "@/lib/api";

export default async function CarsPage({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  const params = await (searchParams || Promise.resolve({} as Record<string, string>));
  const cars = await publicApi
    .cars({
      q: params.q,
      city: params.city,
      page: params.page || 1,
      transmission: params.transmission,
      fuel: params.fuel,
      seats_min: params.seats_min,
      price_min: params.price_min,
      price_max: params.price_max,
      date_from: params.date_from,
      date_to: params.date_to,
      sort: params.sort || "newest",
    })
    .catch(() => ({ items: [] }));
  const count = cars.items.length;

  return (
    <PublicShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold md:text-3xl">Makina me qira</h1>
        <p className="mt-1 text-sm text-muted">
          {count ? `${count} rezultat${count === 1 ? "" : "e"}` : "Ndryshoni filtrat për të gjetur oferta"}
          {params.city ? ` në ${params.city}` : ""}
        </p>
      </div>
      <div className="mb-4">
        <MarketSearch q={params.q} city={params.city} dateFrom={params.date_from} dateTo={params.date_to} compact />
      </div>
      <form className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-surface p-3 shadow-soft">
        <input type="hidden" name="q" value={params.q || ""} />
        <input type="hidden" name="date_from" value={params.date_from || ""} />
        <input type="hidden" name="date_to" value={params.date_to || ""} />
        <label className="text-xs font-bold text-muted">
          Transmision
          <select name="transmission" defaultValue={params.transmission || ""} className="mt-1 block rounded-lg border border-line px-3 py-2 text-sm">
            <option value="">Të gjitha</option>
            <option value="automatic">Automatik</option>
            <option value="manual">Manual</option>
          </select>
        </label>
        <label className="text-xs font-bold text-muted">
          Karburant
          <select name="fuel" defaultValue={params.fuel || ""} className="mt-1 block rounded-lg border border-line px-3 py-2 text-sm">
            <option value="">Të gjitha</option>
            <option value="petrol">Benzinë</option>
            <option value="diesel">Naftë</option>
            <option value="hybrid">Hibrid</option>
            <option value="electric">Elektrik</option>
          </select>
        </label>
        <label className="text-xs font-bold text-muted">
          Rendit
          <select name="sort" defaultValue={params.sort || "newest"} className="mt-1 block rounded-lg border border-line px-3 py-2 text-sm">
            <option value="newest">Më të rejat</option>
            <option value="price_asc">Çmimi ↑</option>
            <option value="price_desc">Çmimi ↓</option>
          </select>
        </label>
        <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white hover:bg-accent-dark">
          Filtro
        </button>
      </form>
      <PublicCarsGrid cars={cars.items} />
    </PublicShell>
  );
}
