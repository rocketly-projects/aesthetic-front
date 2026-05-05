interface KPIProps {
  lbl: string;
  val: string | number;
  delta?: React.ReactNode;
}

export default function KPI({ lbl, val, delta }: KPIProps) {
  return (
    <div className="bg-surface border border-line rounded-lg shadow-sm p-5 flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-ink-3 uppercase tracking-wider">{lbl}</span>
      <span className="text-[28px] font-semibold text-ink leading-none" style={{ fontFamily: "var(--font-display)" }}>
        {val}
      </span>
      {delta && <span className="text-xs text-ink-3">{delta}</span>}
    </div>
  );
}
