"use client";

import { useState, useEffect } from "react";

// ── Event bus ─────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  visible: boolean;
}

type Listener = (item: Omit<ToastItem, "visible">) => void;
const listeners = new Set<Listener>();

function emit(message: string, type: ToastType) {
  const id = Math.random().toString(36).slice(2, 9);
  listeners.forEach((fn) => fn({ id, message, type }));
}

export const toast = {
  success: (message: string) => emit(message, "success"),
  error:   (message: string) => emit(message, "error"),
  info:    (message: string) => emit(message, "info"),
};

// ── Component ─────────────────────────────────────────────────────────────────

const CONFIG: Record<ToastType, { icon: string; bg: string; bar: string }> = {
  success: { icon: "✓", bg: "var(--color-ok)",  bar: "rgba(255,255,255,0.35)" },
  error:   { icon: "✕", bg: "var(--color-err)", bar: "rgba(255,255,255,0.35)" },
  info:    { icon: "ℹ", bg: "var(--color-ink)", bar: "rgba(255,255,255,0.25)" },
};

const DURATION = 3500;

export default function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (item: Omit<ToastItem, "visible">) => {
      setItems((prev) => [...prev.slice(-4), { ...item, visible: false }]);

      // trigger enter animation on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setItems((prev) =>
            prev.map((t) => (t.id === item.id ? { ...t, visible: true } : t))
          );
        });
      });

      // start exit animation
      setTimeout(() => {
        setItems((prev) =>
          prev.map((t) => (t.id === item.id ? { ...t, visible: false } : t))
        );
      }, DURATION - 400);

      // remove after animation
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== item.id));
      }, DURATION);
    };

    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  if (items.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toast-progress {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
        {items.map((item) => {
          const cfg = CONFIG[item.type];
          return (
            <div
              key={item.id}
              className="pointer-events-auto overflow-hidden rounded-xl shadow-xl min-w-[220px] max-w-[320px]"
              style={{
                background: cfg.bg,
                opacity:    item.visible ? 1 : 0,
                transform:  item.visible ? "translateX(0) scale(1)" : "translateX(24px) scale(0.96)",
                transition: "opacity 300ms ease, transform 300ms cubic-bezier(0.34,1.56,0.64,1)",
              }}
            >
              <div className="flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-white">
                <span
                  className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold"
                  style={{ background: "rgba(255,255,255,0.25)" }}
                >
                  {cfg.icon}
                </span>
                <span className="leading-snug">{item.message}</span>
              </div>

              {/* progress bar */}
              <div className="h-[3px] w-full origin-left" style={{ background: cfg.bar }}>
                <div
                  className="h-full w-full origin-left"
                  style={{
                    background: "rgba(255,255,255,0.6)",
                    animation:  item.visible
                      ? `toast-progress ${DURATION - 400}ms linear forwards`
                      : "none",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
