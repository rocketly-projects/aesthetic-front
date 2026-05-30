"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSubmitWhatsappRequest } from "@/hooks/useBusiness";

interface Props {
  open: boolean;
  onClose: () => void;
}

type RequestType = "new" | "existing" | null;
type Step = 1 | 2 | 3;

function validatePhone(v: string) {
  return /^\+\d{7,15}$/.test(v.trim());
}

export default function WhatsAppSetupModal({ open, onClose }: Props) {
  const submit = useSubmitWhatsappRequest();

  const [step,         setStep]         = useState<Step>(1);
  const [requestType,  setRequestType]  = useState<RequestType>(null);
  const [phone,        setPhone]        = useState("");
  const [phoneErr,     setPhoneErr]     = useState("");
  const [contactName,  setContactName]  = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes,        setNotes]        = useState("");
  const [confirmed,    setConfirmed]    = useState(false);

  function resetAndClose() {
    setStep(1);
    setRequestType(null);
    setPhone("");
    setPhoneErr("");
    setContactName("");
    setContactPhone("");
    setNotes("");
    setConfirmed(false);
    onClose();
  }

  function handleNext() {
    if (step === 1) {
      if (!requestType) return;
      setStep(2);
      return;
    }
    if (step === 2) {
      // Validaciones
      if (requestType === "existing") {
        if (!validatePhone(phone)) { setPhoneErr("Formato inválido. Usá +549..."); return; }
        if (!confirmed) return;
      }
      if (!contactName.trim() || !contactPhone.trim()) return;

      submit.mutate(
        {
          type: requestType!,
          ...(requestType === "existing" ? { phone: phone.trim() } : {}),
          contactName:  contactName.trim(),
          contactPhone: contactPhone.trim(),
          notes:        notes.trim() || undefined,
        },
        { onSuccess: () => setStep(3) }
      );
    }
  }

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) resetAndClose(); }}
    >
      <div className="bg-surface border border-line rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <div>
            <div className="text-[14px] font-semibold text-ink">Habilitar WhatsApp</div>
            <div className="text-[11px] text-ink-3 mt-0.5">
              {step === 1 ? "Paso 1 de 2 · Tipo de número" : step === 2 ? "Paso 2 de 2 · Datos de contacto" : "¡Listo!"}
            </div>
          </div>
          <button onClick={resetAndClose} className="bg-transparent border-none cursor-pointer text-ink-3 hover:text-ink transition-colors p-1 rounded-md hover:bg-bg-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Step indicator */}
        {step < 3 && (
          <div className="flex gap-1.5 px-6 pt-4">
            {([1, 2] as const).map((s) => (
              <div key={s} className={`h-1 rounded-full flex-1 transition-colors ${step >= s ? "bg-accent" : "bg-bg-2"}`} />
            ))}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">
          {/* ── Step 1: elegir tipo ── */}
          {step === 1 && (
            <div className="flex flex-col gap-3">
              <p className="text-[13px] text-ink-3 mb-1">
                ¿Cómo querés configurar tu número de WhatsApp?
              </p>
              {[
                {
                  id:    "new" as const,
                  title: "Número nuevo",
                  desc:  "No tenés un número dedicado. Te conseguimos uno para el bot.",
                  icon:  (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                      <path d="M19 3v4M17 5h4"/>
                    </svg>
                  ),
                },
                {
                  id:    "existing" as const,
                  title: "Número existente",
                  desc:  "Ya tenés un número de WhatsApp y querés conectarlo al bot.",
                  icon:  (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                      <path d="M15 3l4 4-4 4M19 7H9"/>
                    </svg>
                  ),
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setRequestType(opt.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all cursor-pointer bg-transparent w-full ${
                    requestType === opt.id
                      ? "border-accent bg-accent-pale"
                      : "border-line hover:border-ink-3"
                  }`}
                >
                  <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                    requestType === opt.id ? "bg-accent text-white" : "bg-bg-2 text-ink-3"
                  }`}>
                    {opt.icon}
                  </div>
                  <div>
                    <div className="text-[13.5px] font-semibold text-ink mb-0.5">{opt.title}</div>
                    <div className="text-[12px] text-ink-3">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── Step 2: datos ── */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              {requestType === "existing" && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">
                      Número a migrar
                    </label>
                    <input
                      className={`input${phoneErr ? " border-err" : ""}`}
                      placeholder="+54911234567"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setPhoneErr(""); }}
                    />
                    {phoneErr
                      ? <p className="text-[11.5px] text-err mt-1">{phoneErr}</p>
                      : <p className="text-[11.5px] text-ink-3 mt-1">Formato internacional: +549...</p>
                    }
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-[#fff8ed] border border-[#f5a623]">
                    <svg className="shrink-0 mt-0.5 text-[#f5a623]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <p className="text-[11.5px] text-[#7a4f00] leading-relaxed">
                      Al migrar este número a WhatsApp Business API <strong>pierde acceso a WhatsApp personal y a la app de WhatsApp Business.</strong> Solo podrá usarse a través del bot.
                    </p>
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      style={{ accentColor: "var(--color-accent)" }}
                    />
                    <span className="text-[12.5px] text-ink">Entiendo y acepto esta condición</span>
                  </label>
                </>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">
                  Tu nombre
                </label>
                <input
                  className="input"
                  placeholder="María García"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">
                  Teléfono o email de contacto
                </label>
                <input
                  className="input"
                  placeholder="+54911234567 o tu@email.com"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
                <p className="text-[11.5px] text-ink-3 mt-1">Te contactamos por este medio para coordinar la activación.</p>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">
                  Notas <span className="normal-case text-ink-3 font-normal">(opcional)</span>
                </label>
                <textarea
                  className="input resize-none"
                  rows={2}
                  placeholder="Ej: prefiero un número argentino, o cualquier detalle relevante..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ── Step 3: éxito ── */}
          {step === 3 && (
            <div className="flex flex-col items-center text-center py-4 gap-4">
              <div className="w-14 h-14 rounded-full bg-[#f0fdf4] flex items-center justify-center">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-ok)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <div>
                <div className="text-[15px] font-semibold text-ink mb-1.5">Solicitud enviada</div>
                <p className="text-[13px] text-ink-3 max-w-xs">
                  Te contactamos en las próximas <strong className="text-ink">48 horas</strong> para coordinar la activación de tu número de WhatsApp.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-line">
          {step === 3 ? (
            <button
              onClick={resetAndClose}
              className="bg-ink text-white text-[13px] font-medium rounded-lg px-4 py-2 border-none cursor-pointer hover:opacity-90 transition-opacity"
            >
              Cerrar
            </button>
          ) : (
            <>
              {step === 2 && (
                <button
                  onClick={() => setStep(1)}
                  className="text-[13px] text-ink-2 px-4 py-2 rounded-lg border border-line hover:border-ink-3 transition-colors bg-transparent cursor-pointer"
                >
                  Atrás
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={
                  (step === 1 && !requestType) ||
                  (step === 2 && (!contactName.trim() || !contactPhone.trim() || (requestType === "existing" && (!phone.trim() || !confirmed)))) ||
                  submit.isPending
                }
                className="bg-ink text-white text-[13px] font-medium rounded-lg px-4 py-2 border-none cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {step === 2 && submit.isPending ? "Enviando…" : step === 1 ? "Continuar" : "Enviar solicitud"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
