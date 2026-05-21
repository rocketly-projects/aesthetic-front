"use client";

import { useState } from "react";
import { useLogin, useGoogleAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api/client";
import CompleteGoogleRegisterModal from "@/components/CompleteGoogleRegisterModal";

export default function LoginPage() {
  const { mutate: login, isPending, error } = useLogin();
  const googleAuth = useGoogleAuth();

  const [email,             setEmail]             = useState("");
  const [password,          setPassword]          = useState("");
  const [remember,          setRemember]          = useState(false);
  const [googleCredential,  setGoogleCredential]  = useState<string | null>(null);

  const errorMsg = error instanceof ApiError ? error.message : error ? "Error al iniciar sesión" : null;
  const googleErrorMsg = googleAuth.error instanceof ApiError ? googleAuth.error.message : googleAuth.error ? "Error con Google" : null;
  const needsOnboarding = googleAuth.data && "needsOnboarding" in googleAuth.data;

  function handleGoogleClick() {
    if (!window.google || !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return;
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: ({ credential }) => {
        setGoogleCredential(credential);
        googleAuth.mutate({ credential });
      },
    });
    window.google.accounts.id.prompt();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login({ email, password, remember });
  }

  return (
    <>
    <div className="grid grid-cols-[1fr_1.1fr] h-screen font-sans">

      {/* ── Left panel — form ── */}
      <div className="flex flex-col bg-bg px-14 py-10">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-8 h-8 rounded-full bg-ink text-bg font-semibold text-[15px] shrink-0 font-display">
            a
          </span>
          <span className="text-[19px] font-medium tracking-[-0.02em] font-display text-ink">
            aesthetic<em className="not-italic text-accent">.</em>
          </span>
        </div>

        {/* Form — vertically centered */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-[380px] mx-auto">
          <h1 className="font-display text-[36px] leading-[1.05] tracking-[-0.03em] m-0 mb-2 font-normal text-ink">
            Bienvenid@<br />de <em className="italic text-accent font-normal">vuelta</em>.
          </h1>
          <p className="text-sm text-ink-3 mt-0 mb-7">
            Entrá a tu agenda y empezá el día con todo en orden.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3.5">
              <label className="block text-[12.5px] font-medium text-ink-2 mb-1.5">
                Email
              </label>
              <input
                className="input"
                type="email"
                placeholder="marina@aesthetic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="mb-3.5">
              <label className="block text-[12.5px] font-medium text-ink-2 mb-1.5">
                Contraseña
              </label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {/* Checkbox + forgot password */}
            <div className="flex items-center justify-between mt-1 mb-[22px] text-[12.5px]">
              <label className="inline-flex items-center gap-2 cursor-pointer text-ink-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5"
                  style={{ accentColor: "var(--color-accent)" }}
                />
                Mantener sesión
              </label>
              <a href="#" className="text-accent-ink no-underline hover:underline">
                Olvidé mi contraseña
              </a>
            </div>

            {errorMsg && (
              <p className="text-[12px] mt-0 mb-3 text-err">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-11 bg-ink text-bg border-0 rounded-md text-[14px] font-medium cursor-pointer tracking-[-0.005em] transition-colors hover:bg-[#1a1815] disabled:opacity-60"
            >
              {isPending ? "Ingresando…" : "Entrar a aesthetic"}
            </button>
          </form>

          {/* OR separator */}
          <div className="flex items-center gap-3 my-[22px] text-[11.5px] text-ink-3 uppercase tracking-[0.08em]">
            <span className="flex-1 h-px bg-line" />
            o
            <span className="flex-1 h-px bg-line" />
          </div>

          {googleErrorMsg && (
            <p className="text-[12px] mt-0 mb-1 text-err">{googleErrorMsg}</p>
          )}

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={googleAuth.isPending}
            className="w-full h-[42px] bg-surface border border-line rounded-md flex items-center justify-center gap-2.5 text-[13.5px] font-medium cursor-pointer transition-[background,border-color] hover:bg-bg-2 hover:border-[#d3c9bf] disabled:opacity-60"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.83z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/>
            </svg>
            {googleAuth.isPending ? "Verificando…" : "Continuar con Google"}
          </button>

          {/* Switch */}
          <div className="text-center text-[13px] text-ink-3 mt-7">
            ¿Es tu primera vez?{" "}
            <a href="/register" className="text-accent-ink font-medium no-underline hover:underline">
              Crear cuenta
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between text-[11.5px] text-ink-3 font-mono uppercase tracking-[0.06em]">
          <span>aesthetic v0.1</span>
          <span>© 2026</span>
        </div>
      </div>

      {/* ── Right panel — testimonial ── */}
      <div className="relative overflow-hidden flex flex-col p-10 bg-[linear-gradient(160deg,var(--color-accent-pale)_0%,var(--color-bg-2)_60%,var(--color-accent-soft)_100%)]">

        {/* Decorative circles */}
        <div className="absolute -top-[120px] -right-[120px] w-[380px] h-[380px] rounded-full border border-accent opacity-[0.12] pointer-events-none" />
        <div className="absolute -bottom-[80px] -left-[80px] w-[240px] h-[240px] rounded-full bg-accent opacity-[0.06] pointer-events-none" />

        {/* Top label */}
        <div className="flex justify-end relative">
          <span className="font-mono text-[11px] text-ink-3 uppercase tracking-[0.08em]">
            testimonios · 4.9 ★
          </span>
        </div>

        {/* Quote block */}
        <div className="relative max-w-[460px] m-auto mb-10">
          <div className="font-display text-[80px] leading-none text-accent opacity-40 -mb-4">
            "
          </div>
          <blockquote className="font-display text-[28px] leading-[1.25] tracking-[-0.02em] text-ink font-normal m-0">
            Antes anotaba los turnos en un cuaderno. Ahora{" "}
            <em className="italic text-accent-ink">aesthetic</em>
            {" "}me responde los whatsapps mientras corto. Ganamos tres horas por día.
          </blockquote>

          {/* Author */}
          <div className="flex items-center gap-3 mt-6">
            <div className="grid place-items-center w-9 h-9 rounded-full bg-ink text-bg font-medium text-[13px] shrink-0">
              PG
            </div>
            <div className="text-[13px] text-ink">
              Paula G.
              <span className="block text-ink-3 text-[11.5px]">Estudio Paula · Palermo</span>
            </div>
          </div>

          {/* Badges */}
          <div className="flex gap-2 flex-wrap mt-6">
            {[
              { label: "+200 peluquerías", dot: true },
              { label: "Sin tarjeta", dot: false },
              { label: "14 días gratis", dot: false },
            ].map(({ label, dot }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-ink-2 bg-white/50 backdrop-blur-[8px] border border-ink/[0.08]"
              >
                {dot && <span className="w-1.5 h-1.5 rounded-full bg-ok shrink-0" />}
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>

    {needsOnboarding && googleCredential && (
      <CompleteGoogleRegisterModal
        credential={googleCredential}
        onClose={() => { setGoogleCredential(null); googleAuth.reset(); }}
      />
    )}
    </>
  );
}
