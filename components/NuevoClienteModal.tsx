"use client";

import { useState } from "react";
import Drawer from "./Drawer";
import { useCreateClient } from "@/hooks/useClients";

interface Props {
  open: boolean;
  onClose: () => void;
}

const EMPTY = { name: "", phone: "", email: "", notes: "" };

export default function NuevoClienteModal({ open, onClose }: Props) {
  const [form, setForm] = useState(EMPTY);
  const createClient = useCreateClient();

  function handleClose() {
    setForm(EMPTY);
    createClient.reset();
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createClient.mutate(
      {
        name:  form.name,
        phone: form.phone,
        email: form.email || undefined,
        notes: form.notes || undefined,
      },
      { onSuccess: handleClose }
    );
  }

  return (
    <Drawer open={open} onClose={handleClose} title="Nueva cliente">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">Nombre</label>
          <input className="input" placeholder="Ana García" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">Teléfono</label>
          <input className="input" type="tel" placeholder="+54 9 11 0000-0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">Email</label>
          <input className="input" type="email" placeholder="ana@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">Notas privadas</label>
          <textarea className="input resize-y" rows={3} placeholder="Preferencias, alergias…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        {createClient.error && (
          <p className="text-[12px] m-0 text-err">{(createClient.error as Error).message}</p>
        )}
        <div className="flex gap-3 justify-end mt-1">
          <button type="button" onClick={handleClose} className="border border-line bg-transparent text-ink rounded-lg px-5 py-2 text-[13px] font-medium cursor-pointer hover:bg-bg transition-colors">Cancelar</button>
          <button type="submit" disabled={createClient.isPending} className="bg-accent text-white rounded-lg px-5 py-2 text-[13px] font-medium cursor-pointer border-none hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60">
            {createClient.isPending ? "Creando…" : "Crear cliente"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
