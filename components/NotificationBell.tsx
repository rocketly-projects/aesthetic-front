"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useNotificationPoll,
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/hooks/useNotifications";
import type { Notification, NotificationType } from "@/lib/api/notifications";

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)   return "ahora";
  if (mins < 60)  return `hace ${mins} min`;
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${days} d`;
}

function navPath(n: Notification): string {
  if (n.type === "new_appointment" || n.type === "payment_received") return "/turnos";
  if (n.type === "reminder_sent") return "/whatsapp";
  return "/";
}

const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
  new_appointment: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  ),
  payment_received: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>
  ),
  reminder_sent: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
};

const TYPE_COLOR: Record<NotificationType, string> = {
  new_appointment:  "bg-accent/10 text-accent",
  payment_received: "bg-ok/10 text-ok",
  reminder_sent:    "bg-ink-2/10 text-ink-2",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref             = useRouter();
  const wrapRef         = useRef<HTMLDivElement>(null);

  const { unreadCount }         = useNotificationPoll();
  const { data, refetch }       = useNotifications();
  const { mutate: markOne }     = useMarkAsRead();
  const { mutate: markAll }     = useMarkAllAsRead();

  // Cargar lista al abrir
  useEffect(() => {
    if (open) refetch();
  }, [open]);

  // Cerrar al click fuera
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  const router   = ref;
  const items    = data?.notifications ?? [];
  const hasUnread = unreadCount > 0;

  function handleClick(n: Notification) {
    if (!n.read) markOne(n.id);
    setOpen(false);
    router.push(navPath(n));
  }

  return (
    <div ref={wrapRef} className="relative">
      {/* Botón campanita */}
      <button
        className="tb-icon-btn relative"
        aria-label="Notificaciones"
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/>
          <path d="M10 21a2 2 0 0 0 4 0"/>
        </svg>
        {hasUnread && (
          <span className="absolute top-1 right-1 min-w-[14px] h-[14px] rounded-full bg-accent text-[9px] font-bold text-accent-ink flex items-center justify-center px-[3px] leading-none pointer-events-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-[340px] bg-surface border border-line rounded-xl shadow-xl z-[100] overflow-hidden"
          style={{ animation: "page-in 150ms var(--ease-out) both" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-line">
            <span className="text-[13px] font-semibold text-ink">Notificaciones</span>
            {hasUnread && (
              <button
                onClick={() => markAll()}
                className="text-[11px] text-accent hover:underline cursor-pointer"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-[380px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-[13px] text-ink-3">
                No tenés notificaciones
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 flex gap-3 border-b border-line last:border-b-0 hover:bg-bg transition-colors cursor-pointer ${!n.read ? "bg-bg/60" : ""}`}
                >
                  {/* Icono */}
                  <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 ${TYPE_COLOR[n.type]}`}>
                    {TYPE_ICON[n.type]}
                  </span>

                  {/* Texto */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[12.5px] font-medium leading-snug ${n.read ? "text-ink-2" : "text-ink"}`}>
                        {n.title}
                      </span>
                      <span className="text-[11px] text-ink-3 shrink-0 mt-0.5">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="text-[11.5px] text-ink-3 mt-0.5 leading-snug line-clamp-2">{n.body}</p>
                  </div>

                  {/* Dot no leída */}
                  {!n.read && (
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
