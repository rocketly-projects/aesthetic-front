"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { statusChip } from "@/components/Chip";
import Modal from "@/components/Modal";
import { ALL_APPTS, CLIENTS, SERVICES } from "@/lib/data";
import type { Appointment } from "@/lib/types";

type Filter = "todos" | "confirmed" | "pending" | "completed" | "cancelled";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "todos",     label: "Todos"       },
  { key: "confirmed", label: "Confirmados" },
  { key: "pending",   label: "Pendientes"  },
  { key: "completed", label: "Completados" },
  { key: "cancelled", label: "Cancelados"  },
];

function count(status: Filter) {
  return status === "todos" ? ALL_APPTS.length : ALL_APPTS.filter((a) => a.status === status).length;
}

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function TurnosPage() {
  const [filter, setFilter] = useState<Filter>("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ clientId: "", serviceId: "", date: "", time: "", notes: "" });

  const visible: Appointment[] = filter === "todos" ? ALL_APPTS : ALL_APPTS.filter((a) => a.status === filter);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setModalOpen(false);
    setForm({ clientId: "", serviceId: "", date: "", time: "", notes: "" });
  }

  return (
    <AppShell
      active="turnos"
      title="Turnos"
      subtitle={`${ALL_APPTS.length} turnos en total`}
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
            <button key={f.key} className={`seg-item${filter === f.key ? " active" : ""}`} onClick={() => setFilter(f.key)}>
              {f.label}
              <span className={`ml-1.5 rounded-full text-[10px] font-semibold px-1.5 ${filter === f.key ? "bg-accent-pale text-accent-ink" : "bg-line text-ink-3"}`}>
                {count(f.key)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-line rounded-lg shadow-sm overflow-hidden">
        <table className="tbl">
          <thead>
            <tr>
              <th>Fecha</th><th>Hora</th><th>Cliente</th><th>Servicio</th><th>Duración</th><th>Precio</th><th>Estado</th><th className="w-[60px]" />
            </tr>
          </thead>
          <tbody>
            {visible.map((appt) => (
              <tr key={appt.id} className="cursor-pointer">
                <td><span className="font-mono text-[12px] text-ink-2">{formatDate(appt.date)}</span></td>
                <td><span className="font-mono text-[12px] font-semibold">{appt.time}</span></td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0" style={{ background: "var(--color-accent-pale)", color: "var(--color-accent-ink)" }}>
                      {appt.clientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-[13px] font-medium text-ink">{appt.clientName}</div>
                      <div className="font-mono text-[11px] text-ink-3">{appt.clientPhone}</div>
                    </div>
                  </div>
                </td>
                <td className="text-ink-2">{appt.serviceName}</td>
                <td><span className="font-mono text-[12px] text-ink-2">{appt.duration} min</span></td>
                <td><span className="font-mono text-[12px] font-semibold">${appt.price.toLocaleString("es-AR")}</span></td>
                <td>{statusChip(appt.status)}</td>
                <td>
                  <div className="flex gap-1">
                    <button className="bg-transparent border-none cursor-pointer text-ink-3 hover:bg-bg-2 hover:text-ink rounded px-2 py-1 text-sm transition-colors">✎</button>
                    <button className="bg-transparent border-none cursor-pointer text-ink-3 hover:bg-bg-2 hover:text-ink rounded px-2 py-1 text-sm transition-colors">⋯</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo turno">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">Cliente</label>
            <select className="input" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} required>
              <option value="">Seleccioná un cliente…</option>
              {CLIENTS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">Servicio</label>
            <select className="input" value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })} required>
              <option value="">Seleccioná un servicio…</option>
              {SERVICES.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.duration} min — ${s.price.toLocaleString("es-AR")}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">Fecha</label>
              <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">Hora</label>
              <input className="input" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">Notas</label>
            <textarea className="input resize-y" rows={3} placeholder="Notas internas…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex gap-3 justify-end mt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="border border-line bg-transparent text-ink rounded-lg px-5 py-2 text-[13px] font-medium cursor-pointer hover:bg-bg transition-colors">Cancelar</button>
            <button type="submit" className="text-white rounded-lg px-5 py-2 text-[13px] font-medium cursor-pointer border-none hover:opacity-90 transition-opacity shadow-sm" style={{ background: "var(--color-accent)" }}>Crear turno</button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
