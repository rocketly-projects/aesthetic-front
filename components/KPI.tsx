interface KPIProps {
  lbl: string;
  val: string | number;
  delta?: React.ReactNode;
  variant?: "default" | "dark";
}

export default function KPI({ lbl, val, delta, variant = "default" }: KPIProps) {
  const dark = variant === "dark";
  return (
    <div className={`border rounded-lg shadow-sm p-5 flex flex-col gap-1.5 ${dark ? "bg-ink border-ink" : "bg-surface border-line"}`}>
      <span className={`text-[12px] font-medium uppercase tracking-wider ${dark ? "text-white/60" : "text-ink-3"}`}>{lbl}</span>
      <span className={`text-[28px] font-semibold leading-none ${dark ? "text-white" : "text-ink"}`} style={{ fontFamily: "var(--font-display)" }}>
        {val}
      </span>
      {delta && <span className={`text-xs ${dark ? "text-white/50" : "text-ink-3"}`}>{delta}</span>}
    </div>
  );
}
