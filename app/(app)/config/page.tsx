"use client";

import AppShell from "@/components/AppShell";
import { usePreferences } from "@/hooks/usePreferences";
import { useGetBusiness } from "@/hooks/useBusiness";

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

        {plan ? (
          <div className="rounded-lg p-5" style={{ background: plan.gradient }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-base text-white mb-2">{plan.label}</div>
                <div className="text-[13px] mb-4" style={{ color: "rgba(255,255,255,.7)" }}>{plan.subtitle}</div>
                <div className="flex flex-wrap gap-2">
                  {plan.features.map((f) => (
                    <span key={f} className="rounded-full px-2.5 py-1 text-[11px] font-medium text-white" style={{ background: "rgba(255,255,255,.15)" }}>{f}</span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0 pl-6">
                <div className="text-[28px] font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>{plan.price}</div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,.6)" }}>por mes</div>
              </div>
            </div>
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
