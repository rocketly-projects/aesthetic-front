"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { useUpdateService } from "@/hooks/useServices";
import type { Service } from "@/lib/api/services";

interface Props {
  open: boolean;
  onClose: () => void;
  service: Service;
}

export default function EditServicioModal({ open, onClose, service }: Props) {
  const [form, setForm] = useState({
    name:     service.name,
    category: service.category,
    duration: String(service.duration),
    price:    String(service.price),
    color:    service.color,
    visible:  service.visible,
  });

  useEffect(() => {
    if (open) {
      setForm({
        name:     service.name,
        category: service.category,
        duration: String(service.duration),
        price:    String(service.price),
        color:    service.color,
        visible:  service.visible,
      });
    }
  }, [open, service]);

  const updateService = useUpdateService();

  function handleClose() {
    updateService.reset();
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateService.mutate(
      {
        id:       service.id,
        name:     form.name,
        category: form.category,
        duration: Number(form.duration),
        price:    Number(form.price),
        color:    form.color,
        visible:  form.visible,
      },
      { onSuccess: handleClose }
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Editar servicio">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">Nombre</label>
          <input
            className="input"
            placeholder="Corte y peinado"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">Categoría</label>
          <input
            className="input"
            placeholder="Corte, Color, Tratamiento…"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">Duración (min)</label>
            <input
              className="input"
              type="number"
              min="1"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">Precio ($)</label>
            <input
              className="input"
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">Color</label>
            <input
              className="input"
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              style={{ height: "2.5rem", padding: "2px 6px", cursor: "pointer" }}
            />
          </div>
          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="edit-svc-visible"
              checked={form.visible}
              onChange={(e) => setForm({ ...form, visible: e.target.checked })}
              className="w-3.5 h-3.5 accent-accent"
            />
            <label htmlFor="edit-svc-visible" className="text-[13px] text-ink-2 cursor-pointer">
              Visible para reservas
            </label>
          </div>
        </div>
        {updateService.error && (
          <p className="text-[12px] m-0 text-err">{(updateService.error as Error).message}</p>
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
            disabled={updateService.isPending}
            className="bg-accent text-white rounded-lg px-5 py-2 text-[13px] font-medium cursor-pointer border-none hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60"
          >
            {updateService.isPending ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
