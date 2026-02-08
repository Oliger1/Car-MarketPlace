export type ApiError = {
  status: number;
  message: string;
  detail?: any;
};

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

export type UserLogin = { email: string; password: string };

export type UserRegister = {
  company_name: string;
  slug: string;
  city: string;
  email: string;
  password: string;
  phone?: string | null;
  whatsapp?: string | null;
};

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

export type CompanyUpdate = Partial<Pick<CompanyResponse,
  "name" | "slug" | "city" | "description" | "phone" | "whatsapp" | "website_url" | "is_published"
>>;

export type CarPhotoResponse = { id: string; path: string; alt_text?: string | null; sort_order: number };

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
