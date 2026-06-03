"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useResetPassword } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api/client";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [matchErr,  setMatchErr]  = useState("");

  const { mutate, isPending, error } = useResetPassword();
  const errorMsg = error instanceof ApiError ? error.message : error ? "Ocurrió un error, intentá de nuevo" : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setMatchErr("Las contraseñas no coinciden.");
      return;
    }
    setMatchErr("");
    mutate({ token, password });
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-[14px] text-err mb-4">El link no es válido o ya fue usado.</p>
        <a href="/forgot-password" className="text-[13px] text-accent-ink font-medium no-underline hover:underline">
          Solicitar uno nuevo
        </a>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-[32px] leading-[1.05] tracking-[-0.03em] m-0 mb-2 font-normal text-ink">
        Nueva<br /><em className="italic text-accent font-normal">contraseña</em>.
      </h1>
      <p className="text-sm text-ink-3 mt-0 mb-7">
        Elegí una contraseña de al menos 8 caracteres.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-3.5">
          <label className="block text-[12.5px] font-medium text-ink-2 mb-1.5">Nueva contraseña</label>
          <input
            className="input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoFocus
            autoComplete="new-password"
          />
        </div>

        <div className="mb-5">
          <label className="block text-[12.5px] font-medium text-ink-2 mb-1.5">Confirmar contraseña</label>
          <input
            className={`input${matchErr ? " border-err" : ""}`}
            type="password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setMatchErr(""); }}
            required
            autoComplete="new-password"
          />
          {matchErr && <p className="text-[12px] text-err mt-1 m-0">{matchErr}</p>}
        </div>

        {errorMsg && (
          <p className="text-[12px] mb-3 text-err m-0">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-11 bg-ink text-bg border-0 rounded-md text-[14px] font-medium cursor-pointer tracking-[-0.005em] transition-colors hover:bg-[#1a1815] disabled:opacity-60"
        >
          {isPending ? "Guardando…" : "Guardar contraseña"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center gap-3 mb-10">
          <img src="/logoDark.svg" alt="aesthetic" className="w-9 h-9 rounded-full shrink-0" />
          <span className="text-[21px] font-medium tracking-[-0.02em] font-display text-ink">
            aesthetic<em className="not-italic text-accent">.</em>
          </span>
        </div>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
