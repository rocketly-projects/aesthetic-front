"use client";

export default function ReservaPendientePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="max-w-[420px] w-full text-center">
        {/* Ícono */}
        <div className="w-[76px] h-[76px] rounded-full bg-warn-soft flex items-center justify-center mx-auto mb-6">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <circle cx="17" cy="17" r="13" stroke="var(--color-warn)" strokeWidth="2.5"/>
            <path d="M17 10v7.5M17 22h.01" stroke="var(--color-warn)" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>

        <h1 className="m-0 mb-2 text-[26px] font-extrabold text-ink font-display">
          Pago en proceso
        </h1>
        <p className="m-0 mb-7 text-[13px] text-ink-3 leading-relaxed">
          Tu pago está siendo procesado por MercadoPago.
          <br />Una vez acreditado, tu turno será <strong>confirmado automáticamente</strong>.
        </p>

        <button
          onClick={() => window.history.back()}
          className="bg-ink text-white border-none rounded-xl px-7 py-3.5 text-[14px] font-semibold cursor-pointer font-display"
        >
          Volver
        </button>
      </div>
    </div>
  );
}
