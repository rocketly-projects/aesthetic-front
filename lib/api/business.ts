import { apiFetch } from "./client";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Business {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  instagram: string | null;
  website: string | null;
  logoUrl: string | null;
  whatsappPhone: string | null;
  depositRequired: boolean;
  depositPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessHours {
  id: string;
  businessId: string;
  dayOfWeek: number; // 0=Dom … 6=Sáb
  open: boolean;
  fromTime: string;  // "HH:MM"
  toTime: string;    // "HH:MM"
}

export interface UpdateBusinessParams {
  name?: string;
  phone?: string;
  address?: string;
  instagram?: string;
  website?: string;
  logoUrl?: string;
  whatsappPhone?: string | null;
  depositRequired?: boolean;
  depositPercent?: number;
}

export interface UpdateHoursParam {
  dayOfWeek: number;
  open: boolean;
  fromTime: string;
  toTime: string;
}

// ── Endpoints ──────────────────────────────────────────────────────────────

export async function getBusiness(): Promise<Business> {
  const data = await apiFetch<{ business: Business }>("/businesses/me");
  return data.business;
}

export async function updateBusiness(params: UpdateBusinessParams): Promise<Business> {
  const data = await apiFetch<{ business: Business }>("/businesses/me", {
    method: "PUT",
    body: JSON.stringify(params),
  });
  return data.business;
}

export async function getHours(): Promise<BusinessHours[]> {
  const data = await apiFetch<{ hours: BusinessHours[] }>("/businesses/me/hours");
  return data.hours;
}

export async function updateHours(hours: UpdateHoursParam[]): Promise<BusinessHours[]> {
  const data = await apiFetch<{ hours: BusinessHours[] }>("/businesses/me/hours", {
    method: "PUT",
    body: JSON.stringify(hours),
  });
  return data.hours;
}
