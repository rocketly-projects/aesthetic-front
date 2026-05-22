"use client";

import { useState } from "react";
import Drawer from "./Drawer";
import { useGoogleAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api/client";

interface Props {
  credential: string;
  onClose: () => void;
}

export default function CompleteGoogleRegisterModal({ credential, onClose }: Props) {
  const [businessName, setBusinessName] = useState("");
  const googleAuth = useGoogleAuth("/planes");

  const errorMsg = googleAuth.error instanceof ApiError
    ? googleAuth.error.message
    : googleAuth.error
    ? "Error al crear la cuenta"
    : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    googleAuth.mutate({ credential, businessName });
  }

  return (
    <Drawer open onClose={onClose} title="Un último paso">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-[13px] text-ink-2 m-0 leading-relaxed">
          ¡Bienvenida! Tu cuenta de Google fue verificada. Solo necesitamos el nombre de tu negocio para terminar de configurar tu cuenta.
        </p>
        <div>
          <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">
            Nombre del negocio
          </label>
          <input
            className="input"
            placeholder="Aesthetic Studio"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
            autoFocus
          />
        </div>
        {errorMsg && (
          <p className="text-[12px] m-0 text-err">{errorMsg}</p>
        )}
        <div className="flex gap-3 justify-end mt-1">
          <button
            type="button"
            onClick={onClose}
            className="border border-line bg-transparent text-ink rounded-lg px-5 py-2 text-[13px] font-medium cursor-pointer hover:bg-bg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={googleAuth.isPending}
            className="bg-accent text-white rounded-lg px-5 py-2 text-[13px] font-medium cursor-pointer border-none hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60"
          >
            {googleAuth.isPending ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
