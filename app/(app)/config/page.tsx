"use client";

import AppShell from "@/components/AppShell";
import { usePreferences } from "@/hooks/usePreferences";

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

  const setNotif = (key: keyof typeof prefs.notifications, value: boolean) =>
    setPrefs((p) => ({ ...p, notifications: { ...p.notifications, [key]: value } }));

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
          <ToggleRow label="Nuevos turnos"          description="Notificación al recibir un turno nuevo"        checked={prefs.notifications.turnos}        onChange={(v) => setNotif("turnos", v)}        />
          <ToggleRow label="Recordatorios enviados" description="Confirmación cuando se envía un recordatorio"  checked={prefs.notifications.recordatorios} onChange={(v) => setNotif("recordatorios", v)} />
          <ToggleRow label="Pagos recibidos"        description="Alerta al registrar un pago"                   checked={prefs.notifications.pagos}         onChange={(v) => setNotif("pagos", v)}         />
          <ToggleRow label="Resumen diario"         description="Reporte de cierre de jornada por email"        checked={prefs.notifications.resumen}       onChange={(v) => setNotif("resumen", v)}       />
          <ToggleRow label="Emails de marketing"    description="Novedades y actualizaciones del producto"      checked={prefs.notifications.marketing}     onChange={(v) => setNotif("marketing", v)}     />
        </div>

        <div className="rounded-lg p-5" style={{ background: "linear-gradient(135deg, #272a25 0%, #3a4535 100%)" }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-base text-white mb-2">Plan Pro activo</div>
              <div className="text-[13px] mb-4" style={{ color: "rgba(255,255,255,.7)" }}>Clientes ilimitadas · Bot de WhatsApp · Reportes avanzados</div>
              <div className="flex flex-wrap gap-2">
                {["Turnos ilimitados", "WhatsApp bot", "Estadísticas", "Soporte prioritario"].map((f) => (
                  <span key={f} className="rounded-full px-2.5 py-1 text-[11px] font-medium text-white" style={{ background: "rgba(255,255,255,.15)" }}>{f}</span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0 pl-6">
              <div className="text-[28px] font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>$4.900</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,.6)" }}>por mes</div>
              <button className="mt-3 rounded-lg px-4 py-1.5 text-xs cursor-pointer hover:bg-white/25 transition-colors text-white border" style={{ background: "rgba(255,255,255,.15)", borderColor: "rgba(255,255,255,.3)" }}>Gestionar plan</button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
