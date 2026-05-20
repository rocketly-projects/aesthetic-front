interface PaginationProps {
  page: number;
  limit: number;
  onChange: (page: number) => void;
  /** Total de registros (devuelto por el backend). Si no se conoce, se usa `count` como fallback. */
  total?: number;
  /** Cantidad de ítems en la página actual — permite mostrar prev/next sin conocer el total. */
  count?: number;
}

export default function Pagination({ page, limit, onChange, total, count = 0 }: PaginationProps) {
  const totalKnown   = total !== undefined && total > 0;
  const totalPages   = totalKnown ? Math.max(1, Math.ceil(total! / limit)) : null;
  const hasPrev      = page > 1;
  const hasNext      = totalKnown ? page < totalPages! : count >= limit;

  // No mostrar si estamos en página 1, no hay más páginas y el total cabe en una sola
  if (!hasPrev && !hasNext) return null;

  const from = (page - 1) * limit + 1;
  const to   = totalKnown ? Math.min(page * limit, total!) : (page - 1) * limit + count;

  return (
    <div className="flex items-center justify-between py-3 text-[12.5px] text-ink-3">
      <span>
        {totalKnown
          ? `Mostrando ${from}–${to} de ${total}`
          : `Página ${page}`}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={!hasPrev}
          className="px-3 py-1.5 rounded-md border border-line bg-surface text-ink-2 hover:bg-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[12px]"
        >
          ← Anterior
        </button>
        {totalPages && (
          <span className="px-3 py-1.5 font-mono text-[11px] text-ink-2">
            {page} / {totalPages}
          </span>
        )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={!hasNext}
          className="px-3 py-1.5 rounded-md border border-line bg-surface text-ink-2 hover:bg-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[12px]"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
