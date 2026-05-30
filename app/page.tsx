"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

// ─── Static data ───────────────────────────────────────────────────────────────

const features = [
  {
    title: "Agenda en bloques",
    desc: "Tu semana entera en una vista. Arrastrá un turno, cambialo de hora, marcalo confirmado — todo desde un mismo lugar.",
    icon: "📅",
  },
  {
    title: "Asistente WhatsApp",
    desc: "El bot responde consultas, agenda turnos y manda recordatorios mientras vos atendés. Si querés intervenir, lo pausás y seguís vos.",
    icon: "💬",
  },
  {
    title: "Ficha de clientes",
    desc: "Historial de turnos, notas privadas (alergias, preferencias), servicio favorito. Conocés a cada cliente sin abrir un cuaderno.",
    icon: "👤",
  },
];

const botFeatures = [
  "Reserva turnos automáticamente con los huecos disponibles",
  "Recordatorios 24h antes — confirmaciones sin tocar el celular",
  "Pausa automática cuando intervenís manualmente",
  "Plantillas de respuesta con el tono que vos elijas",
];

const basicPlan = [
  "Gestión de turnos",
  "Agenda",
  "Clientes",
  "Servicios",
  "Perfil público",
];

const proPlan = [
  "Todo el Plan Básico",
  "Bot de WhatsApp",
  "Respuestas automáticas 24/7",
];

const testimonials = [
  {
    quote:
      "Antes anotaba todo en un cuaderno y dormía mal pensando en confirmar turnos. Ahora el bot responde por mí mientras corto, y los clientes lo notan: respondo más rápido sin estar pegada al teléfono.",
    name: "Paula Gómez",
    biz: "Estudio Paula · Palermo",
    time: "usa aesthetic hace 8 meses",
    initials: "PG",
  },
  {
    quote:
      "La agenda es limpísima. Veo mi semana de un vistazo y se siente como una app que entiende cómo trabajamos.",
    name: "Mariana V.",
    biz: "Casa Mía · Caballito",
    time: "",
    initials: "MV",
  },
  {
    quote:
      "Gané 3 horas por semana que antes perdía en llamadas y mensajes. Ahora las uso para atender mejor o simplemente descansar.",
    name: "Laura S.",
    biz: "La Trenza · Belgrano",
    time: "",
    initials: "LS",
  },
];

const faqs = [
  {
    q: "¿Cómo funciona el asistente de WhatsApp?",
    a: "Conectás tu número de WhatsApp Business y el asistente aprende tu agenda, tus servicios y tus horarios. Responde consultas simples (precios, horarios, disponibilidad) y agenda turnos automáticamente. Si en algún momento querés tomar la conversación, lo hacés manualmente y el bot se pausa solo en ese chat.",
  },
  {
    q: "¿Mis clientes tienen que instalar algo?",
    a: "No, nada. Ellos te escriben a WhatsApp como siempre — la magia pasa de tu lado. Si querés podés también compartirles un link público de reservas donde eligen el horario directamente, pero no es obligatorio.",
  },
  {
    q: "¿Puedo importar mis clientes desde mi cuaderno o planilla?",
    a: "Sí. Aceptamos CSV de Excel o Google Sheets, y también podés ir cargándolos a medida que te llegan turnos. Si tu lista es grande, te ayudamos a importarla en el onboarding sin costo extra.",
  },
  {
    q: "¿Qué pasa si cancelo el plan Pro?",
    a: "Tus datos quedan intactos. Podés reactivar el Pro cuando quieras desde la configuración de tu cuenta.",
  },
  {
    q: "¿Sirve para peluquerías con más de una persona?",
    a: "Aesthetic está pensado y optimizado para peluquerías unipersonales. Si sos un equipo de 2-3 personas también lo usás bien, pero a partir de ahí te conviene una herramienta multi-agenda. En unos meses lanzamos un plan Equipo.",
  },
  {
    q: "¿Puedo cobrar a través de aesthetic?",
    a: "Aún no. Por ahora registramos los precios de cada servicio para que sepas cuánto facturás, pero el cobro lo hacés vos como siempre (efectivo, MercadoPago, transferencia). Estamos trabajando en la integración con Mercado Pago para este año.",
  },
];

