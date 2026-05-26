import { apiFetch } from "./client";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Client {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  visits: number;
  totalSpent: number;
  lastVisitAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetClientsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetClientsResponse {
  clients: Client[];
  page: number;
  limit: number;
  total: number;
}

export interface CreateClientParams {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface UpdateClientParams {
  name?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

// ── Endpoints ──────────────────────────────────────────────────────────────

export async function getClients(params: GetClientsParams = {}): Promise<GetClientsResponse> {
  const qs = new URLSearchParams();
  if (params.page)   qs.set("page",   String(params.page));
  if (params.limit)  qs.set("limit",  String(params.limit));
  if (params.search) qs.set("search", params.search);
  const query = qs.toString() ? `?${qs}` : "";
  return apiFetch<GetClientsResponse>(`/clients${query}`);
}

export async function getClient(id: string): Promise<Client> {
  const data = await apiFetch<{ client: Client }>(`/clients/${id}`);
  return data.client;
}

export async function createClient(params: CreateClientParams): Promise<Client> {
  const data = await apiFetch<{ client: Client }>("/clients", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return data.client;
}

export async function updateClient(id: string, params: UpdateClientParams): Promise<Client> {
  const data = await apiFetch<{ client: Client }>(`/clients/${id}`, {
    method: "PUT",
    body: JSON.stringify(params),
  });
  return data.client;
}

export async function deleteClient(id: string): Promise<void> {
  await apiFetch<void>(`/clients/${id}`, { method: "DELETE" });
}
