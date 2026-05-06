import { apiFetch } from "./client";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Service {
  id: string;
  businessId: string;
  name: string;
  category: string;
  duration: number;  // minutos
  price: number;     // ARS
  color: string;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetServicesParams {
  visible?: "true" | "false" | "all";
}

export interface CreateServiceParams {
  name: string;
  category: string;
  duration: number;
  price: number;
  color?: string;
  visible?: boolean;
}

export interface UpdateServiceParams {
  name?: string;
  category?: string;
  duration?: number;
  price?: number;
  color?: string;
  visible?: boolean;
}

// ── Endpoints ──────────────────────────────────────────────────────────────

export async function getServices(params: GetServicesParams = {}): Promise<Service[]> {
  const qs = params.visible ? `?visible=${params.visible}` : "";
  const data = await apiFetch<{ services: Service[] }>(`/services${qs}`);
  return data.services;
}

export async function getService(id: string): Promise<Service> {
  const data = await apiFetch<{ service: Service }>(`/services/${id}`);
  return data.service;
}

export async function createService(params: CreateServiceParams): Promise<Service> {
  const data = await apiFetch<{ service: Service }>("/services", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return data.service;
}

export async function updateService(id: string, params: UpdateServiceParams): Promise<Service> {
  const data = await apiFetch<{ service: Service }>(`/services/${id}`, {
    method: "PUT",
    body: JSON.stringify(params),
  });
  return data.service;
}

export async function deleteService(id: string): Promise<Service> {
  // Soft delete — pone visible: false
  const data = await apiFetch<{ service: Service }>(`/services/${id}`, {
    method: "DELETE",
  });
  return data.service;
}
