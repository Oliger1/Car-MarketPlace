import { headers } from "next/headers";
import { PublicShell } from "@/components/public-shell";
import { BookingRequestPublicForm } from "@/components/forms";
import { CarGallery } from "@/components/car-gallery";
import { Badge, Card, SectionTitle } from "@/components/ui";
import { publicApi } from "@/lib/api";
import { FUEL_L, TRANS_L, formatDate, money } from "@/lib/utils";
import Link from "next/link";

export default async function CarDetailPage({ params }: { params: Promise<{ slug: string; carSlug: string }> }) {
  const { slug, carSlug } = await params;
  const tenant = (await headers()).get("x-tenant-slug");
  const [car, company] = await Promise.all([
    publicApi.car(slug, carSlug),
    publicApi.company(slug).catch(() => null),
  ]);
  const ranges = car.unavailable_ranges || [];
  const todayIso = new Date().toISOString().slice(0, 10);
  const upcoming = ranges.filter((r) => r.to >= todayIso);

  return (
    <PublicShell companyName={car.company_name || company?.name || undefined} brand={company}>
      <Link href={tenant ? "/" : `/companies/${slug}`} className="mb-6 inline-block text-sm font-medium text-muted hover:text-ink">
        ← Kthehu
      </Link>
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <CarGallery photos={car.photos || []} title={car.title} />
          <div>
              <h1 className="font-display text-4xl font-semibold md:text-5xl">{car.title}</h1>
              <p className="mt-2 text-muted">{car.make} {car.model} · {car.year}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>{TRANS_L[car.transmission] || car.transmission}</Badge>
                <Badge>{FUEL_L[car.fuel] || car.fuel}</Badge>
                <Badge>{car.seats} vende</Badge>
                <Badge>{money(car.deposit_amount, car.currency)} depozitë</Badge>
              </div>
              <p className="mt-5 leading-7 text-muted">{car.description || "Nuk ka përshkrim të shtuar."}</p>
          </div>
          {upcoming.length ? (
            <Card>
              <SectionTitle title="Periudhat e zëna" subtitle="Këto data shfaqen të kuqe në kalendar dhe nuk zgjidhen." />
              <ul className="space-y-2">
                {upcoming.map((r) => (
                  <li
                    key={`${r.from}-${r.to}`}
                    className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
                  >
                    <span>{formatDate(r.from)}</span>
                    <span className="font-normal text-red-400">→</span>
                    <span>{formatDate(r.to)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="border-ink/10">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Çmimi për ditë</p>
            <p className="mt-1 font-display text-5xl text-price">{money(car.price_per_day, car.currency)}</p>
            <p className="mt-1 text-sm text-muted">Depozitë {money(car.deposit_amount, car.currency)} · nuk paguan këtu</p>
            <ul className="mt-4 space-y-1 text-sm text-ink">
              <li>Çmimi që sheh është çmimi ditor</li>
              <li>Konfirmimi vjen me telefon</li>
              <li>Datat e zëna janë të bllokuara</li>
            </ul>
            {company?.whatsapp || company?.phone ? (
              <a
                href={company.whatsapp ? `https://wa.me/${company.whatsapp.replace(/\D/g, "")}` : `tel:${company.phone}`}
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#128C7E] px-4 py-3 text-sm font-bold text-white"
              >
                {company.whatsapp ? "Shkruaj në WhatsApp" : "Telefono kompaninë"}
              </a>
            ) : null}
          </Card>
          <Card>
            <SectionTitle title="Kërkesë rezervimi" subtitle="Zgjidhni datat në kalendar — të zënat nuk klikohen." />
            <BookingRequestPublicForm companySlug={slug} carSlug={carSlug} unavailable={ranges} />
          </Card>
        </div>
      </div>
    </PublicShell>
  );
}
