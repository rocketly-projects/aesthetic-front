"use client";

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
  const sidebarW = collapsed ? "var(--sidebar-w-collapsed)" : "var(--sidebar-w)";

  return (
    <div
      className="grid h-screen overflow-hidden"
      style={{
        gridTemplateColumns: `${sidebarW} 1fr`,
        transition: `grid-template-columns var(--dur-base) var(--ease-out)`,
      }}
    >
      <Sidebar active={active} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex flex-col overflow-hidden bg-bg">
        <Topbar title={title} subtitle={subtitle} actions={actions} />
        <div
          key={pathname}
          className="flex-1 overflow-y-auto p-6"
          style={{ animation: "page-in var(--dur-slow) var(--ease-out) both" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
