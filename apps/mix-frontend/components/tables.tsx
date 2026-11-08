import Link from "next/link";
import { Fuel, MapPin, Settings2, Users } from "lucide-react";
import { Badge, Empty } from "@/components/ui";
import { BookingRequestResponse, BookingResponse, CarPublic, CarResponse, CompanyPublic, CustomerResponse } from "@/lib/types";
import { companyCarUrl, companyHomeUrl } from "@/lib/tenant";
import { FUEL_L, TRANS_L, badgeTone, formatDate, money, resolveFileUrl, statusLabel } from "@/lib/utils";

export function CompanyGrid({ companies }: { companies: CompanyPublic[] }) {
  if (!companies.length) return <Empty title="Nuk ka kompani të publikuara" desc="Provoni një qytet tjetër ose kthehuni më vonë." />;
  return (
    <div className="space-y-3">
      {companies.map((company) => (
        <a
          key={company.slug}
          href={companyHomeUrl(company.slug)}
          className="listing-card flex flex-col overflow-hidden rounded-[24px] border border-line bg-surface transition hover:-translate-y-0.5 hover:border-ink sm:flex-row"
        >
          <div
            className="h-36 shrink-0 bg-[linear-gradient(145deg,#1c1917,#0f6e6a)] bg-cover bg-center sm:h-auto sm:w-52"
            style={{ backgroundImage: company.cover_path ? `url(${resolveFileUrl(company.cover_path)})` : undefined }}
          />
          <div className="flex flex-1 flex-col justify-center p-4 sm:p-5">
            <h3 className="font-display text-lg font-bold text-ink">{company.name}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
              <MapPin className="h-3.5 w-3.5" /> {company.city}
            </p>
            <p className="mt-2 line-clamp-2 text-sm text-muted">{company.description || "Shikoni flotën e kësaj kompani."}</p>
          </div>
          <div className="flex items-center border-t border-line px-4 py-3 sm:border-l sm:border-t-0 sm:px-6">
            <span className="text-sm font-bold text-accent">Shiko →</span>
          </div>
        </a>
      ))}
    </div>
  );
}

