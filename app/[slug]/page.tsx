"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  usePublicBusiness,
  usePublicServices,
  usePublicAvailability,
  useCreatePublicAppointment,
} from "@/hooks/usePublicBooking";
import type { PublicService, BookingResult } from "@/lib/api/public";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const DAYS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];
const MONTHS = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

// ── Global CSS ────────────────────────────────────────────────────────────────

const CSS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes successBounce {
    0%   { opacity: 0; transform: scale(0.55); }
    60%  { transform: scale(1.12); }
    80%  { transform: scale(0.96); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes checkDraw {
    to { stroke-dashoffset: 0; }
  }
  @keyframes dotPulse {
    0%, 100% { opacity: 0.3; transform: scale(0.7); }
    50%       { opacity: 1;   transform: scale(1); }
  }

  .step-in { animation: fadeUp 0.32s cubic-bezier(0.22, 0.61, 0.36, 1) both; }

  .success-ring { animation: successBounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.05s both; }
  .check-path   {
    stroke-dasharray: 52;
    stroke-dashoffset: 52;
    animation: checkDraw 0.38s ease 0.42s forwards;
  }

  .svc-row { transition: background 0.16s ease; }
  .svc-row:hover { background: #f7f8f4 !important; }
  .svc-row:active { background: #f0f1ec !important; }

  .cal-cell {
    position: relative;
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; margin: auto;
    border-radius: 50%; font-size: 13.5px;
    cursor: pointer; user-select: none;
    transition: background 0.14s ease, color 0.14s ease;
    color: var(--color-ink);
    border: none; background: none;
  }
  .cal-cell:hover:not(.cal-off) { background: var(--color-bg-2); }
  .cal-cell.cal-on  { background: var(--color-accent); color: white; font-weight: 600; }
  .cal-cell.cal-off { opacity: 0.2; cursor: default; }
  .cal-dot {
    position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%);
    width: 3px; height: 3px; border-radius: 50%;
    background: var(--color-accent);
  }

  .slot-pill {
    padding: 11px 6px; border-radius: 10px;
    font-size: 13.5px; font-weight: 500;
    cursor: pointer; transition: all 0.16s ease;
    border: 1.5px solid var(--color-line);
    background: white; color: var(--color-ink);
    font-family: var(--font-mono);
  }
  .slot-pill:hover:not(.slot-on) {
    border-color: var(--color-accent-soft);
    color: var(--color-accent-ink);
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(122,139,110,.14);
  }
  .slot-pill.slot-on {
    background: var(--color-accent);
    border-color: var(--color-accent);
    color: white;
  }

  .atelier-input {
    width: 100%; padding: 14px 0 10px;
    background: transparent; border: none;
    border-bottom: 1px solid var(--color-line);
    font-size: 15px; color: var(--color-ink);
    font-family: var(--font-sans); outline: none;
    transition: border-color 0.2s;
  }
  .atelier-input:focus { border-bottom-color: var(--color-accent); }
  .atelier-input::placeholder { color: var(--color-line); }

  .confirm-btn {
    width: 100%; padding: 15px 24px;
    background: var(--color-ink); color: white;
    border: none; border-radius: 12px;
    font-size: 14px; font-weight: 600; letter-spacing: 0.01em;
    font-family: var(--font-display);
    cursor: pointer; transition: background 0.22s ease, transform 0.15s ease;
  }
  .confirm-btn:hover:not(:disabled) {
    background: var(--color-accent);
    transform: translateY(-1px);
  }
  .confirm-btn:active:not(:disabled) { transform: translateY(0); }
  .confirm-btn:disabled { background: var(--color-line); cursor: not-allowed; }

  .back-btn {
    display: inline-flex; align-items: center; gap: 5px;
    background: none; border: none; cursor: pointer; padding: 0 0 24px;
    font-size: 12.5px; color: var(--color-ink-3);
    transition: color 0.15s; font-family: var(--font-sans);
  }
  .back-btn:hover { color: var(--color-ink); }

  .booking-page {
    background-color: var(--color-bg);
    background-image: radial-gradient(var(--color-line-2) 1px, transparent 1px);
    background-size: 22px 22px;
  }
`;

// ── Sub-components ────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  const pct = Math.round(((step + 1) / 5) * 100);
  return (
    <div style={{ height: 2, background: "var(--color-line-2)" }}>
      <div style={{
        height: "100%", background: "var(--color-accent)",
        width: `${pct}%`,
        transition: "width 0.45s cubic-bezier(0.4,0,0.2,1)",
      }} />
    </div>
  );
}

function BackBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button className="back-btn" onClick={onClick}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {label}
    </button>
  );
}

function Chips({ service, date, time }: {
  service?: PublicService | null;
  date?: string | null;
  time?: string | null;
}) {
  if (!service && !date) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 22 }}>
      {service && (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 11px", borderRadius: 100,
          background: "rgba(255,255,255,0.8)", border: "1px solid var(--color-line)",
          fontSize: 12, color: "var(--color-ink-2)",
          backdropFilter: "blur(4px)",
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: service.color, flexShrink: 0 }} />
          {service.name}
        </span>
      )}
      {date && (
        <span style={{
          display: "inline-flex", alignItems: "center",
          padding: "4px 11px", borderRadius: 100,
          background: "rgba(255,255,255,0.8)", border: "1px solid var(--color-line)",
          fontSize: 12, color: "var(--color-ink-2)", textTransform: "capitalize",
          backdropFilter: "blur(4px)",
        }}>
          {formatDate(date)}
        </span>
      )}
      {time && (
        <span style={{
          display: "inline-flex", alignItems: "center",
          padding: "4px 11px", borderRadius: 100,
          background: "var(--color-accent-pale)", border: "1px solid var(--color-accent-soft)",
          fontSize: 12, fontWeight: 700, color: "var(--color-accent-ink)",
          fontFamily: "var(--font-mono)",
        }}>
          {time}
        </span>
      )}
    </div>
  );
}

function StepHeading({ title, sub }: { title: string; sub: string }) {
  return (
    <>
      <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 700, color: "var(--color-ink)", fontFamily: "var(--font-display)", lineHeight: 1.2 }}>
        {title}
      </h2>
      <p style={{ margin: "0 0 28px", fontSize: 13, color: "var(--color-ink-3)", lineHeight: 1.6 }}>
        {sub}
      </p>
    </>
  );
}

function ReceiptRow({ label, value, mono, bold }: { label: string; value: React.ReactNode; mono?: boolean; bold?: boolean }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      gap: 16, padding: "9px 0", borderBottom: "1px solid var(--color-line-2)"
    }}>
      <span style={{ fontSize: 12, color: "var(--color-ink-3)", whiteSpace: "nowrap" }}>{label}</span>
      <span style={{
        fontSize: 13, color: "var(--color-ink)", textAlign: "right",
        fontWeight: bold ? 700 : 500,
        fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
      }}>
        {value}
      </span>
    </div>
  );
}

// ── Calendar ──────────────────────────────────────────────────────────────────

function Calendar({ openDays, selected, onSelect }: {
  openDays: Set<number>;
  selected: string | null;
  onSelect: (date: string) => void;
}) {
  const today = new Date();
  const [yr, setYr] = useState(today.getFullYear());
  const [mo, setMo] = useState(today.getMonth());

  const firstDay = new Date(yr, mo, 1).getDay();
  const daysInMonth = new Date(yr, mo + 1, 0).getDate();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  function prev() { mo === 0 ? (setYr(y => y - 1), setMo(11)) : setMo(m => m - 1); }
  function next() { mo === 11 ? (setYr(y => y + 1), setMo(0)) : setMo(m => m + 1); }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <NavArrow onClick={prev} dir="left" />
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>
          {MONTHS[mo]} {yr}
        </span>
        <NavArrow onClick={next} dir="right" />
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "var(--color-ink-3)", letterSpacing: "0.04em", paddingBottom: 6 }}>
            {d}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px 0" }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = `${yr}-${String(mo + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dow = new Date(yr, mo, day).getDay();
          const disabled = dateStr < todayStr || !openDays.has(dow);
          const isOn = dateStr === selected;
          const isToday = dateStr === todayStr;

          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => onSelect(dateStr)}
              className={`cal-cell${isOn ? " cal-on" : ""}${disabled ? " cal-off" : ""}`}
            >
              {day}
              {isToday && !isOn && <span className="cal-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NavArrow({ onClick, dir }: { onClick: () => void; dir: "left" | "right" }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 32, height: 32, border: "none", cursor: "pointer", borderRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: hov ? "var(--color-bg-2)" : "transparent",
        transition: "background 0.14s", color: "var(--color-ink-3)",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        {dir === "left"
          ? <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          : <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        }
      </svg>
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PublicBookingPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";

  const { data: bizData, isLoading: loadingBiz, error: bizError } = usePublicBusiness(slug);
  const { data: services = [], isLoading: loadingSvcs } = usePublicServices(slug);

  const [step, setStep]         = useState(0);
  const [svc, setSvc]           = useState<PublicService | null>(null);
  const [date, setDate]         = useState<string | null>(null);
  const [time, setTime]         = useState<string | null>(null);
  const [form, setForm]         = useState({ name: "", phone: "", email: "" });
  const [result, setResult]     = useState<BookingResult | null>(null);

  const { data: slots = [], isLoading: loadingSlots } = usePublicAvailability(slug, date ?? "", svc?.id ?? "");
  const createAppt = useCreatePublicAppointment(slug);

  const business = bizData?.business;
  const openDays = new Set((bizData?.hours ?? []).filter(h => h.open).map(h => h.dayOfWeek));

  async function handleConfirm() {
    if (!svc || !date || !time) return;
    const res = await createAppt.mutateAsync({
      serviceId: svc.id, date, time,
      clientName: form.name, clientPhone: form.phone,
      clientEmail: form.email || undefined,
    });
    setResult(res);
    // Si requiere seña y MP está listo, redirigir al checkout
    if (res.deposit.required && res.deposit.initPoint) {
      window.location.href = res.deposit.initPoint;
      return;
    }
    setStep(5);
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loadingBiz) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--color-accent)", animation: `dotPulse 1.1s ease ${i * 0.18}s infinite` }} />
          ))}
        </div>
      </div>
    );
  }

  if (bizError || !business) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 14, color: "var(--color-line)" }}>✦</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>Negocio no encontrado</div>
          <div style={{ fontSize: 13, color: "var(--color-ink-3)", marginTop: 6 }}>La URL que ingresaste no existe.</div>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const STEP_NAMES = ["Servicio","Fecha","Horario","Datos","Confirmar"];

  return (
    <>
      <style>{CSS}</style>
      <div className="booking-page" style={{ minHeight: "100vh" }}>

        {/* Progress */}
        {step < 5 && <ProgressBar step={step} />}

        {/* Header */}
        <div style={{ background: "rgba(255,255,255,0.85)", borderBottom: "1px solid var(--color-line)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ maxWidth: 500, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", gap: 13 }}>
            {business.logoUrl ? (
              <img src={business.logoUrl} alt={business.name}
                style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "1.5px solid var(--color-line)", flexShrink: 0 }} />
            ) : (
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "var(--color-accent-pale)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--color-accent)", fontWeight: 800, fontSize: 16,
                flexShrink: 0, fontFamily: "var(--font-display)",
              }}>
                {business.name[0].toUpperCase()}
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-ink)", fontFamily: "var(--font-display)", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {business.name}
              </div>
              {business.address && (
                <div style={{ fontSize: 11.5, color: "var(--color-ink-3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {business.address}
                </div>
              )}
            </div>

            {step < 5 && (
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <div style={{ fontSize: 11.5, color: "var(--color-accent)", fontWeight: 700 }}>{STEP_NAMES[step]}</div>
                <div style={{ fontSize: 10.5, color: "var(--color-ink-3)", marginTop: 1 }}>{step + 1} de 5</div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 500, margin: "0 auto", padding: "36px 24px 100px" }}>

          {/* ── PASO 0: Servicios ── */}
          {step === 0 && (
            <div className="step-in">
              <StepHeading
                title="¿Qué servicio necesitás?"
                sub="Seleccioná el servicio para continuar."
              />

              {loadingSvcs ? (
                <div style={{ fontSize: 13, color: "var(--color-ink-3)" }}>Cargando...</div>
              ) : services.length === 0 ? (
                <div style={{ background: "white", border: "1px solid var(--color-line)", borderRadius: 14, padding: "44px 24px", textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: "var(--color-ink-3)", margin: 0 }}>
                    Aún no hay servicios disponibles.
                  </p>
                </div>
              ) : (
                <div style={{ background: "white", border: "1px solid var(--color-line)", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(39,42,37,.05)" }}>
                  {services.map((s, i) => (
                    <button
                      key={s.id}
                      className="svc-row"
                      onClick={() => { setSvc(s); setStep(1); }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center",
                        padding: "16px 20px", border: "none",
                        borderBottom: i < services.length - 1 ? "1px solid var(--color-line-2)" : "none",
                        background: "white", cursor: "pointer", textAlign: "left", gap: 14,
                      }}
                    >
                      <div style={{ width: 9, height: 9, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-ink)" }}>{s.name}</div>
                        {s.category && <div style={{ fontSize: 11.5, color: "var(--color-ink-3)", marginTop: 2 }}>{s.category}</div>}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-ink)" }}>{formatPrice(s.price)}</div>
                        <div style={{ fontSize: 11, color: "var(--color-ink-3)", marginTop: 2, fontFamily: "var(--font-mono)" }}>{s.duration} min</div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--color-line)", flexShrink: 0 }}>
                        <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PASO 1: Fecha ── */}
          {step === 1 && svc && (
            <div className="step-in">
              <BackBtn onClick={() => setStep(0)} label="Cambiar servicio" />
              <Chips service={svc} />
              <StepHeading
                title="¿Qué día venís?"
                sub="Los días atenuados no tienen atención."
              />
              <div style={{ background: "white", border: "1px solid var(--color-line)", borderRadius: 16, padding: "24px 20px", boxShadow: "0 2px 16px rgba(39,42,37,.05)" }}>
                <Calendar
                  openDays={openDays}
                  selected={date}
                  onSelect={(d) => { setDate(d); setTime(null); setStep(2); }}
                />
              </div>
            </div>
          )}

          {/* ── PASO 2: Horario ── */}
          {step === 2 && svc && date && (
            <div className="step-in">
              <BackBtn onClick={() => setStep(1)} label="Cambiar fecha" />
              <Chips service={svc} date={date} />
              <StepHeading title="¿A qué hora?" sub="Elegí el horario que más te convenga." />

              {loadingSlots ? (
                <div style={{ fontSize: 13, color: "var(--color-ink-3)" }}>Cargando horarios...</div>
              ) : slots.length === 0 ? (
                <div style={{ background: "white", border: "1px solid var(--color-line)", borderRadius: 16, padding: "48px 24px", textAlign: "center", boxShadow: "0 2px 16px rgba(39,42,37,.05)" }}>
                  <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>—</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-ink)", marginBottom: 4 }}>Sin horarios disponibles</div>
                  <div style={{ fontSize: 13, color: "var(--color-ink-3)", marginBottom: 20 }}>Probá con otra fecha.</div>
                  <button onClick={() => setStep(1)} style={{ fontSize: 13, color: "var(--color-accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>
                    Elegir otra fecha
                  </button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => { setTime(slot); setStep(3); }}
                      className={`slot-pill${time === slot ? " slot-on" : ""}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PASO 3: Datos ── */}
          {step === 3 && (
            <div className="step-in">
              <BackBtn onClick={() => setStep(2)} label="Cambiar horario" />
              <Chips service={svc} date={date} time={time} />
              <StepHeading title="Tus datos" sub="Solo lo necesario para confirmar la reserva." />

              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                {([
                  { key: "name",  label: "Nombre completo", placeholder: "María García",     type: "text",  req: true },
                  { key: "phone", label: "Teléfono",         placeholder: "11 1234-5678",    type: "tel",   req: true },
                  { key: "email", label: "Email",             placeholder: "maria@email.com", type: "email", req: false },
                ] as const).map(f => (
                  <div key={f.key}>
                    <label style={{ display: "block", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-ink-3)", marginBottom: 0 }}>
                      {f.label}
                      {!f.req && <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: 11, marginLeft: 5, opacity: 0.6 }}>· opcional</span>}
                    </label>
                    <input
                      className="atelier-input"
                      type={f.type}
                      placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    />
                  </div>
                ))}

                <button
                  className="confirm-btn"
                  onClick={() => setStep(4)}
                  disabled={!form.name.trim() || !form.phone.trim()}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* ── PASO 4: Confirmar ── */}
          {step === 4 && svc && date && time && (
            <div className="step-in">
              <BackBtn onClick={() => setStep(3)} label="Volver" />
              <StepHeading title="Confirmá tu turno" sub="Revisá los detalles antes de confirmar." />

              {/* Receipt card */}
              <div style={{ background: "white", border: "1px solid var(--color-line)", borderRadius: 16, overflow: "hidden", marginBottom: 14, boxShadow: "0 2px 16px rgba(39,42,37,.05)" }}>
                {/* Servicio highlight */}
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-line-2)", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: svc.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-ink)" }}>{svc.name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--color-ink-3)", marginTop: 2, fontFamily: "var(--font-mono)" }}>{svc.duration} min</div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>
                    {formatPrice(svc.price)}
                  </div>
                </div>

                {/* Turno details */}
                <div style={{ padding: "0 20px" }}>
                  <ReceiptRow label="Fecha"   value={<span style={{ textTransform: "capitalize" }}>{formatDate(date)}</span>} />
                  <ReceiptRow label="Horario" value={time} mono />
                  <div style={{ height: 4 }} />
                </div>

                <div style={{ height: 1, background: "var(--color-line)", margin: "0 20px" }} />

                {/* Datos */}
                <div style={{ padding: "0 20px" }}>
                  <ReceiptRow label="Nombre"   value={form.name} />
                  <ReceiptRow label="Teléfono" value={form.phone} mono />
                  {form.email && <ReceiptRow label="Email" value={form.email} />}
                  <div style={{ height: 4 }} />
                </div>
              </div>

              {/* Seña notice */}
              {business.webDepositRequired && (
                <div style={{
                  padding: "13px 16px", borderRadius: 12, marginBottom: 14,
                  background: "var(--color-warn-soft)", border: "1px solid rgba(160,120,64,.15)",
                  display: "flex", alignItems: "flex-start", gap: 11,
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--color-warn)", marginTop: 1, flexShrink: 0 }}>
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)", marginBottom: 2 }}>Se requiere seña</div>
                    <div style={{ fontSize: 12, color: "var(--color-ink-2)", lineHeight: 1.5 }}>
                      {business.depositPercent}% del total —{" "}
                      <strong>{formatPrice(Math.round(svc.price * business.depositPercent / 100))}</strong>.
                      Serás redirigido a MercadoPago para completar el pago.
                    </div>
                  </div>
                </div>
              )}

              <button className="confirm-btn" onClick={handleConfirm} disabled={createAppt.isPending}>
                {createAppt.isPending ? "Confirmando..." : "Confirmar reserva"}
              </button>

              {createAppt.isError && (
                <p style={{ fontSize: 12, color: "var(--color-err)", marginTop: 10, textAlign: "center" }}>
                  {(createAppt.error as Error)?.message ?? "Ocurrió un error. Intentá de nuevo."}
                </p>
              )}
            </div>
          )}

          {/* ── PASO 5: Éxito ── */}
          {step === 5 && result && (
            <div className="step-in" style={{ textAlign: "center", paddingTop: 12 }}>
              <div className="success-ring" style={{
                width: 76, height: 76, borderRadius: "50%",
                background: "var(--color-ok-soft)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 26px",
              }}>
                <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                  <path
                    className="check-path"
                    d="M9 17.5l6 6 11-13"
                    stroke="var(--color-ok)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h2 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 800, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>
                ¡Turno reservado!
              </h2>
              <p style={{ margin: "0 0 32px", fontSize: 13, color: "var(--color-ink-3)", lineHeight: 1.6 }}>
                Tu reserva fue registrada exitosamente.<br />¡Te esperamos!
              </p>

              <div style={{
                background: "white", border: "1px solid var(--color-line)",
                borderRadius: 16, padding: "20px", textAlign: "left",
                marginBottom: 28, boxShadow: "0 2px 16px rgba(39,42,37,.05)"
              }}>
                <ReceiptRow label="Servicio" value={result.appointment.serviceName} />
                <ReceiptRow label="Fecha"    value={<span style={{ textTransform: "capitalize" }}>{formatDate(result.appointment.date)}</span>} />
                <ReceiptRow label="Horario"  value={result.appointment.time} mono />
                <ReceiptRow label="Total"    value={formatPrice(result.appointment.price)} bold />

                {result.deposit.required && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--color-line-2)" }}>
                    <div style={{ fontSize: 12, color: "var(--color-ink-3)", lineHeight: 1.6 }}>
                      Seña a abonar:{" "}
                      <strong style={{ color: "var(--color-ink)" }}>{formatPrice(result.deposit.amount)}</strong>
                      {" "}({result.deposit.percent}%)
                      <br />El negocio se comunicará para coordinar el pago.
                    </div>
                  </div>
                )}
              </div>

              {business.instagram && (
                <p style={{ fontSize: 12, color: "var(--color-ink-3)" }}>
                  Seguinos en{" "}
                  <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>{business.instagram}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step < 5 && (
          <div style={{ textAlign: "center", paddingBottom: 36 }}>
            <p style={{ fontSize: 11, color: "var(--color-ink-3)", margin: 0, opacity: 0.45, letterSpacing: "0.02em" }}>
              Reservas online · <span style={{ fontWeight: 700 }}>aesthetic.</span>
            </p>
          </div>
        )}
      </div>
    </>
  );
}
