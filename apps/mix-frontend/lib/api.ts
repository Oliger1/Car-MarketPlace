import { ApiList, BookingRequestResponse, BookingResponse, CarPublic, CarResponse, CompanyPublic, CompanyResponse, CustomerResponse, LoginResponse, PlanResponse, SubscriptionResponse, UserResponse } from "@/lib/types";

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | null | undefined>;
  revalidate?: number;
};

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

function apiOrigin() {
  if (typeof window !== "undefined") return "";
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
}

function buildUrl(path: string, params?: RequestOptions["params"]) {
  const origin = apiOrigin();
  const url = new URL(path, origin || "http://local.invalid");
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined && value !== "") url.searchParams.set(key, String(value));
    }
  }
  if (origin) return url.toString();
  return `${url.pathname}${url.search}`;
}

async function cookieHeader(): Promise<Record<string, string>> {
  if (typeof window !== "undefined") return {};
  try {
    const { cookies } = await import("next/headers");
    const jar = await cookies();
    const token = jar.get("access_token")?.value;
    return token ? { Cookie: `access_token=${token}` } : {};
  } catch {
    return {};
  }
}

async function parseResponse(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  if (res.status === 204) return null;
  return res.text();
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, revalidate, ...rest } = options;
  const cookie = await cookieHeader();
  const cacheOpts =
    typeof revalidate === "number" && revalidate > 0
      ? { next: { revalidate } }
      : { cache: "no-store" as RequestCache };

  const res = await fetch(buildUrl(path, params), {
    credentials: "include",
    headers: {
      ...(rest.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...cookie,
      ...headers,
    },
    ...rest,
    ...cacheOpts,
  });

  const payload = await parseResponse(res);
  if (!res.ok) {
    const detail = typeof payload === "object" && payload && "detail" in (payload as object) ? (payload as { detail: unknown }).detail : null;
    const message = typeof detail === "string" ? detail : `Gabim ${res.status}`;
    throw new ApiError(message, res.status, payload);
  }
  return payload as T;
}

function normalizeList<T>(payload: unknown): ApiList<T> {
  if (Array.isArray(payload)) return { items: payload };
  if (!payload || typeof payload !== "object") return { items: [] };
  const p = payload as Record<string, unknown>;
  const items = (p.items || p.results || p.data || p.rows || []) as T[];
  return {
    items: Array.isArray(items) ? items : [],
    total: (p.total || p.count) as number | undefined,
    page: p.page as number | undefined,
    limit: p.limit as number | undefined,
  };
}

const PUBLIC = { revalidate: 30 } as const;

