import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface AppShellProps {
  active: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function AppShell({ active, title, subtitle, actions, children }: AppShellProps) {
  return (
    <div className="grid h-screen overflow-hidden" style={{ gridTemplateColumns: "var(--sidebar-w) 1fr" }}>
      <Sidebar active={active} />
      <div className="flex flex-col overflow-hidden bg-bg">
        <Topbar title={title} subtitle={subtitle} actions={actions} />
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
