"use client";

export default function ReservaFallidaPage() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--color-bg)", padding: "24px",
    }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        {/* Ícono */}
        <div style={{
          width: 76, height: 76, borderRadius: "50%",
          background: "var(--color-err-pale, #fef2f2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <path d="M11 11l12 12M23 11L11 23" stroke="var(--color-err)" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>

        <h1 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 800, color: "var(--color-ink)", fontFamily: "var(--font-display)" }}>
          Pago no completado
        </h1>
        <p style={{ margin: "0 0 28px", fontSize: 13, color: "var(--color-ink-3)", lineHeight: 1.6 }}>
          No se pudo procesar el pago de la seña.
          <br />Tu reserva fue <strong style={{ color: "var(--color-err)" }}>cancelada</strong> automáticamente.
        </p>

        <button
          onClick={() => window.history.go(-3)}
          style={{
            background: "var(--color-ink)", color: "white", border: "none",
            borderRadius: 12, padding: "14px 28px", fontSize: 14, fontWeight: 600,
            cursor: "pointer", fontFamily: "var(--font-display)",
          }}
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
