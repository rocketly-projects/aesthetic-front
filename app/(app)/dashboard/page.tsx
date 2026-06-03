"use client";

import { useState, useMemo } from "react";
import AppShell from "@/components/AppShell";
import Chip from "@/components/Chip";
import NuevoTurnoModal from "@/components/NuevoTurnoModal";
import { useGetAppointments } from "@/hooks/useAppointments";
import { useGetHours } from "@/hooks/useBusiness";
import { useCurrentUser } from "@/hooks/useAuth";
import type { Appointment } from "@/lib/api/appointments";

const TODAY = new Date().toISOString().slice(0, 10);

// Lunes–Domingo de la semana actual
const WEEK: string[] = (() => {
  const dow = new Date().getDay();
  const mon = new Date();
  mon.setDate(mon.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
})();

// ── Helpers ────────────────────────────────────────────────────────────────────



function toMin(t: string): number { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function fromMin(mins: number): string { return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`; }
function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60); const m = mins % 60;
  if (h === 0) return `${m}m`; if (m === 0) return `${h}h`; return `${h}h ${m}m`;
}
function calcFreeBlocks(appts: Appointment[], fromTime: string, toTime: string, minGap = 30): string[] {
  const openMin  = toMin(fromTime); const closeMin = toMin(toTime);
  const active   = appts.filter((a) => a.status !== "cancelled" && a.status !== "no_show").sort((a, b) => toMin(a.time) - toMin(b.time));
  const blocks: string[] = []; let cursor = openMin;
  for (const appt of active) {
    const start = toMin(appt.time);
    if (start - cursor >= minGap) blocks.push(`${fromMin(cursor)}–${fromMin(start)}`);
    cursor = Math.max(cursor, start + appt.duration);
  }
  if (closeMin - cursor >= minGap) blocks.push(`${fromMin(cursor)}–${fromMin(closeMin)}`);
  return blocks.slice(0, 3);
}

// ── Weekly occupancy grid ─────────────────────────────────────────────────────

type BusinessHour = { dayOfWeek: number; open: boolean; fromTime: string; toTime: string };
const DAY_LABELS = ["L", "Ma", "Mi", "J", "V", "S", "D"];

function WeeklyOccupancy({
  appts,
  hoursData,
  isLoading,
}: {
  appts: Appointment[];
  hoursData: BusinessHour[] | undefined;
  isLoading: boolean;
}) {
  const SLOT        = 60; // 1 cuadrado = 1 hora
  const openHours   = hoursData?.filter((h) => h.open) ?? [];
  const minOpen     = openHours.length ? Math.min(...openHours.map((h) => toMin(h.fromTime))) : toMin("09:00");
  const maxClose    = openHours.length ? Math.max(...openHours.map((h) => toMin(h.toTime)))   : toMin("20:00");
  const slotCount   = Math.ceil((maxClose - minOpen) / SLOT);
  const dayHoursMap = new Map(hoursData?.map((h) => [h.dayOfWeek, h]) ?? []);

  // Segmento ocupado por slot: clave "date:hourStartMin" → { from, to } en minutos dentro del slot (0-60)
  const occupancyMap = useMemo(() => {
    const map = new Map<string, { from: number; to: number }>();
    for (const a of appts) {
      if (a.status === "cancelled" || a.status === "no_show") continue;
      if (!WEEK.includes(a.date)) continue;
      const start = toMin(a.time);
      const end   = start + a.duration;
      for (let h = Math.floor(start / SLOT) * SLOT; h < end; h += SLOT) {
        const slotFrom = Math.max(start, h) - h;        // offset dentro del slot donde empieza
        const slotTo   = Math.min(end, h + SLOT) - h;   // offset dentro del slot donde termina
        const key = `${a.date}:${h}`;
        const existing = map.get(key);
        // Si hay varios turnos en el mismo slot, expandir el rango
        map.set(key, existing
          ? { from: Math.min(existing.from, slotFrom), to: Math.max(existing.to, slotTo) }
          : { from: slotFrom, to: slotTo }
        );
      }
    }
    return map;
  }, [appts]);

  const weekTotal = appts.filter(
    (a) => WEEK.includes(a.date) && a.status !== "cancelled" && a.status !== "no_show"
  ).length;

  return (
    <div
      className="bg-surface border border-line rounded-2xl shadow-sm p-5 card-lift"
      style={{ animation: "fade-in-up var(--dur-base) var(--ease-out) both", animationDelay: "240ms" }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-semibold text-ink-3 uppercase tracking-widest">Ocupación semanal</span>
        {!isLoading && (
          <span className="text-[11px] text-ink-3">{weekTotal} turno{weekTotal !== 1 ? "s" : ""} esta semana</span>
        )}
      </div>

      {isLoading ? (
        <div className="flex gap-[5px] animate-pulse">
          <div className="flex flex-col gap-[3px] w-[18px] shrink-0">
            <div className="h-[9px] mb-[2px]" />
            {Array.from({ length: 10 }).map((_, j) => (
              <div key={j} className="h-[10px]" />
            ))}
          </div>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col gap-[3px]">
              <div className="h-[9px] rounded-[2px] bg-bg-2 mb-[2px]" />
              {Array.from({ length: 10 }).map((_, j) => (
                <div key={j} className="h-[10px] rounded-[2px] bg-bg-2" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-[5px]">
          {/* Time axis — un label por cada slot (= cada hora) */}
          <div className="flex flex-col gap-[3px] shrink-0 w-[18px]">
            <span className="text-[10px] font-semibold mb-[2px] text-transparent select-none leading-none">L</span>
            {Array.from({ length: slotCount }, (_, si) => {
              const slotMin = minOpen + si * SLOT;
              return (
                <div key={si} className="h-[12px] flex items-start justify-end pr-[2px]">
                  <span className="text-[9px] leading-none text-ink-3 whitespace-nowrap">
                    {String(Math.floor(slotMin / 60))}h
                  </span>
                </div>
              );
            })}
          </div>

          {/* Columnas de días */}
          {WEEK.map((day, di) => {
            const dow     = di === 6 ? 0 : di + 1;
            const dh      = dayHoursMap.get(dow);
            const isOpen  = !!dh?.open;
            const isToday = day === TODAY;

            return (
              <div key={day} className="flex-1 flex flex-col gap-[3px]">
                <span className={`text-center text-[9px] font-semibold mb-[2px] leading-none ${isToday ? "text-accent" : "text-ink-3"}`}>
                  {DAY_LABELS[di]}
                </span>
                {Array.from({ length: slotCount }, (_, si) => {
                  const slotMin = minOpen + si * SLOT;
                  const inHours = isOpen && !!dh &&
                    slotMin >= toMin(dh.fromTime) && slotMin < toMin(dh.toTime);

                  // Fuera de horario: invisible (sólo ocupa espacio para alineación)
                  if (!inHours) {
                    return <div key={si} className="w-full h-[10px]" />;
                  }

                  const slot      = occupancyMap.get(`${day}:${slotMin}`);
                  const occColor  = isToday ? "var(--color-accent)" : "var(--color-ok)";
                  const freeColor = "var(--color-bg-2)";
                  const fromPct   = slot ? Math.round((slot.from / SLOT) * 100) : 0;
                  const toPct     = slot ? Math.round((slot.to   / SLOT) * 100) : 0;

                  const bg = !slot
                    ? freeColor
                    : fromPct === 0 && toPct === 100
                    ? occColor
                    : fromPct === 0
                    ? `linear-gradient(to right, ${occColor} ${toPct}%, ${freeColor} ${toPct}%)`
                    : toPct === 100
                    ? `linear-gradient(to right, ${freeColor} ${fromPct}%, ${occColor} ${fromPct}%)`
                    : `linear-gradient(to right, ${freeColor} ${fromPct}%, ${occColor} ${fromPct}%, ${occColor} ${toPct}%, ${freeColor} ${toPct}%)`;

                  return (
                    <div key={si} className="w-full h-[12px] rounded-[2px]" style={{ background: bg }} />
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Arc progress ───────────────────────────────────────────────────────────────

function ArcProgress({ pct }: { pct: number }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(pct / 100, 1) * circ;
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0">
      <circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-bg-2)" strokeWidth="7" />
      <circle
        cx="40" cy="40" r={r} fill="none" stroke="var(--color-accent)" strokeWidth="7"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.7s cubic-bezier(.4,0,.2,1)" }}
      />
    </svg>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const current  = useCurrentUser();
  const firstName = current ? current.name.trim().split(/\s+/)[0] : null;

  const { data, isLoading }                        = useGetAppointments({ dateFrom: WEEK[0], limit: 100 });
  const { data: hoursData, isLoading: isLoadingHours } = useGetHours();
  const allAppts = data?.appointments ?? [];
  const appts    = allAppts.filter((a) => a.date === TODAY);

  const total     = appts.length;
  const confirmed = appts.filter((a) => a.status === "confirmed").length;
  const pending   = appts.filter((a) => a.status === "pending").length;
  const revenue   = appts.filter((a) => a.status !== "cancelled").reduce((s, a) => s + a.price, 0);
  const next      = appts.find((a) => a.status !== "cancelled");

  const todayDow   = new Date().getDay();
  const todayHours = hoursData?.find((h) => h.dayOfWeek === todayDow);
  const isClosed   = !todayHours || !todayHours.open;
  const totalMin   = isClosed ? 0 : toMin(todayHours!.toTime) - toMin(todayHours!.fromTime);
  const usedMin    = appts.filter((a) => a.status !== "cancelled" && a.status !== "no_show").reduce((s, a) => s + a.duration, 0);
  const occupancyPct = totalMin > 0 ? Math.min(100, Math.round((usedMin / totalMin) * 100)) : 0;
  const freeBlocks   = isClosed ? [] : calcFreeBlocks(appts, todayHours!.fromTime, todayHours!.toTime);

  const todayLabel     = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  const todayFormatted = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);

  return (
    <AppShell
      active="dashboard"
      title="Inicio"
      subtitle="Tu día de un vistazo"
      actions={
        <button
          className="flex items-center gap-1.5 bg-ink text-white text-[13.5px] font-medium rounded-lg px-4 py-2 border-none cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
          onClick={() => setModalOpen(true)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Nuevo turno
        </button>
      }
    >
      {/* ── Greeting ── */}
      <div className="mb-6">
        <p className="text-[11.5px] font-mono text-ink-3 uppercase tracking-widest mb-1.5">{todayFormatted}</p>
        <h2 className="font-display text-[26px] md:text-[34px] font-normal text-ink leading-none tracking-[-0.03em] m-0">
          Buen día, <em className="not-italic text-accent">{firstName ?? "…"}</em>.
        </h2>
        <p className="text-sm text-ink-3 mt-2 mb-0">
          {isLoading ? "Cargando turnos…" : (
            <>
              Tenés <strong className="text-ink font-medium">{total}</strong> turnos hoy.
              {next && <> El próximo es a las <strong className="text-ink font-medium">{next.time}</strong> con {next.serviceName}.</>}
            </>
          )}
        </p>
      </div>

      {/* ── Bento grid ── */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-[1.55fr_1fr] lg:[grid-template-rows:auto_auto_1fr]">

        {/* HERO — Agenda de hoy */}
        <div
          className="bg-surface border border-line rounded-2xl shadow-sm p-5 flex flex-col lg:row-span-3"
          style={{ animation: "fade-in-up var(--dur-base) var(--ease-out) both", animationDelay: "0ms" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="m-0 text-[14px] font-semibold text-ink">Agenda de hoy</h3>
              <span className="text-[12px] text-ink-3">
                {total} turnos · {appts.filter((a) => a.status === "cancelled").length} cancelado{appts.filter((a) => a.status === "cancelled").length !== 1 ? "s" : ""}
              </span>
            </div>
            <a href="/agenda" className="flex items-center gap-1 text-[12px] text-ink-2 hover:text-ink transition-colors no-underline">
              Ver agenda
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6"/>
              </svg>
            </a>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col gap-2.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-14 h-10 rounded-lg bg-bg-2 shrink-0" />
                    <div className="flex-1 h-10 rounded-lg bg-bg-2" />
                  </div>
                ))}
              </div>
            ) : appts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-accent-pale flex items-center justify-center mb-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-ink)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
                  </svg>
                </div>
                <p className="text-[13px] font-medium text-ink mb-0.5">Sin turnos por hoy</p>
                <p className="text-[12px] text-ink-3">Agendá el primero con el botón de abajo</p>
              </div>
            ) : (
              <div className="timeline">
                {appts.map((appt) => (
                  <div key={appt.id} className="tl-item">
                    <div className="tl-time">
                      {appt.time}
                      <small>{appt.duration} min</small>
                    </div>
                    <div className={`tl-card ${appt.status}`}>
                      <div className="stripe" />
                      <div>
                        <div className="who">{appt.clientName ?? "Sin cliente"}</div>
                        <div className="svc">{appt.serviceName}</div>
                      </div>
                      <div className="right">
                        {appt.status === "confirmed"        && <Chip variant="ok"      label="Confirmado" />}
                        {appt.status === "pending"          && <Chip variant="warn"    label="Pendiente"  />}
                        {appt.status === "cancelled"        && <Chip variant="err"     label="Cancelado"  />}
                        {appt.status === "completed"        && <Chip variant="info"    label="Completado" />}
                        {appt.status === "awaiting_payment" && <Chip variant="warn"    label="Esperando pago" />}
                        {appt.status === "no_show"          && <Chip variant="neutral" label="No asistió" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="quick-add mt-4 shrink-0" onClick={() => setModalOpen(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Agregar un turno para hoy
          </button>
        </div>

        {/* KPIs — 2 mini cards */}
        <div
          className="grid grid-cols-2 gap-3"
          style={{ animation: "fade-in-up var(--dur-base) var(--ease-out) both", animationDelay: "60ms" }}
        >
          {/* Turnos hoy — sage pale */}
          <div className="bg-accent-pale rounded-2xl p-4 flex flex-col gap-1 card-lift">
            <span className="text-[10.5px] font-semibold text-accent-ink uppercase tracking-widest">Turnos hoy</span>
            <span className="font-display text-[42px] font-light text-accent-ink leading-none mt-0.5">
              {isLoading ? "–" : total}
            </span>
            <span className="text-[11px] text-accent-ink opacity-60">
              {isLoading ? "" : `${confirmed} confirmado${confirmed !== 1 ? "s" : ""} · ${pending} pendiente${pending !== 1 ? "s" : ""}`}
            </span>
          </div>

          {/* Ingresos — dark ink */}
          <div className="bg-ink rounded-2xl p-4 flex flex-col gap-1 card-lift">
            <span className="text-[10.5px] font-semibold text-white/50 uppercase tracking-widest">Ingresos est.</span>
            <span className="font-display text-[28px] font-light text-white leading-none mt-0.5">
              {isLoading ? "–" : `$${revenue.toLocaleString("es-AR")}`}
            </span>
            <span className="text-[11px] text-white/40">del día</span>
          </div>
        </div>

        {/* Ocupación del día — arc progress */}
        <div
          className="bg-surface border border-line rounded-2xl shadow-sm p-5 card-lift"
          style={{ animation: "fade-in-up var(--dur-base) var(--ease-out) both", animationDelay: "120ms" }}
        >
          <span className="text-[11px] font-semibold text-ink-3 uppercase tracking-widest">Ocupación del día</span>
          {isLoadingHours || isLoading ? (
            <div className="mt-3 animate-pulse flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-bg-2" />
              <div className="flex flex-col gap-2">
                <div className="w-20 h-7 rounded-lg bg-bg-2" />
                <div className="w-28 h-3 rounded-full bg-bg-2" />
              </div>
            </div>
          ) : isClosed ? (
            <p className="text-[13px] text-ink-3 mt-3">Cerrado hoy.</p>
          ) : (
            <>
              <div className="flex items-center gap-4 mt-3">
                <ArcProgress pct={occupancyPct} />
                <div>
                  <div className="font-display text-[38px] font-light text-ink leading-none tracking-tight">{occupancyPct}%</div>
                  <div className="text-[11.5px] text-ink-3 mt-1">{formatMinutes(usedMin)} de {formatMinutes(totalMin)}</div>
                </div>
              </div>
              {freeBlocks.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {freeBlocks.map((b) => (
                    <span key={b} className="text-[11px] bg-bg-2 text-ink-3 px-2.5 py-0.5 rounded-full">{b}</span>
                  ))}
                </div>
              )}
              {freeBlocks.length === 0 && (
                <p className="text-[11.5px] text-ink-3 mt-2.5">Sin bloques libres.</p>
              )}
            </>
          )}
        </div>

        {/* Ocupación semanal */}
        <WeeklyOccupancy
          appts={allAppts}
          hoursData={hoursData}
          isLoading={isLoading || isLoadingHours}
        />

      </div>

      <NuevoTurnoModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </AppShell>
  );
}
