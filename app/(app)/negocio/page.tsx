"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { useGetBusiness, useUpdateBusiness, useGetHours, useUpdateHours } from "@/hooks/useBusiness";

const DAYS = [
  { key: "lun", label: "Lunes",     dayOfWeek: 1 },
  { key: "mar", label: "Martes",    dayOfWeek: 2 },
  { key: "mie", label: "Miércoles", dayOfWeek: 3 },
  { key: "jue", label: "Jueves",    dayOfWeek: 4 },
  { key: "vie", label: "Viernes",   dayOfWeek: 5 },
  { key: "sab", label: "Sábado",    dayOfWeek: 6 },
  { key: "dom", label: "Domingo",   dayOfWeek: 0 },
];

type DaySchedule = { open: boolean; from: string; to: string };

const defaultSchedule: Record<string, DaySchedule> = {
  lun: { open: true,  from: "09:00", to: "18:00" },
  mar: { open: true,  from: "09:00", to: "18:00" },
  mie: { open: true,  from: "09:00", to: "18:00" },
  jue: { open: true,  from: "09:00", to: "18:00" },
  vie: { open: true,  from: "09:00", to: "18:00" },
  sab: { open: true,  from: "09:00", to: "14:00" },
  dom: { open: false, from: "10:00", to: "14:00" },
};

