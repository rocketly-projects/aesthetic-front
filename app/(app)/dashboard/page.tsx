"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import KPI from "@/components/KPI";
import Chip from "@/components/Chip";
import NuevoTurnoModal from "@/components/NuevoTurnoModal";
import { useGetAppointments } from "@/hooks/useAppointments";
import { useGetHours } from "@/hooks/useBusiness";
import { useCurrentUser } from "@/hooks/useAuth";
import type { Appointment } from "@/lib/api/appointments";

const TODAY = new Date().toISOString().slice(0, 10);

function timeLabel(apptTime: string): string {
  const [h, m] = apptTime.split(":").map(Number);
  const now = new Date();
  const apptMinutes = h * 60 + m;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const diff = nowMinutes - apptMinutes;
  if (diff < 0) return `a las ${apptTime}`;
  if (diff < 60) return diff <= 1 ? "Hace 1 min" : `Hace ${diff} min`;
  const hrs = Math.floor(diff / 60);
  return hrs === 1 ? "Hace 1 hora" : `Hace ${hrs} horas`;
}

type ActivityItem = { color: string; text: React.ReactNode };

function deriveActivity(appts: Appointment[]): ActivityItem[] {
  if (!appts.length) return [];

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const past   = appts.filter((a) => toMinutes(a.time) <= nowMinutes).sort((a, b) => toMinutes(b.time) - toMinutes(a.time));
  const future = appts.filter((a) => toMinutes(a.time) >  nowMinutes).sort((a, b) => toMinutes(a.time) - toMinutes(b.time));

  return [...past, ...future].slice(0, 4).map((appt): ActivityItem => {
    const name = appt.clientName ?? "Cliente";
    const svc  = appt.serviceName;
    const lbl  = timeLabel(appt.time);

    switch (appt.status) {
      case "confirmed":
        return {
          color: "var(--color-ok)",
          text:  <><strong>{name}</strong> confirmó su turno de {svc}.<small>{lbl}</small></>,
        };
      case "pending":
        return {
          color: "var(--color-warn)",
          text:  <><strong>{name}</strong> tiene turno pendiente · {svc} a las {appt.time}.<small>{lbl}</small></>,
        };
      case "completed":
        return {
          color: "var(--color-info)",
          text:  <>Turno completado: <strong>{name}</strong> · {svc}.<small>{lbl}</small></>,
        };
      case "cancelled":
        return {
          color: "var(--color-err)",
          text:  <><strong>{name}</strong> canceló su turno de {svc}.<small>{lbl}</small></>,
        };
      case "no_show":
        return {
          color: "var(--color-warn)",
          text:  <><strong>{name}</strong> no se presentó a {svc}.<small>{lbl}</small></>,
        };
    }
  });
}

// ── Ocupación helpers ──────────────────────────────────────────────────────

function toMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function fromMin(mins: number): string {
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
}

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function calcFreeBlocks(appts: Appointment[], fromTime: string, toTime: string, minGap = 30): string[] {
  const openMin  = toMin(fromTime);
  const closeMin = toMin(toTime);
  const active   = appts
    .filter((a) => a.status !== "cancelled" && a.status !== "no_show")
    .sort((a, b) => toMin(a.time) - toMin(b.time));

  const blocks: string[] = [];
  let cursor = openMin;

  for (const appt of active) {
    const start = toMin(appt.time);
    if (start - cursor >= minGap) blocks.push(`${fromMin(cursor)}–${fromMin(start)}`);
    cursor = Math.max(cursor, start + appt.duration);
  }

  if (closeMin - cursor >= minGap) blocks.push(`${fromMin(cursor)}–${fromMin(closeMin)}`);

  return blocks.slice(0, 3);
}

function ArrowUp() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle" }}>
      <path d="M12 19V5M5 12l7-7 7 7"/>
    </svg>
  );
}

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const current = useCurrentUser();
  const firstName = current ? current.name.trim().split(/\s+/)[0] : null;

  const { data, isLoading }             = useGetAppointments({ date: TODAY, limit: 100 });
  const { data: hoursData, isLoading: isLoadingHours } = useGetHours();
  const appts = data?.appointments ?? [];

  const total     = appts.length;
  const confirmed = appts.filter((a) => a.status === "confirmed").length;
  const pending   = appts.filter((a) => a.status === "pending").length;
  const revenue   = appts.filter((a) => a.status !== "cancelled").reduce((s, a) => s + a.price, 0);
  const next      = appts.find((a) => a.status !== "cancelled");
  const activity  = deriveActivity(appts);

  // Ocupación del día
  const todayDow    = new Date().getDay(); // 0=Dom…6=Sáb
  const todayHours  = hoursData?.find((h) => h.dayOfWeek === todayDow);
  const isClosed    = !todayHours || !todayHours.open;
  const totalMin    = isClosed ? 0 : toMin(todayHours!.toTime) - toMin(todayHours!.fromTime);
  const usedMin     = appts
    .filter((a) => a.status !== "cancelled" && a.status !== "no_show")
    .reduce((s, a) => s + a.duration, 0);
  const occupancyPct = totalMin > 0 ? Math.min(100, Math.round((usedMin / totalMin) * 100)) : 0;
  const freeBlocks   = isClosed ? [] : calcFreeBlocks(appts, todayHours!.fromTime, todayHours!.toTime);

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
            Buen día, <em className="not-italic text-accent">{firstName ?? "…"}</em>.
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
        <KPI lbl="Turnos hoy"      val={isLoading ? "…" : total}     delta={<></>} />
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
                    <div className="who">{appt.clientName ?? "Sin cliente"}</div>
                    <div className="svc">{appt.serviceName}</div>
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

          <button className="quick-add" style={{ marginTop: 14 }} onClick={() => setModalOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Agregar un turno para hoy
          </button>
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
              {isLoading ? (
                <div className="muted text-[13px]">Cargando…</div>
              ) : activity.length === 0 ? (
                <div className="muted text-[13px]">Sin actividad por hoy.</div>
              ) : (
                activity.map((item, i) => (
                  <div key={i} className="act">
                    <span className="dot" style={{ background: item.color }} />
                    <div className="text">{item.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ocupación del día */}
          <div className="bg-surface border border-line rounded-lg shadow-sm p-5">
            <div className="flex items-baseline justify-between mb-1">
              <h3 className="m-0 text-[14px] font-semibold text-ink">Ocupación del día</h3>
            </div>
            {isLoadingHours || isLoading ? (
              <div className="muted text-[13px] mt-2">Cargando…</div>
            ) : isClosed ? (
              <div className="muted text-[13px] mt-2">Cerrado hoy.</div>
            ) : (
              <>
                <div className="flex justify-between items-baseline">
                  <span
                    className="text-[32px] text-ink"
                    style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.02em" }}
                  >
                    {occupancyPct}%
                  </span>
                  <span className="muted text-[12.5px]">
                    {formatMinutes(usedMin)} de {formatMinutes(totalMin)}
                  </span>
                </div>
                <div className="progress">
                  <span style={{ width: `${occupancyPct}%` }} />
                </div>
                <div className="muted text-xs mt-2.5">
                  {freeBlocks.length === 0
                    ? "Sin bloques libres."
                    : `Bloque${freeBlocks.length > 1 ? "s" : ""} libre${freeBlocks.length > 1 ? "s" : ""}: ${freeBlocks.join(" · ")}`
                  }
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <NuevoTurnoModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </AppShell>
  );
}
