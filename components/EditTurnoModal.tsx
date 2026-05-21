"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { useUpdateAppointment } from "@/hooks/useAppointments";
import type { Appointment, AppointmentStatus } from "@/lib/api/appointments";

interface Props {
  open: boolean;
  onClose: () => void;
  appointment: Appointment;
}

const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: "pending",   label: "Pendiente"  },
  { value: "confirmed", label: "Confirmado" },
  { value: "completed", label: "Completado" },
  { value: "cancelled", label: "Cancelado"  },
  { value: "no_show",   label: "No asistió" },
];

export default function EditTurnoModal({ open, onClose, appointment }: Props) {
  const [form, setForm] = useState({
    status: appointment.status,
    date:   appointment.date,
    time:   appointment.time,
    notes:  appointment.notes ?? "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        status: appointment.status,
        date:   appointment.date,
        time:   appointment.time,
        notes:  appointment.notes ?? "",
      });
    }
  }, [open, appointment]);

  const updateAppt = useUpdateAppointment();

  function handleClose() {
    updateAppt.reset();
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateAppt.mutate(
      {
        id:     appointment.id,
        status: form.status,
        date:   form.date,
        time:   form.time,
        notes:  form.notes || undefined,
      },
      { onSuccess: handleClose }
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Editar turno">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">Estado</label>
          <select
            className="input"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as AppointmentStatus })}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">Fecha</label>
            <input
              className="input"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">Hora</label>
            <input
              className="input"
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">Notas</label>
          <textarea
            className="input resize-y"
            rows={3}
            placeholder="Notas internas…"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        {updateAppt.error && (
          <p className="text-[12px] m-0 text-err">{(updateAppt.error as Error).message}</p>
        )}
        <div className="flex gap-3 justify-end mt-1">
          <button
            type="button"
            onClick={handleClose}
            className="border border-line bg-transparent text-ink rounded-lg px-5 py-2 text-[13px] font-medium cursor-pointer hover:bg-bg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={updateAppt.isPending}
            className="bg-accent text-white rounded-lg px-5 py-2 text-[13px] font-medium cursor-pointer border-none hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60"
          >
            {updateAppt.isPending ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
