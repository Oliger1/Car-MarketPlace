"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authApi, bookingsApi, carsApi, companyApi, customersApi, publicApi } from "@/lib/api";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { AvailabilityCalendar } from "@/components/availability-calendar";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function compact(values: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value === "" ? null : value]));
}

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const schema = z.object({ email: z.string().email("Email i pavlefshëm"), password: z.string().min(1, "Shkruani fjalëkalimin") });
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setServerError(null);
      await authApi.login(values);
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Nuk u kyçët. Kontrolloni emailin dhe fjalëkalimin.");
    }
  });
  const { register, formState: { errors, isSubmitting } } = form;
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-2xl font-semibold">Hyr në panel</h1>
      <p className="text-sm text-muted">Për pronarët e kompanive rent-a-car.</p>
      {serverError ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{serverError}</p> : null}
      <Field label="Email" error={errors.email?.message}><Input type="email" placeholder="info@kompania.al" {...register("email")} /></Field>
      <Field label="Fjalëkalimi" error={errors.password?.message}><Input type="password" placeholder="••••••••" {...register("password")} /></Field>
      <div className="text-right"><Link href="/forgot-password" className="text-xs text-muted">Keni harruar fjalëkalimin?</Link></div>
      <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? "Duke hyrë..." : "Hyr"}</Button>
      <p className="text-center text-sm text-muted">Nuk keni llogari? <Link href="/register" className="text-accent">Regjistro kompaninë</Link></p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const schema = z.object({
    company_name: z.string().min(2, "Emri i kompanisë"),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Vetëm shkronja të vogla, numra dhe vizë"),
    city: z.string().min(2, "Qyteti"),
    email: z.string().email("Email i pavlefshëm"),
    password: z.string().min(8, "Të paktën 8 karaktere"),
    phone: z.string().optional().or(z.literal("")),
    whatsapp: z.string().optional().or(z.literal("")),
  });
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setServerError(null);
      await authApi.register(values);
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Regjistrimi dështoi.");
    }
  });
  const { register, watch, setValue, formState: { errors, isSubmitting } } = form;
  const companyName = watch("company_name");
  useEffect(() => {
    if (!companyName) return;
    setValue("slug", companyName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
  }, [companyName, setValue]);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-2xl font-semibold">Hapni kompaninë</h1>
      <p className="text-sm text-muted">30 ditë provë, pa kartë.</p>
      {serverError ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{serverError}</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Emri i kompanisë" error={errors.company_name?.message}><Input placeholder="Auto Plus" {...register("company_name")} /></Field>
        <Field label="Qyteti" error={errors.city?.message}><Input placeholder="Tiranë" {...register("city")} /></Field>
      </div>
      <Field label="Adresa në treg" hint="mix.app/p/slug-i-juaj" error={errors.slug?.message}><Input placeholder="auto-plus" {...register("slug")} /></Field>
      <Field label="Email" error={errors.email?.message}><Input type="email" {...register("email")} /></Field>
      <Field label="Fjalëkalimi" error={errors.password?.message}><Input type="password" {...register("password")} /></Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Telefon"><Input {...register("phone")} /></Field>
        <Field label="WhatsApp"><Input {...register("whatsapp")} /></Field>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? "Duke krijuar..." : "Krijo llogarinë"}</Button>
      <p className="text-center text-sm text-muted">Keni llogari? <Link href="/login" className="text-accent">Hyr</Link></p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const schema = z.object({ email: z.string().email() });
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setServerError(null);
      const res = await authApi.forgotPassword(values);
      setMessage(res.reset_url ? `${res.message} Link: ${res.reset_url}` : (res.message || "Kërkesa u dërgua."));
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Gabim");
    }
  });
  const { register, formState: { errors, isSubmitting } } = form;
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-2xl font-semibold">Fjalëkalim i harruar</h1>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
      <Field label="Email" error={errors.email?.message}><Input type="email" {...register("email")} /></Field>
      <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? "Duke dërguar..." : "Dërgo udhëzimet"}</Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const params = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const schema = z.object({ token: z.string().min(1), new_password: z.string().min(8) });
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { token: params.get("token") || "" } });
  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setServerError(null);
      await authApi.resetPassword(values);
      setMessage("Fjalëkalimi u ndryshua. Tani mund të hyni.");
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Gabim");
    }
  });
  const { register, formState: { errors, isSubmitting } } = form;
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-2xl font-semibold">Fjalëkalim i ri</h1>
      {message ? <p className="text-sm text-emerald-700">{message} <Link href="/login" className="underline">Hyr</Link></p> : null}
      {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
      <Field label="Kodi i rivendosjes" error={errors.token?.message}><Input {...register("token")} /></Field>
      <Field label="Fjalëkalimi i ri" error={errors.new_password?.message}><Input type="password" {...register("new_password")} /></Field>
      <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? "Duke ruajtur..." : "Ndrysho fjalëkalimin"}</Button>
    </form>
  );
}

