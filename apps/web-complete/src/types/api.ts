// ============================================================================
// ERROR TYPES
// ============================================================================

export type ApiError = {
  status: number;
  message: string;
  detail?: any;
};

// ============================================================================
// AUTH TYPES
// ============================================================================

export type UserResponse = {
  id: string;
  company_id: string;
  email: string;
  role: string;
  is_active: boolean;
};

export type LoginResponse = {
  user: UserResponse;
  message?: string;
};

export type UserLogin = {
  email: string;
  password: string;
};

export type UserRegister = {
  company_name: string;
  slug: string;
  city: string;
  email: string;
  password: string;
  phone?: string | null;
  whatsapp?: string | null;
};

export type ForgotPassword = {
  email: string;
};

export type ResetPassword = {
  token: string;
  new_password: string;
};

// ============================================================================
// COMPANY TYPES
// ============================================================================

export type CompanyResponse = {
  id: string;
  name: string;
  slug: string;
  city: string;
  description?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  website_url?: string | null;
  logo_path?: string | null;
  cover_path?: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type CompanyUpdate = {
  name?: string | null;
  slug?: string | null;
  city?: string | null;
  description?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  website_url?: string | null;
  is_published?: boolean | null;
};

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
};

// ============================================================================
// CAR TYPES
// ============================================================================

export type CarPhotoResponse = {
  id: string;
  path: string;
  alt_text?: string | null;
  sort_order: number;
};

export type CarResponse = {
  id: string;
  company_id: string;
  slug: string;
  title: string;
  make: string;
  model: string;
  year: number;
  transmission: "manual" | "automatic";
  fuel: "petrol" | "diesel" | "hybrid" | "electric";
  seats: number;
  price_per_day: string;
  deposit_amount: string;
  currency: "EUR" | "ALL" | "USD";
  description?: string | null;
  location_text?: string | null;
  status: "active" | "inactive" | "maintenance";
  is_published: boolean;
  photos: CarPhotoResponse[];
  created_at: string;
  updated_at: string;
};

export type CarCreate = {
  title: string;
  make: string;
  model: string;
  year: number;
  transmission: "manual" | "automatic";
  fuel: "petrol" | "diesel" | "hybrid" | "electric";
  seats: number;
  price_per_day: number | string;
  deposit_amount: number | string;
  currency?: "EUR" | "ALL" | "USD";
  description?: string | null;
  location_text?: string | null;
  slug: string;
  status?: "active" | "inactive" | "maintenance";
};

export type CarUpdate = {
  title?: string | null;
  slug?: string | null;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  transmission?: "manual" | "automatic" | null;
  fuel?: "petrol" | "diesel" | "hybrid" | "electric" | null;
  seats?: number | null;
  price_per_day?: number | string | null;
  deposit_amount?: number | string | null;
  currency?: "EUR" | "ALL" | "USD" | null;
  status?: "active" | "inactive" | "maintenance" | null;
  description?: string | null;
  location_text?: string | null;
  is_published?: boolean | null;
};

export type CarPublic = {
  id: string;
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
  photos: CarPhotoResponse[];
};

// ============================================================================
// BOOKING TYPES
// ============================================================================

export type BookingResponse = {
  id: string;
  company_id: string;
  car_id: string;
  customer_id?: string | null;
  request_id?: string | null;
  date_from: string;
  date_to: string;
  status: "requested" | "confirmed" | "active" | "completed" | "cancelled";
  price_total?: string | null;
  deposit_amount?: string | null;
  currency: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type BookingCreate = {
  date_from: string;
  date_to: string;
  notes?: string | null;
  car_id: string;
  customer_id?: string | null;
  price_total?: number | string | null;
  deposit_amount?: number | string | null;
  currency?: string;
  status?: string | null;
};

export type BookingUpdate = {
  date_from?: string | null;
  date_to?: string | null;
  status?: "requested" | "confirmed" | "active" | "completed" | "cancelled" | null;
  price_total?: number | string | null;
  deposit_amount?: number | string | null;
  notes?: string | null;
};

// ============================================================================
// BOOKING REQUEST TYPES
// ============================================================================

export type BookingRequestResponse = {
  id: string;
  company_id: string;
  car_id?: string | null;
  requester_name: string;
  requester_phone: string;
  date_from?: string | null;
  date_to?: string | null;
  message?: string | null;
  status: "new" | "contacted" | "converted" | "spam";
  created_at: string;
};

export type BookingRequestCreate = {
  company_slug: string;
  car_slug?: string | null;
  requester_name: string;
  requester_phone: string;
  date_from?: string | null;
  date_to?: string | null;
  message?: string | null;
};

export type BookingRequestUpdate = {
  status: "new" | "contacted" | "converted" | "spam";
};

export type BookingRequestConvert = {
  customer_id?: string | null;
  date_from: string;
  date_to: string;
  price_total?: number | null;
  deposit_amount?: number | null;
};

// ============================================================================
// CUSTOMER TYPES
// ============================================================================

export type CustomerResponse = {
  id: string;
  company_id: string;
  name: string;
  phone: string;
  id_number?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type CustomerCreate = {
  name: string;
  phone: string;
  id_number?: string | null;
  notes?: string | null;
};

export type CustomerUpdate = {
  name?: string | null;
  phone?: string | null;
  id_number?: string | null;
  notes?: string | null;
};

// ============================================================================
// BILLING TYPES
// ============================================================================

export type PlanResponse = {
  id: string;
  name: string;
  car_limit: number;
  price_monthly: string;
  is_active: boolean;
};

export type SubscriptionResponse = {
  id: string;
  company_id: string;
  plan_id: string;
  plan: PlanResponse;
  status: string;
  trial_until?: string | null;
  active_until?: string | null;
  created_at: string;
  updated_at: string;
};

export type ChoosePlan = {
  plan_id: "p10" | "p30" | "p100";
};
