"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import Pagination from "@/components/Pagination";
import EmptyState, { ClientEmptyIcon, SearchEmptyIcon } from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { statusChip } from "@/components/Chip";
import NuevoClienteModal from "@/components/NuevoClienteModal";
import EditClienteModal from "@/components/EditClienteModal";
import { useGetClients, useGetClient } from "@/hooks/useClients";
import { useGetAppointments } from "@/hooks/useAppointments";

const PAGE_LIMIT = 20;

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function ClientesPage() {
  const [searchInput,      setSearchInput]      = useState("");
  const [search,           setSearch]           = useState("");
  const [page,             setPage]             = useState(1);
  const [activeId,         setActiveId]         = useState<string>("");
  const [mobileDetail,     setMobileDetail]     = useState(false);
  const [modalOpen,        setModalOpen]        = useState(false);
  const [editOpen,         setEditOpen]         = useState(false);

  // Debounce search — resetea página al buscar
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data: clientData, isLoading } = useGetClients({ page, limit: PAGE_LIMIT, search: search || undefined });
  const allClients = clientData?.clients ?? [];
  const total      = clientData?.total;

  const grouped: Record<string, typeof allClients> = {};
  for (const c of allClients) {
    const l = c.name[0].toUpperCase();
    if (!grouped[l]) grouped[l] = [];
    grouped[l].push(c);
  }
  const letters = Object.keys(grouped).sort();

  const resolvedActiveId = activeId || allClients[0]?.id || "";

  const { data: active }   = useGetClient(resolvedActiveId);
  const { data: apptData } = useGetAppointments({ clientId: resolvedActiveId, limit: 100 });
  const clientAppts        = apptData?.appointments ?? [];

  return (
    <AppShell
      active="clientes"
      title="Clientes"
      subtitle={total !== undefined ? `${total} cliente${total !== 1 ? "s" : ""}` : undefined}
      actions={
        <button className="flex items-center gap-1.5 bg-ink text-white text-[13.5px] font-medium rounded-lg px-4 py-2 border-none cursor-pointer hover:opacity-90 transition-opacity shadow-sm" onClick={() => setModalOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Nueva cliente
        </button>
      }
    >
      <div className="grid gap-5 h-full grid-cols-1 lg:grid-cols-[360px_1fr]">
        {/* List */}
        <div className="bg-surface border border-line rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 border-b border-line">
            <input
              className="input"
              placeholder="Buscar cliente…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="p-3"><SkeletonList rows={15} /></div>
            ) : allClients.length === 0 ? (
              <EmptyState
                icon={search ? <SearchEmptyIcon /> : <ClientEmptyIcon />}
                title={search ? "Sin resultados" : "Sin clientes registrados"}
                description={search ? `No encontramos clientes para "${search}".` : "Agregá tu primera clienta usando el botón de arriba."}
              />
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
                      onClick={() => { setActiveId(c.id); setMobileDetail(true); }}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-line transition-colors border-l-[3px] ${isActive ? "bg-accent-pale border-l-accent" : "border-l-transparent hover:bg-bg"}`}
                    >
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0 bg-accent-pale text-accent-ink">
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
          <div className="px-3 border-t border-line">
            <Pagination page={page} total={total} limit={PAGE_LIMIT} count={allClients.length} onChange={setPage} />
          </div>
        </div>

        {/* Profile — desktop: columna derecha; mobile: overlay al seleccionar */}
        {active ? (
          <div className={`flex flex-col gap-4 overflow-y-auto
            ${mobileDetail
              ? "fixed inset-0 z-40 bg-bg p-4 lg:static lg:inset-auto lg:z-auto lg:bg-transparent lg:p-0"
              : "hidden lg:flex"
            }`}
          >
            {/* Back button — mobile only */}
            <button
              className="lg:hidden flex items-center gap-2 text-[13px] text-ink-2 hover:text-ink mb-1 bg-transparent border-none cursor-pointer p-0"
              onClick={() => setMobileDetail(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              Volver a clientes
            </button>
            <div className="bg-surface border border-line rounded-lg shadow-sm p-5">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold shrink-0 bg-accent-pale text-accent-ink">
                  {initials(active.name)}
                </div>
                <div className="flex-1">
                  <h2 className="m-0 text-xl font-semibold text-ink">{active.name}</h2>
                  <div className="flex gap-4 mt-1">
                    <span className="font-mono text-xs text-ink-3">{active.phone}</span>
                    {active.email && <span className="font-mono text-xs text-ink-3">{active.email}</span>}
                  </div>
                </div>
                <button
                  onClick={() => setEditOpen(true)}
                  className="border border-line bg-transparent text-ink text-xs rounded-lg px-3 py-1.5 cursor-pointer hover:bg-bg transition-colors"
                >
                  Editar
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5 border-t border-line">
                <div className="text-center">
                  <div className="text-base font-semibold text-ink">{active.visits}</div>
                  <div className="text-[11px] text-ink-3 mt-0.5">Visitas</div>
                </div>
                <div className="text-center bg-ink rounded-lg py-3">
                  <div className="text-base font-semibold text-white">${active.totalSpent.toLocaleString("es-AR")}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>Total gastado</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-semibold text-ink">{active.lastVisitAt ? formatDate(active.lastVisitAt) : "—"}</div>
                  <div className="text-[11px] text-ink-3 mt-0.5">Última visita</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-semibold text-ink">{active.visits > 0 ? "$" + Math.round(active.totalSpent / active.visits).toLocaleString("es-AR") : "—"}</div>
                  <div className="text-[11px] text-ink-3 mt-0.5">Promedio</div>
                </div>
              </div>
            </div>

            {active.notes && (
              <div className="rounded-lg p-5 border bg-accent-pale border-accent-soft">
                <div className="text-[11px] font-semibold uppercase tracking-wider mb-2 text-accent-ink">Notas privadas</div>
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
      {active && (
        <EditClienteModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          client={active}
        />
      )}
    </AppShell>
  );
}
