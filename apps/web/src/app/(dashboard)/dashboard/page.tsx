import { Shell } from "@/components/dashboard/Shell";
import { Card } from "@/components/ui/Card";

export default function DashboardHome() {
  return (
    <Shell>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="text-sm text-zinc-400">Tip</div>
          <div className="mt-1 text-xl font-semibold">Nise nga Makinat</div>
          <p className="mt-2 text-sm text-zinc-300">
            Krijo makinat, ngarko fotot, pastaj menaxho rezervimet & kërkesat.
          </p>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-zinc-400">Shpejt</div>
          <div className="mt-1 text-xl font-semibold">Zero CORS</div>
          <p className="mt-2 text-sm text-zinc-300">
            Kjo UI flet me Next API routes (proxy) që ruajnë cookies për FastAPI.
          </p>
        </Card>
      </div>
    </Shell>
  );
}
