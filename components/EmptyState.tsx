interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-5 text-ink-3" style={{ opacity: 0.35 }}>
        {icon}
      </div>
      <div className="text-[14.5px] font-semibold text-ink mb-1.5">{title}</div>
      {description && (
        <div className="text-[13px] text-ink-3 max-w-[260px] leading-relaxed">{description}</div>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ── SVG icons ──────────────────────────────────────────────────────────────

export function CalendarEmptyIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="10" width="36" height="32" rx="4" />
      <path d="M16 6v8M32 6v8M6 22h36" />
      <path d="M17 32h.01M24 32h.01M31 32h.01M17 38h.01M24 38h.01" />
    </svg>
  );
}

export function ClientEmptyIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="16" r="8" />
      <path d="M8 42c0-8.837 7.163-16 16-16s16 7.163 16 16" />
      <path d="M30 10l8-6M38 10l-8-6" strokeWidth="1.6" />
    </svg>
  );
}

export function ChatEmptyIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 8h32a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2H16l-8 8V10a2 2 0 0 1 2-2z" />
      <path d="M16 20h16M16 27h8" />
    </svg>
  );
}

export function ScissorsEmptyIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="14" cy="12" r="6" />
      <circle cx="14" cy="36" r="6" />
      <path d="M20 12l24 24M20 36L44 12" />
    </svg>
  );
}

export function SearchEmptyIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="22" cy="22" r="14" />
      <path d="M32 32l10 10" />
      <path d="M17 22h10M22 17v10" />
    </svg>
  );
}