export const authApi = {
  register: (data: Record<string, unknown>) => apiFetch<LoginResponse>("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: Record<string, unknown>) => apiFetch<LoginResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
  logout: () => apiFetch<{ message?: string }>("/api/auth/logout", { method: "POST" }),
  forgotPassword: (data: { email: string }) => apiFetch<{ message?: string; token?: string; reset_url?: string }>("/api/auth/forgot-password", { method: "POST", body: JSON.stringify(data) }),
  resetPassword: (data: { token: string; new_password: string }) => apiFetch<{ message?: string }>("/api/auth/reset-password", { method: "POST", body: JSON.stringify(data) }),
  me: () => apiFetch<{ user: UserResponse; company?: CompanyResponse; is_platform_admin?: boolean }>("/api/me"),
};

export const publicApi = {
  companies: async (params?: Record<string, unknown>) =>
    normalizeList<CompanyPublic>(await apiFetch("/api/public/companies", { params: params as RequestOptions["params"], ...PUBLIC })),
  cars: async (params?: Record<string, unknown>) =>
    normalizeList<CarPublic>(await apiFetch("/api/public/cars", { params: params as RequestOptions["params"], ...PUBLIC })),
  cities: () => apiFetch<{ data: { city: string; companies: number }[] }>("/api/public/cities", PUBLIC),
  company: (slug: string) => apiFetch<CompanyPublic>(`/api/public/company/${slug}`, { cache: "no-store" }),
  companyCars: async (slug: string, params?: Record<string, unknown>) =>
    normalizeList<CarPublic>(await apiFetch(`/api/public/company/${slug}/cars`, { params: params as RequestOptions["params"], cache: "no-store" })),
  car: (companySlug: string, carSlug: string) =>
    apiFetch<CarPublic>(`/api/public/company/${companySlug}/car/${carSlug}`, { cache: "no-store" }),
  availability: (companySlug: string, carSlug: string, params?: Record<string, unknown>) =>
    apiFetch<{ unavailable_ranges?: { from: string; to: string }[] }>(
      `/api/public/company/${companySlug}/car/${carSlug}/availability`,
      { params: params as RequestOptions["params"], cache: "no-store" },
    ),
  bookingRequest: (data: Record<string, unknown>) =>
    apiFetch<{ message?: string }>("/api/public/booking-request", { method: "POST", body: JSON.stringify(data) }),
};

export const companyApi = {
  get: () => apiFetch<CompanyResponse>("/api/company/"),
  update: (data: Record<string, unknown>) => apiFetch<CompanyResponse>("/api/company/", { method: "PATCH", body: JSON.stringify(data) }),
  uploadLogo: (file: File) => { const fd = new FormData(); fd.append("file", file); return apiFetch("/api/company/logo", { method: "POST", body: fd }); },
  uploadCover: (file: File) => { const fd = new FormData(); fd.append("file", file); return apiFetch("/api/company/cover", { method: "POST", body: fd }); },
};

export const carsApi = {
  list: async (params?: Record<string, unknown>) => normalizeList<CarResponse>(await apiFetch("/api/cars/", { params: params as RequestOptions["params"] })),
  get: (id: string) => apiFetch<CarResponse>(`/api/cars/${id}`),
  create: (data: Record<string, unknown>) => apiFetch<CarResponse>("/api/cars/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiFetch<CarResponse>(`/api/cars/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch<void>(`/api/cars/${id}`, { method: "DELETE" }),
  uploadPhoto: (carId: string, file: File) => { const fd = new FormData(); fd.append("file", file); return apiFetch(`/api/cars/${carId}/photos`, { method: "POST", body: fd }); },
  deletePhoto: (carId: string, photoId: string) => apiFetch<void>(`/api/cars/${carId}/photos/${photoId}`, { method: "DELETE" }),
};

export const bookingsApi = {
  list: async (params?: Record<string, unknown>) => normalizeList<BookingResponse>(await apiFetch("/api/bookings/", { params: params as RequestOptions["params"] })),
  get: (id: string) => apiFetch<BookingResponse>(`/api/bookings/${id}`),
  create: (data: Record<string, unknown>) => apiFetch<BookingResponse>("/api/bookings/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiFetch<BookingResponse>(`/api/bookings/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch<void>(`/api/bookings/${id}`, { method: "DELETE" }),
};

export const bookingRequestsApi = {
  list: async (params?: Record<string, unknown>) => normalizeList<BookingRequestResponse>(await apiFetch("/api/booking-requests/", { params: params as RequestOptions["params"] })),
  get: (id: string) => apiFetch<BookingRequestResponse>(`/api/booking-requests/${id}`),
  update: (id: string, data: Record<string, unknown>) => apiFetch<BookingRequestResponse>(`/api/booking-requests/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  convert: (id: string, data: Record<string, unknown>) => apiFetch<BookingResponse>(`/api/booking-requests/${id}/convert`, { method: "POST", body: JSON.stringify(data) }),
};

export const customersApi = {
  list: async (params?: Record<string, unknown>) => normalizeList<CustomerResponse>(await apiFetch("/api/customers/", { params: params as RequestOptions["params"] })),
  get: (id: string) => apiFetch<CustomerResponse>(`/api/customers/${id}`),
  create: (data: Record<string, unknown>) => apiFetch<CustomerResponse>("/api/customers/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiFetch<CustomerResponse>(`/api/customers/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
};

export const billingApi = {
  subscription: () => apiFetch<SubscriptionResponse>("/api/billing/subscription"),
  plans: () => apiFetch<PlanResponse[]>("/api/billing/plans"),
  invoices: async (params?: Record<string, unknown>) => normalizeList<Record<string, unknown>>(await apiFetch("/api/billing/invoices", { params: params as RequestOptions["params"] })),
};

export type AdminCompany = {
  id: string;
  name: string;
  slug: string;
  city: string;
  is_published: boolean;
  listed_on_market: boolean;
  is_suspended: boolean;
  deleted_at?: string | null;
  visibility: string;
  plan_id?: string | null;
  plan_name?: string | null;
  subscription_status?: string | null;
  trial_until?: string | null;
  active_until?: string | null;
  owner_email?: string | null;
};

export type AdminCar = {
  id: string;
  title: string;
  slug: string;
  company_id: string;
  company_name: string;
  company_slug: string;
  is_published: boolean;
  price_per_day: string;
  city?: string | null;
};

export type AdminInvoice = {
  id: string;
  company_id: string;
  company_name: string;
  company_slug: string;
  amount: string;
  currency: string;
  status: string;
  issued_at: string;
  due_date: string;
  paid_at?: string | null;
  notes?: string | null;
  active_until?: string | null;
};

export type AdminStats = {
  companies_total: number;
  companies_live: number;
  companies_on_market: number;
  companies_suspended: number;
  cars_on_market: number;
  requests_last_7_days: number;
  invoices_open: number;
};

export const adminApi = {
  stats: () => apiFetch<AdminStats>("/api/admin/stats"),
  plans: () => apiFetch<PlanResponse[]>("/api/admin/plans"),
  createPlan: (data: Record<string, unknown>) => apiFetch<PlanResponse>("/api/admin/plans", { method: "POST", body: JSON.stringify(data) }),
  updatePlan: (id: string, data: Record<string, unknown>) => apiFetch<PlanResponse>(`/api/admin/plans/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  companies: async (params?: Record<string, unknown>) =>
    normalizeList<AdminCompany>(await apiFetch("/api/admin/companies", { params: params as RequestOptions["params"] })),
  patchCompany: (companyId: string, data: Record<string, unknown>) =>
    apiFetch<AdminCompany>(`/api/admin/companies/${companyId}`, { method: "PATCH", body: JSON.stringify(data) }),
  assignSubscription: (companyId: string, data: Record<string, unknown>) =>
    apiFetch<SubscriptionResponse>(`/api/admin/companies/${companyId}/subscription`, { method: "POST", body: JSON.stringify(data) }),
  cars: async (params?: Record<string, unknown>) =>
    normalizeList<AdminCar>(await apiFetch("/api/admin/cars", { params: params as RequestOptions["params"] })),
  patchCar: (carId: string, data: Record<string, unknown>) =>
    apiFetch<AdminCar>(`/api/admin/cars/${carId}`, { method: "PATCH", body: JSON.stringify(data) }),
  invoices: async (params?: Record<string, unknown>) =>
    normalizeList<AdminInvoice>(await apiFetch("/api/admin/invoices", { params: params as RequestOptions["params"] })),
  markInvoicePaid: (invoiceId: string) =>
    apiFetch(`/api/admin/invoices/${invoiceId}/mark-paid`, { method: "POST" }),
  admins: () => apiFetch<{ env: string[]; extra: string[]; all: string[] }>("/api/admin/admins"),
  addAdmin: (email: string) => apiFetch<{ all: string[] }>("/api/admin/admins", { method: "POST", body: JSON.stringify({ email }) }),
  removeAdmin: (email: string) => apiFetch<{ all: string[] }>(`/api/admin/admins/${encodeURIComponent(email)}`, { method: "DELETE" }),
  slugs: () => apiFetch<{ builtin: string[]; blocked: string[]; all: string[] }>("/api/admin/slugs"),
  blockSlug: (slug: string) => apiFetch<{ all: string[] }>("/api/admin/slugs/block", { method: "POST", body: JSON.stringify({ slug }) }),
  unblockSlug: (slug: string) => apiFetch<{ all: string[] }>(`/api/admin/slugs/block/${encodeURIComponent(slug)}`, { method: "DELETE" }),
};
