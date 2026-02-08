import { apiFetch } from "@/lib/api";
import type { LoginResponse, UserRegister, UserLogin } from "@/types/api";

export async function login(data: UserLogin) {
  return apiFetch<LoginResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(data) });
}

export async function register(data: UserRegister) {
  return apiFetch<LoginResponse>("/api/auth/register", { method: "POST", body: JSON.stringify(data) });
}

export async function logout() {
  return apiFetch<{}>("/api/auth/logout", { method: "POST", body: "{}" });
}
