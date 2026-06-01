"use client";

import { useState } from "react";
import { useRegister, useGoogleAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api/client";
import CompleteGoogleRegisterModal from "@/components/CompleteGoogleRegisterModal";

export default function RegisterPage() {
  const { mutate: register, isPending, error } = useRegister();
  const googleAuth = useGoogleAuth();

  const [form,            setForm]            = useState({ name: "", businessName: "", email: "", password: "" });
  const [googleCredential, setGoogleCredential] = useState<string | null>(null);

  const errorMsg       = error instanceof ApiError ? error.message : error ? "Error al crear la cuenta" : null;
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
    register(form);
  }

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });
  }

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] h-screen font-sans">

      {/* Left panel */}
      <div className="flex flex-col bg-bg px-6 py-8 lg:px-14 lg:py-10 overflow-y-auto">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <img src="/logoDark.svg" alt="aesthetic" className="w-9 h-9 rounded-full shrink-0" />
          <span className="text-[21px] font-medium tracking-[-0.02em] font-display text-ink">
            aesthetic<em className="not-italic text-accent">.</em>
          </span>
        </div>

        {/* Form */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-[380px] mx-auto">
          <h1 className="font-display text-[36px] leading-[1.05] tracking-[-0.03em] m-0 mb-2 font-normal text-ink">
            Creá tu<br />cuenta <em className="italic text-accent font-normal">gratis</em>.
          </h1>
          <p className="text-sm text-ink-3 mt-0 mb-7">
            14 días de prueba. Sin tarjeta de crédito.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3.5">
              <label className="block text-[12.5px] font-medium text-ink-2 mb-1.5">Tu nombre</label>
              <input
                className="input"
                placeholder="Marina García"
                value={form.name}
                onChange={set("name")}
                required
                autoComplete="name"
              />
            </div>

            <div className="mb-3.5">
              <label className="block text-[12.5px] font-medium text-ink-2 mb-1.5">Nombre del negocio</label>
              <input
                className="input"
                placeholder="Aesthetic Studio"
                value={form.businessName}
                onChange={set("businessName")}
                required
              />
            </div>

            <div className="mb-3.5">
              <label className="block text-[12.5px] font-medium text-ink-2 mb-1.5">Email</label>
              <input
                className="input"
                type="email"
                placeholder="marina@aesthetic.com"
                value={form.email}
                onChange={set("email")}
                required
                autoComplete="email"
              />
            </div>

            <div className="mb-[22px]">
              <label className="block text-[12.5px] font-medium text-ink-2 mb-1.5">Contraseña</label>
              <input
                className="input"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={set("password")}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            {errorMsg && (
              <p className="text-[12px] mt-0 mb-3 text-err">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-11 bg-ink text-bg border-0 rounded-md text-[14px] font-medium cursor-pointer tracking-[-0.005em] transition-colors hover:bg-[#1a1815] disabled:opacity-60"
            >
              {isPending ? "Creando cuenta…" : "Crear cuenta gratis"}
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

          <div className="text-center text-[13px] text-ink-3 mt-7">
            ¿Ya tenés cuenta?{" "}
            <a href="/login" className="text-accent-ink font-medium no-underline hover:underline">
              Iniciar sesión
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between text-[11.5px] text-ink-3 font-mono uppercase tracking-[0.06em]">
          <span>aesthetic v0.1</span>
          <span>© 2026</span>
        </div>
      </div>

      {/* Right panel */}
      <div
        className="hidden lg:flex relative overflow-hidden flex-col justify-center p-10"
        style={{
          background: `
            radial-gradient(at 20% 20%, var(--color-accent-pale) 0%, transparent 50%),
            radial-gradient(at 80% 0%,  var(--color-accent-soft) 0%, transparent 45%),
            radial-gradient(at 70% 80%, var(--color-warn-soft)   0%, transparent 55%),
            var(--color-bg-2)
          `,
        }}
      >
        <div className="absolute -top-[100px] -right-[100px] w-[420px] h-[420px] rounded-full border border-accent opacity-[0.18] pointer-events-none" />
        <div className="absolute top-[30%] -right-[60px] w-[180px] h-[180px] rounded-full border border-accent-soft opacity-[0.25] pointer-events-none" />
        <div className="absolute -bottom-[60px] -left-[60px] w-[260px] h-[260px] rounded-full bg-accent opacity-[0.07] pointer-events-none" />

        <div className="relative max-w-[480px] mx-auto">
          <div className="font-display leading-none text-accent opacity-30 -mb-6 select-none" style={{ fontSize: 140 }}>"</div>
          <blockquote className="font-display leading-[1.15] tracking-[-0.025em] text-ink font-normal m-0" style={{ fontSize: 42 }}>
            En dos semanas ya no atendía el teléfono yo. El bot tomaba los turnos solo, yo solo aparecía a trabajar.
          </blockquote>

          <div className="flex items-center gap-3.5 mt-7">
            <div className="grid place-items-center rounded-full bg-ink text-bg font-semibold text-[15px] shrink-0" style={{ width: 56, height: 56 }}>
              LM
            </div>
            <div>
              <div className="text-[14px] font-semibold text-ink">Laura M.</div>
              <div className="text-[12px] text-ink-3 mt-0.5">Studio Laura · Villa Urquiza</div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mt-7">
            {[
              { label: "14 días gratis", dot: true },
              { label: "Sin tarjeta", dot: false },
              { label: "Cancelá cuando quieras", dot: false },
            ].map(({ label, dot }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-ink-2 border border-ink/[0.08]"
                style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", boxShadow: "var(--shadow-md)" }}
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
