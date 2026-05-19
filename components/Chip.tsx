type ChipVariant = "ok" | "warn" | "err" | "info" | "neutral";

interface ChipProps {
  variant: ChipVariant;
  label: string;
}

export default function Chip({ variant, label }: ChipProps) {
  return (
    <span className={`chip chip-${variant}`}>
      <span className="dot" />
      {label}
    </span>
  );
}

export function statusChip(status: string) {
  switch (status) {
    case "confirmed":        return <Chip variant="ok"      label="Confirmado"      />;
    case "pending":          return <Chip variant="warn"    label="Pendiente"       />;
    case "completed":        return <Chip variant="info"    label="Completado"      />;
    case "cancelled":        return <Chip variant="err"     label="Cancelado"       />;
    case "no_show":          return <Chip variant="err"     label="No asistió"      />;
    case "awaiting_payment": return <Chip variant="warn"    label="Esperando pago"  />;
    default:                 return <Chip variant="neutral" label={status}          />;
  }
}
