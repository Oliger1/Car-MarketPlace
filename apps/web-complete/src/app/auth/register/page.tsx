"use client";

import * as React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { register } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const [form, setForm] = React.useState({
    company_name: "",
    city: "",
    slug: "",
    email: "",
    password: "",
    phone: "",
    whatsapp: "",
  });

  function slugify(s: string) {
    return s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await register({
        company_name: form.company_name,
        city: form.city,
        slug: form.slug,
        email: form.email,
        password: form.password,
        phone: form.phone || null,
        whatsapp: form.whatsapp || null,
      });
      router.push("/dashboard");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <Card className="p-6">
          <h1 className="text-2xl font-bold">Regjistro kompaninë</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Krijo kompaninë + userin owner në një hap.
          </p>

          {err ? <div className="mt-4"><Alert>{err}</Alert></div> : null}

          <form onSubmit={submit} className="mt-4 grid gap-3">
            <div className="grid gap-2 md:grid-cols-2">
              <Input
                placeholder="Emri i kompanisë"
                value={form.company_name}
                onChange={(e) => setForm((s) => ({ ...s, company_name: e.target.value, slug: s.slug || slugify(e.target.value) }))}
                required
                minLength={2}
              />
              <Input
                placeholder="Slug (p.sh. arberrent)"
                value={form.slug}
                onChange={(e) => setForm((s) => ({ ...s, slug: slugify(e.target.value) }))}
                required
                minLength={2}
              />
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <Input placeholder="Qyteti" value={form.city} onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))} required />
              <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} required />
            </div>

            <Input
              placeholder="Fjalëkalimi (min 8)"
              type="password"
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              required
              minLength={8}
            />

            <div className="grid gap-2 md:grid-cols-2">
              <Input placeholder="Telefon (opsional)" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
              <Input placeholder="WhatsApp (opsional)" value={form.whatsapp} onChange={(e) => setForm((s) => ({ ...s, whatsapp: e.target.value }))} />
            </div>

            <Button disabled={loading}>{loading ? "Duke krijuar..." : "Krijo llogari"}</Button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link href="/auth/login" className="text-zinc-300 hover:text-white">Ke llogari? Hyr</Link>
            <Link href="/" className="text-zinc-300 hover:text-white">Home</Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
