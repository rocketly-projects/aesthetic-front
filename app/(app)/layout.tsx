import PlanGate from "@/components/PlanGate";
import Toaster from "@/components/Toaster";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <PlanGate>
        {children}
        <Toaster />
      </PlanGate>
    </div>
  );
}
