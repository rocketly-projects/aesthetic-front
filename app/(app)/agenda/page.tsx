"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { useGetAppointments } from "@/hooks/useAppointments";

const HOUR_PX  = 56;
const DAY_START = 8;
const HOURS    = Array.from({ length: 13 }, (_, i) => i + DAY_START);
const DAYS     = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function getWeekDates(anchor: Date) {
  const day    = anchor.getDay();
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() - day + 1);
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; });
}

function toYMD(d: Date)               { return d.toISOString().slice(0, 10); }
function apptTop(time: string)        { const [h, m] = time.split(":").map(Number); return (h - DAY_START + m / 60) * HOUR_PX; }
function apptHeight(duration: number) { return Math.max((duration / 60) * HOUR_PX - 2, 18); }

const TODAY = new Date().toISOString().slice(0, 10);

const statusBg: Record<string, string> = {
  confirmed: "var(--color-ok-soft)",
  pending:   "var(--color-warn-soft)",
  cancelled: "var(--color-err-soft)",
  completed: "var(--color-info-soft)",
};
const statusBorder: Record<string, string> = {
  confirmed: "var(--color-ok)",
  pending:   "var(--color-warn)",
  cancelled: "var(--color-err)",
  completed: "var(--color-info)",
};

export default function AgendaPage() {
  const [anchor, setAnchor] = useState(new Date());
  const weekDates           = getWeekDates(anchor);

  const weekStart = toYMD(weekDates[0]);
  const weekEnd   = toYMD(weekDates[6]);
  const weekLabel = `${weekDates[0].getDate()} ${weekDates[0].toLocaleDateString("es-AR", { month: "short" })} — ${weekDates[6].getDate()} ${weekDates[6].toLocaleDateString("es-AR", { month: "short", year: "numeric" })}`;

  const { data } = useGetAppointments({ limit: 100 });
  const allAppts = data?.appointments ?? [];

  // Filtrar los turnos de la semana visible en el cliente
  const weekAppts = allAppts.filter((a) => a.date >= weekStart && a.date <= weekEnd);

  return (
    <AppShell
      active="agenda"
      title="Agenda"
      subtitle={weekLabel}
      actions={
        <button className="flex items-center gap-1.5 text-white text-[13.5px] font-medium rounded-lg px-4 py-2 border-none cursor-pointer hover:opacity-90 transition-opacity shadow-sm" style={{ background: "var(--color-ink)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Nuevo turno
        </button>
      }
    >
      {/* Controls */}
      <div className="flex items-center gap-3 mb-4">
        <button className="border border-line bg-surface rounded-md px-2.5 py-1.5 cursor-pointer hover:bg-bg text-ink transition-colors text-sm" onClick={() => { const d = new Date(anchor); d.setDate(d.getDate() - 7); setAnchor(d); }}>‹</button>
        <button className="border border-line bg-surface rounded-md px-2.5 py-1.5 cursor-pointer hover:bg-bg text-ink transition-colors text-sm" onClick={() => { const d = new Date(anchor); d.setDate(d.getDate() + 7); setAnchor(d); }}>›</button>
        <button className="border border-line bg-surface rounded-md px-3.5 py-1.5 text-xs cursor-pointer hover:bg-bg text-ink transition-colors" onClick={() => setAnchor(new Date())}>Hoy</button>
        <div className="flex-1" />
        <div className="seg">
          {["Día", "Semana", "Mes"].map((v) => (
            <button key={v} className={`seg-item${v === "Semana" ? " active" : ""}`}>{v}</button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-surface border border-line rounded-lg shadow-sm overflow-hidden flex flex-col">
        {/* Day headers */}
        <div className="grid border-b border-line bg-bg" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
          <div />
          {weekDates.map((d, i) => {
            const isToday = toYMD(d) === TODAY;
            return (
              <div key={i} className="py-3 px-2 text-center border-l border-line">
                <div className="text-[11px] text-ink-3 uppercase tracking-wider">{DAYS[d.getDay()]}</div>
                <div
                  className={`text-lg font-semibold w-8 h-8 rounded-full inline-flex items-center justify-center mt-0.5 ${isToday ? "text-white" : "text-ink"}`}
                  style={isToday ? { background: "var(--color-accent)" } : undefined}
                >
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
          <div className="grid" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
            <div>
              {HOURS.map((h) => (
                <div key={h} className="flex items-start justify-end pr-2 pt-1" style={{ height: HOUR_PX }}>
                  <span className="font-mono text-[10px] text-ink-3">{String(h).padStart(2, "0")}:00</span>
                </div>
              ))}
            </div>
            {weekDates.map((d, di) => {
              const ymd     = toYMD(d);
              const isToday = ymd === TODAY;
              const dayAppts = weekAppts.filter((a) => a.date === ymd);
              return (
                <div key={di} className="border-l border-line relative" style={isToday ? { background: "rgba(122,139,110,.03)" } : undefined}>
                  {HOURS.map((h) => <div key={h} className="border-t border-line" style={{ height: HOUR_PX }} />)}
                  {dayAppts.map((appt) => (
                    <div
                      key={appt.id}
                      className="absolute left-0.5 right-0.5 rounded-sm overflow-hidden cursor-pointer z-10"
                      style={{ top: apptTop(appt.time), height: apptHeight(appt.duration), background: statusBg[appt.status], borderLeft: `3px solid ${statusBorder[appt.status] ?? "var(--color-line)"}`, padding: "3px 6px" }}
                    >
                      <div className="text-[11px] font-semibold text-ink leading-tight">{appt.serviceName}</div>
                      {apptHeight(appt.duration) > 30 && <div className="text-[10px] text-ink-3 mt-px">{appt.time} · {appt.serviceName}</div>}
                    </div>
                  ))}
                  {isToday && (
                    <div
                      className="absolute left-0 right-0 h-0.5 z-20"
                      style={{ top: (new Date().getHours() + new Date().getMinutes() / 60 - DAY_START) * HOUR_PX, background: "var(--color-accent)" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
