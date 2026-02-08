"use client";

import * as React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { login } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login({ email, password });
      router.push("/dashboard");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500/80 via-violet-500/70 to-emerald-500/70 shadow-lg" />
            <div className="text-left">
              <div className="font-semibold leading-5">Mix</div>
              <div className="text-xs text-zinc-400">Dashboard</div>
            </div>
          </div>
        </div>

        <Card className="p-6">
          <h1 className="text-2xl font-bold">Hyr</h1>
          <p className="mt-2 text-sm text-zinc-400">Hyr me email dhe fjalëkalim.</p>

          {err ? <div className="mt-4"><Alert>{err}</Alert></div> : null}

          <form onSubmit={submit} className="mt-4 grid gap-3">
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Fjalëkalimi" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button disabled={loading}>{loading ? "Duke hyrë..." : "Hyr"}</Button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link href="/auth/register" className="text-zinc-300 hover:text-white">Regjistrohu</Link>
            <Link href="/auth/forgot-password" className="text-zinc-300 hover:text-white">Harrove fjalëkalimin?</Link>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200">← Kthehu në Home</Link>
        </div>
      </div>
    </main>
  );
}
