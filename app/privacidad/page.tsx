"use client";

import Link from "next/link";

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-bg text-ink" style={{ fontFamily: "var(--font-sans)" }}>
      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <img src="/logoDark.svg" alt="aesthetic" className="w-[44px] h-[44px] rounded-full shrink-0" />
            <span
              className="text-[20px] font-medium text-ink tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              aesthetic.
            </span>
          </Link>

          <Link
            href="/"
            className="text-[13.5px] text-ink-2 hover:text-ink transition-colors no-underline"
          >
            Volver
          </Link>
        </div>
      </nav>

      {/* ── Contenido ────────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-5 md:px-6 py-14 md:py-20">
        <span className="text-[11px] font-semibold text-accent uppercase tracking-widest block mb-4">
          Legal
        </span>
        <h1
          className="text-[34px] md:text-[42px] font-semibold leading-tight tracking-tight text-ink mb-3 m-0"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Política de Privacidad
        </h1>
        <p className="text-[14px] text-ink-3 mb-12 m-0">
          Última actualización: 5 de junio de 2026
        </p>

        <Section title="1. Quiénes somos">
          <p>
            <strong className="text-ink">aesthetic</strong> es una plataforma desarrollada por
            <strong className="text-ink"> Rocketly</strong> que permite a profesionales de la belleza
            (peluquerías, estéticas, salones) gestionar sus turnos, clientes y atender consultas
            por WhatsApp mediante un asistente automatizado.
          </p>
          <p>
            Esta política describe cómo recopilamos, usamos, almacenamos y protegemos la información
            personal de:
          </p>
          <ul>
            <li>
              <strong className="text-ink">Profesionales y negocios</strong> que se registran y
              utilizan aesthetic para gestionar su agenda.
            </li>
            <li>
              <strong className="text-ink">Clientes finales</strong> que reservan turnos o
              interactúan con el asistente de WhatsApp de un negocio.
            </li>
          </ul>
        </Section>

        <Section title="2. Datos que recopilamos">
          <h3 className="text-[16px] font-semibold text-ink mt-6 mb-2">2.1 De los negocios</h3>
          <ul>
            <li>Nombre, email, contraseña (encriptada)</li>
            <li>Nombre del negocio, dirección, teléfono, redes sociales, sitio web</li>
            <li>Logo e imágenes</li>
            <li>Información de pago (procesada por MercadoPago — no almacenamos datos de tarjeta)</li>
            <li>Número de WhatsApp Business (cuando habilitan el bot)</li>
          </ul>

          <h3 className="text-[16px] font-semibold text-ink mt-6 mb-2">2.2 De los clientes finales</h3>
          <ul>
            <li>Nombre y apellido</li>
            <li>Número de teléfono</li>
            <li>Email (opcional)</li>
            <li>Historial de turnos con el negocio</li>
            <li>
              Contenido de los mensajes intercambiados con el asistente de WhatsApp (texto de las
              conversaciones)
            </li>
            <li>Notas privadas que el profesional registra sobre el cliente</li>
          </ul>

          <h3 className="text-[16px] font-semibold text-ink mt-6 mb-2">2.3 Datos técnicos</h3>
          <ul>
            <li>Dirección IP (para rate limiting de seguridad)</li>
            <li>Tipo de navegador y dispositivo</li>
            <li>Logs de actividad (para diagnóstico y mejora del servicio)</li>
          </ul>
        </Section>

        <Section title="3. Para qué usamos esos datos">
          <ul>
            <li>Gestionar las cuentas de los negocios y sus suscripciones</li>
            <li>Permitir que los clientes reserven turnos y reciban confirmaciones</li>
            <li>
              Operar el asistente automático de WhatsApp: identificar al cliente por su número,
              ofrecer servicios disponibles, agendar, cancelar o consultar turnos
            </li>
            <li>Enviar recordatorios de turno por WhatsApp o email</li>
            <li>Procesar pagos y señas a través de MercadoPago</li>
            <li>Detectar y prevenir uso fraudulento o abusivo de la plataforma</li>
            <li>Cumplir con obligaciones legales y regulatorias</li>
            <li>Mejorar el servicio a partir del análisis de uso agregado</li>
          </ul>
        </Section>

        <Section title="4. Integración con WhatsApp / Meta">
          <p>
            aesthetic utiliza la <strong className="text-ink">WhatsApp Business Cloud API</strong> de
            Meta Platforms, Inc. para operar el asistente automatizado. Esto implica:
          </p>
          <ul>
            <li>
              Los mensajes que los clientes envían al número de WhatsApp del negocio son recibidos por
              nuestra plataforma y procesados por un modelo de lenguaje para generar respuestas
              automáticas relevantes a su consulta (agendar turno, consultar disponibilidad, etc.).
            </li>
            <li>
              Las respuestas se envían de vuelta al cliente a través de la misma API de Meta.
            </li>
            <li>
              Meta puede recopilar metadatos del intercambio según su propia política de privacidad.
              Te recomendamos revisarla:{" "}
              <a
                href="https://www.whatsapp.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent no-underline hover:underline"
              >
                Política de Privacidad de WhatsApp
              </a>
              .
            </li>
            <li>
              No usamos los datos de los clientes para enviarles publicidad ni los compartimos con
              terceros con fines comerciales.
            </li>
          </ul>
        </Section>

        <Section title="5. Servicios de terceros que utilizamos">
          <p>Para operar el servicio, compartimos datos estrictamente necesarios con:</p>
          <ul>
            <li>
              <strong className="text-ink">Meta Platforms, Inc.</strong> — Envío y recepción de
              mensajes vía WhatsApp Business Cloud API
            </li>
            <li>
              <strong className="text-ink">OpenAI, L.L.C.</strong> — Procesamiento del contenido de
              los mensajes para generar respuestas del asistente automatizado. OpenAI no almacena ni
              entrena modelos con estos datos según los términos de su API.
            </li>
            <li>
              <strong className="text-ink">MercadoPago</strong> — Procesamiento de pagos
              (suscripciones y señas de reservas)
            </li>
            <li>
              <strong className="text-ink">Resend</strong> — Envío de emails transaccionales
              (confirmaciones, recuperación de contraseña)
            </li>
            <li>
              <strong className="text-ink">Cloudflare</strong> — Infraestructura y protección contra
              ataques
            </li>
            <li>
              <strong className="text-ink">Vercel</strong> — Alojamiento del frontend
            </li>
          </ul>
          <p>
            Todos estos proveedores cumplen con estándares internacionales de seguridad y privacidad.
          </p>
        </Section>

        <Section title="6. Almacenamiento y seguridad">
          <ul>
            <li>
              Los datos se almacenan en bases de datos PostgreSQL alojadas en proveedores con
              certificación SOC 2 e ISO 27001.
            </li>
            <li>Las contraseñas se almacenan con hash bcrypt.</li>
            <li>
              Las comunicaciones entre nuestros servidores, los clientes y los servicios de terceros
              se realizan siempre con cifrado TLS 1.2 o superior.
            </li>
            <li>
              Los tokens de autenticación tienen una validez limitada y son verificados en cada
              solicitud.
            </li>
            <li>
              No vendemos ni alquilamos información personal a terceros bajo ninguna circunstancia.
            </li>
          </ul>
        </Section>

        <Section title="7. Cuánto tiempo conservamos los datos">
          <ul>
            <li>
              Los datos de los negocios se conservan mientras la cuenta esté activa o tenga
              suscripciones activas, y hasta 12 meses después de la baja para cumplir obligaciones
              legales y contables.
            </li>
            <li>
              Las conversaciones de WhatsApp se conservan mientras la cuenta del negocio esté
              activa.
            </li>
            <li>
              Los logs técnicos y de seguridad se rotan automáticamente cada 90 días salvo
              excepciones por investigación de incidentes.
            </li>
          </ul>
        </Section>

        <Section title="8. Tus derechos">
          <p>
            En cualquier momento podés ejercer los siguientes derechos sobre tus datos personales:
          </p>
          <ul>
            <li>
              <strong className="text-ink">Acceso</strong> — solicitar una copia de la información
              que tenemos sobre vos
            </li>
            <li>
              <strong className="text-ink">Rectificación</strong> — corregir datos inexactos o
              incompletos
            </li>
            <li>
              <strong className="text-ink">Eliminación</strong> — pedir que borremos tus datos
              (sujeto a obligaciones legales)
            </li>
            <li>
              <strong className="text-ink">Portabilidad</strong> — recibir tus datos en un formato
              estructurado
            </li>
            <li>
              <strong className="text-ink">Oposición</strong> — oponerte al procesamiento de tus
              datos para ciertos fines
            </li>
          </ul>
          <p>
            Para ejercer cualquiera de estos derechos, escribinos a{" "}
            <a
              href="mailto:aesthetic.rocketly@gmail.com"
              className="text-accent no-underline hover:underline"
            >
              aesthetic.rocketly@gmail.com
            </a>
            .
          </p>
        </Section>

        <Section title="9. Menores de edad">
          <p>
            aesthetic no está destinada a menores de 18 años. Si descubrimos que recopilamos datos
            de un menor sin consentimiento parental válido, los eliminaremos inmediatamente.
          </p>
        </Section>

        <Section title="10. Cookies">
          <p>
            Usamos cookies esenciales para el funcionamiento del servicio (sesión, preferencias).
            No usamos cookies de tracking publicitario de terceros.
          </p>
        </Section>

        <Section title="11. Cambios en esta política">
          <p>
            Podemos actualizar esta política cuando incorporemos nuevas funcionalidades o por
            requerimientos legales. Te notificaremos por email cualquier cambio significativo. La
            fecha de última actualización siempre figura al inicio de este documento.
          </p>
        </Section>

        <Section title="12. Contacto">
          <p>
            Si tenés preguntas sobre esta política o sobre el tratamiento de tus datos personales,
            podés contactarnos:
          </p>
          <ul>
            <li>
              Email:{" "}
              <a
                href="mailto:aesthetic.rocketly@gmail.com"
                className="text-accent no-underline hover:underline"
              >
                aesthetic.rocketly@gmail.com
              </a>
            </li>
            <li>Responsable: Rocketly · Buenos Aires, Argentina</li>
          </ul>
        </Section>

        <div className="mt-16 pt-8 border-t border-line">
          <p className="text-[13px] text-ink-3 m-0">
            Esta política se rige por la Ley 25.326 de Protección de Datos Personales de la
            República Argentina.
          </p>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer
        className="bg-ink px-5 py-8 md:px-6 md:py-10 mt-20"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img src="/logoLight.svg" alt="aesthetic" className="w-[36px] h-[36px] rounded-full shrink-0" />
            <span
              className="text-[16px] font-medium"
              style={{ color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-display)" }}
            >
              aesthetic.
            </span>
          </div>
          <p className="text-[12px] m-0" style={{ color: "rgba(255,255,255,0.3)" }}>
            © 2026 aesthetic · Buenos Aires, AR
          </p>
        </div>
      </footer>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2
        className="text-[20px] md:text-[22px] font-semibold text-ink mb-4 m-0"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>
      <div className="text-[14.5px] text-ink-2 leading-relaxed space-y-3 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:list-disc [&_li]:marker:text-ink-3">
        {children}
      </div>
    </section>
  );
}
