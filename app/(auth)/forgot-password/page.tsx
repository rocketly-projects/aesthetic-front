"use client";

import { useState } from "react";
import { useForgotPassword } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const { mutate, isPending, isSuccess, error } = useForgotPassword();

  const errorMsg = error instanceof ApiError ? error.message : error ? "Ocurrió un error, intentá de nuevo" : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutate(email);
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[380px]">

        {/* Brand */}
        <div className="flex items-center gap-3 mb-10">
          <img src="/logoDark.svg" alt="aesthetic" className="w-9 h-9 rounded-full shrink-0" />
          <span className="text-[21px] font-medium tracking-[-0.02em] font-display text-ink">
            aesthetic<em className="not-italic text-accent">.</em>
          </span>
        </div>

        {isSuccess ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-accent-pale flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <h1 className="font-display text-[28px] font-normal text-ink tracking-[-0.02em] m-0 mb-2">
              Revisá tu email
            </h1>
            <p className="text-[14px] text-ink-3 mb-6">
              Si <strong className="text-ink">{email}</strong> está registrado, te enviamos un link para restablecer tu contraseña. Expira en 1 hora.
            </p>
            <a href="/login" className="text-[13px] text-accent-ink font-medium no-underline hover:underline">
              ← Volver al inicio de sesión
            </a>
          </div>
        ) : (
          <>
            <h1 className="font-display text-[32px] leading-[1.05] tracking-[-0.03em] m-0 mb-2 font-normal text-ink">
              Olvidé mi<br /><em className="italic text-accent font-normal">contraseña</em>.
            </h1>
            <p className="text-sm text-ink-3 mt-0 mb-7">
              Ingresá tu email y te enviamos un link para restablecerla.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block text-[12.5px] font-medium text-ink-2 mb-1.5">Email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="marina@aesthetic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>

              {errorMsg && (
                <p className="text-[12px] mb-3 text-err m-0">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-11 bg-ink text-bg border-0 rounded-md text-[14px] font-medium cursor-pointer tracking-[-0.005em] transition-colors hover:bg-[#1a1815] disabled:opacity-60"
              >
                {isPending ? "Enviando…" : "Enviar link de recuperación"}
              </button>
            </form>

            <div className="text-center mt-6">
              <a href="/login" className="text-[13px] text-ink-3 no-underline hover:text-ink transition-colors">
                ← Volver al inicio de sesión
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
