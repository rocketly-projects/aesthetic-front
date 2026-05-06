"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { statusChip } from "@/components/Chip";
import NuevoClienteModal from "@/components/NuevoClienteModal";
import { useGetClients, useGetClient } from "@/hooks/useClients";
import { useGetAppointments } from "@/hooks/useAppointments";

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function ClientesPage() {
  const [search,    setSearch]    = useState("");
  const [activeId,  setActiveId]  = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);

  const { data: clientData, isLoading } = useGetClients({ limit: 100 });
  const allClients = clientData?.clients ?? [];

  const filtered = allClients.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const grouped: Record<string, typeof filtered> = {};
  for (const c of filtered) {
    const l = c.name[0].toUpperCase();
    if (!grouped[l]) grouped[l] = [];
    grouped[l].push(c);
  }
  const letters = Object.keys(grouped).sort();

  const resolvedActiveId = activeId || allClients[0]?.id || "";

  const { data: active }      = useGetClient(resolvedActiveId);
  const { data: apptData }    = useGetAppointments({ clientId: resolvedActiveId, limit: 100 });
  const clientAppts           = apptData?.appointments ?? [];

  return (
    <AppShell
      active="clientes"
      title="Clientes"
      subtitle={`${allClients.length} clientes`}
      actions={
        <button className="flex items-center gap-1.5 text-white text-[13.5px] font-medium rounded-lg px-4 py-2 border-none cursor-pointer hover:opacity-90 transition-opacity shadow-sm" style={{ background: "var(--color-ink)" }} onClick={() => setModalOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Nueva cliente
        </button>
      }
    >
      <div className="grid gap-5 h-full" style={{ gridTemplateColumns: "360px 1fr" }}>
        {/* List */}
        <div className="bg-surface border border-line rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 border-b border-line">
            <input className="input" placeholder="Buscar cliente…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="p-6 text-center text-[13px] text-ink-3">Cargando clientes…</div>
            ) : letters.map((letter) => (
              <div key={letter}>
                <div className="px-4 py-1.5 text-[10.5px] font-semibold text-ink-3 uppercase tracking-widest bg-bg border-b border-line">
                  {letter}
                </div>
                {grouped[letter].map((c) => {
                  const isActive = c.id === resolvedActiveId;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setActiveId(c.id)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-line transition-colors ${isActive ? "border-l-[3px]" : "border-l-[3px] border-l-transparent hover:bg-bg"}`}
                      style={isActive ? { background: "var(--color-accent-pale)", borderLeftColor: "var(--color-accent)" } : undefined}
                    >
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0" style={{ background: "var(--color-accent-pale)", color: "var(--color-accent-ink)" }}>
                        {initials(c.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-ink">{c.name}</div>
                        <div className="font-mono text-[11px] text-ink-3">{c.phone}</div>
                      </div>
                      <div className="text-[11px] text-ink-3">{c.visits} visitas</div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Profile */}
        {active ? (
          <div className="flex flex-col gap-4 overflow-y-auto">
            <div className="bg-surface border border-line rounded-lg shadow-sm p-5">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold shrink-0" style={{ background: "var(--color-accent-pale)", color: "var(--color-accent-ink)" }}>
                  {initials(active.name)}
                </div>
                <div className="flex-1">
                  <h2 className="m-0 text-xl font-semibold text-ink">{active.name}</h2>
                  <div className="flex gap-4 mt-1">
                    <span className="font-mono text-xs text-ink-3">{active.phone}</span>
                    {active.email && <span className="font-mono text-xs text-ink-3">{active.email}</span>}
                  </div>
                </div>
                <button className="border border-line bg-transparent text-ink text-xs rounded-lg px-3 py-1.5 cursor-pointer hover:bg-bg transition-colors">Editar</button>
              </div>
              <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-line">
                {[
                  { label: "Visitas",       val: active.visits },
                  { label: "Total gastado", val: "$" + active.totalSpent.toLocaleString("es-AR") },
                  { label: "Última visita", val: active.lastVisitAt ? formatDate(active.lastVisitAt) : "—" },
                  { label: "Promedio",      val: active.visits > 0 ? "$" + Math.round(active.totalSpent / active.visits).toLocaleString("es-AR") : "—" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-base font-semibold text-ink">{s.val}</div>
                    <div className="text-[11px] text-ink-3 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {active.notes && (
              <div className="rounded-lg p-5 border" style={{ background: "var(--color-accent-pale)", borderColor: "var(--color-accent-soft)" }}>
                <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-accent-ink)" }}>Notas privadas</div>
                <p className="m-0 text-[13px] text-ink-2 leading-relaxed">{active.notes}</p>
              </div>
            )}

            <div className="bg-surface border border-line rounded-lg shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-line font-semibold text-sm text-ink">Historial de turnos</div>
              {clientAppts.length === 0 ? (
                <div className="p-6 text-center text-[13px] text-ink-3">Sin turnos registrados</div>
              ) : (
                <table className="tbl">
                  <thead><tr><th>Fecha</th><th>Hora</th><th>Servicio</th><th>Precio</th><th>Estado</th></tr></thead>
                  <tbody>
                    {clientAppts.map((a) => (
                      <tr key={a.id}>
                        <td><span className="font-mono text-[12px]">{formatDate(a.date)}</span></td>
                        <td><span className="font-mono text-[12px]">{a.time}</span></td>
                        <td>{a.serviceName}</td>
                        <td><span className="font-mono text-[12px]">${a.price.toLocaleString("es-AR")}</span></td>
                        <td>{statusChip(a.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center text-[13px] text-ink-3">
            {isLoading ? "Cargando…" : "Seleccioná un cliente"}
          </div>
        )}
      </div>
      <NuevoClienteModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </AppShell>
  );
}
