"use client";

import Link from "next/link";
import { useLogout, useCurrentUser } from "@/hooks/useAuth";
import { useGetChats } from "@/hooks/useWhatsapp";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function SvgWrap({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round"
      className="shrink-0"
    >
      {children}
    </svg>
  );
}

function IconDashboard() {
  return <SvgWrap><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></SvgWrap>;
}
function IconAgenda() {
  return <SvgWrap><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></SvgWrap>;
}
function IconTurnos() {
  return <SvgWrap><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></SvgWrap>;
}
function IconClientes() {
  return <SvgWrap><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.5 3.4-5 6.5-5s5.9 1.5 6.5 5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5c2.6.2 4.6 1.6 5 5"/></SvgWrap>;
}
function IconWhatsapp() {
  return <SvgWrap><path d="M21 11.5a8.4 8.4 0 0 1-1.2 4.4L21 21l-5.2-1.2a8.4 8.4 0 1 1 5.4-8.3zM8 9a1 1 0 0 1 1-1h.5l1 2.5-1 1a6 6 0 0 0 3 3l1-1L16 14.5V15a1 1 0 0 1-1 1c-3.9 0-7-3.1-7-7z"/></SvgWrap>;
}
function IconServicios() {
  return <SvgWrap><circle cx="6" cy="7" r="2.5"/><circle cx="6" cy="17" r="2.5"/><path d="M8 8.5L20 19M8 15.5L20 5"/></SvgWrap>;
}
function IconNegocio() {
  return <SvgWrap><path d="M3 9l1.5-5h15L21 9M3 9v11h18V9M3 9c0 1.7 1.3 3 3 3s3-1.3 3-3M9 9c0 1.7 1.3 3 3 3s3-1.3 3-3M15 9c0 1.7 1.3 3 3 3s3-1.3 3-3"/></SvgWrap>;
}
function IconConfig() {
  return (
    <SvgWrap>
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
    </SvgWrap>
  );
}
function IconLogout() {
  return (
    <SvgWrap>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
    </SvgWrap>
  );
}
function IconChevronLeft() {
  return <SvgWrap><path d="M15 18l-6-6 6-6"/></SvgWrap>;
}
function IconChevronRight() {
  return <SvgWrap><path d="M9 18l6-6-6-6"/></SvgWrap>;
}

type IconComponent = () => React.ReactElement;

const ICON_MAP: Record<string, IconComponent> = {
  dashboard: IconDashboard,
  agenda:    IconAgenda,
  turnos:    IconTurnos,
  clientes:  IconClientes,
  whatsapp:  IconWhatsapp,
  servicios: IconServicios,
  negocio:   IconNegocio,
  config:    IconConfig,
};

interface NavItem {
  href: string;
  id: string;
  label: string;
}

const gestionNav: NavItem[] = [
  { href: "/dashboard", id: "dashboard", label: "Inicio"    },
  { href: "/agenda",    id: "agenda",    label: "Agenda"    },
  { href: "/turnos",    id: "turnos",    label: "Turnos"    },
  { href: "/clientes",  id: "clientes",  label: "Clientes"  },
  { href: "/whatsapp",  id: "whatsapp",  label: "WhatsApp" },
  { href: "/servicios", id: "servicios", label: "Servicios" },
];

const configNav: NavItem[] = [
  { href: "/negocio", id: "negocio", label: "Mi negocio"    },
  { href: "/config",  id: "config",  label: "Configuración" },
];

