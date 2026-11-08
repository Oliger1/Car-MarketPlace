export type UUID = string;

export type ApiList<T> = {
  items: T[];
  total?: number;
  page?: number;
  limit?: number;
};

export type UserResponse = {
  id: UUID;
  company_id: UUID;
  email: string;
  role: string;
  is_active: boolean;
};

export type LoginResponse = {
  user: UserResponse;
  message?: string;
};

export type PageSection = { id: "hero" | "about" | "fleet" | "contact"; on: boolean };

export type CompanyPublic = {
  name: string;
  slug: string;
  city: string;
  description?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  website_url?: string | null;
  logo_path?: string | null;
  cover_path?: string | null;
  brand_primary?: string | null;
  brand_accent?: string | null;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  page_sections?: PageSection[];
  listed_on_market?: boolean;
};

export type CompanyResponse = {
  id: UUID;
  name: string;
  city: string;
  slug: string;
  description?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  website_url?: string | null;
  logo_path?: string | null;
  cover_path?: string | null;
  brand_primary?: string | null;
  brand_accent?: string | null;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  page_sections?: PageSection[];
  is_published: boolean;
  listed_on_market: boolean;
  created_at: string;
  updated_at: string;
};

export type CarPhotoResponse = {
  id: UUID;
  path: string;
  alt_text?: string | null;
  sort_order: number;
};

export type CarPublic = {
  id: UUID;
  slug: string;
  title: string;
  make: string;
  model: string;
  year: number;
  transmission: string;
  fuel: string;
  seats: number;
  price_per_day: string;
  deposit_amount: string;
  currency: string;
  description?: string | null;
  location_text?: string | null;
  photos?: CarPhotoResponse[];
  company_name?: string | null;
  company_slug?: string | null;
  company_logo?: string | null;
  unavailable_ranges?: { from: string; to: string }[];
};

export type CarResponse = CarPublic & {
  company_id: UUID;
  status: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type CustomerResponse = {
  id: UUID;
  company_id: UUID;
  name: string;
  phone: string;
  email?: string | null;
  id_number?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type BookingResponse = {
  id: UUID;
  company_id: UUID;
  car_id: UUID;
  customer_id?: UUID | null;
  request_id?: UUID | null;
  date_from: string;
  date_to: string;
  status: string;
  price_total?: string | null;
  deposit_amount?: string | null;
  currency: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type BookingRequestResponse = {
  id: UUID;
  company_id: UUID;
  car_id?: UUID | null;
  requester_name: string;
  requester_phone: string;
  requester_email?: string | null;
  date_from?: string | null;
  date_to?: string | null;
  message?: string | null;
  status: string;
  created_at: string;
};

export type PlanResponse = {
  id: string;
  name: string;
  car_limit: number;
  price_monthly: string;
  is_active: boolean;
};

export type SubscriptionResponse = {
  id: UUID;
  company_id: UUID;
  plan_id: string;
  plan: PlanResponse;
  status: string;
  trial_until?: string | null;
  active_until?: string | null;
  created_at: string;
  updated_at: string;
};
