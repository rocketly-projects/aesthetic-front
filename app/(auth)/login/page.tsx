"use client";

import { useState } from "react";
import { useLogin } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api/client";

export default function LoginPage() {
  const { mutate: login, isPending, error } = useLogin();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const errorMsg = error instanceof ApiError ? error.message : error ? "Error al iniciar sesión" : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login({ email, password });
  }

  return (
    <div className="grid grid-cols-2 h-screen" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Left — form */}
      <div className="flex flex-col justify-center bg-surface px-20 py-16">
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-10">
          <span
            className="flex items-center justify-center text-white font-semibold text-sm shrink-0"
            style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--color-accent)", fontFamily: "var(--font-display)" }}
          >
            a
          </span>
          <span className="text-[17px] font-semibold text-ink" style={{ fontFamily: "var(--font-display)" }}>
            aesthetic<em className="not-italic text-accent">.</em>
          </span>
        </div>

        <h1
          className="m-0 mb-2 text-[28px] font-normal text-ink"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.02em" }}
        >
          Bienvenida de nuevo
        </h1>
        <p className="m-0 mb-8 text-sm text-ink-3">
          Ingresá a tu cuenta para gestionar tu agenda.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">
              Correo electrónico
            </label>
            <input className="input" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-ink-2 mb-1.5 uppercase tracking-wider">
              Contraseña
            </label>
            <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-3.5 h-3.5" style={{ accentColor: "var(--color-accent)" }} />
            <label htmlFor="remember" className="text-[13px] text-ink-2 cursor-pointer">
              Mantener sesión iniciada
            </label>
          </div>

          {errorMsg && (
            <p className="text-[12px] m-0" style={{ color: "var(--color-err)" }}>{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center items-center py-2.5 rounded-lg text-[13.5px] font-medium text-white border-none cursor-pointer hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60"
            style={{ background: "var(--color-accent)", marginTop: 4 }}
          >
            {isPending ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <p className="mt-6 text-xs text-ink-3 text-center">
          ¿No tenés cuenta?{" "}
          <span className="cursor-pointer font-medium" style={{ color: "var(--color-accent)" }}>
            Probá 14 días gratis
          </span>
        </p>
      </div>

      {/* Right — testimonial */}
      <div
        className="flex flex-col justify-center items-center relative overflow-hidden px-16 py-16"
        style={{ background: "linear-gradient(135deg, #272a25 0%, #3a4535 50%, #5a6b50 100%)" }}
      >
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none" style={{ background: "rgba(122,139,110,.15)" }} />
        <div className="absolute -bottom-14 -left-14 w-60 h-60 rounded-full pointer-events-none" style={{ background: "rgba(122,139,110,.1)" }} />

        <div className="max-w-sm relative">
          <div className="text-[72px] leading-none mb-3" style={{ color: "rgba(184,200,168,.4)" }}>"</div>

          <p className="text-xl font-normal text-white leading-relaxed m-0 mb-6" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>
            Desde que uso aesthetic. organicé todos mis turnos y mis clientas están encantadas con los recordatorios automáticos.
          </p>

          <div className="flex items-center gap-3 mb-8">
            <div
              className="flex items-center justify-center text-white text-sm font-semibold shrink-0"
              style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--color-accent)" }}
            >
              LM
            </div>
            <div>
              <div className="text-[13px] font-semibold text-white">Laura Martínez</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,.6)" }}>Estudio Lau, Buenos Aires</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {["+200 peluquerías", "Sin tarjeta de crédito", "14 días gratis"].map((b) => (
              <span key={b} className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", color: "rgba(255,255,255,.9)" }}>
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
