import AppShell from "@/components/AppShell";
import KPI from "@/components/KPI";
import Chip from "@/components/Chip";

const TODAY_APPTS = [
  { id: "1", time: "09:00", duration: 45,  client: "Lucía Fernández",  service: "Corte de cabello",         status: "confirmed" },
  { id: "2", time: "10:00", duration: 120, client: "Camila Suárez",    service: "Coloración completa",      status: "confirmed" },
  { id: "3", time: "12:30", duration: 30,  client: "Martín Acosta",    service: "Brushing",                 status: "pending"   },
  { id: "4", time: "14:00", duration: 150, client: "Valentina López",  service: "Mechas / babylights",      status: "confirmed" },
  { id: "5", time: "17:00", duration: 90,  client: "Sofía Romero",     service: "Tratamiento de keratina",  status: "pending"   },
  { id: "6", time: "18:45", duration: 45,  client: "Tomás Quiroga",    service: "Corte + barba",            status: "cancelled" },
];

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
  const total = TODAY_APPTS.length;
  const confirmed = TODAY_APPTS.filter((a) => a.status === "confirmed").length;
  const pending = TODAY_APPTS.filter((a) => a.status === "pending").length;
  const next = TODAY_APPTS.find((a) => a.status !== "cancelled");

  return (
    <AppShell
      active="dashboard"
      title="Inicio"
      subtitle="Tu día de un vistazo"
      actions={
        <button
          className="flex items-center gap-1.5 text-white text-[13.5px] font-medium rounded-lg px-4 py-2 border-none cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
          style={{ background: "var(--color-ink)" }}
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
            Tenés <strong className="text-ink font-medium">{total}</strong> turnos hoy.
            El próximo es a las <strong className="text-ink font-medium">{next?.time}</strong> con {next?.client}.
          </div>
        </div>
        <div className="text-ink-3 text-[13.5px] font-mono uppercase tracking-wider">
          Martes · 5 mayo 2026
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPI
          lbl="Turnos hoy"
          val={total}
          delta={<><ArrowUp /> +2 vs. ayer</>}
        />
        <KPI
          lbl="Confirmados"
          val={confirmed}
          delta={<><span style={{ width:6,height:6,borderRadius:"50%",background:"var(--color-ok)",display:"inline-block",verticalAlign:"middle",marginRight:4 }}/> Listos</>}
        />
        <KPI
          lbl="Pendientes"
          val={pending}
          delta={<><span style={{ width:6,height:6,borderRadius:"50%",background:"var(--color-warn)",display:"inline-block",verticalAlign:"middle",marginRight:4 }}/> A confirmar</>}
        />
        <KPI
          lbl="Ingresos del día"
          val="$71.000"
          delta={<><ArrowUp /> estimado</>}
        />
      </div>

      {/* 2-col grid */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "1.5fr 1fr" }}>
        {/* Agenda de hoy */}
        <div className="bg-surface border border-line rounded-lg shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="m-0 text-[14px] font-semibold text-ink">Agenda de hoy</h3>
              <span className="text-[12.5px] text-ink-3">
                {total} turnos · 1 cancelado
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
            {TODAY_APPTS.map((appt) => (
              <div key={appt.id} className="tl-item">
                <div className="tl-time">
                  {appt.time}
                  <small>{appt.duration} min</small>
                </div>
                <div className={`tl-card ${appt.status}`}>
                  <div className="stripe" />
                  <div>
                    <div className="who">{appt.client}</div>
                    <div className="svc">{appt.service}</div>
                  </div>
                  <div className="right">
                    {appt.status === "confirmed" && <Chip variant="ok"   label="Confirmado" />}
                    {appt.status === "pending"   && <Chip variant="warn"  label="Pendiente"  />}
                    {appt.status === "cancelled" && <Chip variant="err"   label="Cancelado"  />}
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
    </AppShell>
  );
}