export function PublicCarsGrid({ cars, tenantSlug }: { cars: CarPublic[]; tenantSlug?: string }) {
  if (!cars.length) return <Empty title="Nuk u gjet asnjë makinë" desc="Ndryshoni qytetin ose kërkimin." />;
  return (
    <div className="space-y-3">
      {cars.map((car) => {
        const slug = tenantSlug || car.company_slug;
        const href = slug
          ? tenantSlug
            ? `/cars/${car.slug}`
            : companyCarUrl(slug, car.slug)
          : "#";
        return (
          <a
            key={`${slug}-${car.slug}-${car.id}`}
            href={href}
            className="listing-card group flex flex-col overflow-hidden rounded-[24px] border border-line bg-surface transition hover:-translate-y-0.5 hover:border-ink sm:flex-row"
          >
            <div className="relative aspect-[16/10] shrink-0 bg-[linear-gradient(145deg,#1c1917,#e07a3d)] sm:aspect-auto sm:h-[168px] sm:w-[240px]">
              {car.photos?.[0]?.path ? (
                <img src={resolveFileUrl(car.photos[0].path) || undefined} alt={car.title} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-medium text-muted">Pa foto</div>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="min-w-0">
                <h3 className="font-display text-lg font-bold text-ink group-hover:text-accent">{car.title}</h3>
                <p className="mt-1 text-sm text-muted">
                  {car.year} · {car.make} {car.model}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium text-muted">
                  <span className="inline-flex items-center gap-1"><Settings2 className="h-3.5 w-3.5" />{TRANS_L[car.transmission] || car.transmission}</span>
                  <span className="inline-flex items-center gap-1"><Fuel className="h-3.5 w-3.5" />{FUEL_L[car.fuel] || car.fuel}</span>
                  <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{car.seats} vende</span>
                  {car.location_text ? <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{car.location_text}</span> : null}
                </div>
                {car.company_name && !tenantSlug ? <p className="mt-2 text-xs font-semibold text-accent">{car.company_name}</p> : null}
              </div>
              <div className="shrink-0 text-left sm:min-w-[140px] sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Nga</p>
                <p className="font-display text-2xl font-extrabold text-price">
                  {money(car.price_per_day, car.currency)}
                </p>
                <p className="text-xs text-muted">/ ditë</p>
                <span className="mt-2 inline-flex rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-white group-hover:bg-accent">
                  Shiko çmimin
                </span>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}

function TableWrap({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto rounded-xl border border-line bg-surface shadow-soft">{children}</div>;
}

export function CarsTable({ cars }: { cars: CarResponse[] }) {
  if (!cars.length) return <Empty title="Nuk keni makina ende" desc="Shtoni makinën e parë të flotës." />;
  return (
    <TableWrap>
      <table className="min-w-full text-left text-sm">
        <thead className="bg-background text-muted"><tr><th className="px-4 py-3 font-semibold">Makina</th><th className="px-4 py-3 font-semibold">Çmimi</th><th className="px-4 py-3 font-semibold">Statusi</th><th className="px-4 py-3 font-semibold">Publikuar</th><th className="px-4 py-3" /></tr></thead>
        <tbody>
          {cars.map((car) => (
            <tr key={car.id} className="border-t border-line hover:bg-background/80">
              <td className="px-4 py-3 font-medium">{car.title}<div className="text-xs text-muted">{car.make} {car.model} · {car.year}</div></td>
              <td className="px-4 py-3 font-bold text-price">{money(car.price_per_day, car.currency)}</td>
              <td className="px-4 py-3"><Badge tone={badgeTone(car.status)}>{statusLabel(car.status)}</Badge></td>
              <td className="px-4 py-3">{car.is_published ? "Po" : "Jo"}</td>
              <td className="px-4 py-3"><Link href={`/dashboard/cars/${car.id}`} className="font-bold text-accent">Hap</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  );
}

export function BookingsTable({ bookings }: { bookings: BookingResponse[] }) {
  if (!bookings.length) return <Empty title="Nuk ka rezervime" />;
  return (
    <TableWrap>
      <table className="min-w-full text-left text-sm">
        <thead className="bg-background text-muted"><tr><th className="px-4 py-3 font-semibold">Periudha</th><th className="px-4 py-3 font-semibold">Statusi</th><th className="px-4 py-3 font-semibold">Çmimi</th><th className="px-4 py-3" /></tr></thead>
        <tbody>
          {bookings.map((item) => (
            <tr key={item.id} className="border-t border-line hover:bg-background/80">
              <td className="px-4 py-3">{formatDate(item.date_from)} → {formatDate(item.date_to)}</td>
              <td className="px-4 py-3"><Badge tone={badgeTone(item.status)}>{statusLabel(item.status)}</Badge></td>
              <td className="px-4 py-3 font-bold">{money(item.price_total, item.currency)}</td>
              <td className="px-4 py-3"><Link href={`/dashboard/bookings/${item.id}`} className="font-bold text-accent">Hap</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  );
}

export function BookingRequestsTable({ requests }: { requests: BookingRequestResponse[] }) {
  if (!requests.length) return <Empty title="Nuk ka kërkesa nga tregu" desc="Kur dikush dërgon kërkesë nga faqja publike, shfaqet këtu." />;
  return (
    <TableWrap>
      <table className="min-w-full text-left text-sm">
        <thead className="bg-background text-muted"><tr><th className="px-4 py-3 font-semibold">Klienti</th><th className="px-4 py-3 font-semibold">Datat</th><th className="px-4 py-3 font-semibold">Statusi</th><th className="px-4 py-3" /></tr></thead>
        <tbody>
          {requests.map((item) => (
            <tr key={item.id} className="border-t border-line hover:bg-background/80">
              <td className="px-4 py-3 font-medium">{item.requester_name}<div className="text-xs text-muted">{item.requester_phone}</div></td>
              <td className="px-4 py-3">{formatDate(item.date_from)} → {formatDate(item.date_to)}</td>
              <td className="px-4 py-3"><Badge tone={badgeTone(item.status)}>{statusLabel(item.status)}</Badge></td>
              <td className="px-4 py-3"><Link href={`/dashboard/booking-requests/${item.id}`} className="font-bold text-accent">Hap</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  );
}

export function CustomersTable({ customers }: { customers: CustomerResponse[] }) {
  if (!customers.length) return <Empty title="Nuk ka klientë" />;
  return (
    <TableWrap>
      <table className="min-w-full text-left text-sm">
        <thead className="bg-background text-muted"><tr><th className="px-4 py-3 font-semibold">Emri</th><th className="px-4 py-3 font-semibold">Telefoni</th><th className="px-4 py-3" /></tr></thead>
        <tbody>
          {customers.map((item) => (
            <tr key={item.id} className="border-t border-line hover:bg-background/80">
              <td className="px-4 py-3 font-medium">{item.name}</td>
              <td className="px-4 py-3">{item.phone}</td>
              <td className="px-4 py-3"><Link href={`/dashboard/customers/${item.id}`} className="font-bold text-accent">Hap</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  );
}
