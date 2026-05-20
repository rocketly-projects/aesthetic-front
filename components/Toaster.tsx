"use client";

import { useState, useEffect } from "react";

// ── Event bus ─────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

type Listener = (item: ToastItem) => void;
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

const ICONS: Record<ToastType, string> = {
  success: "✓",
  error:   "✕",
  info:    "ℹ",
};

const COLORS: Record<ToastType, string> = {
  success: "var(--color-ok)",
  error:   "var(--color-err)",
  info:    "var(--color-ink)",
};

export default function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (item: ToastItem) => {
      setItems((prev) => [...prev.slice(-4), item]);
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== item.id));
      }, 3500);
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-[13px] font-medium text-white pointer-events-auto min-w-[200px] max-w-[320px]"
          style={{ background: COLORS[item.type] }}
        >
          <span className="text-sm leading-none shrink-0 font-bold">{ICONS[item.type]}</span>
          {item.message}
        </div>
      ))}
    </div>
  );
}
