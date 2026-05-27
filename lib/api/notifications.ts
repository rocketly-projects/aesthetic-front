import { apiFetch } from "./client";

// ── Types ─────────────────────────────────────────────────────────────────────

export type NotificationType = "new_appointment" | "payment_received" | "reminder_sent";

export interface Notification {
  id: string;
  businessId: string;
  type: NotificationType;
  title: string;
  body: string;
  entityId: string | null;
  read: boolean;
  createdAt: string;
}

export interface GetNotificationsResponse {
  notifications: Notification[];
}

export interface UnreadCountResponse {
  count: number;
}

// ── Endpoints ─────────────────────────────────────────────────────────────────

export async function getNotifications(unreadOnly = false, limit = 20): Promise<GetNotificationsResponse> {
  const qs = new URLSearchParams({ limit: String(limit) });
  if (unreadOnly) qs.set("unreadOnly", "true");
  return apiFetch<GetNotificationsResponse>(`/notifications?${qs}`);
}

export async function getUnreadCount(): Promise<UnreadCountResponse> {
  return apiFetch<UnreadCountResponse>("/notifications/unread-count");
}

export async function markAsRead(id: string): Promise<void> {
  await apiFetch<{ ok: boolean }>(`/notifications/${id}/read`, { method: "PATCH" });
}

export async function markAllAsRead(): Promise<void> {
  await apiFetch<{ ok: boolean }>("/notifications/read-all", { method: "PATCH" });
}
