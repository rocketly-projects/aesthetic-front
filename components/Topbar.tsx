interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <div className="h-[var(--topbar-h)] min-h-[var(--topbar-h)] bg-surface border-b border-line flex items-center px-6 gap-4">
      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="m-0 text-[15px] font-semibold text-ink leading-tight">{title}</h1>
        {subtitle && (
          <div className="text-[12.5px] text-ink-3 mt-0.5">{subtitle}</div>
        )}
      </div>

      {/* Notifications */}
      <button className="tb-icon-btn" aria-label="Notificaciones">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/>
          <path d="M10 21a2 2 0 0 0 4 0"/>
        </svg>
        <span className="dot" />
      </button>

      {/* Divider + actions */}
      {actions && (
        <>
          <span className="tb-divider" />
          <div className="flex items-center gap-2">{actions}</div>
        </>
      )}
    </div>
  );
}
