import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { CompanyPublic } from "@/types/api";

export function CompanyCard({ company }: { company: CompanyPublic }) {
  return (
    <Link href={`/companies/${company.slug}`} className="block">
      <Card className="p-5 hover:bg-white/[0.05] transition">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">{company.name}</div>
            <div className="mt-1 text-sm text-zinc-400">{company.city}</div>
          </div>
          <Badge>Profil</Badge>
        </div>
        {company.description ? (
          <p className="mt-3 text-sm text-zinc-300 line-clamp-3">{company.description}</p>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">Pa përshkrim.</p>
        )}
      </Card>
    </Link>
  );
}
