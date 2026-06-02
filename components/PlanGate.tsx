"use client";

import { useBillingStatus, usePlans, useSubscribe } from "@/hooks/useBilling";
import { useLogout } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api/client";
import type { Plan } from "@/lib/api/billing";

const CHECK = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FALLBACK_PLANS: Plan[] = [
  {
    id: "basic",
    name: "Plan Basico",
    price: 30000,
    features: ["Gestion de turnos", "Agenda", "Clientes", "Servicios", "Perfil publico"],
  },
  {
    id: "pro",
    name: "Plan Pro",
    price: 40000,
    features: ["Todo el Plan Basico", "Bot de WhatsApp", "Respuestas automaticas 24/7"],
  },
];

function TrialBanner({ trialEndsAt }: { trialEndsAt: string }) {
  const daysLeft = Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const label = daysLeft <= 1 ? "Último día de prueba" : `${daysLeft} días de prueba restantes`;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 px-5 py-2.5 text-[12.5px]"
      style={{ background: "var(--color-ink)", borderTop: "1px solid rgba(255,255,255,0.08)" }}
    >
      <span className="text-white/70">{label}</span>
      <a
        href="/planes"
        className="shrink-0 bg-accent text-bg text-[12px] font-medium no-underline rounded-lg px-3 py-1.5 hover:opacity-90 transition-opacity"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Elegir plan
      </a>
    </div>
  );
}

export default function PlanGate({ children }: { children: React.ReactNode }) {
  const { data: status, isLoading: statusLoading } = useBillingStatus();
  const { data: plansData, isLoading: plansLoading } = usePlans();
  const { mutate: subscribe, isPending, error, variables } = useSubscribe();
  const logout = useLogout();

  const errorMsg = error instanceof ApiError ? error.message : error ? "Error al iniciar el pago" : null;
  const plans = plansData ?? (plansLoading ? null : FALLBACK_PLANS);

  if (statusLoading) return <>{children}</>;

  if (status?.planStatus === "active") return <>{children}</>;

  // Trial activo: trialEndsAt existe y no venció
  const isInTrial = !!status?.trialEndsAt && new Date(status.trialEndsAt) > new Date();
  if (isInTrial) {
    return (
      <>
        <div style={{ paddingBottom: "44px" }}>{children}</div>
        <TrialBanner trialEndsAt={status!.trialEndsAt!} />
      </>
    );
  }

  const isCancelled = status?.planStatus === "cancelled";
  const isPastDue = status?.planStatus === "past_due";

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 py-16">
      <button
        onClick={logout}
        className="fixed top-5 right-6 text-[12.5px] text-ink-3 hover:text-ink transition-colors cursor-pointer bg-transparent border-0"
      >
        Cerrar sesion
      </button>

      <div className="text-center mb-10 max-w-lg">
        {isCancelled && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-err-soft text-err text-[12px] font-medium mb-5">
            Suscripcion cancelada
          </div>
        )}
        {isPastDue && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-warn-soft text-warn text-[12px] font-medium mb-5">
            Pago pendiente
          </div>
        )}
        <h1 className="font-display text-[36px] leading-[1.05] tracking-[-0.03em] font-normal text-ink mb-3">
          {isCancelled || isPastDue ? "Reactiva tu plan" : "Elegi tu plan para continuar"}
        </h1>
        <p className="text-[14px] text-ink-3">
          {isCancelled
            ? "Tu suscripcion fue cancelada. Podes reactivarla eligiendo un plan."
            : isPastDue
            ? "Hay un problema con tu pago. Por favor renova tu suscripcion."
            : "Activa tu cuenta con un plan para acceder al panel."}
        </p>
      </div>

      {!plans ? (
        <div className="flex gap-5">
          {[0, 1].map((i) => (
            <div key={i} className="w-[280px] h-[360px] rounded-xl bg-bg-2 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex gap-5 flex-wrap justify-center">
          {plans.map((plan) => {
            const isPro = plan.id === "pro";
            const isThisPending = isPending && variables === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative w-[280px] rounded-xl border p-6 flex flex-col transition-shadow ${
                  isPro
                    ? "bg-ink text-bg border-ink shadow-xl"
                    : "bg-surface text-ink border-line shadow-md"
                }`}
              >
                {isPro && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-medium bg-accent text-bg tracking-wide">
                    Recomendado
                  </span>
                )}

                <div className="mb-5">
                  <p className={`text-[11px] font-medium uppercase tracking-[0.08em] mb-1 ${isPro ? "text-accent-soft" : "text-accent"}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1.5">
                    <span className="font-display text-[34px] leading-none tracking-[-0.03em] font-normal">
                      ${(plan.price / 1000).toFixed(0)}k
                    </span>
                    <span className={`text-[12px] mb-1 ${isPro ? "text-bg/60" : "text-ink-3"}`}>/ mes</span>
                  </div>
                </div>

                <ul className="flex-1 space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className={`flex items-start gap-2 text-[13px] ${isPro ? "text-bg/85" : "text-ink-2"}`}>
                      <span className={`mt-0.5 shrink-0 ${isPro ? "text-accent-soft" : "text-accent"}`}>
                        {CHECK}
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => subscribe(plan.id)}
                  disabled={isPending}
                  className={`w-full h-10 rounded-md text-[13.5px] font-medium transition-colors disabled:opacity-60 cursor-pointer border-0 ${
                    isPro
                      ? "bg-accent text-bg hover:bg-accent-ink"
                      : "bg-ink text-bg hover:bg-[#1a1815]"
                  }`}
                >
                  {isThisPending ? "Redirigiendo..." : "Suscribirme"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {errorMsg && (
        <p className="mt-5 text-[13px] text-err">{errorMsg}</p>
      )}
    </div>
  );
}
