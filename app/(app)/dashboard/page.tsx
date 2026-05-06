"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import KPI from "@/components/KPI";
import Chip from "@/components/Chip";
import NuevoTurnoModal from "@/components/NuevoTurnoModal";
import { useGetAppointments } from "@/hooks/useAppointments";

const TODAY = new Date().toISOString().slice(0, 10);

const ACTIVITY = [
  {
    color: "var(--color-ok)",
    text: <><strong>Camila Suárez</strong> confirmó su turno por WhatsApp.<small>Hace 14 min · vía bot</small></>,
  },
  {
    color: "var(--color-accent)",
    text: <>Nuevo cliente: <strong>Belén Iturralde</strong> agendó keratina.<small>Hace 1 hora · vía bot</small></>,
  },
  {
    color: "var(--color-warn)",
    text: <><strong>Tomás Quiroga</strong> pidió cancelar. Le respondiste y reagendaste.<small>Hace 2 horas · manual</small></>,
  },
  {
    color: "var(--color-info)",
    text: <>Se cobraron <strong>$28.000</strong> a Valentina López.<small>Ayer · 18:30</small></>,
  },
];

function ArrowUp() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle" }}>
      <path d="M12 19V5M5 12l7-7 7 7"/>
    </svg>
  );
}

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data, isLoading } = useGetAppointments({ date: TODAY, limit: 100 });
  const appts = data?.appointments ?? [];

  const total     = appts.length;
  const confirmed = appts.filter((a) => a.status === "confirmed").length;
  const pending   = appts.filter((a) => a.status === "pending").length;
  const revenue   = appts.filter((a) => a.status !== "cancelled").reduce((s, a) => s + a.price, 0);
  const next      = appts.find((a) => a.status !== "cancelled");

  const todayLabel = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const todayFormatted = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);

  return (
    <AppShell
      active="dashboard"
      title="Inicio"
      subtitle="Tu día de un vistazo"
      actions={
        <button
          className="flex items-center gap-1.5 text-white text-[13.5px] font-medium rounded-lg px-4 py-2 border-none cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
          style={{ background: "var(--color-ink)" }}
          onClick={() => setModalOpen(true)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Nuevo turno
        </button>
      }
    >
      {/* Greeting */}
      <div className="flex items-end justify-between mb-7">
        <div>
          <h2
            className="m-0 mb-1 text-[32px] font-normal text-ink"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.03em" }}
          >
            Buen día, <em className="not-italic text-accent">Marina</em>.
          </h2>
          <div className="muted text-sm">
            {isLoading ? "Cargando turnos…" : (
              <>
                Tenés <strong className="text-ink font-medium">{total}</strong> turnos hoy.
                {next && <> El próximo es a las <strong className="text-ink font-medium">{next.time}</strong> con {next.serviceName}.</>}
              </>
            )}
          </div>
        </div>
        <div className="text-ink-3 text-[13.5px] font-mono uppercase tracking-wider">
          {todayFormatted}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPI lbl="Turnos hoy"      val={isLoading ? "…" : total}     delta={<><ArrowUp /> +2 vs. ayer</>} />
        <KPI lbl="Confirmados"     val={isLoading ? "…" : confirmed} delta={<><span style={{ width:6,height:6,borderRadius:"50%",background:"var(--color-ok)",display:"inline-block",verticalAlign:"middle",marginRight:4 }}/> Listos</>} />
        <KPI lbl="Pendientes"      val={isLoading ? "…" : pending}   delta={<><span style={{ width:6,height:6,borderRadius:"50%",background:"var(--color-warn)",display:"inline-block",verticalAlign:"middle",marginRight:4 }}/> A confirmar</>} />
        <KPI lbl="Ingresos del día" val={isLoading ? "…" : "$" + revenue.toLocaleString("es-AR")} delta={<><ArrowUp /> estimado</>} />
      </div>

      {/* 2-col grid */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "1.5fr 1fr" }}>
        {/* Agenda de hoy */}
        <div className="bg-surface border border-line rounded-lg shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="m-0 text-[14px] font-semibold text-ink">Agenda de hoy</h3>
              <span className="text-[12.5px] text-ink-3">
                {total} turnos · {appts.filter((a) => a.status === "cancelled").length} cancelado
              </span>
            </div>
            <a href="/agenda" className="flex items-center gap-1 text-[12.5px] text-ink-2 hover:text-ink transition-colors" style={{ textDecoration: "none" }}>
              Ver agenda
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6"/>
              </svg>
            </a>
          </div>

          <div className="timeline">
            {appts.map((appt) => (
              <div key={appt.id} className="tl-item">
                <div className="tl-time">
                  {appt.time}
                  <small>{appt.duration} min</small>
                </div>
                <div className={`tl-card ${appt.status}`}>
                  <div className="stripe" />
                  <div>
                    <div className="who">{appt.serviceName}</div>
                    <div className="svc">{appt.clientId}</div>
                  </div>
                  <div className="right">
                    {appt.status === "confirmed" && <Chip variant="ok"   label="Confirmado" />}
                    {appt.status === "pending"   && <Chip variant="warn" label="Pendiente"  />}
                    {appt.status === "cancelled" && <Chip variant="err"  label="Cancelado"  />}
                    {appt.status === "completed" && <Chip variant="info" label="Completado" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="quick-add" style={{ marginTop: 14 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Agregar un turno para hoy
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Actividad reciente */}
          <div className="bg-surface border border-line rounded-lg shadow-sm p-5">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="m-0 text-[14px] font-semibold text-ink">Actividad reciente</h3>
              <span className="text-[12px] text-ink-3">Últimas 24h</span>
            </div>
            <div className="activity">
              {ACTIVITY.map((item, i) => (
                <div key={i} className="act">
                  <span className="dot" style={{ background: item.color }} />
                  <div className="text">{item.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Ocupación del día */}
          <div className="bg-surface border border-line rounded-lg shadow-sm p-5">
            <div className="flex items-baseline justify-between mb-1">
              <h3 className="m-0 text-[14px] font-semibold text-ink">Ocupación del día</h3>
            </div>
            <div className="flex justify-between items-baseline">
              <span
                className="text-[32px] text-ink"
                style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.02em" }}
              >
                78%
              </span>
              <span className="muted text-[12.5px]">7h 35m de 9h 30m</span>
            </div>
            <div className="progress">
              <span style={{ width: "78%" }} />
            </div>
            <div className="muted text-xs mt-2.5">
              Bloque libre: 11:00–12:30 · 15:30–17:00
            </div>
          </div>
        </div>
      </div>
      <NuevoTurnoModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </AppShell>
  );
}
