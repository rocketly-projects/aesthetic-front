"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";

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

const PALETTE_OPTIONS = [
  { key: "sage",  label: "Salvia",  color: "#7a8b6e" },
  { key: "rose",  label: "Rosa",    color: "#9b7e7e" },
  { key: "slate", label: "Pizarra", color: "#7e869b" },
  { key: "sand",  label: "Arena",   color: "#9b8e7e" },
];

export default function ConfigPage() {
  const [palette, setPalette] = useState("sage");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [notifs, setNotifs] = useState({ turnos: true, recordatorios: true, pagos: false, resumen: true, marketing: false });

  return (
    <AppShell
      active="config"
      title="Configuración"
      subtitle="Preferencias de la aplicación"
      actions={
        <button className="flex items-center gap-1.5 text-white text-[13.5px] font-medium rounded-lg px-4 py-2 border-none cursor-pointer hover:opacity-90 transition-opacity shadow-sm" style={{ background: "var(--color-ink)" }}>Guardar</button>
      }
    >
      <div className="flex flex-col gap-5 max-w-[720px]">
        <div className="bg-surface border border-line rounded-lg shadow-sm p-5">
          <div className="font-semibold text-sm text-ink mb-5">Apariencia</div>
          <div className="mb-5">
            <label className="block text-[11px] font-semibold text-ink-2 mb-2 uppercase tracking-wider">Paleta de color</label>
            <div className="flex gap-3">
              {PALETTE_OPTIONS.map((p) => (
                <button key={p.key} onClick={() => setPalette(p.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all ${palette === p.key ? "bg-surface shadow-sm" : "bg-bg hover:bg-surface"}`} style={{ border: `2px solid ${palette === p.key ? p.color : "var(--color-line)"}` }}>
                  <span className="w-4 h-4 rounded-full shrink-0" style={{ background: p.color }} />
                  <span className="text-xs font-medium text-ink">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mb-5">
            <label className="block text-[11px] font-semibold text-ink-2 mb-2 uppercase tracking-wider">Tipografía</label>
            <select className="input"><option>Inter + DM Sans (predeterminada)</option><option>Geist</option><option>DM Sans</option></select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-ink-2 mb-2 uppercase tracking-wider">Densidad</label>
            <div className="seg">
              <button className={`seg-item${density === "comfortable" ? " active" : ""}`} onClick={() => setDensity("comfortable")}>Cómoda</button>
              <button className={`seg-item${density === "compact" ? " active" : ""}`} onClick={() => setDensity("compact")}>Compacta</button>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-line rounded-lg shadow-sm p-5">
          <div className="font-semibold text-sm text-ink mb-2">Notificaciones</div>
          <ToggleRow label="Nuevos turnos"        description="Notificación al recibir un turno nuevo"          checked={notifs.turnos}        onChange={(v) => setNotifs({ ...notifs, turnos: v })}        />
          <ToggleRow label="Recordatorios enviados" description="Confirmación cuando se envía un recordatorio"   checked={notifs.recordatorios} onChange={(v) => setNotifs({ ...notifs, recordatorios: v })} />
          <ToggleRow label="Pagos recibidos"       description="Alerta al registrar un pago"                    checked={notifs.pagos}         onChange={(v) => setNotifs({ ...notifs, pagos: v })}         />
          <ToggleRow label="Resumen diario"        description="Reporte de cierre de jornada por email"         checked={notifs.resumen}       onChange={(v) => setNotifs({ ...notifs, resumen: v })}       />
          <ToggleRow label="Emails de marketing"   description="Novedades y actualizaciones del producto"       checked={notifs.marketing}     onChange={(v) => setNotifs({ ...notifs, marketing: v })}     />
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
