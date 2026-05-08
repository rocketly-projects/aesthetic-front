"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import NuevoTurnoModal from "@/components/NuevoTurnoModal";
import { useGetAppointments } from "@/hooks/useAppointments";
import type { Appointment } from "@/lib/api/appointments";

// ── Constants ────────────────────────────────────────────────────────────────

const HOUR_PX   = 56;
const DAY_START = 8;
const HOURS     = Array.from({ length: 13 }, (_, i) => i + DAY_START);
const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MON_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

type View = "dia" | "semana" | "mes";

// ── Helpers ──────────────────────────────────────────────────────────────────

function toYMD(d: Date) { return d.toISOString().slice(0, 10); }

function apptTop(time: string) {
  const [h, m] = time.split(":").map(Number);
  return (h - DAY_START + m / 60) * HOUR_PX;
}
function apptHeight(duration: number) { return Math.max((duration / 60) * HOUR_PX - 2, 18); }

function getWeekDates(anchor: Date) {
  const day    = anchor.getDay();
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() - day + 1);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function getMonthGrid(anchor: Date): (Date | null)[] {
  const year  = anchor.getFullYear();
  const month = anchor.getMonth();
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  const dow   = first.getDay();
  const offset = dow === 0 ? 6 : dow - 1; // Monday-first
  const cells: (Date | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const statusBg: Record<string, string> = {
  confirmed: "var(--color-ok-soft)",
  pending:   "var(--color-warn-soft)",
  cancelled: "var(--color-err-soft)",
  completed: "var(--color-info-soft)",
  no_show:   "var(--color-err-soft)",
};
const statusBorder: Record<string, string> = {
  confirmed: "var(--color-ok)",
  pending:   "var(--color-warn)",
  cancelled: "var(--color-err)",
  completed: "var(--color-info)",
  no_show:   "var(--color-err)",
};

// ── Sub-views ────────────────────────────────────────────────────────────────

function HourGrid() {
  return (
    <div>
      {HOURS.map((h) => (
        <div key={h} className="flex items-start justify-end pr-2 pt-1" style={{ height: HOUR_PX }}>
          <span className="font-mono text-[10px] text-ink-3">{String(h).padStart(2, "0")}:00</span>
        </div>
      ))}
    </div>
  );
}

function DayColumn({ date, appts, isToday }: { date: Date; appts: Appointment[]; isToday: boolean }) {
  return (
    <div className="border-l border-line relative" style={isToday ? { background: "rgba(122,139,110,.03)" } : undefined}>
      {HOURS.map((h) => <div key={h} className="border-t border-line" style={{ height: HOUR_PX }} />)}
      {appts.map((appt) => (
        <div
          key={appt.id}
          className="absolute left-0.5 right-0.5 rounded-sm overflow-hidden cursor-pointer z-10"
          style={{
            top:        apptTop(appt.time),
            height:     apptHeight(appt.duration),
            background: statusBg[appt.status],
            borderLeft: `3px solid ${statusBorder[appt.status] ?? "var(--color-line)"}`,
            padding:    "3px 6px",
          }}
        >
          <div className="text-[11px] font-semibold text-ink leading-tight">{appt.serviceName}</div>
          {apptHeight(appt.duration) > 30 && (
            <div className="text-[10px] text-ink-3 mt-px">{appt.time} · {appt.serviceName}</div>
          )}
        </div>
      ))}
      {isToday && (
        <div
          className="absolute left-0 right-0 h-0.5 z-20"
          style={{
            top:        (new Date().getHours() + new Date().getMinutes() / 60 - DAY_START) * HOUR_PX,
            background: "var(--color-accent)",
          }}
        />
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().slice(0, 10);

export default function AgendaPage() {
  const [anchor,    setAnchor]    = useState(new Date());
  const [view,      setView]      = useState<View>("semana");
  const [modalOpen, setModalOpen] = useState(false);

  const { data } = useGetAppointments({ limit: 100 });
  const allAppts  = data?.appointments ?? [];

  // Navigation
  function navigate(dir: 1 | -1) {
    const d = new Date(anchor);
    if (view === "dia")    d.setDate(d.getDate() + dir);
    if (view === "semana") d.setDate(d.getDate() + dir * 7);
    if (view === "mes")    d.setMonth(d.getMonth() + dir);
    setAnchor(d);
  }

  // Subtitle
  const weekDates  = getWeekDates(anchor);
  const anchorYMD  = toYMD(anchor);
  const subtitle =
    view === "dia"
      ? anchor.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).replace(/^\w/, (c) => c.toUpperCase())
      : view === "semana"
      ? `${weekDates[0].getDate()} ${weekDates[0].toLocaleDateString("es-AR", { month: "short" })} — ${weekDates[6].getDate()} ${weekDates[6].toLocaleDateString("es-AR", { month: "short", year: "numeric" })}`
      : `${MON_NAMES[anchor.getMonth()]} ${anchor.getFullYear()}`;

  const VIEW_LABELS: { key: View; label: string }[] = [
    { key: "dia",    label: "Día"    },
    { key: "semana", label: "Semana" },
    { key: "mes",    label: "Mes"    },
  ];

  return (
    <AppShell
      active="agenda"
      title="Agenda"
      subtitle={subtitle}
      actions={
        <button
          className="flex items-center gap-1.5 text-white text-[13.5px] font-medium rounded-lg px-4 py-2 border-none cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
          style={{ background: "var(--color-ink)" }}
          onClick={() => setModalOpen(true)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Nuevo turno
        </button>
      }
    >
      {/* Controls */}
      <div className="flex items-center gap-3 mb-4">
        <button
          className="border border-line bg-surface rounded-md px-2.5 py-1.5 cursor-pointer hover:bg-bg text-ink transition-colors text-sm"
          onClick={() => navigate(-1)}
        >
          ‹
        </button>
        <button
          className="border border-line bg-surface rounded-md px-2.5 py-1.5 cursor-pointer hover:bg-bg text-ink transition-colors text-sm"
          onClick={() => navigate(1)}
        >
          ›
        </button>
        <button
          className="border border-line bg-surface rounded-md px-3.5 py-1.5 text-xs cursor-pointer hover:bg-bg text-ink transition-colors"
          onClick={() => setAnchor(new Date())}
        >
          Hoy
        </button>
        <div className="flex-1" />
        <div className="seg">
          {VIEW_LABELS.map(({ key, label }) => (
            <button
              key={key}
              className={`seg-item${view === key ? " active" : ""}`}
              onClick={() => setView(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Vista Día ── */}
      {view === "dia" && (() => {
        const isToday  = anchorYMD === TODAY;
        const dayAppts = allAppts.filter((a) => a.date === anchorYMD);
        return (
          <div className="bg-surface border border-line rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="grid border-b border-line bg-bg" style={{ gridTemplateColumns: "60px 1fr" }}>
              <div />
              <div className="py-3 px-2 text-center border-l border-line">
                <div className="text-[11px] text-ink-3 uppercase tracking-wider">{DAY_NAMES[anchor.getDay()]}</div>
                <div
                  className={`text-lg font-semibold w-8 h-8 rounded-full inline-flex items-center justify-center mt-0.5 ${isToday ? "text-white" : "text-ink"}`}
                  style={isToday ? { background: "var(--color-accent)" } : undefined}
                >
                  {anchor.getDate()}
                </div>
              </div>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
              <div className="grid" style={{ gridTemplateColumns: "60px 1fr" }}>
                <HourGrid />
                <DayColumn date={anchor} appts={dayAppts} isToday={isToday} />
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Vista Semana ── */}
      {view === "semana" && (() => {
        const weekStart = toYMD(weekDates[0]);
        const weekEnd   = toYMD(weekDates[6]);
        const weekAppts = allAppts.filter((a) => a.date >= weekStart && a.date <= weekEnd);
        return (
          <div className="bg-surface border border-line rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="grid border-b border-line bg-bg" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
              <div />
              {weekDates.map((d, i) => {
                const isToday = toYMD(d) === TODAY;
                return (
                  <div key={i} className="py-3 px-2 text-center border-l border-line">
                    <div className="text-[11px] text-ink-3 uppercase tracking-wider">{DAY_NAMES[d.getDay()]}</div>
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
                <HourGrid />
                {weekDates.map((d, di) => {
                  const ymd      = toYMD(d);
                  const isToday  = ymd === TODAY;
                  const dayAppts = weekAppts.filter((a) => a.date === ymd);
                  return <DayColumn key={di} date={d} appts={dayAppts} isToday={isToday} />;
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Vista Mes ── */}
      {view === "mes" && (() => {
        const cells       = getMonthGrid(anchor);
        const monthStart  = toYMD(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
        const monthEnd    = toYMD(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0));
        const monthAppts  = allAppts.filter((a) => a.date >= monthStart && a.date <= monthEnd);

        return (
          <div className="bg-surface border border-line rounded-lg shadow-sm overflow-hidden">
            {/* Week day headers */}
            <div className="grid grid-cols-7 border-b border-line bg-bg">
              {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((d) => (
                <div key={d} className="py-2 text-center text-[11px] font-semibold text-ink-3 uppercase tracking-wider border-r border-line last:border-r-0">
                  {d}
                </div>
              ))}
            </div>
            {/* Day cells */}
            <div className="grid grid-cols-7">
              {cells.map((cell, i) => {
                if (!cell) {
                  return <div key={i} className="border-r border-b border-line last:border-r-0 bg-bg min-h-[100px]" />;
                }
                const ymd      = toYMD(cell);
                const isToday  = ymd === TODAY;
                const isOtherM = cell.getMonth() !== anchor.getMonth();
                const dayAppts = monthAppts.filter((a) => a.date === ymd);
                const MAX_SHOW = 3;
                const overflow = dayAppts.length - MAX_SHOW;

                return (
                  <div
                    key={i}
                    onClick={() => { setAnchor(cell); setView("dia"); }}
                    className={`border-r border-b border-line last:border-r-0 min-h-[100px] p-2 cursor-pointer hover:bg-bg transition-colors ${isOtherM ? "opacity-40" : ""}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-semibold mb-1 ${isToday ? "text-white" : "text-ink"}`}
                      style={isToday ? { background: "var(--color-accent)" } : undefined}
                    >
                      {cell.getDate()}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {dayAppts.slice(0, MAX_SHOW).map((appt) => (
                        <div
                          key={appt.id}
                          className="text-[10.5px] font-medium px-1.5 py-0.5 rounded truncate"
                          style={{
                            background:  statusBg[appt.status],
                            borderLeft:  `2px solid ${statusBorder[appt.status] ?? "var(--color-line)"}`,
                            color:       "var(--color-ink)",
                          }}
                        >
                          {appt.time} {appt.serviceName}
                        </div>
                      ))}
                      {overflow > 0 && (
                        <div className="text-[10px] text-ink-3 pl-1">+{overflow} más</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      <NuevoTurnoModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </AppShell>
  );
}
