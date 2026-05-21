"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import EmptyState, { ScissorsEmptyIcon } from "@/components/EmptyState";
import KPI from "@/components/KPI";
import NuevoServicioModal from "@/components/NuevoServicioModal";
import EditServicioModal from "@/components/EditServicioModal";
import { useGetServices } from "@/hooks/useServices";
import type { Service } from "@/lib/api/services";

export default function ServiciosPage() {
  const [hoverAdd,    setHoverAdd]    = useState(false);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);

  const { data: services = [], isLoading } = useGetServices();
  const visible    = services.filter((s) => s.visible);
  const avgPrice   = services.length ? Math.round(services.reduce((a, s) => a + s.price, 0)    / services.length) : 0;
  const avgDuration = services.length ? Math.round(services.reduce((a, s) => a + s.duration, 0) / services.length) : 0;

  return (
    <AppShell
      active="servicios"
      title="Servicios"
      subtitle={`${services.length} servicios configurados`}
      actions={
        <button className="flex items-center gap-1.5 bg-ink text-white text-[13.5px] font-medium rounded-lg px-4 py-2 border-none cursor-pointer hover:opacity-90 transition-opacity shadow-sm" onClick={() => setModalOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Agregar servicio
        </button>
      }
    >
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPI lbl="Total servicios"   val={services.length} />
        <KPI lbl="Activos"           val={visible.length}  delta={`${services.length - visible.length} ocultos`} />
        <KPI lbl="Precio promedio"   val={"$" + avgPrice.toLocaleString("es-AR")} />
        <KPI lbl="Duración promedio" val={`${avgDuration} min`} />
      </div>

      {isLoading ? (
        <div className="text-center text-[13px] text-ink-3 py-12">Cargando servicios…</div>
      ) : services.length === 0 ? (
        <div className="bg-surface border border-line rounded-lg shadow-sm">
          <EmptyState
            icon={<ScissorsEmptyIcon />}
            title="Sin servicios configurados"
            description="Agregá tu primer servicio para empezar a recibir turnos."
            action={
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1.5 bg-accent text-white text-[13px] font-medium rounded-lg px-4 py-2 border-none cursor-pointer hover:opacity-90 transition-opacity"
              >
                Agregar servicio
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {services.map((s) => (
            <div key={s.id} className={`bg-surface border border-line rounded-lg shadow-sm overflow-hidden ${!s.visible ? "opacity-60" : ""}`}>
              <div className="h-1.5" style={{ background: s.color }} />
              <div className="p-4">
                <div className="text-[10px] font-semibold text-ink-3 uppercase tracking-widest mb-2">{s.category}</div>
                <h3 className="m-0 mb-3 text-[15px] font-semibold text-ink">{s.name}</h3>
                <div className="flex gap-6 mb-4">
                  <div>
                    <div className="font-mono text-base font-semibold text-ink">${s.price.toLocaleString("es-AR")}</div>
                    <div className="text-[11px] text-ink-3">precio</div>
                  </div>
                  <div>
                    <div className="font-mono text-base font-semibold text-ink">{s.duration} min</div>
                    <div className="text-[11px] text-ink-3">duración</div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-line">
                  <span className={`text-[11px] font-medium ${s.visible ? "text-ok" : "text-ink-3"}`}>
                    {s.visible ? "● Visible" : "○ Oculto"}
                  </span>
                  <button
                    onClick={() => setEditService(s)}
                    className="bg-transparent border-none cursor-pointer text-[12px] text-ink-2 hover:bg-bg-2 hover:text-ink rounded px-2 py-1 transition-colors"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div
            onMouseEnter={() => setHoverAdd(true)}
            onMouseLeave={() => setHoverAdd(false)}
            onClick={() => setModalOpen(true)}
            className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-8 cursor-pointer transition-colors min-h-[180px] ${hoverAdd ? "border-accent text-accent" : "border-line-2 text-ink-3"}`}
          >
            <span className="text-3xl leading-none">+</span>
            <span className="text-[13px] font-medium mt-2">Agregar servicio</span>
          </div>
        </div>
      )}
      <NuevoServicioModal open={modalOpen} onClose={() => setModalOpen(false)} />
      {editService && (
        <EditServicioModal
          open={!!editService}
          onClose={() => setEditService(null)}
          service={editService}
        />
      )}
    </AppShell>
  );
}
