"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { useGetClients } from "@/hooks/useClients";
import { useGetServices } from "@/hooks/useServices";
import { useCreateAppointment } from "@/hooks/useAppointments";

interface Props {
  open: boolean;
  onClose: () => void;
  initialDate?: string;
  initialTime?: string;
}

const EMPTY = { clientId: "", serviceId: "", date: "", time: "", notes: "" };

export default function NuevoTurnoModal({ open, onClose, initialDate, initialTime }: Props) {
  const [form, setForm] = useState({ ...EMPTY, date: initialDate ?? "", time: initialTime ?? "" });

  // Sync initial values each time the modal opens
  useEffect(() => {
    if (open) setForm({ ...EMPTY, date: initialDate ?? "", time: initialTime ?? "" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const { data: clientData } = useGetClients({ limit: 100 });
  const { data: services = [] } = useGetServices();
  const createAppt = useCreateAppointment();

  const clients = clientData?.clients ?? [];

  function handleClose() {
    setForm(EMPTY);
    createAppt.reset();
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createAppt.mutate(
      {
        serviceId: form.serviceId,
        clientId:  form.clientId  || undefined,
        date:      form.date,
        time:      form.time,
        notes:     form.notes     || undefined,
      },
      { onSuccess: handleClose }
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Nuevo turno">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">Cliente</label>
          <select className="input" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
            <option value="">Sin cliente asignado</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">Servicio</label>
          <select className="input" value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })} required>
            <option value="">Seleccioná un servicio…</option>
            {services.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.duration} min — ${s.price.toLocaleString("es-AR")}</option>)}
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
        {createAppt.error && (
          <p className="text-[12px] m-0" style={{ color: "var(--color-err)" }}>{(createAppt.error as Error).message}</p>
        )}
        <div className="flex gap-3 justify-end mt-1">
          <button type="button" onClick={handleClose} className="border border-line bg-transparent text-ink rounded-lg px-5 py-2 text-[13px] font-medium cursor-pointer hover:bg-bg transition-colors">Cancelar</button>
          <button type="submit" disabled={createAppt.isPending} className="text-white rounded-lg px-5 py-2 text-[13px] font-medium cursor-pointer border-none hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60" style={{ background: "var(--color-accent)" }}>
            {createAppt.isPending ? "Creando…" : "Crear turno"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
