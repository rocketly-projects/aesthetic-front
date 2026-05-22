interface KPIProps {
  lbl: string;
  val: string | number;
  delta?: React.ReactNode;
  variant?: "default" | "dark" | "accent";
}

export default function KPI({ lbl, val, delta, variant = "default" }: KPIProps) {
  const bg    = variant === "dark" ? "bg-ink border-ink" : variant === "accent" ? "bg-accent-pale border-accent-pale" : "bg-surface border-line";
  const lbl_c = variant === "dark" ? "text-white/60"     : variant === "accent" ? "text-accent-ink/70"                : "text-ink-3";
  const val_c = variant === "dark" ? "text-white"         : variant === "accent" ? "text-accent-ink"                   : "text-ink";
  const dlt_c = variant === "dark" ? "text-white/50"      : variant === "accent" ? "text-accent-ink/60"                : "text-ink-3";
  return (
    <div className={`border rounded-lg shadow-sm p-5 flex flex-col gap-1.5 ${bg}`}>
      <span className={`text-[12px] font-medium uppercase tracking-wider ${lbl_c}`}>{lbl}</span>
      <span className={`text-[28px] font-semibold leading-none ${val_c}`} style={{ fontFamily: "var(--font-display)" }}>
        {val}
      </span>
      {delta && <span className={`text-xs ${dlt_c}`}>{delta}</span>}
    </div>
  );
}
