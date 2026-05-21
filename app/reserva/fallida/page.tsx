"use client";

export default function ReservaFallidaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="max-w-[420px] w-full text-center">
        {/* Ícono */}
        <div className="w-[76px] h-[76px] rounded-full bg-[#fef2f2] flex items-center justify-center mx-auto mb-6">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <path d="M11 11l12 12M23 11L11 23" stroke="var(--color-err)" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>

        <h1 className="m-0 mb-2 text-[26px] font-extrabold text-ink font-display">
          Pago no completado
        </h1>
        <p className="m-0 mb-7 text-[13px] text-ink-3 leading-relaxed">
          No se pudo procesar el pago de la seña.
          <br />Tu reserva fue <strong className="text-err">cancelada</strong> automáticamente.
        </p>

        <button
          onClick={() => window.history.go(-3)}
          className="bg-ink text-white border-none rounded-xl px-7 py-3.5 text-[14px] font-semibold cursor-pointer font-display"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
