import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="max-w-[420px] w-full text-center">

        {/* Número 404 */}
        <div
          className="text-[96px] leading-none font-normal text-accent opacity-20 mb-4 select-none"
          style={{ fontFamily: "var(--font-display)" }}
        >
          404
        </div>

        <h1
          className="m-0 mb-2 text-[28px] font-normal text-ink leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Página no encontrada
        </h1>
        <p className="m-0 mb-8 text-[13px] text-ink-3 leading-relaxed">
          La página que buscás no existe o fue movida.
          <br />Verificá la URL o volvé al inicio.
        </p>

        <Link
          href="/dashboard"
          className="inline-block bg-ink text-bg no-underline rounded-xl px-7 py-3 text-[14px] font-medium hover:opacity-90 transition-opacity"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
