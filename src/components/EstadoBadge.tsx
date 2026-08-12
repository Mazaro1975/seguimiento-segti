import { ESTADO_COLORS, ESTADO_LABELS } from "@/lib/labels";
import type { Estado } from "@/lib/types";

export function EstadoBadge({ estado }: { estado: string }) {
  const key = estado as Estado;
  const color = ESTADO_COLORS[key] ?? "#94a3b8";
  const label = ESTADO_LABELS[key] ?? estado;
  return (
    <span className="badge" style={{ backgroundColor: color }}>
      {label}
    </span>
  );
}
