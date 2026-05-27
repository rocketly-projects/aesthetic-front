"use client";

import { useQuery, useMutation, useQueryClient, useQueryClient as useQC } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  type Notification,
  type NotificationType,
} from "@/lib/api/notifications";
import { usePreferences } from "./usePreferences";
import { toast } from "@/components/Toaster";

// ── Mapeo type → clave de preferencias ────────────────────────────────────────

const TYPE_TO_PREF: Record<NotificationType, keyof ReturnType<typeof usePreferences>["prefs"]["notifications"]> = {
  new_appointment:  "turnos",
  payment_received: "pagos",
  reminder_sent:    "recordatorios",
};

// ── Query keys ────────────────────────────────────────────────────────────────

export const notificationKeys = {
  all:         ["notifications"] as const,
  list:        () => ["notifications", "list"] as const,
  unreadPoll:  () => ["notifications", "unread-poll"] as const,
  unreadCount: () => ["notifications", "unread-count"] as const,
};

// ── useNotifications — lista completa (lazy, sin polling) ──────────────────────

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn:  () => getNotifications(false, 20),
    staleTime: 0,
  });
}

// ── useNotificationPoll — polling de no leídas + toasts ───────────────────────
// Llámalo una sola vez en el layout (dentro de NotificationBell).

export function useNotificationPoll() {
  const { prefs } = usePreferences();
  const seenIds = useRef<Set<string>>(new Set());
  const initialized = useRef(false);

  const query = useQuery({
    queryKey: notificationKeys.unreadPoll(),
    queryFn:  () => getNotifications(true, 10),
    refetchInterval: 30_000,
    staleTime: 0,
  });

  useEffect(() => {
    const items = query.data?.notifications ?? [];

    if (!initialized.current) {
      // Primera carga: marcar como "ya vistas" sin disparar toasts
      items.forEach((n) => seenIds.current.add(n.id));
      initialized.current = true;
      return;
    }

    // Disparar toast para cada notificación nueva
    for (const n of items) {
      if (seenIds.current.has(n.id)) continue;
      seenIds.current.add(n.id);

      const prefKey = TYPE_TO_PREF[n.type];
      if (!prefs.notifications[prefKey]) continue;

      toast.info(`${n.title} — ${n.body}`);
    }
  }, [query.data]);

  // Unread count derivado de la poll
  const unreadCount = query.data?.notifications.length ?? 0;

  return { unreadCount, isLoading: query.isLoading };
}

// ── useMarkAsRead ─────────────────────────────────────────────────────────────

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

// ── useMarkAllAsRead ──────────────────────────────────────────────────────────

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
