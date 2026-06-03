"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { usePreferences } from "@/hooks/usePreferences";
import { useGetBusiness } from "@/hooks/useBusiness";
import { useBillingStatus, useCancelSubscription } from "@/hooks/useBilling";

const PLAN_CONFIG = {
  basic: {
    label:    "Plan Básico activo",
    subtitle: "Turnos, clientes y servicios en un solo lugar.",
    features: ["Gestión de turnos", "Agenda", "Clientes", "Servicios", "Perfil público"],
    price:    "$30.000",
    gradient: "linear-gradient(135deg, #1e2535 0%, #2c3a4a 100%)",
  },
  pro: {
    label:    "Plan Pro activo",
    subtitle: "Clientes ilimitadas · Bot de WhatsApp · Reportes avanzados",
    features: ["Turnos ilimitados", "WhatsApp bot", "Estadísticas", "Soporte prioritario"],
    price:    "$40.000",
    gradient: "linear-gradient(135deg, #272a25 0%, #3a4535 100%)",
  },
} as const;

function ToggleRow({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-line last:border-b-0">
      <div className="flex-1">
        <div className="text-[13px] font-medium text-ink">{label}</div>
        {description && <div className="text-xs text-ink-3 mt-0.5">{description}</div>}
      </div>
      <label className="toggle">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="toggle-track" /><span className="toggle-thumb" />
      </label>
    </div>
  );
}

export default function ConfigPage() {
  const { prefs, setPrefs, save, saved } = usePreferences();
  const { data: business } = useGetBusiness();
  const { data: billing }  = useBillingStatus();
  const cancelPlan = useCancelSubscription();
  const [cancelConfirm, setCancelConfirm] = useState(false);

  const setNotif = (key: keyof typeof prefs.notifications, value: boolean) =>
    setPrefs((p) => ({ ...p, notifications: { ...p.notifications, [key]: value } }));

  const planKey = business?.planStatus === 'active' && business?.planId
    ? (business.planId as keyof typeof PLAN_CONFIG)
    : null;
  const plan = planKey && planKey in PLAN_CONFIG ? PLAN_CONFIG[planKey] : null;

  return (
    <AppShell
      active="config"
      title="Configuración"
      subtitle="Preferencias de la aplicación"
      actions={
        <button
          onClick={save}
          className={`flex items-center gap-1.5 text-white text-[13.5px] font-medium rounded-lg px-4 py-2 border-none cursor-pointer hover:opacity-90 transition-opacity shadow-sm ${saved ? "bg-ok" : "bg-ink"}`}
        >
          {saved ? "Guardado" : "Guardar"}
        </button>
      }
    >
      <div className="flex flex-col gap-5 max-w-[720px]">
        <div className="bg-surface border border-line rounded-lg shadow-sm p-5">
          <div className="font-semibold text-sm text-ink mb-2">Notificaciones</div>
          <ToggleRow label="Nuevos turnos"          description="Toast al recibir un turno desde la web"       checked={prefs.notifications.turnos}        onChange={(v) => setNotif("turnos", v)}        />
          <div className="flex items-center gap-4 py-4 border-b border-line opacity-50">
            <div className="flex-1">
              <div className="text-[13px] font-medium text-ink">Recordatorios enviados</div>
              <div className="text-xs text-ink-3 mt-0.5">Aún sin desarrollar</div>
            </div>
            <label className="toggle">
              <input type="checkbox" disabled checked={false} onChange={() => {}} />
              <span className="toggle-track" /><span className="toggle-thumb" />
            </label>
          </div>
          <ToggleRow label="Pagos recibidos"        description="Toast al confirmar una seña"                  checked={prefs.notifications.pagos}         onChange={(v) => setNotif("pagos", v)}         />
        </div>

        {business?.planStatus === "cancelled" ? (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#fef2f2] border border-err text-err text-[13px] font-medium">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
            </svg>
            Plan cancelado — tu acceso se mantiene hasta el fin del período actual
          </div>
        ) : plan ? (
          <div className="flex flex-col gap-3">
            {/* Card oscura del plan */}
            <div className="rounded-lg p-5" style={{ background: plan.gradient }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base text-white mb-1">{plan.label}</div>
                  <div className="text-[13px] mb-4" style={{ color: "rgba(255,255,255,.7)" }}>{plan.subtitle}</div>
                  <div className="flex flex-wrap gap-2">
                    {plan.features.map((f) => (
                      <span key={f} className="rounded-full px-2.5 py-1 text-[11px] font-medium text-white" style={{ background: "rgba(255,255,255,.15)" }}>{f}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <div className="text-[28px] font-semibold text-white leading-none" style={{ fontFamily: "var(--font-display)" }}>{plan.price}</div>
                  <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,.6)" }}>por mes</div>
                  {billing?.subscriptionExpiresAt && (
                    <div className="mt-3 text-right">
                      <div className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,.45)" }}>Próximo cobro</div>
                      <div className="text-[12.5px] font-medium mt-0.5" style={{ color: "rgba(255,255,255,.8)" }}>
                        {new Date(billing.subscriptionExpiresAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Baja del plan */}
            {cancelConfirm ? (
              <div className="flex flex-col gap-3 p-4 rounded-lg bg-surface border border-err/30">
                <p className="text-[12.5px] text-ink leading-snug m-0">
                  <span className="font-semibold text-err">¿Confirmás la baja?</span> Tu suscripción se cancelará de inmediato en MercadoPago. Seguís teniendo acceso hasta el fin del período actual.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setCancelConfirm(false); cancelPlan.reset(); }}
                    className="flex-1 text-[13px] text-ink-2 py-2 rounded-lg border border-line hover:border-ink-3 transition-colors bg-transparent cursor-pointer"
                  >
                    Mantener plan
                  </button>
                  <button
                    onClick={() => cancelPlan.mutate(undefined, { onSuccess: () => setCancelConfirm(false) })}
                    disabled={cancelPlan.isPending}
                    className="flex-1 text-[13px] font-medium py-2 rounded-lg border-none text-white cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: "var(--color-err)" }}
                  >
                    {cancelPlan.isPending ? "Cancelando…" : "Confirmar baja"}
                  </button>
                </div>
                {cancelPlan.error && (
                  <p className="text-[12px] text-err m-0">{(cancelPlan.error as Error).message}</p>
                )}
              </div>
            ) : (
              <button
                onClick={() => setCancelConfirm(true)}
                className="flex items-center gap-2 text-[12.5px] font-medium text-ink-3 hover:text-err border border-line hover:border-err/40 rounded-lg px-4 py-2.5 transition-colors bg-transparent cursor-pointer w-full justify-center"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                </svg>
                Dar de baja el plan
              </button>
            )}
          </div>
        ) : (
          <div className="bg-surface border border-line rounded-lg p-5">
            <div className="font-semibold text-sm text-ink mb-1">Sin plan activo</div>
            <p className="text-[12.5px] text-ink-3 mt-0.5">
              Activá un plan para acceder a todas las funciones de aesthetic.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
