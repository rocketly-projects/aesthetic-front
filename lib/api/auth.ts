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

export interface GoogleAuthParams {
  credential: string;    // Google ID token
  businessName?: string; // requerido solo para usuarios nuevos
}

// El backend devuelve AuthResponse en login/register exitoso,
// o { needsOnboarding: true } cuando el usuario no existe y falta businessName.
export type GoogleAuthResponse = AuthResponse | { needsOnboarding: true };

// ── Helpers ────────────────────────────────────────────────────────────────

export function saveToken(token: string) {
  Cookies.set("token", token, { expires: 7, sameSite: "lax" });
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

// Backend requerido: POST /auth/google
// Verifica el Google ID token con Google, luego:
//   - Usuario existente → devuelve AuthResponse (igual que /auth/login)
//   - Usuario nuevo con businessName → crea cuenta y devuelve AuthResponse
//   - Usuario nuevo sin businessName → devuelve { needsOnboarding: true }
export async function googleAuth(params: GoogleAuthParams): Promise<GoogleAuthResponse> {
  const data = await apiFetch<GoogleAuthResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify(params),
  });
  if (!("needsOnboarding" in data)) {
    saveToken((data as AuthResponse).token);
  }
  return data;
}
