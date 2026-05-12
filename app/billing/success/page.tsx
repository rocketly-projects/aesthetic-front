"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";

export default function BillingSuccessPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"loading" | "ok" | "pending">("loading");

  useEffect(() => {
    apiFetch<{ confirmed: boolean }>("/billing/confirm", { method: "POST" })
      .then((data) => {
        setStatus(data.confirmed ? "ok" : "pending");
        queryClient.invalidateQueries({ queryKey: ["billing", "status"] });
        setTimeout(() => router.push("/dashboard"), 3000);
      })
      .catch(() => {
        setStatus("pending");
        setTimeout(() => router.push("/dashboard"), 3000);
      });
  }, [router, queryClient]);

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-5 px-6">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${status === "loading" ? "bg-bg-2 animate-pulse" : "bg-ok-soft"}`}>
        {status !== "loading" && (
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M5 14L11 20L23 8" stroke="#4e7c5f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <div className="text-center max-w-sm">
        <h1 className="font-display text-[28px] tracking-[-0.03em] font-normal text-ink mb-2">
          {status === "loading" ? "Verificando pago..." : "Suscripcion iniciada"}
        </h1>
        <p className="text-[14px] text-ink-3">
          {status === "ok"
            ? "Tu plan fue activado correctamente."
            : status === "pending"
            ? "El pago esta siendo procesado por Mercado Pago. Tu cuenta se activara en breve."
            : "Estamos verificando tu suscripcion con Mercado Pago..."}
        </p>
      </div>

      {status !== "loading" && (
        <p className="text-[12.5px] text-ink-3">Redirigiendo al panel...</p>
      )}
    </div>
  );
}
