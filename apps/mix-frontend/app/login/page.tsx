import { PublicShell } from "@/components/public-shell";
import { LoginForm } from "@/components/forms";
import { Card } from "@/components/ui";

export default function Page() {
  return (
    <PublicShell>
      <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Për kompanitë</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight">Flota dhe rezervimet në një panel.</h1>
          <p className="mt-4 text-muted">Hyni për të menaxhuar makinat, kërkesat nga tregu dhe klientët.</p>
        </div>
        <Card><LoginForm /></Card>
      </div>
    </PublicShell>
  );
}
