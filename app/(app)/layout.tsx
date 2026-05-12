import PlanGate from "@/components/PlanGate";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <PlanGate>{children}</PlanGate>;
}
