"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface AppointmentSummary {
  id: string;
  serviceName: string;
  date: string;
  time: string;
  status: string;
  depositAmount: number;
  businessName: string;
  businessSlug: string;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

function ReservaConfirmadaContent() {
  const params = useSearchParams();
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  const appointmentId = params.get("external_reference");
  const slug = params.get("slug");

  const [appt, setAppt] = useState<AppointmentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!appointmentId) {
      setLoading(false);
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/appointment/${appointmentId}`)
      .then((r) => r.json())
      .then((data) => setAppt(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [appointmentId]);

  async function handleSaveImage() {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `comprobante-turno.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  const businessSlug = appt?.businessSlug ?? slug;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: 420, width: "100%" }}>
        {/* Card comprobante */}
        <div
          ref={cardRef}
          style={{
            background: "#ffffff",
            borderRadius: 20,
            padding: "32px 28px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            marginBottom: 16,
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#f0fdf4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <path
                  d="M7 15.5l5.5 5.5 10-12"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1
              style={{
                margin: "0 0 4px",
                fontSize: 22,
                fontWeight: 800,
                color: "var(--color-ink, #111)",
                fontFamily: "var(--font-display)",
              }}
            >
              ¡Pago recibido!
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
              Tu seña fue acreditada
            </p>
          </div>

          {/* Datos del turno */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#9ca3af", fontSize: 13 }}>
              Cargando...
            </div>
          ) : appt ? (
            <>
              {/* Negocio */}
              <div
                style={{
                  background: "#f9fafb",
                  borderRadius: 12,
                  padding: "14px 16px",
                  marginBottom: 12,
                }}
              >
                <p style={{ margin: 0, fontSize: 12, color: "#9ca3af", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Negocio
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 700, color: "#111" }}>
                  {appt.businessName}
                </p>
              </div>

              {/* Detalles */}
              <div
                style={{
                  background: "#f9fafb",
                  borderRadius: 12,
                  padding: "14px 16px",
                  marginBottom: 12,
                  display: "grid",
                  gap: 10,
                }}
              >
                <Row label="Servicio" value={appt.serviceName} />
                <Row label="Fecha" value={formatDate(appt.date)} />
                <Row label="Hora" value={appt.time} />
              </div>

              {/* Monto */}
              <div
                style={{
                  background: "#f0fdf4",
                  borderRadius: 12,
                  padding: "14px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#166534" }}>
                  Seña abonada
                </p>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#166534" }}>
                  {formatCurrency(appt.depositAmount)}
                </p>
              </div>
            </>
          ) : (
            <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
              Tu turno quedó confirmado.
            </p>
          )}

          {/* Footer del comprobante */}
          <p
            style={{
              margin: "20px 0 0",
              fontSize: 11,
              color: "#d1d5db",
              textAlign: "center",
            }}
          >
            Comprobante generado por aesthetic
          </p>
        </div>

        {/* Botones — fuera del card para que no aparezcan en la imagen */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={handleSaveImage}
            disabled={saving || loading || !appt}
            style={{
              flex: 1,
              background: saving ? "#e5e7eb" : "var(--color-ink, #111)",
              color: saving ? "#9ca3af" : "white",
              border: "none",
              borderRadius: 12,
              padding: "14px 16px",
              fontSize: 14,
              fontWeight: 600,
              cursor: saving || !appt ? "not-allowed" : "pointer",
              fontFamily: "var(--font-display)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1v9m0 0L5 7m3 3l3-3M1 12v1.5A1.5 1.5 0 002.5 15h11A1.5 1.5 0 0015 13.5V12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {saving ? "Guardando..." : "Guardar comprobante"}
          </button>

          <button
            onClick={() =>
              businessSlug
                ? router.push(`/${businessSlug}`)
                : router.push("/")
            }
            style={{
              flex: 1,
              background: "transparent",
              color: "var(--color-ink, #111)",
              border: "1.5px solid #e5e7eb",
              borderRadius: 12,
              padding: "14px 16px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-display)",
            }}
          >
            Volver al negocio
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
      <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#111", textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

export default function ReservaConfirmadaPage() {
  return (
    <Suspense>
      <ReservaConfirmadaContent />
    </Suspense>
  );
}
