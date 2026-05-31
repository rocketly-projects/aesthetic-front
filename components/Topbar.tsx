import NotificationBell from "./NotificationBell";

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onOpenMobileNav?: () => void;
}

export default function Topbar({ title, subtitle, actions, onOpenMobileNav }: TopbarProps) {
  return (
    <div className="h-[var(--topbar-h)] min-h-[var(--topbar-h)] flex items-center px-3 md:px-6 gap-3 md:gap-4">
      {/* Hamburger — mobile only */}
      {onOpenMobileNav && (
        <div className="lg:hidden">
        <button
          onClick={onOpenMobileNav}
          aria-label="Abrir menú"
          className="tb-icon-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        </div>
      )}

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="m-0 text-[15px] font-semibold text-ink leading-tight truncate">{title}</h1>
        {subtitle && (
          <div className="text-[12.5px] text-ink-3 mt-0.5 truncate hidden sm:block">{subtitle}</div>
        )}
      </div>

      {/* Notifications */}
      <NotificationBell />

      {/* Divider + actions */}
      {actions && (
        <>
          <span className="tb-divider hidden sm:block" />
          <div className="flex items-center gap-2">{actions}</div>
        </>
      )}
    </div>
  );
}