interface SidebarProps {
  active: string;
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ active, collapsed, onToggle }: SidebarProps) {
  const logout  = useLogout();
  const current = useCurrentUser();
  const roleLabel = current?.role === "owner" ? "Propietario" : current?.role === "staff" ? "Colaborador" : "";
  const { data: chatsData } = useGetChats();
  const unreadCount = chatsData?.chats.reduce((sum, c) => sum + (c.unread ?? 0), 0) ?? 0;

  const navItemClass = (id: string) =>
    `nav-item${active === id ? " active" : ""}${collapsed ? " justify-center" : ""}`;

  return (
    <aside
      className="flex flex-col overflow-y-auto overflow-x-hidden border-r border-line bg-bg"
      style={{ transition: `width var(--dur-base) var(--ease-out)` }}
    >
      {/* Brand */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 border-b border-line"
        style={{
          padding: collapsed ? "16px 0" : "16px",
          justifyContent: collapsed ? "center" : undefined,
          textDecoration: "none",
          transition: "padding var(--dur-base) var(--ease-out)",
        }}
        title={collapsed ? "aesthetic." : undefined}
      >
        <span className="flex items-center justify-center text-white font-semibold text-sm shrink-0 w-7 h-7 rounded-full bg-accent font-display">
          a
        </span>
        {!collapsed && (
          <span className="text-[15px] font-semibold text-ink" style={{ fontFamily: "var(--font-display)" }}>
            aesthetic<em className="not-italic text-accent">.</em>
          </span>
        )}
      </Link>

      {/* Nav */}
      <nav className="flex-1 flex flex-col px-3 py-3">
        {!collapsed && (
          <div className="px-1 py-1 text-[10.5px] font-semibold text-ink-3 uppercase tracking-widest mb-1">
            Gestión
          </div>
        )}

        {gestionNav.map((item) => {
          const IconComp = ICON_MAP[item.id];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={navItemClass(item.id)}
              title={collapsed ? item.label : undefined}
            >
              {IconComp && <IconComp />}
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && item.id === "whatsapp" && unreadCount > 0 && (
                <span className="bg-accent text-white text-[10px] font-semibold leading-none px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
              {collapsed && item.id === "whatsapp" && unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              )}
            </Link>
          );
        })}

        {!collapsed && (
          <div className="px-1 py-1 mt-4 text-[10.5px] font-semibold text-ink-3 uppercase tracking-widest mb-1">
            Configuración
          </div>
        )}
        {collapsed && <div className="my-2 border-t border-line" />}

        {configNav.map((item) => {
          const IconComp = ICON_MAP[item.id];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={navItemClass(item.id)}
              title={collapsed ? item.label : undefined}
            >
              {IconComp && <IconComp />}
              {!collapsed && <span className="flex-1">{item.label}</span>}
            </Link>
          );
        })}

        <div className="flex-1" />

        {/* Toggle button */}
        <button
          onClick={onToggle}
          className={`nav-item w-full border-none bg-transparent cursor-pointer text-ink-3 hover:text-ink${collapsed ? " justify-center" : ""}`}
          title={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {collapsed ? <IconChevronRight /> : <><IconChevronLeft /><span className="flex-1 text-left">Colapsar</span></>}
        </button>

        <button
          onClick={logout}
          className={`nav-item w-full border-none bg-transparent cursor-pointer text-ink-3 hover:text-err${collapsed ? " justify-center" : ""}`}
          title={collapsed ? "Cerrar sesión" : undefined}
        >
          <IconLogout />
          {!collapsed && <span className="flex-1 text-left">Cerrar sesión</span>}
        </button>
      </nav>

      {/* User footer */}
      <div
        className="flex items-center border-t border-line"
        style={{
          padding: collapsed ? "12px 0" : "12px 16px",
          gap: collapsed ? 0 : 12,
          justifyContent: collapsed ? "center" : undefined,
          transition: "padding var(--dur-base) var(--ease-out)",
        }}
      >
        <div className="flex items-center justify-center text-[11px] font-semibold text-white shrink-0 w-[30px] h-[30px] rounded-full bg-accent">
          {current ? initials(current.name) : "…"}
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-ink truncate">
              {current ? shortName(current.name) : "…"}
            </div>
            <div className="text-[11px] text-ink-3">{roleLabel}</div>
          </div>
        )}
      </div>
    </aside>
  );
}
