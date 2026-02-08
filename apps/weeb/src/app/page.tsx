import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl animate-glow" />
        <div className="absolute top-32 left-1/4 h-[420px] w-[420px] rounded-full bg-violet-500/20 blur-3xl animate-glow" />
        <div className="absolute top-72 right-1/4 h-[460px] w-[460px] rounded-full bg-emerald-500/15 blur-3xl animate-glow" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500/80 via-violet-500/70 to-emerald-500/70 shadow-lg" />
            <div>
              <div className="font-semibold leading-5">Mix</div>
              <div className="text-xs text-zinc-400">Public + Private</div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/companies" className="hidden sm:block">
              <Button variant="ghost">Gjej kompani</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Hero */}
        <section className="mt-10 grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <Badge className="border-white/15 bg-white/5">SaaS për Rent-a-Car • Albania → Global</Badge>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Një profil publik që shitet vetë.
              <span className="block bg-gradient-to-r from-blue-300 via-violet-300 to-emerald-200 bg-clip-text text-transparent">
                Një dashboard privat që kontrollon gjithçka.
              </span>
            </h1>
            <p className="mt-4 text-zinc-300">
              Mix i jep kompanisë sate një faqe publike me SEO (si Instagram, por për makina) dhe një panel privat
              për menaxhimin e makinave, klientëve, rezervimeve dhe kërkesave.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/register">
                <Button size="lg">Nis tani (free trial)</Button>
              </Link>
              <Link href="/companies">
                <Button size="lg" variant="outline">
                  Shiko marketplace
                </Button>
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 text-sm text-zinc-400">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-zinc-200 font-medium">Zero CORS drama</div>
                <div className="mt-1">Proxy routes në Next, cookies stable.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-zinc-200 font-medium">Foto + Renditje</div>
                <div className="mt-1">Upload, delete, reorder (ready).</div>
              </div>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[3rem] bg-gradient-to-br from-blue-500/15 via-violet-500/10 to-emerald-500/10 blur-2xl" />
            <Card className="p-5 rounded-[3rem]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-zinc-400">Live preview</div>
                  <div className="text-xl font-semibold">Rent-a-Car Profile</div>
                </div>
                <Badge>SEO</Badge>
              </div>

              <div className="mt-4 grid gap-3">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">ArberRent</div>
                      <div className="text-sm text-zinc-400">Tiranë • WhatsApp • Website</div>
                    </div>
                    <div className="h-10 w-10 rounded-2xl bg-white/5 animate-floaty" />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="h-16 rounded-2xl bg-white/5" />
                    <div className="h-16 rounded-2xl bg-white/5" />
                    <div className="h-16 rounded-2xl bg-white/5" />
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-zinc-400">Dashboard</div>
                      <div className="font-semibold">Rezervime & Kërkesa</div>
                    </div>
                    <Badge>Realtime-ish</Badge>
                  </div>
                  <div className="mt-3 grid gap-2">
                    <div className="h-10 rounded-2xl bg-white/5" />
                    <div className="h-10 rounded-2xl bg-white/5" />
                    <div className="h-10 rounded-2xl bg-white/5" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Sections */}
        <section className="mt-12 grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="text-lg font-semibold">Publik</div>
            <p className="mt-2 text-sm text-zinc-300">
              Marketplace i kompanive + profile me makina, galeri, disponibilitet dhe “booking request”.
            </p>
          </Card>
          <Card className="p-6">
            <div className="text-lg font-semibold">Privat</div>
            <p className="mt-2 text-sm text-zinc-300">
              CRUD për makina/klientë/rezervime, foto upload, kërkesa → rezervim, billing (planet).
            </p>
          </Card>
          <Card className="p-6">
            <div className="text-lg font-semibold">Gati për rritje</div>
            <p className="mt-2 text-sm text-zinc-300">
              Arkitekturë e pastër: API në FastAPI, UI në Next. Mund të shtosh payments, SMS, jobs.
            </p>
          </Card>
        </section>

        <footer className="mt-12 border-t border-white/10 pt-6 text-sm text-zinc-500">
          © {new Date().getFullYear()} Mix. Built for speed.
        </footer>
      </div>
    </main>
  );
}
