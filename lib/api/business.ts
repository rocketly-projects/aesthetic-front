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
  // Depósitos
  webDepositRequired: boolean;
  botDepositRequired: boolean;
  depositPercent: number;
  // MercadoPago OAuth (null = no conectado)
  mpUserId: string | null;
  // Plan de suscripción
  planId: string | null;                                              // 'basic' | 'pro' | null
  planStatus: 'active' | 'inactive' | 'cancelled' | 'past_due';
  // WhatsApp setup
  whatsappRequestedAt: string | null;
  whatsappBotActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsappRequestParams {
  type:         'new' | 'existing';
  phone?:       string;
  contactName:  string;
  contactPhone: string;
  notes?:       string;
}

export interface WhatsappDeactivationParams {
  contactName:  string;
  contactPhone: string;
  notes?:       string;
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
  webDepositRequired?: boolean;
  botDepositRequired?: boolean;
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

export async function submitWhatsappRequest(params: WhatsappRequestParams): Promise<void> {
  await apiFetch("/businesses/me/whatsapp-request", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function submitWhatsappDeactivationRequest(params: WhatsappDeactivationParams): Promise<void> {
  await apiFetch("/businesses/me/whatsapp-deactivation-request", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function connectMp(): Promise<void> {
  const { redirectUrl } = await apiFetch<{ redirectUrl: string }>("/billing/mp/connect");
  window.location.href = redirectUrl;
}

export async function disconnectMp(): Promise<void> {
  await apiFetch("/billing/mp/disconnect", { method: "DELETE" });
}