export default function NegocioPage() {
  const { data: business }  = useGetBusiness();
  const { data: hoursData } = useGetHours();
  const updateBusiness      = useUpdateBusiness();
  const updateHours         = useUpdateHours();

  const [schedule, setSchedule] = useState(defaultSchedule);
  const [form, setForm] = useState({
    name: "", phone: "", address: "", instagram: "", website: "",
  });

  // Inicializar form con datos del backend
  useEffect(() => {
    if (!business) return;
    setForm({
      name:      business.name       ?? "",
      phone:     business.phone      ?? "",
      address:   business.address    ?? "",
      instagram: business.instagram  ?? "",
      website:   business.website    ?? "",
    });
  }, [business]);

  // Inicializar horarios con datos del backend
  useEffect(() => {
    if (!hoursData) return;
    const next = { ...defaultSchedule };
    for (const h of hoursData) {
      const day = DAYS.find((d) => d.dayOfWeek === h.dayOfWeek);
      if (day) next[day.key] = { open: h.open, from: h.fromTime, to: h.toTime };
    }
    setSchedule(next);
  }, [hoursData]);

  function toggleDay(key: string) {
    setSchedule((p) => ({ ...p, [key]: { ...p[key], open: !p[key].open } }));
  }

  function handleSave() {
    updateBusiness.mutate({
      name:      form.name      || undefined,
      phone:     form.phone     || undefined,
      address:   form.address   || undefined,
      instagram: form.instagram || undefined,
      website:   form.website   || undefined,
    });
    updateHours.mutate(
      DAYS.map(({ key, dayOfWeek }) => ({
        dayOfWeek,
        open:     schedule[key].open,
        fromTime: schedule[key].from,
        toTime:   schedule[key].to,
      }))
    );
  }

  const isSaving = updateBusiness.isPending || updateHours.isPending;

  const botSample = `Hola! Soy el asistente de ${form.name || "tu estudio"} 🌿\nPara reservar escribí TURNO, o indicame:\n• Tu nombre\n• El servicio que buscás\n• Día y horario preferido\n\nHorario: Lun–Vie 9–18 · Sáb 9–14`;

  return (
    <AppShell
      active="negocio"
      title="Mi negocio"
      subtitle="Información y configuración del estudio"
      actions={
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 text-white text-[13.5px] font-medium rounded-lg px-4 py-2 border-none cursor-pointer hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60"
          style={{ background: "var(--color-ink)" }}
        >
          {isSaving ? "Guardando…" : "Guardar cambios"}
        </button>
      }
    >
      <div className="grid gap-5" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
        <div className="flex flex-col gap-5">
          <div className="bg-surface border border-line rounded-lg shadow-sm p-5">
            <div className="font-semibold text-sm text-ink mb-4">Datos del negocio</div>
            <div className="border-2 border-dashed border-line-2 rounded-lg p-6 text-center mb-5 cursor-pointer bg-bg hover:border-accent transition-colors">
              <div className="text-3xl">🖼</div>
              <div className="text-xs text-ink-3 mt-2">Subir logo del negocio</div>
              <div className="text-[11px] text-ink-3 mt-0.5">PNG, JPG — máx 2MB</div>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { key: "name",      label: "Nombre del negocio", placeholder: "Aesthetic Studio"       },
                { key: "phone",     label: "Teléfono",           placeholder: "+54 9 11 0000-0000"     },
                { key: "address",   label: "Dirección",          placeholder: "Calle y número, ciudad" },
                { key: "instagram", label: "Instagram",          placeholder: "@tunegocio"              },
                { key: "website",   label: "Sitio web",          placeholder: "tunegocio.com"           },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">{f.label}</label>
                  <input
                    className="input"
                    placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-line rounded-lg shadow-sm p-5">
            <div className="font-semibold text-sm text-ink mb-4">Horario de atención</div>
            <div className="flex flex-col gap-3">
              {DAYS.map(({ key, label }) => {
                const s = schedule[key];
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className={`w-24 text-[13px] ${s.open ? "text-ink font-medium" : "text-ink-3"}`}>{label}</div>
                    <label className="toggle">
                      <input type="checkbox" checked={s.open} onChange={() => toggleDay(key)} />
                      <span className="toggle-track" /><span className="toggle-thumb" />
                    </label>
                    {s.open ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input className="input" type="time" value={s.from} style={{ width: "6.875rem" }} onChange={(e) => setSchedule((p) => ({ ...p, [key]: { ...p[key], from: e.target.value } }))} />
                        <span className="text-xs text-ink-3">a</span>
                        <input className="input" type="time" value={s.to}   style={{ width: "6.875rem" }} onChange={(e) => setSchedule((p) => ({ ...p, [key]: { ...p[key], to: e.target.value } }))} />
                      </div>
                    ) : <span className="text-xs text-ink-3">Cerrado</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="bg-surface border border-line rounded-lg shadow-sm p-5">
            <div className="font-semibold text-sm text-ink mb-4">Vista previa del bot</div>
            <div className="bg-bg rounded-md p-4 border border-line">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-line">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0" style={{ background: "var(--color-accent)" }}>a</div>
                <div>
                  <div className="text-xs font-semibold text-ink">aesthetic. bot</div>
                  <div className="text-[10px] text-ok">En línea</div>
                </div>
              </div>
              <div className="bg-surface rounded-md p-3 border border-line-2 text-xs text-ink-2 leading-relaxed whitespace-pre-line">{botSample}</div>
            </div>
          </div>

          <div className="bg-surface border border-line rounded-lg shadow-sm p-5">
            <div className="font-semibold text-sm text-ink mb-4">Ubicación</div>
            <div className="h-44 rounded-md border border-line flex items-center justify-center text-[13px] text-ink-3" style={{ background: "linear-gradient(135deg, var(--color-bg-2) 0%, var(--color-line) 100%)" }}>
              🗺 Mapa — {form.address || "Ingresá tu dirección"}
            </div>
          </div>

          <div className="bg-surface border border-line rounded-lg shadow-sm p-5">
            <div className="font-semibold text-sm text-ink mb-3">Links rápidos</div>
            {[{ label: "Instagram", val: form.instagram, icon: "📸" }, { label: "Sitio web", val: form.website, icon: "🌐" }].map((l) => (
              <div key={l.label} className="flex items-center gap-3 py-3 border-b border-line last:border-b-0">
                <span className="text-lg">{l.icon}</span>
                <div>
                  <div className="text-[11px] text-ink-3">{l.label}</div>
                  <div className="text-[13px] font-medium" style={{ color: "var(--color-accent)" }}>{l.val || "—"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
