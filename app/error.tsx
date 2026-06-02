"use client";

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="max-w-[420px] w-full text-center">

        {/* Ícono */}
        <div className="w-[76px] h-[76px] rounded-full bg-[#fef2f2] flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M16 10v7M16 21.5v.5"
              stroke="var(--color-err)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M13.27 4.9c1.18-2.2 4.28-2.2 5.46 0l10.4 19.4C30.3 26.5 28.8 29 26.4 29H5.6c-2.4 0-3.9-2.5-2.73-4.7L13.27 4.9z"
              stroke="var(--color-err)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1
          className="m-0 mb-2 text-[28px] font-normal text-ink leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Algo salió mal
        </h1>
        <p className="m-0 mb-8 text-[13px] text-ink-3 leading-relaxed">
          Ocurrió un error inesperado. Podés intentar de nuevo
          <br />o volver al inicio si el problema persiste.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-ink text-bg border-none rounded-xl px-7 py-3 text-[14px] font-medium cursor-pointer hover:opacity-90 transition-opacity"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Reintentar
          </button>
          <a
            href="/dashboard"
            className="bg-surface text-ink border border-line rounded-xl px-7 py-3 text-[14px] font-medium no-underline hover:bg-bg-2 transition-colors"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ir al inicio
          </a>
        </div>

        {error.digest && (
          <p className="mt-8 text-[11px] text-ink-3 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
