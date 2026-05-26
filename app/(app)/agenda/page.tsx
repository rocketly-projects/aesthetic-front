"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import NuevoTurnoModal from "@/components/NuevoTurnoModal";
import EditTurnoModal from "@/components/EditTurnoModal";
import { statusChip } from "@/components/Chip";
import { useGetAppointments, useUpdateAppointment } from "@/hooks/useAppointments";
import type { Appointment, AppointmentStatus } from "@/lib/api/appointments";

// ── Constants ────────────────────────────────────────────────────────────────

const HOUR_PX   = 56;
const DAY_START = 8;
const HOURS     = Array.from({ length: 13 }, (_, i) => i + DAY_START);
const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MON_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

type View = "dia" | "semana" | "mes";

const QUICK_STATUSES: { status: AppointmentStatus; label: string }[] = [
  { status: "confirmed", label: "Confirmar"  },
  { status: "completed", label: "Completar"  },
  { status: "cancelled", label: "Cancelar"   },
  { status: "no_show",   label: "No asistió" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function toYMD(d: Date) { return d.toISOString().slice(0, 10); }

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

function apptTop(time: string) {
  const [h, m] = time.split(":").map(Number);
  return (h - DAY_START + m / 60) * HOUR_PX;
}
function apptHeight(duration: number) { return Math.max((duration / 60) * HOUR_PX - 2, 18); }

function yToTime(y: number): string {
  const snapped = Math.round((y / HOUR_PX) * 60 / 15) * 15;
  const h = DAY_START + Math.floor(snapped / 60);
  const m = snapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

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
  const offset = dow === 0 ? 6 : dow - 1;
  const cells: (Date | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const statusBg: Record<string, string> = {
  confirmed:        "var(--color-ok-soft)",
  pending:          "var(--color-warn-soft)",
  cancelled:        "var(--color-err-soft)",
  completed:        "var(--color-info-soft)",
  no_show:          "var(--color-err-soft)",
  awaiting_payment: "var(--color-warn-soft)",
};
const statusBorder: Record<string, string> = {
  confirmed:        "var(--color-ok)",
  pending:          "var(--color-warn)",
  cancelled:        "var(--color-err)",
  completed:        "var(--color-info)",
  no_show:          "var(--color-err)",
  awaiting_payment: "var(--color-warn)",
};

// ── Detail panel ─────────────────────────────────────────────────────────────

function ApptDetailPanel({
  appt,
  onClose,
  onStatusChange,
  onEdit,
  isPending,
}: {
  appt: Appointment;
  onClose: () => void;
  onStatusChange: (status: AppointmentStatus) => void;
  onEdit: () => void;
  isPending: boolean;
}) {
  return (
    <>
      {/* Backdrop — click outside to close */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-x-3 bottom-4 md:inset-auto md:right-6 md:top-24 md:w-72 bg-surface border border-line rounded-xl shadow-xl z-50 flex flex-col overflow-hidden max-h-[80vh] md:max-h-none overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-line">
          <div className="font-semibold text-[13.5px] text-ink truncate">
            {appt.clientName ?? "Sin cliente"}
          </div>
          <button
            onClick={onClose}
            className="text-ink-3 hover:text-ink bg-transparent border-none cursor-pointer rounded-md p-1 transition-colors text-base leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-3.5">
          <div>
            <div className="text-[10.5px] text-ink-3 uppercase tracking-wider mb-0.5">Servicio</div>
            <div className="text-[13px] text-ink font-medium">{appt.serviceName}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10.5px] text-ink-3 uppercase tracking-wider mb-0.5">Fecha</div>
              <div className="font-mono text-[12px] text-ink">{formatDate(appt.date)}</div>
            </div>
            <div>
              <div className="text-[10.5px] text-ink-3 uppercase tracking-wider mb-0.5">Hora</div>
              <div className="font-mono text-[12px] text-ink font-semibold">{appt.time}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10.5px] text-ink-3 uppercase tracking-wider mb-0.5">Duración</div>
              <div className="font-mono text-[12px] text-ink">{appt.duration} min</div>
            </div>
            <div>
              <div className="text-[10.5px] text-ink-3 uppercase tracking-wider mb-0.5">Precio</div>
              <div className="font-mono text-[12px] text-ink font-semibold">${appt.price.toLocaleString("es-AR")}</div>
            </div>
          </div>

          <div>
            <div className="text-[10.5px] text-ink-3 uppercase tracking-wider mb-1.5">Estado</div>
            {statusChip(appt.status)}
          </div>

          {/* Quick actions */}
          {QUICK_STATUSES.filter((q) => q.status !== appt.status).length > 0 && (
            <div className="flex flex-col gap-1.5 pt-1 border-t border-line">
              <div className="text-[10.5px] text-ink-3 uppercase tracking-wider mb-0.5">Cambiar estado</div>
              {QUICK_STATUSES.filter((q) => q.status !== appt.status).map((q) => (
                <button
                  key={q.status}
                  onClick={() => onStatusChange(q.status)}
                  disabled={isPending}
                  className="w-full text-left px-3 py-2 text-[12.5px] text-ink-2 hover:bg-bg hover:text-ink border border-line bg-surface rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <button
            onClick={onEdit}
            className="w-full py-2 text-[13px] font-medium rounded-lg border border-line bg-transparent text-ink hover:bg-bg cursor-pointer transition-colors"
          >
            Editar turno
          </button>
        </div>
      </div>
    </>
  );
}

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

function DayColumn({
  date,
  appts,
  isToday,
  onSelect,
  onCellClick,
}: {
  date: Date;
  appts: Appointment[];
  isToday: boolean;
  onSelect: (appt: Appointment) => void;
  onCellClick: (date: string, time: string) => void;
}) {
  return (
    <div
      className="border-l border-line relative"
      style={isToday ? { background: "rgba(122,139,110,.03)" } : undefined}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onCellClick(toYMD(date), yToTime(e.clientY - rect.top));
      }}
    >
      {HOURS.map((h) => <div key={h} className="border-t border-line" style={{ height: HOUR_PX }} />)}
      {appts.map((appt) => (
        <div
          key={appt.id}
          onClick={(e) => { e.stopPropagation(); onSelect(appt); }}
          className="absolute left-0.5 right-0.5 rounded-sm overflow-hidden cursor-pointer z-10 hover:brightness-95 transition-all"
          style={{
            top:        apptTop(appt.time),
            height:     apptHeight(appt.duration),
            background: statusBg[appt.status],
            borderLeft: `3px solid ${statusBorder[appt.status] ?? "var(--color-line)"}`,
            padding:    "3px 6px",
          }}
        >
          <div className="text-[11px] font-semibold text-ink leading-tight">{appt.clientName ?? "Sin cliente"}</div>
          {apptHeight(appt.duration) > 30 && (
            <div className="text-[10px] text-ink-3 mt-px">{appt.time} · {appt.serviceName}</div>
          )}
        </div>
      ))}
      {isToday && (
        <div
          className="absolute left-0 right-0 z-20 pointer-events-none"
          style={{ top: (new Date().getHours() + new Date().getMinutes() / 60 - DAY_START) * HOUR_PX }}
        >
          <div className="absolute -left-1 -top-[3px] w-2 h-2 rounded-full bg-err" />
          <div className="h-px bg-err" />
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().slice(0, 10);

export default function AgendaPage() {
  const [anchor,          setAnchor]         = useState(new Date());
  const [view,            setView]           = useState<View>("semana");
  const [modalOpen,       setModalOpen]      = useState(false);
  const [preset,          setPreset]         = useState<{ date: string; time: string } | null>(null);
  const [selectedApptId,  setSelectedApptId] = useState<string | null>(null);
  const [editApptId,      setEditApptId]     = useState<string | null>(null);

  const { data }   = useGetAppointments({ limit: 100 });
  const allAppts   = data?.appointments ?? [];
  const updateAppt = useUpdateAppointment();

  // Derivar selectedAppt del cache — se actualiza automáticamente tras mutaciones
  const selectedAppt = selectedApptId
    ? (allAppts.find((a) => a.id === selectedApptId) ?? null)
    : null;

  const editAppt = editApptId
    ? (allAppts.find((a) => a.id === editApptId) ?? null)
    : null;

  function handleSelect(appt: Appointment) {
    setSelectedApptId(appt.id);
  }

  function handleCellClick(date: string, time: string) {
    setPreset({ date, time });
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setPreset(null);
  }

  function handleStatusChange(status: AppointmentStatus) {
    if (!selectedApptId) return;
    updateAppt.mutate({ id: selectedApptId, status });
  }

  function handleEdit() {
    setEditApptId(selectedApptId);
    setSelectedApptId(null);
  }

  // Navigation
  function navigate(dir: 1 | -1) {
    const d = new Date(anchor);
    if (view === "dia")    d.setDate(d.getDate() + dir);
    if (view === "semana") d.setDate(d.getDate() + dir * 7);
    if (view === "mes")    d.setMonth(d.getMonth() + dir);
    setAnchor(d);
  }

  // Subtitle
  const weekDates = getWeekDates(anchor);
  const anchorYMD = toYMD(anchor);
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
          className="flex items-center gap-1.5 bg-ink text-white text-[13.5px] font-medium rounded-lg px-4 py-2 border-none cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
          onClick={() => { setPreset(null); setModalOpen(true); }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Nuevo turno
        </button>
      }
    >
      {/* Controls */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
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
                  className={`text-lg font-semibold w-8 h-8 rounded-full inline-flex items-center justify-center mt-0.5 ${isToday ? "text-white bg-accent" : "text-ink"}`}
                >
                  {anchor.getDate()}
                </div>
              </div>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
              <div className="grid" style={{ gridTemplateColumns: "60px 1fr" }}>
                <HourGrid />
                <DayColumn date={anchor} appts={dayAppts} isToday={isToday} onSelect={handleSelect} onCellClick={handleCellClick} />
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
            <div className="overflow-x-auto">
              <div className="grid border-b border-line bg-bg" style={{ gridTemplateColumns: "60px repeat(7, minmax(100px, 1fr))", minWidth: 760 }}>
                <div />
                {weekDates.map((d, i) => {
                  const isToday = toYMD(d) === TODAY;
                  return (
                    <div key={i} className="py-3 px-2 text-center border-l border-line">
                      <div className="text-[11px] text-ink-3 uppercase tracking-wider">{DAY_NAMES[d.getDay()]}</div>
                      <div
                        className={`text-lg font-semibold w-8 h-8 rounded-full inline-flex items-center justify-center mt-0.5 ${isToday ? "text-white bg-accent" : "text-ink"}`}
                      >
                        {d.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
                <div className="grid" style={{ gridTemplateColumns: "60px repeat(7, minmax(100px, 1fr))", minWidth: 760 }}>
                  <HourGrid />
                  {weekDates.map((d, di) => {
                    const ymd      = toYMD(d);
                    const isToday  = ymd === TODAY;
                    const dayAppts = weekAppts.filter((a) => a.date === ymd);
                    return <DayColumn key={di} date={d} appts={dayAppts} isToday={isToday} onSelect={handleSelect} onCellClick={handleCellClick} />;
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Vista Mes ── */}
      {view === "mes" && (() => {
        const cells      = getMonthGrid(anchor);
        const monthStart = toYMD(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
        const monthEnd   = toYMD(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0));
        const monthAppts = allAppts.filter((a) => a.date >= monthStart && a.date <= monthEnd);

        return (
          <div className="bg-surface border border-line rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 border-b border-line bg-bg">
              {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((d) => (
                <div key={d} className="py-2 text-center text-[11px] font-semibold text-ink-3 uppercase tracking-wider border-r border-line last:border-r-0">
                  {d}
                </div>
              ))}
            </div>
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
                    className={`border-r border-b border-line last:border-r-0 min-h-[72px] md:min-h-[100px] p-1 md:p-2 cursor-pointer hover:bg-bg transition-colors ${isOtherM ? "opacity-40" : ""}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-semibold mb-1 ${isToday ? "text-white bg-accent" : "text-ink"}`}
                    >
                      {cell.getDate()}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {dayAppts.slice(0, MAX_SHOW).map((appt) => (
                        <div
                          key={appt.id}
                          onClick={(e) => { e.stopPropagation(); handleSelect(appt); }}
                          className="text-[10.5px] font-medium px-1.5 py-0.5 rounded truncate cursor-pointer hover:brightness-95 transition-all text-ink"
                          style={{
                            background: statusBg[appt.status],
                            borderLeft: `2px solid ${statusBorder[appt.status] ?? "var(--color-line)"}`,
                          }}
                        >
                          {appt.time} {appt.clientName ?? appt.serviceName}
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

      {/* Detail panel */}
      {selectedAppt && (
        <ApptDetailPanel
          appt={selectedAppt}
          onClose={() => setSelectedApptId(null)}
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          isPending={updateAppt.isPending}
        />
      )}

      <NuevoTurnoModal
        open={modalOpen}
        onClose={handleModalClose}
        initialDate={preset?.date}
        initialTime={preset?.time}
      />
      {editAppt && (
        <EditTurnoModal
          open={!!editAppt}
          onClose={() => setEditApptId(null)}
          appointment={editAppt}
        />
      )}
    </AppShell>
  );
}
