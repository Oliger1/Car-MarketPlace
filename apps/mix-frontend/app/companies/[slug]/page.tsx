import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { PublicShell } from "@/components/public-shell";
import { BookingRequestPublicForm } from "@/components/forms";
import { PublicCarsGrid } from "@/components/tables";
import { Card } from "@/components/ui";
import { publicApi } from "@/lib/api";
import { normalizeSections } from "@/lib/storefront";
import { resolveFileUrl } from "@/lib/utils";
import { MapPin, Phone } from "lucide-react";

export default async function CompanyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = (await headers()).get("x-tenant-slug");
  try {
    const [company, cars] = await Promise.all([publicApi.company(slug), publicApi.companyCars(slug)]);
    const sections = normalizeSections(company.page_sections).filter((s) => s.on);
    const title = company.hero_title || company.name;
    const subtitle = company.hero_subtitle || company.description || "Makina me qira. Kompania të telefonon.";

    return (
      <PublicShell companyName={company.name} brand={company}>
        <div className="space-y-8">
          {sections.map((section) => {
            if (section.id === "hero") {
              return (
                <div key={section.id} className="overflow-hidden rounded-[28px] border border-line bg-surface shadow-soft">
                  <div
                    className="relative h-52 bg-[linear-gradient(145deg,#1c1917_0%,var(--accent,#0f6e6a)_55%,var(--signal,#e07a3d)_140%)] bg-cover bg-center sm:h-72"
                    style={{ backgroundImage: company.cover_path ? `url(${resolveFileUrl(company.cover_path)})` : undefined }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                      <p className="flex items-center gap-1.5 text-sm text-white/80"><MapPin className="h-4 w-4" />{company.city}</p>
                      <h1 className="mt-1 font-display text-4xl font-semibold text-white md:text-5xl">{title}</h1>
                      <p className="mt-2 max-w-2xl text-sm text-white/85 md:text-base">{subtitle}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-6">
                    {company.phone ? (
                      <a href={`tel:${company.phone}`} className="inline-flex items-center gap-2 rounded-full bg-[var(--accent,#0f6e6a)] px-4 py-2.5 text-sm font-bold text-white">
                        <Phone className="h-4 w-4" /> {company.phone}
                      </a>
                    ) : (
                      <span className="text-sm text-muted">Shto telefonin te Faqja ime</span>
                    )}
                    {company.whatsapp ? (
                      <a
                        href={`https://wa.me/${company.whatsapp.replace(/\D/g, "")}`}
                        className="inline-flex items-center gap-2 rounded-full bg-[#128C7E] px-4 py-2.5 text-sm font-bold text-white"
                      >
                        WhatsApp
                      </a>
                    ) : null}
                  </div>
                </div>
              );
            }

            if (section.id === "about") {
              return (
                <section key={section.id}>
                  <h2 className="font-display text-2xl font-semibold">Rreth nesh</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-muted md:text-base">
                    {company.description || "Kjo kompani nuk ka shtuar përshkrim."}
                  </p>
                </section>
              );
            }

            if (section.id === "fleet") {
              return (
                <section key={section.id}>
                  <h2 className="mb-4 font-display text-2xl font-semibold">Flota ({cars.items.length})</h2>
                  <PublicCarsGrid
                    tenantSlug={tenant || undefined}
                    cars={cars.items.map((car) => ({ ...car, company_slug: slug, company_name: company.name }))}
                  />
                </section>
              );
            }

            return (
              <section key={section.id} className="grid gap-4 lg:max-w-xl">
                <h2 className="font-display text-2xl font-semibold">Dërgo kërkesë</h2>
                <Card>
                  <p className="mb-4 text-sm text-muted">Kompania ju telefonon. Nuk paguani këtu.</p>
                  <BookingRequestPublicForm companySlug={slug} />
                </Card>
              </section>
            );
          })}
        </div>
      </PublicShell>
    );
  } catch {
    notFound();
  }
}
