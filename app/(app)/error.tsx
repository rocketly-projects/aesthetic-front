"use client";

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[AppError]", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-[380px] w-full text-center">

        {/* Ícono */}
        <div className="w-[64px] h-[64px] rounded-full bg-[#fef2f2] flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
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

        <h2
          className="m-0 mb-2 text-[22px] font-normal text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Algo salió mal
        </h2>
        <p className="m-0 mb-6 text-[13px] text-ink-3 leading-relaxed">
          No se pudo cargar esta sección. Podés reintentar
          <br />o volver al inicio.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-ink text-bg border-none rounded-xl px-6 py-2.5 text-[13.5px] font-medium cursor-pointer hover:opacity-90 transition-opacity"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Reintentar
          </button>
          <a
            href="/dashboard"
            className="bg-surface text-ink border border-line rounded-xl px-6 py-2.5 text-[13.5px] font-medium no-underline hover:bg-bg-2 transition-colors"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Inicio
          </a>
        </div>
      </div>
    </div>
  );
}
