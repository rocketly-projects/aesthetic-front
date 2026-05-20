"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import Pagination from "@/components/Pagination";
import { statusChip } from "@/components/Chip";
import NuevoTurnoModal from "@/components/NuevoTurnoModal";
import EditTurnoModal from "@/components/EditTurnoModal";
import { useGetAppointments, useUpdateAppointment } from "@/hooks/useAppointments";
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

const QUICK_STATUSES: { status: AppointmentStatus; label: string }[] = [
  { status: "confirmed", label: "Confirmar"   },
  { status: "completed", label: "Completar"   },
  { status: "cancelled", label: "Cancelar"    },
  { status: "no_show",   label: "No asistió"  },
];

export default function TurnosPage() {
  const [filter, setFilter]       = useState<Filter>("todos");
  const [page,   setPage]         = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAppt,  setEditAppt]  = useState<Appointment | null>(null);
  const [menuId,    setMenuId]    = useState<string | null>(null);

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

  const updateAppt = useUpdateAppointment();

  function handleQuickStatus(appt: Appointment, status: AppointmentStatus) {
    setMenuId(null);
    updateAppt.mutate({ id: appt.id, status });
  }

  return (
    <AppShell
      active="turnos"
      title="Turnos"
      subtitle={total !== undefined ? `${total} turno${total !== 1 ? "s" : ""}` : undefined}
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
      <div className="flex items-center gap-3 mb-4">
        <div className="seg">
          {FILTERS.map((f) => (
            <button key={f.key} className={`seg-item${filter === f.key ? " active" : ""}`} onClick={() => handleFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-line rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-[13px] text-ink-3">Cargando turnos…</div>
        ) : appts.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-ink-3">
            {filter === "todos" ? "No hay turnos registrados" : `No hay turnos con estado "${FILTERS.find(f => f.key === filter)?.label}"`}
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Fecha</th><th>Hora</th><th>Cliente</th><th>Servicio</th><th>Duración</th><th>Precio</th><th>Estado</th><th className="w-[60px]" />
              </tr>
            </thead>
            <tbody>
              {appts.map((appt) => (
                <tr key={appt.id} className="cursor-pointer">
                  <td><span className="font-mono text-[12px] text-ink-2">{formatDate(appt.date)}</span></td>
                  <td><span className="font-mono text-[12px] font-semibold">{appt.time}</span></td>
                  <td className="text-ink font-medium">{appt.clientName ?? <span className="text-ink-3">—</span>}</td>
                  <td className="text-ink-2">{appt.serviceName}</td>
                  <td><span className="font-mono text-[12px] text-ink-2">{appt.duration} min</span></td>
                  <td><span className="font-mono text-[12px] font-semibold">${appt.price.toLocaleString("es-AR")}</span></td>
                  <td>{statusChip(appt.status)}</td>
                  <td>
                    <div className="flex gap-1 relative">
                      <button
                        onClick={() => setEditAppt(appt)}
                        className="bg-transparent border-none cursor-pointer text-ink-3 hover:bg-bg-2 hover:text-ink rounded px-2 py-1 text-sm transition-colors"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => setMenuId(menuId === appt.id ? null : appt.id)}
                        className="bg-transparent border-none cursor-pointer text-ink-3 hover:bg-bg-2 hover:text-ink rounded px-2 py-1 text-sm transition-colors"
                      >
                        ⋯
                      </button>
                      {menuId === appt.id && (
                        <div className="absolute right-0 top-full mt-1 z-50 bg-surface border border-line rounded-lg shadow-lg overflow-hidden min-w-[130px]">
                          {QUICK_STATUSES.filter((q) => q.status !== appt.status).map((q) => (
                            <button
                              key={q.status}
                              onClick={() => handleQuickStatus(appt, q.status)}
                              className="w-full text-left px-3 py-2 text-[12.5px] text-ink-2 hover:bg-bg hover:text-ink border-none bg-transparent cursor-pointer transition-colors"
                            >
                              {q.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
