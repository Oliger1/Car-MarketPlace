import { Card } from "@/components/ui/Card";
import { CarPhotosManager } from "@/components/dashboard/CarPhotosManager";

async function getCar(carId: string) {
  const base = process.env.API_URL ?? "http://localhost:8000";

  // NOTE:
  // Në server-side fetch, cookie forwarding mund të mos punojë në dev nëse auth është cookie-based.
  // UI do shfaqet gjithsesi; upload bëhet client-side me credentials: "include".
  const res = await fetch(`${base}/api/cars/${carId}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;
  return await res.json();
}

export default async function CarManagePage({ params }: { params: { carId: string } }) {
  const car = await getCar(params.carId);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <a href="/dashboard/cars" className="text-sm text-zinc-300 hover:text-white">
          ← Cars
        </a>

        {!car ? (
          <Card className="mt-4 p-6">
            Makina nuk u gjet (ose endpoint kërkon auth dhe server-side s’e ka cookie).
          </Card>
        ) : (
          <>
            <h1 className="mt-4 text-2xl font-bold">{car.title}</h1>
            <div className="mt-1 text-sm text-zinc-400">
              {car.make} {car.model} • {car.year}
            </div>

            <CarPhotosManager carId={car.id} />
          </>
        )}
      </div>
    </main>
  );
}
