"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import Pagination from "@/components/Pagination";
import EmptyState, { CalendarEmptyIcon, SearchEmptyIcon } from "@/components/EmptyState";
import { SkeletonTableRows } from "@/components/Skeleton";
import { statusChip } from "@/components/Chip";
import NuevoTurnoModal from "@/components/NuevoTurnoModal";
import EditTurnoModal from "@/components/EditTurnoModal";
import { useGetAppointments } from "@/hooks/useAppointments";
import type { Appointment, AppointmentStatus } from "@/lib/api/appointments";

type Filter = "todos" | AppointmentStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "todos",            label: "Todos"          },
  { key: "confirmed",        label: "Confirmados"    },
  { key: "awaiting_payment", label: "Esperando pago" },
  { key: "pending",          label: "Pendientes"     },
  { key: "completed",        label: "Completados"    },
  { key: "cancelled",        label: "Cancelados"     },
  { key: "no_show",          label: "No asistió"     },
];

const PAGE_LIMIT = 15;

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

function statusColor(s: AppointmentStatus): string {
  switch (s) {
    case "confirmed":        return "var(--color-ok)";
    case "completed":        return "var(--color-info)";
    case "cancelled":
    case "no_show":          return "var(--color-err)";
    case "pending":
    case "awaiting_payment": return "var(--color-warn)";
    default:                 return "transparent";
  }
}

export default function TurnosPage() {
  const [filter, setFilter]       = useState<Filter>("todos");
  const [page,   setPage]         = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAppt,  setEditAppt]  = useState<Appointment | null>(null);

  function handleFilter(f: Filter) {
    setFilter(f);
    setPage(1);
  }

  const { data: apptData, isLoading } = useGetAppointments({
    page,
    limit: PAGE_LIMIT,
    status: filter !== "todos" ? filter : undefined,
  });
  const appts = apptData?.appointments ?? [];
  const total = apptData?.total;

  return (
    <AppShell
      active="turnos"
      title="Turnos"
      subtitle={total !== undefined ? `${total} turno${total !== 1 ? "s" : ""}` : undefined}
      actions={
        <button
          className="flex items-center gap-1.5 bg-ink text-white text-[13.5px] font-medium rounded-lg px-4 py-2 border-none cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
          onClick={() => setModalOpen(true)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Nuevo turno
        </button>
      }
    >
      <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-1">
        <div className="seg shrink-0">
          {FILTERS.map((f) => (
            <button key={f.key} className={`seg-item${filter === f.key ? " active" : ""}`} onClick={() => handleFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-line rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <>
            <table className="tbl hidden md:table"><tbody><SkeletonTableRows cols={8} rows={10} /></tbody></table>
            <div className="md:hidden flex flex-col divide-y divide-line">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4 flex gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-lg bg-bg-2 shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-3.5 bg-bg-2 rounded w-2/3" />
                    <div className="h-3 bg-bg-2 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : appts.length === 0 ? (
          <EmptyState
            icon={filter === "todos" ? <CalendarEmptyIcon /> : <SearchEmptyIcon />}
            title={filter === "todos" ? "Sin turnos registrados" : `Sin turnos "${FILTERS.find(f => f.key === filter)?.label}"`}
            description={filter === "todos" ? "Creá tu primer turno usando el botón de arriba." : "No hay turnos con este estado en la página actual."}
          />
        ) : (
          <>
            {/* Desktop: tabla */}
            <table className="tbl hidden md:table">
              <thead>
                <tr>
                  <th>Fecha</th><th>Hora</th><th>Cliente</th><th>Servicio</th><th>Duración</th><th>Precio</th><th>Estado</th><th className="w-[60px]" />
                </tr>
              </thead>
              <tbody>
                {appts.map((appt, index) => (
                  <tr
                    key={appt.id}
                    className="cursor-pointer"
                    style={{
                      animation: "fade-in-up var(--dur-base) var(--ease-out) both",
                      animationDelay: `${index * 25}ms`,
                    }}
                  >
                    <td style={{ borderLeft: `3px solid ${statusColor(appt.status)}` }}><span className="font-mono text-[12px] text-ink-2">{formatDate(appt.date)}</span></td>
                    <td><span className="font-mono text-[12px] font-semibold">{appt.time}</span></td>
                    <td className="text-ink font-medium">{appt.clientName ?? <span className="text-ink-3">—</span>}</td>
                    <td className="text-ink-2">{appt.serviceName}</td>
                    <td><span className="font-mono text-[12px] text-ink-2">{appt.duration} min</span></td>
                    <td><span className="font-mono text-[12px] font-semibold">${appt.price.toLocaleString("es-AR")}</span></td>
                    <td>{statusChip(appt.status)}</td>
                    <td>
                      <button
                        onClick={() => setEditAppt(appt)}
                        className="bg-transparent border-none cursor-pointer text-ink-3 hover:bg-bg-2 hover:text-ink rounded px-2 py-1 text-sm transition-colors"
                      >
                        ✎
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile: cards */}
            <div className="md:hidden flex flex-col divide-y divide-line">
              {appts.map((appt, index) => (
                <div
                  key={appt.id}
                  className="p-4"
                  style={{
                    animation: "fade-in-up var(--dur-base) var(--ease-out) both",
                    animationDelay: `${index * 25}ms`,
                    borderLeft: `3px solid ${statusColor(appt.status)}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[13px] font-semibold text-ink">{appt.time}</span>
                        <span className="font-mono text-[11px] text-ink-3">{formatDate(appt.date)}</span>
                      </div>
                      <div className="text-[14px] font-medium text-ink truncate">{appt.clientName ?? <span className="text-ink-3">Sin cliente</span>}</div>
                      <div className="text-[12px] text-ink-3 mt-0.5">{appt.serviceName} · {appt.duration} min · <span className="font-mono">${appt.price.toLocaleString("es-AR")}</span></div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {statusChip(appt.status)}
                      <button
                        onClick={() => setEditAppt(appt)}
                        className="bg-transparent border-none cursor-pointer text-ink-3 hover:bg-bg-2 hover:text-ink rounded px-2 py-1 text-sm transition-colors"
                      >
                        ✎
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Pagination page={page} total={total} limit={PAGE_LIMIT} count={appts.length} onChange={setPage} />

      <NuevoTurnoModal open={modalOpen} onClose={() => setModalOpen(false)} />
      {editAppt && (
        <EditTurnoModal
          open={!!editAppt}
          onClose={() => setEditAppt(null)}
          appointment={editAppt}
        />
      )}
    </AppShell>
  );
}