const agendaMock = [
  { time: "09:00", name: "Lucía F.", svc: "Corte", status: "ok" as const },
  { time: "10:00", name: "Camila S.", svc: "Coloración", status: "ok" as const },
  { time: "12:30", name: "Martín A.", svc: "Brushing", status: "pending" as const },
  { time: "14:00", name: "Valentina L.", svc: "Mechas", status: "ok" as const },
];


// ─── Hooks ────────────────────────────────────────────────────────────────────

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Reveal ───────────────────────────────────────────────────────────────────

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(16px)",
        transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Check icon ───────────────────────────────────────────────────────────────

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
      <path
        d="M3 8l3.5 3.5L13 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── FAQItem ──────────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-5 flex items-center justify-between gap-4 bg-transparent border-none cursor-pointer"
      >
        <span className="text-[15px] font-medium text-ink">{q}</span>
        <span
          className="text-ink-3 text-xl leading-none shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(45deg)" : "none" }}
        >
          +
        </span>
      </button>
      {open && <p className="pb-5 text-[14px] text-ink-2 leading-relaxed m-0">{a}</p>}
    </div>
  );
}

// ─── MobileNav ────────────────────────────────────────────────────────────────

function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // double-rAF so the element is in the DOM before we trigger the transition
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
      document.body.style.overflow = "hidden";
    } else {
      setVisible(false);
      const t = setTimeout(() => {
        setMounted(false);
        document.body.style.overflow = "";
      }, 300);
      return () => clearTimeout(t);
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 backdrop-blur-sm transition-opacity duration-300"
        style={{ background: "rgba(39,42,37,0.45)", opacity: visible ? 1 : 0 }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="absolute top-0 right-0 h-full w-72 bg-bg flex flex-col"
        style={{
          boxShadow: "var(--shadow-xl)",
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-line shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-ink flex items-center justify-center">
              <span
                className="text-bg text-sm font-semibold italic"
                style={{ fontFamily: "var(--font-display)" }}
              >
                a
              </span>
            </div>
            <span
              className="text-[14px] font-semibold text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              aesthetic.
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-3 hover:text-ink hover:bg-bg-2 transition-colors bg-transparent border-none cursor-pointer text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Links */}
        <nav className="flex flex-col gap-1 p-4 flex-1">
          {(
            [
              ["#features", "Producto"],
              ["#planes", "Planes"],
              ["#faq", "Preguntas frecuentes"],
            ] as [string, string][]
          ).map(([href, label]) => (
            <a
              key={href}
              href={href}
              onClick={onClose}
              className="text-[15px] text-ink-2 hover:text-ink hover:bg-bg-2 rounded-lg px-3 py-2.5 no-underline transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTAs */}
        <div className="p-4 border-t border-line space-y-2 shrink-0">
          <Link
            href="/login"
            onClick={onClose}
            className="block w-full text-center text-[14px] text-ink-2 hover:text-ink no-underline py-2.5 rounded-xl border border-line hover:bg-bg-2 transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            onClick={onClose}
            className="block w-full text-center text-[14px] font-medium bg-ink text-bg no-underline py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            Empezar gratis
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [spot, setSpot] = useState({ x: -600, y: -600 });

  return (
    <div className="min-h-screen bg-bg text-ink" style={{ fontFamily: "var(--font-sans)" }}>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#top" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center">
              <span
                className="text-bg text-base font-semibold italic"
                style={{ fontFamily: "var(--font-display)" }}
              >
                a
              </span>
            </div>
            <span
              className="text-[15px] font-semibold text-ink tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              aesthetic.
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-6">
            {(
              [
                ["#features", "Producto"],
                ["#planes", "Planes"],
                ["#faq", "Preguntas"],
              ] as [string, string][]
            ).map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="text-[13.5px] text-ink-2 hover:text-ink transition-colors no-underline"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs + mobile hamburger */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden lg:block text-[13.5px] text-ink-2 hover:text-ink transition-colors no-underline px-3 py-1.5"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="hidden lg:block text-[13px] font-medium bg-ink text-bg rounded-lg px-4 py-2 hover:opacity-90 transition-opacity no-underline"
            >
              Empezar gratis
            </Link>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex flex-col gap-[5px] w-8 h-8 items-center justify-center bg-transparent border-none cursor-pointer rounded-lg hover:bg-bg-2 transition-colors"
              aria-label="Abrir menú"
            >
              <span className="w-5 h-px bg-ink block" />
              <span className="w-5 h-px bg-ink block" />
              <span className="w-3.5 h-px bg-ink block self-start ml-[5px]" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        id="top"
        className="relative min-h-[100dvh] flex items-center px-5 md:px-6 overflow-hidden py-20"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setSpot({ x: e.clientX - r.left, y: e.clientY - r.top });
        }}
        onMouseLeave={() => setSpot({ x: -600, y: -600 })}
      >
        {/* Cursor spotlight */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: spot.x,
            top: spot.y,
            width: 560,
            height: 560,
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, var(--color-accent-pale) 0%, transparent 68%)",
            opacity: 0.55,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-accent-pale text-accent-ink text-[12px] font-medium rounded-full px-3 py-1 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
              Nuevo · asistente WhatsApp con IA
            </div>

            {/* 3 — h1 word highlight */}
            <h1
              className="text-[38px] sm:text-[44px] lg:text-[50px] font-semibold leading-[1.1] tracking-tight text-ink mb-5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Una agenda{" "}
              <em
                className="not-italic"
                style={{
                  color: "var(--color-accent)",
                  fontStyle: "italic",
                  fontFamily: "var(--font-display)",
                }}
              >
                tranquila
              </em>
              <br />
              para tu peluquería.
            </h1>

            <p className="text-[17px] text-ink-2 leading-relaxed mb-8 max-w-md">
              aesthetic es un sistema simple para gestionar turnos, clientes y mensajes —
              pensado para peluquerías unipersonales que quieren concentrarse en atender,
              no en administrar.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-ink text-bg text-[14px] font-medium rounded-xl px-6 py-3 hover:opacity-90 transition-opacity no-underline"
              >
                Probar 14 días gratis
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 text-[14px] font-medium text-ink-2 hover:text-ink transition-colors no-underline px-4 py-3 rounded-xl border border-line hover:bg-bg-2"
              >
                Ver cómo funciona
              </a>
            </div>
            <p className="text-[12px] text-ink-3 mt-4">Sin tarjeta · cancelás cuando quieras</p>
          </div>

          {/* Mocks — stacked + rotated */}
          <div className="relative h-[460px] hidden lg:block">
            {/* Static blob (behind cards) */}
            <div
              className="absolute -top-10 -right-20 w-80 h-80 rounded-full pointer-events-none"
              style={{
                background: "var(--color-accent-pale)",
                opacity: 0.45,
                filter: "blur(60px)",
              }}
            />

            {/* Agenda card */}
            <div
              className="absolute top-0 left-0 bg-surface border border-line rounded-2xl shadow-lg overflow-hidden"
              style={{
                width: "calc(100% - 3rem)",
                transform: "rotate(-2deg)",
                transformOrigin: "top left",
                zIndex: 1,
              }}
            >
              <div className="px-4 py-3 border-b border-line flex items-center justify-between">
                <span className="text-[11px] font-semibold text-ink-3 uppercase tracking-widest">
                  Agenda · Martes 5
                </span>
                <span className="text-[11px] font-semibold text-accent uppercase tracking-widest">
                  5 turnos
                </span>
              </div>
              <div className="p-3 space-y-1.5">
                {agendaMock.map((appt) => (
                  <div key={appt.time} className="flex items-center gap-3 rounded-lg px-3 py-2 bg-bg">
                    <span
                      className="text-[11px] text-ink-3 w-10 shrink-0"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {appt.time}
                    </span>
                    <span className="text-[12px] font-medium text-ink flex-1">{appt.name}</span>
                    <span className="text-[11px] text-ink-3">{appt.svc}</span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        appt.status === "ok" ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn"
                      }`}
                    >
                      {appt.status === "ok" ? "OK" : "?"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat card */}
            <div
              className="absolute bottom-0 right-0 bg-surface border border-line rounded-2xl shadow-xl overflow-hidden"
              style={{
                width: "calc(100% - 3rem)",
                transform: "rotate(1.5deg)",
                transformOrigin: "bottom right",
                zIndex: 10,
              }}
            >
              <div className="px-4 py-3 border-b border-line flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-ok" />
                <span className="text-[11px] font-semibold text-ink-3 uppercase tracking-widest">
                  WhatsApp Bot
                </span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-start">
                  <div className="bg-bg-2 text-ink text-[13px] rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[75%]">
                    ¿Hay turno mañana?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div
                    className="text-accent-ink text-[13px] rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[75%] bg-accent-pale"
                    style={{ border: "1px solid var(--color-accent-soft)" }}
                  >
                    Tengo 09:00 o 11:30 ✨
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-bg-2 text-ink text-[13px] rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[75%]">
                    11:30 perfecto!
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-ok-soft rounded-xl mt-1">
                  <span className="text-ok">
                    <Check />
                  </span>
                  <span className="text-[12px] text-ok font-medium">
                    Turno reservado automáticamente
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features 01 ──────────────────────────────────────────────── */}
      <section id="features" className="py-14 md:py-24 px-5 md:px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <span className="text-[11px] font-semibold text-accent uppercase tracking-widest block mb-4">
              Producto · 01
            </span>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14">
              <h2
                className="text-[28px] md:text-[38px] font-semibold leading-tight tracking-tight text-ink m-0"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Todo en un solo lugar.
                <br />
                <span className="text-ink-3 font-normal">Lo justo, nada más.</span>
              </h2>
              <p className="text-[15px] text-ink-2 max-w-sm leading-relaxed m-0">
                Tres funciones bien hechas — agenda, asistente de WhatsApp y ficha de clientes —
                en vez de veinte a medias.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 100}>
                <div className="bg-surface border border-line rounded-2xl p-6 shadow-sm card-lift h-full">
                  <div className="w-10 h-10 rounded-xl bg-bg-2 flex items-center justify-center text-xl mb-4">
                    {f.icon}
                  </div>
                  <h3
                    className="text-[16px] font-semibold text-ink mb-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-[13.5px] text-ink-2 leading-relaxed m-0">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bot 02 ───────────────────────────────────────────────────── */}
      <section className="py-14 md:py-24 px-5 md:px-6 bg-bg-2">
        <Reveal className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <span className="text-[11px] font-semibold text-accent uppercase tracking-widest block mb-4">
              Producto · 02
            </span>
            <h2
              className="text-[36px] font-semibold leading-tight tracking-tight text-ink mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              El bot que atiende
              <br />
              mientras vos cortás.
            </h2>
            <p className="text-[15px] text-ink-2 leading-relaxed mb-8">
              Conectás tu WhatsApp en 2 minutos. El asistente aprende tu agenda, tus servicios y
              tu tono. Responde lo simple, te pasa lo complejo.
            </p>
            <ul className="space-y-3">
              {botFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-[14px] text-ink-2">
                  <span className="text-accent">
                    <Check />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface rounded-2xl border border-line shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-line bg-bg flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-ok" />
              <div>
                <div className="text-[13px] font-semibold text-ink">Lucía Fernández</div>
                <div className="text-[11px] text-ink-3">en línea · vía WhatsApp</div>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-start">
                <div className="bg-bg-2 text-ink text-[13px] rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[80%]">
                  Hola! ¿Tienen turno esta semana?
                </div>
              </div>
              <div className="flex justify-end">
                <div
                  className="text-accent-ink text-[13px] rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%] bg-accent-pale"
                  style={{ border: "1px solid var(--color-accent-soft)" }}
                >
                  ¡Hola Lucía! 👋 Tengo el miércoles a las 10:00 o el jueves a las 14:30. ¿Cuál te queda mejor?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-bg-2 text-ink text-[13px] rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[80%]">
                  El jueves a las 14:30 perfecto!
                </div>
              </div>
              <div className="flex justify-end">
                <div
                  className="text-accent-ink text-[13px] rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%] bg-accent-pale"
                  style={{ border: "1px solid var(--color-accent-soft)" }}
                >
                  ✅ Turno confirmado para el jueves 8 a las 14:30. Te mando un recordatorio el día anterior.
                </div>
              </div>
            </div>
            <div className="px-5 pb-5">
              <div className="flex items-center gap-2 bg-ok-soft rounded-xl px-4 py-2.5">
                <span className="text-ok">
                  <Check />
                </span>
                <span className="text-[12px] text-ok font-medium">
                  Turno reservado sin intervención manual
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Plans 04 ─────────────────────────────────────────────────── */}
      <section id="planes" className="py-14 md:py-24 px-5 md:px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-[11px] font-semibold text-accent uppercase tracking-widest block mb-3">
                Planes · 04
              </span>
              <h2
                className="text-[38px] font-semibold leading-tight tracking-tight text-ink mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Empezá gratis. Crecé a tu ritmo.
              </h2>
              <p className="text-[15px] text-ink-2">
                Dos planes claros. Sin sorpresas. Cambialos cuando quieras desde la configuración.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {/* Básico */}
            <Reveal delay={0}>
              <div className="bg-surface border border-line rounded-2xl p-8 shadow-sm h-full flex flex-col">
                <h3
                  className="text-[18px] font-semibold text-ink mb-1"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Básico
                </h3>
                <p className="text-[13px] text-ink-3 mb-5">Turnos, clientes y servicios en un solo lugar.</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span
                    className="text-[36px] font-semibold text-ink"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    $30.000
                  </span>
                  <span className="text-[14px] text-ink-3">/ mes</span>
                </div>
                <p className="text-[12px] text-ink-3 mb-7">ARS · 14 días gratis · cancelás cuando quieras</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {basicPlan.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[13.5px] text-ink-2">
                      <span className="text-accent-soft">
                        <Check />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className="block w-full text-center bg-bg-2 text-ink text-[14px] font-medium rounded-xl px-6 py-3 hover:bg-bg transition-colors no-underline border border-line"
                >
                  Empezar gratis
                </Link>
              </div>
            </Reveal>

            {/* Pro */}
            <Reveal delay={100}>
              <div className="bg-ink rounded-2xl p-8 shadow-lg relative overflow-hidden h-full flex flex-col">
                <div className="absolute top-4 right-4 bg-accent text-bg text-[11px] font-semibold rounded-full px-3 py-1">
                  Más elegido
                </div>
                <h3
                  className="text-[18px] font-semibold text-white mb-1"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Pro
                </h3>
                <p className="text-[13px] mb-5" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Para que el negocio funcione solo.
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span
                    className="text-[36px] font-semibold text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    $40.000
                  </span>
                  <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                    / mes
                  </span>
                </div>
                <p className="text-[12px] mb-7" style={{ color: "rgba(255,255,255,0.4)" }}>
                  ARS · 14 días gratis · cancelás cuando quieras
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {proPlan.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 text-[13.5px]"
                      style={{ color: "rgba(255,255,255,0.8)" }}
                    >
                      <span className="text-accent-soft">
                        <Check />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register?plan=pro"
                  className="block w-full text-center bg-accent text-bg text-[14px] font-medium rounded-xl px-6 py-3 hover:opacity-90 transition-opacity no-underline"
                >
                  Probar Pro 14 días
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <p className="text-center text-[12px] text-ink-3 mt-8">
              Todos los planes incluyen actualizaciones gratuitas · Sin permanencia · Facturás como
              monotributista
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Testimonials 05 ──────────────────────────────────────────── */}
      <section className="py-14 md:py-24 px-5 md:px-6 bg-bg-2">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <span className="text-[11px] font-semibold text-accent uppercase tracking-widest block mb-3">
              Voces · 05
            </span>
            <h2
              className="text-[36px] font-semibold leading-tight tracking-tight text-ink mb-12"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Las peluqueras que ya cambiaron
              <br />
              la planilla por aesthetic.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div className="bg-surface border border-line rounded-2xl p-6 shadow-sm card-lift flex flex-col h-full">
                  <p className="text-[14px] text-ink-2 leading-relaxed mb-6 italic flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-accent-pale text-accent-ink text-[12px] font-semibold flex items-center justify-center shrink-0">
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-ink">{t.name}</div>
                      <div className="text-[12px] text-ink-3">{t.biz}</div>
                      {t.time && <div className="text-[11px] text-ink-3">{t.time}</div>}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ 06 ───────────────────────────────────────────────────── */}
      <section id="faq" className="py-14 md:py-24 px-5 md:px-6">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <span className="text-[11px] font-semibold text-accent uppercase tracking-widest block mb-3">
              Preguntas · 06
            </span>
            <h2
              className="text-[36px] font-semibold leading-tight tracking-tight text-ink mb-12"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Lo que siempre nos preguntan.
            </h2>
          </Reveal>

          <Reveal delay={80}>
            <div className="bg-surface border border-line rounded-2xl px-6 shadow-sm">
              {faqs.map((faq) => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <section className="py-14 md:py-24 px-5 md:px-6 bg-ink">
        <Reveal className="max-w-2xl mx-auto text-center">
          <h2
            className="text-[28px] md:text-[40px] font-semibold leading-tight tracking-tight text-white mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Probá aesthetic por 14 días, gratis.
          </h2>
          <p className="text-[15px] mb-10" style={{ color: "rgba(255,255,255,0.6)" }}>
            Sin tarjeta, sin compromisos. Si te gusta cómo trabajás con la app, seguís.
            Si no, no pasa nada.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-accent text-bg text-[14px] font-medium rounded-xl px-7 py-3.5 hover:opacity-90 transition-opacity no-underline"
            >
              Crear mi cuenta
            </Link>
            <a
              href="#features"
              className="text-[14px] font-medium hover:text-white transition-colors no-underline"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Volver a ver el producto →
            </a>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer
        className="bg-ink px-5 pb-8 pt-10 md:px-6 md:pb-10 md:pt-12"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <span
                    className="text-bg text-sm font-semibold italic"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    a
                  </span>
                </div>
                <span
                  className="text-[14px] font-semibold"
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  aesthetic.
                </span>
              </div>
              <p
                className="text-[13px] leading-relaxed m-0"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                El sistema simple para peluquerías unipersonales. Hecho en Buenos Aires.
              </p>
            </div>

            {[
              {
                title: "Producto",
                links: ["Funcionalidades", "Planes", "Demo", "Preguntas frecuentes"],
              },
              {
                title: "Compañía",
                links: ["Sobre nosotros", "Blog", "Contacto", "Términos"],
              },
              {
                title: "Para clientes",
                links: ["Buscar peluquería", "Cómo reservar", "Política de cancelación"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4
                  className="text-[12px] font-semibold uppercase tracking-widest mb-4"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {col.title}
                </h4>
                <ul className="space-y-2.5 list-none m-0 p-0">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="text-[13px] no-underline transition-colors"
                        style={{ color: "rgba(255,255,255,0.45)" }}
                        onMouseEnter={(e) =>
                          ((e.target as HTMLAnchorElement).style.color = "rgba(255,255,255,0.9)")
                        }
                        onMouseLeave={(e) =>
                          ((e.target as HTMLAnchorElement).style.color = "rgba(255,255,255,0.45)")
                        }
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p className="text-[12px] m-0" style={{ color: "rgba(255,255,255,0.3)" }}>
              © 2026 aesthetic · Todos los derechos reservados
            </p>
            <p className="text-[12px] m-0" style={{ color: "rgba(255,255,255,0.3)" }}>
              Buenos Aires, AR
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