export function CompanyForm({ defaults }: { defaults?: Record<string, unknown> }) {
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<Record<string, any>>({ defaultValues: defaults || {} });
  const { register, handleSubmit, formState: { isSubmitting } } = form;
  return (
    <form onSubmit={handleSubmit(async (values) => { await companyApi.update(compact(values as Record<string, unknown>)); setMessage("Profili u ruajt."); })} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Emri"><Input {...register("name")} /></Field>
        <Field label="Qyteti"><Input {...register("city")} /></Field>
        <Field label="Telefon"><Input {...register("phone")} /></Field>
        <Field label="WhatsApp"><Input {...register("whatsapp")} /></Field>
        <Field label="Website" ><Input {...register("website_url")} /></Field>
        <Field label="Adresa në treg (slug)"><Input {...register("slug")} /></Field>
      </div>
      <Field label="Përshkrimi"><Textarea rows={5} {...register("description")} /></Field>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Duke ruajtur..." : "Ruaj profilin"}</Button>
    </form>
  );
}

export function CarForm({ defaults = {}, carId }: { defaults?: Record<string, unknown>; carId?: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<Record<string, any>>({ defaultValues: { currency: "EUR", status: "active", transmission: "automatic", fuel: "petrol", ...defaults } });
  const { register, handleSubmit, formState: { isSubmitting } } = form;
  return (
    <form onSubmit={handleSubmit(async (values) => {
      if (carId) await carsApi.update(carId, compact(values as Record<string, unknown>));
      else {
        const created = await carsApi.create(compact(values as Record<string, unknown>));
        router.push(`/dashboard/cars/${created.id}`);
      }
      setMessage(carId ? "Makina u përditësua." : "Makina u krijua.");
    })} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Titulli"><Input placeholder="Toyota Corolla 2023" {...register("title")} /></Field>
        <Field label="Slug"><Input placeholder="toyota-corolla-2023" {...register("slug")} /></Field>
        <Field label="Marka"><Input {...register("make")} /></Field>
        <Field label="Modeli"><Input {...register("model")} /></Field>
        <Field label="Viti"><Input type="number" {...register("year", { valueAsNumber: true })} /></Field>
        <Field label="Vendet"><Input type="number" {...register("seats", { valueAsNumber: true })} /></Field>
        <Field label="Transmisioni"><Select {...register("transmission")}><option value="automatic">Automatik</option><option value="manual">Manual</option></Select></Field>
        <Field label="Karburanti"><Select {...register("fuel")}><option value="petrol">Benzinë</option><option value="diesel">Dizël</option><option value="hybrid">Hibrid</option><option value="electric">Elektrik</option></Select></Field>
        <Field label="Çmim / ditë"><Input {...register("price_per_day")} /></Field>
        <Field label="Depozita"><Input {...register("deposit_amount")} /></Field>
        <Field label="Valuta"><Select {...register("currency")}><option value="EUR">EUR</option><option value="ALL">ALL</option></Select></Field>
        <Field label="Statusi"><Select {...register("status")}><option value="active">Aktive</option><option value="inactive">Jo aktive</option><option value="maintenance">Mirëmbajtje</option></Select></Field>
        <Field label="Vendndodhja"><Input {...register("location_text")} /></Field>
      </div>
      <Field label="Përshkrimi"><Textarea rows={5} {...register("description")} /></Field>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Duke ruajtur..." : carId ? "Ruaj makinën" : "Krijo makinën"}</Button>
    </form>
  );
}

export function CustomerForm({ defaults = {}, customerId }: { defaults?: Record<string, unknown>; customerId?: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<Record<string, any>>({ defaultValues: defaults });
  const { register, handleSubmit, formState: { isSubmitting } } = form;
  return (
    <form onSubmit={handleSubmit(async (values) => { if (customerId) await customersApi.update(customerId, compact(values as Record<string, unknown>)); else await customersApi.create(compact(values as Record<string, unknown>)); setMessage("Klienti u ruajt."); })} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Emri"><Input {...register("name")} /></Field>
        <Field label="Telefoni"><Input {...register("phone")} /></Field>
        <Field label="Email"><Input type="email" {...register("email")} /></Field>
        <Field label="Nr. ID / pasaportë"><Input {...register("id_number")} /></Field>
      </div>
      <Field label="Shënime"><Textarea rows={4} {...register("notes")} /></Field>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Duke ruajtur..." : "Ruaj klientin"}</Button>
    </form>
  );
}

export function BookingForm({ defaults = {}, bookingId }: { defaults?: Record<string, unknown>; bookingId?: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [cars, setCars] = useState<{ id: string; title: string }[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const form = useForm<Record<string, any>>({ defaultValues: { currency: "EUR", status: "confirmed", ...defaults } });
  const { register, handleSubmit, formState: { isSubmitting } } = form;
  useEffect(() => {
    carsApi.list({ limit: 100 }).then((r) => setCars(r.items.map((c) => ({ id: c.id, title: c.title })))).catch(() => {});
    customersApi.list({ limit: 100 }).then((r) => setCustomers(r.items.map((c) => ({ id: c.id, name: c.name })))).catch(() => {});
  }, []);
  return (
    <form onSubmit={handleSubmit(async (values) => { if (bookingId) await bookingsApi.update(bookingId, compact(values as Record<string, unknown>)); else await bookingsApi.create(compact(values as Record<string, unknown>)); setMessage("Rezervimi u ruajt."); })} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Makina"><Select {...register("car_id")}><option value="">Zgjidh makinën</option>{cars.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</Select></Field>
        <Field label="Klienti"><Select {...register("customer_id")}><option value="">Pa klient</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
        <Field label="Nga data"><Input type="date" {...register("date_from")} /></Field>
        <Field label="Deri"><Input type="date" {...register("date_to")} /></Field>
        <Field label="Çmimi total"><Input {...register("price_total")} /></Field>
        <Field label="Depozita"><Input {...register("deposit_amount")} /></Field>
        <Field label="Valuta"><Select {...register("currency")}><option value="EUR">EUR</option><option value="ALL">ALL</option></Select></Field>
        <Field label="Statusi"><Select {...register("status")}><option value="requested">Kërkuar</option><option value="confirmed">Konfirmuar</option><option value="active">Aktive</option><option value="completed">Përfunduar</option><option value="cancelled">Anuluar</option></Select></Field>
      </div>
      <Field label="Shënime"><Textarea rows={4} {...register("notes")} /></Field>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Duke ruajtur..." : "Ruaj rezervimin"}</Button>
    </form>
  );
}

export function BookingRequestPublicForm({
  companySlug,
  carSlug,
  unavailable = [],
}: {
  companySlug: string;
  carSlug?: string;
  unavailable?: { from: string; to: string }[];
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<Record<string, any>>({
    defaultValues: { company_slug: companySlug, car_slug: carSlug || "", date_from: "", date_to: "" },
  });
  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = form;
  const dateFrom = watch("date_from");
  const dateTo = watch("date_to");

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        try {
          setError(null);
          if (!values.date_from || !values.date_to) {
            setError("Zgjidhni datat në kalendar.");
            return;
          }
          await publicApi.bookingRequest(compact(values as Record<string, unknown>));
          setMessage("Kërkesa u dërgua. Kompania do t’ju kontaktojë.");
        } catch (e) {
          setError(e instanceof Error ? e.message : "Nuk u dërgua. Provoni sërish.");
        }
      })}
      className="space-y-4"
    >
      <input type="hidden" {...register("company_slug")} />
      <input type="hidden" {...register("car_slug")} />
      <input type="hidden" {...register("date_from")} />
      <input type="hidden" {...register("date_to")} />

      <Field label="Emri juaj"><Input {...register("requester_name")} required /></Field>
      <Field label="Telefoni"><Input {...register("requester_phone")} required /></Field>
      <Field label="Email"><Input type="email" {...register("requester_email")} required /></Field>

      <div>
        <p className="mb-2 text-xs font-bold text-muted">Datat e qirasë</p>
        <AvailabilityCalendar
          unavailable={unavailable}
          selectedFrom={dateFrom}
          selectedTo={dateTo}
          onChange={({ date_from, date_to }) => {
            setValue("date_from", date_from, { shouldDirty: true });
            setValue("date_to", date_to, { shouldDirty: true });
          }}
        />
        <p className="mt-2 text-xs text-muted">
          {dateFrom && dateTo
            ? `Zgjedhur: ${dateFrom} → ${dateTo}`
            : dateFrom
              ? `Nga: ${dateFrom} — zgjidhni datën e kthimit`
              : "Klikoni datën e fillimit, pastaj datën e mbarimit."}
        </p>
      </div>

      <Field label="Mesazhi"><Textarea rows={3} {...register("message")} /></Field>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Duke dërguar..." : "Dërgo kërkesën"}
      </Button>
    </form>
  );
}
