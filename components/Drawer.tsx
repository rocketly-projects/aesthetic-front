"use client";

import { useEffect, useRef, useState } from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
}

export default function Drawer({ open, onClose, title, children, width = 520 }: DrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 320);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (visible && scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [visible]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{
        background: `rgba(39,42,37,${visible ? 0.35 : 0})`,
        backdropFilter: visible ? "blur(2px)" : "none",
        transition: `background var(--dur-base) var(--ease-out), backdrop-filter var(--dur-base) var(--ease-out)`,
      }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col h-full bg-surface shadow-xl overflow-hidden"
        style={{
          width,
          maxWidth: "100vw",
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: `transform var(--dur-slow) var(--ease-out)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line flex-shrink-0">
          <span className="text-[15px] font-semibold text-ink">{title}</span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-3 hover:bg-bg hover:text-ink transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
