"use client";

import { useState, useEffect, useRef } from "react";
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
    name: "", phone: "", address: "", instagram: "", website: "", whatsappPhone: "",
  });
  const [whatsappPhoneError, setWhatsappPhoneError] = useState("");
  const [depositRequired, setDepositRequired] = useState(false);
  const [depositPercent, setDepositPercent] = useState(30);
  const [urlCopied, setUrlCopied] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function validateWhatsappPhone(value: string): string {
    if (!value) return "";
    return /^\+\d{7,15}$/.test(value) ? "" : "Formato inválido. Usá el formato internacional: +54911234567";
  }

  // Inicializar form con datos del backend
  useEffect(() => {
    if (!business) return;
    setForm({
      name:          business.name          ?? "",
      phone:         business.phone         ?? "",
      address:       business.address       ?? "",
      instagram:     business.instagram     ?? "",
      website:       business.website       ?? "",
      whatsappPhone: business.whatsappPhone ?? "",
    });
    setDepositRequired(business.depositRequired ?? false);
    setDepositPercent(business.depositPercent ?? 30);
    if (business.logoUrl) setLogoPreview(business.logoUrl);
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

  async function handleSave() {
    const wpError = validateWhatsappPhone(form.whatsappPhone);
    if (wpError) {
      setWhatsappPhoneError(wpError);
      return;
    }

    let logoUrl: string | undefined = undefined;
    if (logoFile) {
      setLogoError("");
      const fd = new FormData();
      fd.append("file", logoFile);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const { error } = await res.json();
        setLogoError(error ?? "Error al subir el logo");
        return;
      }
      const data = await res.json();
      logoUrl = data.url;
    }

    updateBusiness.mutate({
      name:           form.name          || undefined,
      phone:          form.phone         || undefined,
      address:        form.address       || undefined,
      instagram:      form.instagram     || undefined,
      website:        form.website       || undefined,
      whatsappPhone:  form.whatsappPhone || null,
      depositRequired,
      depositPercent: depositRequired ? depositPercent : 0,
      ...(logoUrl ? { logoUrl } : {}),
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
            <div
              className="border-2 border-dashed border-line-2 rounded-lg p-6 text-center mb-5 cursor-pointer bg-bg hover:border-accent transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="h-16 w-auto mx-auto object-contain rounded mb-2" />
              ) : (
                <div className="text-3xl">🖼</div>
              )}
              <div className="text-xs text-ink-3 mt-2">{logoPreview ? "Cambiar logo" : "Subir logo del negocio"}</div>
              <div className="text-[11px] text-ink-3 mt-0.5">PNG, JPG — máx 2MB</div>
              {logoError && <div className="text-[11.5px] text-err mt-1">{logoError}</div>}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 2 * 1024 * 1024) {
                  setLogoError("El archivo supera el límite de 2MB");
                  return;
                }
                setLogoError("");
                setLogoFile(file);
                setLogoPreview(URL.createObjectURL(file));
              }}
            />
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

              <div>
                <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">
                  Número de WhatsApp del bot
                </label>
                <input
                  className={`input${whatsappPhoneError ? " border-err" : ""}`}
                  placeholder="+54911234567"
                  value={form.whatsappPhone}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm({ ...form, whatsappPhone: v });
                    setWhatsappPhoneError(validateWhatsappPhone(v));
                  }}
                />
                {whatsappPhoneError ? (
                  <p className="text-[11.5px] text-err mt-1">{whatsappPhoneError}</p>
                ) : (
                  <p className="text-[11.5px] text-ink-3 mt-1">
                    Este es el número que usará el bot para comunicarse con tus clientes.
                  </p>
                )}
              </div>
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
          {/* Reservas online */}
          <div className="bg-surface border border-line rounded-lg shadow-sm p-5">
            <div className="font-semibold text-sm text-ink mb-4">Reservas online</div>
            {business?.slug ? (
              <div className="mb-4">
                <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">Tu link de reservas</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 input text-xs text-ink-3 select-all truncate" style={{ userSelect: "all" }}>
                    {typeof window !== "undefined" ? window.location.origin : ""}/{business.slug}
                  </div>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/${business.slug}`;
                      navigator.clipboard.writeText(url);
                      setUrlCopied(true);
                      setTimeout(() => setUrlCopied(false), 2000);
                    }}
                    className="shrink-0 text-[11.5px] font-medium px-3 py-2 rounded-md border border-line hover:border-accent hover:text-accent transition-colors text-ink-2"
                  >
                    {urlCopied ? "¡Copiado!" : "Copiar"}
                  </button>
                </div>
                <p className="text-[11.5px] text-ink-3 mt-1.5">Compartí este link con tus clientes para que reserven online.</p>
              </div>
            ) : null}
            <div className="border-t border-line pt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[13px] font-medium text-ink">Requerir seña</div>
                  <div className="text-xs text-ink-3 mt-0.5">El cliente deberá abonar una seña para confirmar el turno</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={depositRequired} onChange={(e) => setDepositRequired(e.target.checked)} />
                  <span className="toggle-track" /><span className="toggle-thumb" />
                </label>
              </div>
              {depositRequired && (
                <div>
                  <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">Porcentaje de seña</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={5}
                      max={100}
                      step={5}
                      value={depositPercent}
                      onChange={(e) => setDepositPercent(Number(e.target.value))}
                      className="flex-1"
                      style={{ accentColor: "var(--color-accent)" }}
                    />
                    <span className="text-sm font-semibold text-ink w-10 text-right">{depositPercent}%</span>
                  </div>
                  <p className="text-[11.5px] text-ink-3 mt-1">Por ej. para un servicio de $5.000 la seña sería ${Math.round(5000 * depositPercent / 100).toLocaleString("es-AR")}</p>
                </div>
              )}
            </div>
          </div>

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
