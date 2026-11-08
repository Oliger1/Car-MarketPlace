import Link from "next/link";
import { BadgeCheck, Phone, ShieldCheck } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { MarketSearch } from "@/components/search";
import { publicApi } from "@/lib/api";
import { PublicCarsGrid } from "@/components/tables";

const HERO =
  "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=2200&q=80";

const CITY_LABEL: Record<string, string> = { tirane: "Tiranë", durres: "Durrës", vlore: "Vlorë", shkoder: "Shkodër" };

export default async function HomePage() {
  const [cars, cities] = await Promise.all([
    publicApi.cars({ limit: 6, sort: "price_asc" }).catch(() => ({ items: [] })),
    publicApi.cities().catch(() => ({ data: [] as { city: string; companies: number }[] })),
  ]);
  const cityChips = (cities.data || []).slice(0, 6);

  return (
    <PublicShell flush>
      <section className="relative overflow-hidden bg-ink">
        <img src={HERO} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/55 to-ink" />
        <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-14 sm:px-6 sm:pt-20">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur">
            <BadgeCheck className="h-3.5 w-3.5 text-signal" /> Pa pagesë online · kompania të telefonon
          </div>
          <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.05] text-white sm:text-6xl">
            Gjej makinë me qira. Çmimi që sheh, është çmimi.
          </h1>
          <p className="mt-3 max-w-xl text-base text-white/80">
            Oferta nga kompani lokale. Zgjidh qytetin dhe datat, krahaso dhe dërgo kërkesë.
          </p>
          <div className="mt-8">
            <MarketSearch />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {cityChips.map((item) => (
              <Link
                key={item.city}
                href={`/cars?city=${encodeURIComponent(item.city)}`}
                className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white hover:text-ink"
              >
                {CITY_LABEL[item.city.toLowerCase()] || item.city}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-5 sm:px-6 md:grid-cols-4">
          {[
            ["0€", "komision për ty"],
            ["Cash", "pagesa te kompania"],
            ["Direkt", "telefon ose WhatsApp"],
            ["Datat", "e zëna nuk klikohen"],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="font-display text-2xl text-ink">{k}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{v}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Çmimet më të ulëta tani</h2>
            <p className="mt-1 text-sm text-muted">Renditur sipas çmimit për ditë</p>
          </div>
          <Link href="/cars?sort=price_asc" className="shrink-0 text-sm font-bold text-accent">Të gjitha →</Link>
        </div>
        <PublicCarsGrid cars={cars.items} />
      </section>

      <section className="mx-auto mb-8 grid max-w-6xl gap-4 px-4 sm:px-6 md:grid-cols-3">
        {[
          { icon: ShieldCheck, t: "Pa surpriza në fund", d: "Çmimi ditor dhe depozita shkruhen para se të dërgosh kërkesën." },
          { icon: Phone, t: "Përgjigje nga pronari", d: "Nuk kalon në call center. Kompania të kontakton direkt." },
          { icon: BadgeCheck, t: "Zgjedh datat e lira", d: "Kalendari i bllokon ditët e zëna. Nuk rezervon mbi një tjetër." },
        ].map((item) => (
          <div key={item.t} className="rounded-[24px] border border-line bg-surface p-5">
            <item.icon className="h-5 w-5 text-accent" />
            <h3 className="mt-3 font-display text-2xl">{item.t}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{item.d}</p>
          </div>
        ))}
      </section>
    </PublicShell>
  );
}
