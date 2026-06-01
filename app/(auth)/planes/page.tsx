"use client";

import { usePlans, useSubscribe } from "@/hooks/useBilling";
import { ApiError } from "@/lib/api/client";

const CHECK = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function PlanesPage() {
  const { data: plans, isLoading } = usePlans();
  const { mutate: subscribe, isPending, error, variables } = useSubscribe();

  const errorMsg = error instanceof ApiError ? error.message : error ? "Error al iniciar el pago" : null;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-6 md:px-10 md:py-8">
        <img src="/logoDark.svg" alt="aesthetic" className="w-9 h-9 rounded-full shrink-0" />
        <span className="text-[21px] font-medium tracking-[-0.02em] font-display text-ink">
          aesthetic<em className="not-italic text-accent">.</em>
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        <div className="text-center mb-10 max-w-lg">
          <h1 className="font-display text-[32px] md:text-[40px] leading-[1.05] tracking-[-0.03em] font-normal text-ink mb-3">
            Elegí tu <em className="italic text-accent font-normal">plan</em>
          </h1>
          <p className="text-[15px] text-ink-3">
            Empezás con 14 días gratis en cualquier plan. Cancelás cuando quieras.
          </p>
        </div>

        {isLoading ? (
          <div className="flex gap-5 flex-wrap justify-center w-full">
            {[0, 1].map((i) => (
              <div key={i} className="w-full max-w-[300px] h-[380px] rounded-xl bg-bg-2 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex gap-5 flex-wrap justify-center">
            {plans?.map((plan) => {
              const isPro = plan.id === "pro";
              const isThisPending = isPending && variables === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`
                    relative w-full max-w-[300px] rounded-xl border p-7 flex flex-col transition-shadow
                    ${isPro
                      ? "bg-ink text-bg border-ink shadow-xl"
                      : "bg-surface text-ink border-line shadow-md"
                    }
                  `}
                >
                  {isPro && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-medium bg-accent text-bg tracking-wide">
                      Recomendado
                    </span>
                  )}

                  <div className="mb-6">
                    <p className={`text-[12px] font-medium uppercase tracking-[0.08em] mb-1 ${isPro ? "text-accent-soft" : "text-accent"}`}>
                      {plan.name}
                    </p>
                    <div className="flex items-end gap-1.5">
                      <span className="font-display text-[38px] leading-none tracking-[-0.03em] font-normal">
                        ${(plan.price / 1000).toFixed(0)}k
                      </span>
                      <span className={`text-[13px] mb-1 ${isPro ? "text-bg/60" : "text-ink-3"}`}>
                        / mes
                      </span>
                    </div>
                    <p className={`text-[12px] mt-1.5 ${isPro ? "text-bg/50" : "text-ink-3"}`}>
                      ARS · facturación mensual
                    </p>
                  </div>

                  <ul className="flex-1 space-y-2.5 mb-7">
                    {plan.features.map((feature) => (
                      <li key={feature} className={`flex items-start gap-2.5 text-[13.5px] ${isPro ? "text-bg/85" : "text-ink-2"}`}>
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
                    className={`
                      w-full h-11 rounded-md text-[14px] font-medium transition-colors disabled:opacity-60 cursor-pointer
                      ${isPro
                        ? "bg-accent text-bg hover:bg-accent-ink border-0"
                        : "bg-ink text-bg hover:bg-[#1a1815] border-0"
                      }
                    `}
                  >
                    {isThisPending ? "Redirigiendo…" : "Empezar gratis"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {errorMsg && (
          <p className="mt-5 text-[13px] text-err">{errorMsg}</p>
        )}

        <p className="mt-8 text-[12.5px] text-ink-3 text-center max-w-sm">
          Al hacer clic en "Empezar gratis" serás redirigido a Mercado Pago para completar la suscripción.
          Los 14 días de prueba comienzan desde el momento del registro.
        </p>
      </div>
    </div>
  );
}
