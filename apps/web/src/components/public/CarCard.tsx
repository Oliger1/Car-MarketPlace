import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { money } from "@/lib/format";

export function CarCard({ companySlug, car }: { companySlug: string; car: any }) {
  const photo = car.photos?.[0]?.path ? `/api/files/${car.photos[0].path}` : null;

  return (
    <Link href={`/c/${companySlug}/${car.slug}`} className="block">
      <Card className="overflow-hidden hover:bg-white/[0.05] transition">
        <div className="relative h-44 w-full">
          {photo ? (
            <Image src={photo} alt={car.title} fill className="object-cover" />
          ) : (
            <div className="h-full w-full bg-white/5" />
          )}
          <div className="absolute left-3 top-3">
            <Badge>{money(car.price_per_day, car.currency)} / ditë</Badge>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold">{car.title}</div>
              <div className="text-sm text-zinc-400">
                {car.make} {car.model} • {car.year} • {car.transmission}
              </div>
            </div>
            <Badge>{car.seats} vende</Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
}
