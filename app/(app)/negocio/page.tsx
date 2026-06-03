"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import AppShell from "@/components/AppShell";
import Skeleton from "@/components/Skeleton";
import WhatsAppSetupModal from "@/components/WhatsAppSetupModal";
import { useSearchParams } from "next/navigation";
import { useGetBusiness, useUpdateBusiness, useGetHours, useUpdateHours, useMpConnect, useMpDisconnect, useSubmitWhatsappDeactivationRequest } from "@/hooks/useBusiness";
import { useBillingStatus, useCancelSubscription } from "@/hooks/useBilling";

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

function NegocioPageInner() {
  const searchParams    = useSearchParams();
  const { data: business, isLoading: bizLoading }    = useGetBusiness();
  const { data: hoursData, isLoading: hoursLoading } = useGetHours();
  const updateBusiness  = useUpdateBusiness();
  const updateHours     = useUpdateHours();
  const mpConnect       = useMpConnect();
  const mpDisconnect    = useMpDisconnect();

  const [schedule, setSchedule] = useState(defaultSchedule);
  const [form, setForm] = useState({
    name: "", phone: "", address: "", instagram: "", website: "", whatsappPhone: "",
  });
  const [whatsappPhoneError, setWhatsappPhoneError] = useState("");
  const [webDepositRequired, setWebDepositRequired] = useState(false);
  const [botDepositRequired, setBotDepositRequired] = useState(false);
  const [depositPercent, setDepositPercent]         = useState(30);
  const [urlCopied, setUrlCopied]         = useState(false);
  const [waModalOpen, setWaModalOpen]     = useState(false);
  const [deactOpen,   setDeactOpen]       = useState(false);
  const [deactName,   setDeactName]       = useState("");
  const [deactPhone,  setDeactPhone]      = useState("");
  const [deactNotes,  setDeactNotes]      = useState("");
  const deactivate = useSubmitWhatsappDeactivationRequest();
  const [logoFile, setLogoFile]     = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError]   = useState("");
  const [mpNotice, setMpNotice]       = useState<"connected" | "error" | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: billing } = useBillingStatus();
  const cancelPlan = useCancelSubscription();

  // Leer ?mp= param del callback OAuth
  useEffect(() => {
    const mp = searchParams.get("mp");
    if (mp === "connected" || mp === "error") {
      setMpNotice(mp);
      // Limpiar el param de la URL sin recargar
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams]);

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
    setWebDepositRequired(business.webDepositRequired ?? false);
    setBotDepositRequired(business.botDepositRequired ?? false);
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
      name:               form.name          || undefined,
      phone:              form.phone         || undefined,
      address:            form.address       || undefined,
      instagram:          form.instagram     || undefined,
      website:            form.website       || undefined,
      whatsappPhone:      form.whatsappPhone || null,
      webDepositRequired,
      botDepositRequired,
      depositPercent:     (webDepositRequired || botDepositRequired) ? depositPercent : 0,
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

  const isPro = business?.planId === 'pro' && business?.planStatus === 'active';

  return (
    <AppShell
      active="negocio"
      title="Mi negocio"
      subtitle="Información y configuración del estudio"
      actions={
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 bg-ink text-white text-[13.5px] font-medium rounded-lg px-4 py-2 border-none cursor-pointer hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60"
        >
          {isSaving ? "Guardando…" : "Guardar cambios"}
        </button>
      }
    >
      {(bizLoading || hoursLoading) ? (
        <div className="grid gap-5 grid-cols-1 lg:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col gap-5">
            <div className="bg-surface border border-line rounded-lg shadow-sm p-5 space-y-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-24 rounded-lg" />
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9" />)}
            </div>
            <div className="bg-surface border border-line rounded-lg shadow-sm p-5 space-y-3">
              <Skeleton className="h-5 w-32" />
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-9" />)}
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="bg-surface border border-line rounded-lg shadow-sm p-5 space-y-3">
              <Skeleton className="h-5 w-36" />
              {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
            </div>
          </div>
        </div>
      ) : (
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-[1.2fr_1fr]">
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
                    <div className={`w-20 sm:w-24 shrink-0 text-[13px] ${s.open ? "text-ink font-medium" : "text-ink-3"}`}>{label}</div>
                    <label className="toggle shrink-0">
                      <input type="checkbox" checked={s.open} onChange={() => toggleDay(key)} />
                      <span className="toggle-track" /><span className="toggle-thumb" />
                    </label>
                    {s.open ? (
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <input className="input flex-1 min-w-0" type="time" value={s.from} onChange={(e) => setSchedule((p) => ({ ...p, [key]: { ...p[key], from: e.target.value } }))} />
                        <span className="text-xs text-ink-3 shrink-0">a</span>
                        <input className="input flex-1 min-w-0" type="time" value={s.to} onChange={(e) => setSchedule((p) => ({ ...p, [key]: { ...p[key], to: e.target.value } }))} />
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
              <div>
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
          </div>

          {/* Pagos */}
          <div className="bg-surface border border-line rounded-lg shadow-sm p-5">
            <div className="font-semibold text-sm text-ink mb-4">Pagos y señas</div>

            {/* MercadoPago connection */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-line">
              <div className="flex items-start gap-3 flex-col">
                <img src="/mpLogo.png" alt="MercadoPago" style={{ height: 34, width: "auto", objectFit: "contain" }} />
                {business?.mpUserId ? (
                  <div className="text-xs text-ok">● Conectado (ID: {business.mpUserId})</div>
                ) : (
                  <div className="text-xs text-ink-3">No conectado — necesario para cobrar señas</div>
                )}
              </div>
              {business?.mpUserId ? (
                <button
                  onClick={() => mpDisconnect.mutate()}
                  disabled={mpDisconnect.isPending}
                  className="text-[11.5px] font-medium px-3 py-1.5 rounded-md border border-line hover:border-err hover:text-err transition-colors text-ink-2 disabled:opacity-50"
                >
                  {mpDisconnect.isPending ? "Desconectando…" : "Desconectar"}
                </button>
              ) : (
                <button
                  onClick={() => mpConnect.mutate()}
                  disabled={mpConnect.isPending}
                  className="text-[11.5px] font-medium px-3 py-1.5 rounded-md border-none text-white cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ background: "#009EE3" }}
                >
                  {mpConnect.isPending ? "Redirigiendo…" : "Conectar cuenta"}
                </button>
              )}
            </div>

            {/* Aviso del callback OAuth */}
            {mpNotice === "connected" && (
              <div className="mb-4 px-3 py-2 rounded-md text-[12.5px] text-ok bg-[#f0fdf4] border border-ok">
                ✓ MercadoPago conectado correctamente.
              </div>
            )}
            {mpNotice === "error" && (
              <div className="mb-4 px-3 py-2 rounded-md text-[12.5px] text-err bg-[#fef2f2] border border-err">
                ✗ No se pudo conectar MercadoPago. Intentá de nuevo.
              </div>
            )}

            {/* Toggles de seña */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-medium text-ink">Seña en reservas web</div>
                  <div className="text-xs text-ink-3 mt-0.5">El cliente paga al reservar desde tu link público</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={webDepositRequired} onChange={(e) => setWebDepositRequired(e.target.checked)} disabled={!business?.mpUserId} />
                  <span className="toggle-track" /><span className="toggle-thumb" />
                </label>
              </div>
              {isPro && (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-medium text-ink">Seña en reservas por bot</div>
                    <div className="text-xs text-ink-3 mt-0.5">El chatbot solicita el pago antes de confirmar</div>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={botDepositRequired} onChange={(e) => setBotDepositRequired(e.target.checked)} disabled={!business?.mpUserId} />
                    <span className="toggle-track" /><span className="toggle-thumb" />
                  </label>
                </div>
              )}
            </div>

            {/* Porcentaje de seña */}
            {(webDepositRequired || botDepositRequired) && (
              <div className="mt-4 pt-4 border-t border-line">
                <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">Porcentaje de seña</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min={5} max={100} step={5}
                    value={depositPercent}
                    onChange={(e) => setDepositPercent(Number(e.target.value))}
                    className="flex-1 accent-accent"
                  />
                  <span className="text-sm font-semibold text-ink w-10 text-right">{depositPercent}%</span>
                </div>
                <p className="text-[11.5px] text-ink-3 mt-1">
                  Por ej. para un servicio de $5.000 la seña sería ${Math.round(5000 * depositPercent / 100).toLocaleString("es-AR")}
                </p>
              </div>
            )}

            {!business?.mpUserId && (
              <p className="text-[11.5px] text-ink-3 mt-3">
                Conectá tu cuenta de MercadoPago para habilitar el cobro de señas.
              </p>
            )}
          </div>

          {isPro && (
            <div className="bg-surface border border-line rounded-lg shadow-sm p-5">
              <div className="font-semibold text-sm text-ink mb-1.5">Bot de WhatsApp</div>

              {/* ── State 3: bot activo ── */}
              {business?.whatsappBotActive ? (
                business?.whatsappDeactivationRequestedAt ? (
                  <div className="flex items-center gap-2 justify-center py-2.5 rounded-lg bg-[#fff8ed] border border-[#f5a623] text-[#7a4f00] text-[13px] font-medium">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    Baja solicitada — te contactamos pronto
                  </div>
                ) : deactOpen ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-[12.5px] text-ink-3">
                      Completá tus datos para coordinar la baja del bot.
                    </p>
                    <div>
                      <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">Tu nombre</label>
                      <input className="input" placeholder="María García" value={deactName} onChange={(e) => setDeactName(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">Teléfono o email</label>
                      <input className="input" placeholder="+54911234567 o tu@email.com" value={deactPhone} onChange={(e) => setDeactPhone(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">
                        Notas <span className="normal-case text-ink-3 font-normal">(opcional)</span>
                      </label>
                      <textarea
                        className="input resize-none"
                        rows={2}
                        placeholder="Motivo u observaciones..."
                        value={deactNotes}
                        onChange={(e) => setDeactNotes(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => { setDeactOpen(false); setDeactName(""); setDeactPhone(""); setDeactNotes(""); }}
                        className="flex-1 text-[13px] text-ink-2 py-2 rounded-lg border border-line hover:border-ink-3 transition-colors bg-transparent cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          if (!deactName.trim() || !deactPhone.trim()) return;
                          deactivate.mutate(
                            { contactName: deactName.trim(), contactPhone: deactPhone.trim(), notes: deactNotes.trim() || undefined },
                            { onSuccess: () => setDeactOpen(false) }
                          );
                        }}
                        disabled={!deactName.trim() || !deactPhone.trim() || deactivate.isPending}
                        className="flex-1 text-[13px] font-medium py-2 rounded-lg border-none text-white cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: "var(--color-err)" }}
                      >
                        {deactivate.isPending ? "Enviando…" : "Confirmar baja"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-[#f0fdf4] border border-ok mb-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "#25D366" }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="white" stroke="none">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-semibold text-ink">Bot activo</div>
                        <div className="text-[12px] text-ink-3 truncate">{business.whatsappPhone || "Número configurado"}</div>
                      </div>
                      <div className="flex items-center gap-1 text-ok text-[12.5px] font-medium shrink-0">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        Activo
                      </div>
                    </div>
                    <button
                      onClick={() => setDeactOpen(true)}
                      className="w-full text-[12.5px] font-medium py-2 rounded-lg border border-line hover:border-err hover:text-err transition-colors text-ink-3 bg-transparent cursor-pointer"
                    >
                      Solicitar baja del bot
                    </button>
                  </>
                )
              ) : business?.whatsappRequestedAt ? (
                /* ── State 2: solicitado ── */
                <>
                  <div className="text-[12.5px] text-ink-3 mb-4">
                    Conectá un número de WhatsApp para que el bot gestione turnos automáticamente con tus clientes.
                  </div>
                  <div className="flex items-center gap-2 justify-center py-2.5 rounded-lg bg-[#f0fdf4] border border-ok text-ok text-[13px] font-medium">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    Solicitud enviada — te contactamos pronto
                  </div>
                </>
              ) : (
                /* ── State 1: sin solicitud ── */
                <>
                  <div className="text-[12.5px] text-ink-3 mb-4">
                    Conectá un número de WhatsApp para que el bot gestione turnos automáticamente con tus clientes.
                  </div>
                  <button
                    onClick={() => setWaModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 text-[13px] font-medium rounded-lg px-4 py-2.5 border-none text-white cursor-pointer transition-all active:scale-[0.98]"
                    style={{ background: "#25D366" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#1db954")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#25D366")}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.4 8.4 0 0 1-1.2 4.4L21 21l-5.2-1.2a8.4 8.4 0 1 1 5.4-8.3zM8 9a1 1 0 0 1 1-1h.5l1 2.5-1 1a6 6 0 0 0 3 3l1-1L16 14.5V15a1 1 0 0 1-1 1c-3.9 0-7-3.1-7-7z"/>
                    </svg>
                    Habilitar número de WhatsApp
                  </button>
                </>
              )}
            </div>
          )}

          {/* Plan y suscripción */}
          {billing && (
            <div className="bg-surface border border-line rounded-lg shadow-sm p-5">
              <div className="font-semibold text-sm text-ink mb-3">Plan y suscripción</div>

              {billing.planStatus === "cancelled" ? (
                <div className="flex items-center gap-2 py-2.5 px-3 rounded-lg bg-[#fef2f2] border border-err text-err text-[13px] font-medium">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
                  </svg>
                  Plan cancelado
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[14px] font-semibold text-ink">{billing.planName ?? "Plan activo"}</div>
                      <div className="text-[12px] text-ok mt-0.5">● Activo</div>
                    </div>
                    {billing.subscriptionExpiresAt && (
                      <div className="text-right">
                        <div className="text-[11px] text-ink-3">Próximo cobro</div>
                        <div className="text-[12.5px] font-medium text-ink">
                          {new Date(billing.subscriptionExpiresAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                    )}
                  </div>

                  {cancelConfirm ? (
                    <div className="flex flex-col gap-3">
                      <div className="px-3 py-2.5 rounded-lg bg-[#fef2f2] border border-err text-[12.5px] text-ink leading-snug">
                        <span className="font-semibold text-err">¿Confirmás la baja?</span> Tu plan quedará cancelado de inmediato y perderás el acceso al finalizar el período actual.
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setCancelConfirm(false); cancelPlan.reset(); }}
                          className="flex-1 text-[13px] text-ink-2 py-2 rounded-lg border border-line hover:border-ink-3 transition-colors bg-transparent cursor-pointer"
                        >
                          Cancelar
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
                      className="w-full text-[12.5px] font-medium py-2 rounded-lg border border-line hover:border-err hover:text-err transition-colors text-ink-3 bg-transparent cursor-pointer"
                    >
                      Dar de baja el plan
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          <div className="bg-surface border border-line rounded-lg shadow-sm p-5">
            <div className="font-semibold text-sm text-ink mb-3">Links rápidos</div>
            {[{ label: "Instagram", val: form.instagram, icon: "📸" }, { label: "Sitio web", val: form.website, icon: "🌐" }].map((l) => (
              <div key={l.label} className="flex items-center gap-3 py-3 border-b border-line last:border-b-0">
                <span className="text-lg">{l.icon}</span>
                <div>
                  <div className="text-[11px] text-ink-3">{l.label}</div>
                  <div className="text-[13px] font-medium text-accent">{l.val || "—"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}
      <WhatsAppSetupModal open={waModalOpen} onClose={() => setWaModalOpen(false)} />
    </AppShell>
  );
}

export default function NegocioPage() {
  return (
    <Suspense>
      <NegocioPageInner />
    </Suspense>
  );
}
