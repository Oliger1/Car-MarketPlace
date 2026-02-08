"use client";

import * as React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api";
import { Alert } from "@/components/ui/Alert";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(false);
    setLoading(true);
    try {
      await apiFetch("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
      setOk(true);
    } catch (e: any) {
      setErr(e?.message ?? "Gabim");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Card className="p-6">
          <h1 className="text-2xl font-bold">Rivendos fjalëkalimin</h1>
          <p className="mt-2 text-sm text-zinc-400">Dërgo token në email.</p>

          {err ? <div className="mt-4"><Alert>{err}</Alert></div> : null}
          {ok ? (
            <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
              Nëse email ekziston, token u dërgua.
            </div>
          ) : null}

          <form onSubmit={submit} className="mt-4 grid gap-3">
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button disabled={loading}>{loading ? "Duke dërguar..." : "Dërgo"}</Button>
          </form>

          <div className="mt-4 text-sm">
            <Link href="/auth/login" className="text-zinc-300 hover:text-white">← Login</Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
