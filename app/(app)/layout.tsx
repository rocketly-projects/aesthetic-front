import PlanGate from "@/components/PlanGate";
import Toaster from "@/components/Toaster";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlanGate>
      {children}
      <Toaster />
    </PlanGate>
  );
}
