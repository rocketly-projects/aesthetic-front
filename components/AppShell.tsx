"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useSidebarCollapsed } from "@/lib/useSidebarCollapsed";

interface AppShellProps {
  active: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function AppShell({ active, title, subtitle, actions, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useSidebarCollapsed();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Cerrar drawer al cambiar de ruta
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [mobileOpen]);

  const sidebarW = collapsed ? "var(--sidebar-w-collapsed)" : "var(--sidebar-w)";

  return (
    <div
      className="h-screen overflow-hidden bg-bg-2 lg:grid lg:[grid-template-columns:var(--cols)]"
      style={{
        ["--cols" as string]: `${sidebarW} 1fr`,
        transition: `grid-template-columns var(--dur-base) var(--ease-out)`,
      }}
    >
      {/* Sidebar desktop — sólo lg+ */}
      <div className="hidden lg:block h-full">
        <Sidebar active={active} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Sidebar mobile — drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="relative h-full w-64 max-w-[80vw] bg-bg shadow-xl"
            style={{ animation: "drawer-in var(--dur-base) var(--ease-out) both" }}
          >
            <Sidebar
              active={active}
              collapsed={false}
              onToggle={() => {}}
              mobile
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Right panel — wrapper que provee el inset gap en desktop */}
      <div className="h-full flex flex-col lg:p-2">
        {/* Panel flotante */}
        <div
          className="flex-1 min-h-0 flex flex-col overflow-hidden bg-bg lg:rounded-2xl"
          style={{ boxShadow: "0 0 0 1px var(--color-line)" }}
        >
          <Topbar
            title={title}
            subtitle={subtitle}
            actions={actions}
            onOpenMobileNav={() => setMobileOpen(true)}
          />
          <div
            key={pathname}
            className="flex-1 overflow-y-auto p-4 md:p-6"
            style={{ animation: "page-in var(--dur-slow) var(--ease-out) both" }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
