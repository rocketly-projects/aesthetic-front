"use client";

import { useSearchParams } from "next/navigation";

export default function ReservaConfirmadaPage() {
  const params          = useSearchParams();
  const paymentId       = params.get("payment_id");
  const externalRef     = params.get("external_reference");

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--color-bg)", padding: "24px",
    }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        {/* Ícono */}
        <div style={{
          width: 76, height: 76, borderRadius: "50%",
          background: "var(--color-ok-soft, #f0fdf4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <path d="M9 17.5l6 6 11-13" stroke="var(--color-ok)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 800, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>
          ¡Pago recibido!
        </h1>
        <p style={{ margin: "0 0 28px", fontSize: 13, color: "var(--color-ink-3)", lineHeight: 1.6 }}>
          Tu seña fue acreditada. El turno está <strong style={{ color: "var(--color-ok)" }}>confirmado</strong>.
          <br />En breve recibirás la confirmación.
        </p>

        {paymentId && (
          <p style={{ fontSize: 11, color: "var(--color-ink-3)", marginBottom: 24, fontFamily: "var(--font-mono)" }}>
            ID de pago: {paymentId}
          </p>
        )}

        <button
          onClick={() => window.history.back()}
          style={{
            background: "var(--color-ink)", color: "white", border: "none",
            borderRadius: 12, padding: "14px 28px", fontSize: 14, fontWeight: 600,
            cursor: "pointer", fontFamily: "var(--font-display)",
          }}
        >
          Volver
        </button>
      </div>
    </div>
  );
}
