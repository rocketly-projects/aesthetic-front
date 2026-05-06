import { apiFetch } from "./client";

// ── Types ──────────────────────────────────────────────────────────────────

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";

export interface Appointment {
  id: string;
  businessId: string;
  clientId: string;
  serviceId: string | null;
  serviceName: string;
  duration: number;  // minutos — snapshot
  price: number;     // ARS — snapshot
  date: string;      // YYYY-MM-DD
  time: string;      // HH:MM
  status: AppointmentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetAppointmentsParams {
  page?: number;
  limit?: number;
  status?: AppointmentStatus;
  date?: string;
  clientId?: string;
}

export interface GetAppointmentsResponse {
  appointments: Appointment[];
  page: number;
  limit: number;
}

export interface AgendaSlot {
  id: string;
  time: string;
  duration: number;
  status: AppointmentStatus;
  serviceName: string;
}

export interface AgendaResponse {
  date: string;
  appointments: AgendaSlot[];
  availableSlots: string[];
}

export interface CreateAppointmentParams {
  serviceId: string;
  clientId?: string;
  date: string;
  time: string;
  notes?: string;
}

export interface UpdateAppointmentParams {
  status?: AppointmentStatus;
  notes?: string;
  date?: string;
  time?: string;
}

// ── Endpoints ──────────────────────────────────────────────────────────────

export async function getAppointments(params: GetAppointmentsParams = {}): Promise<GetAppointmentsResponse> {
  const qs = new URLSearchParams();
  if (params.page)     qs.set("page",     String(params.page));
  if (params.limit)    qs.set("limit",    String(params.limit));
  if (params.status)   qs.set("status",   params.status);
  if (params.date)     qs.set("date",     params.date);
  if (params.clientId) qs.set("clientId", params.clientId);
  const query = qs.toString() ? `?${qs}` : "";
  return apiFetch<GetAppointmentsResponse>(`/appointments${query}`);
}

export async function getAppointment(id: string): Promise<Appointment> {
  const data = await apiFetch<{ appointment: Appointment }>(`/appointments/${id}`);
  return data.appointment;
}

export async function createAppointment(params: CreateAppointmentParams): Promise<Appointment> {
  const data = await apiFetch<{ appointment: Appointment }>("/appointments", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return data.appointment;
}

export async function updateAppointment(id: string, params: UpdateAppointmentParams): Promise<Appointment> {
  const data = await apiFetch<{ appointment: Appointment }>(`/appointments/${id}`, {
    method: "PUT",
    body: JSON.stringify(params),
  });
  return data.appointment;
}

export async function deleteAppointment(id: string): Promise<void> {
  // Soft delete — cambia status a "cancelled"
  await apiFetch<void>(`/appointments/${id}`, { method: "DELETE" });
}

export async function getAgenda(date: string): Promise<AgendaResponse> {
  return apiFetch<AgendaResponse>(`/appointments/agenda/${date}`);
}
