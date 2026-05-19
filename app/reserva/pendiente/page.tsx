"use client";

export default function ReservaPendientePage() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--color-bg)", padding: "24px",
    }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        {/* Ícono */}
        <div style={{
          width: 76, height: 76, borderRadius: "50%",
          background: "var(--color-warn-soft, #fffbeb)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <circle cx="17" cy="17" r="13" stroke="var(--color-warn)" strokeWidth="2.5"/>
            <path d="M17 10v7.5M17 22h.01" stroke="var(--color-warn)" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>

        <h1 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 800, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>
          Pago en proceso
        </h1>
        <p style={{ margin: "0 0 28px", fontSize: 13, color: "var(--color-ink-3)", lineHeight: 1.6 }}>
          Tu pago está siendo procesado por MercadoPago.
          <br />Una vez acreditado, tu turno será <strong>confirmado automáticamente</strong>.
        </p>

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
