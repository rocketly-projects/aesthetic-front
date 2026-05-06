import Cookies from "js-cookie";
import { apiFetch } from "./client";

// ── Types ──────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  businessId: string;
  email: string;
  name: string;
  role: "owner" | "staff";
  createdAt: string;
}

export interface AuthBusiness {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  instagram: string | null;
  website: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  business: AuthBusiness;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  email: string;
  password: string;
  name: string;
  businessName: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function saveToken(token: string) {
  Cookies.set("token", token, { expires: 7, sameSite: "strict" });
}

export function clearToken() {
  Cookies.remove("token");
}

// ── Endpoints ──────────────────────────────────────────────────────────────

export async function login(params: LoginParams): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(params),
  });
  saveToken(data.token);
  return data;
}

export async function register(params: RegisterParams): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(params),
  });
  saveToken(data.token);
  return data;
}
