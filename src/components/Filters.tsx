"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Direction } from "@prisma/client";
import { enumOptions, ESTADO_LABELS, CLASIFICACION_LABELS, TIPO_SOLICITUD_LABELS, TRIMESTRE_LABELS } from "@/lib/labels";

interface FiltersProps {
  directions?: Direction[];
}

export function Filters({ directions }: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="card mb-4 flex flex-wrap items-end gap-3">
      <div className="min-w-[200px] flex-1">
        <label className="label">Buscar</label>
        <input
          className="input"
          placeholder="Título, líder, director..."
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(e) => update("q", e.target.value)}
        />
      </div>

      {directions && (
        <div>
          <label className="label">Dirección</label>
          <select
            className="input"
            value={searchParams.get("direction") ?? ""}
            onChange={(e) => update("direction", e.target.value)}
          >
            <option value="">Todas</option>
            {directions.map((d) => (
              <option key={d.id} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="label">Trimestre</label>
        <select
          className="input"
          value={searchParams.get("trimestre") ?? ""}
          onChange={(e) => update("trimestre", e.target.value)}
        >
          <option value="">Todos</option>
          {enumOptions(TRIMESTRE_LABELS).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Estado</label>
        <select
          className="input"
          value={searchParams.get("estado") ?? ""}
          onChange={(e) => update("estado", e.target.value)}
        >
          <option value="">Todos</option>
          {enumOptions(ESTADO_LABELS).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Clasificación</label>
        <select
          className="input"
          value={searchParams.get("clasificacion") ?? ""}
          onChange={(e) => update("clasificacion", e.target.value)}
        >
          <option value="">Todas</option>
          {enumOptions(CLASIFICACION_LABELS).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Tipo Solicitud</label>
        <select
          className="input"
          value={searchParams.get("tipoSolicitud") ?? ""}
          onChange={(e) => update("tipoSolicitud", e.target.value)}
        >
          <option value="">Todos</option>
          {enumOptions(TIPO_SOLICITUD_LABELS).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 pb-1.5 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={searchParams.get("includeArchived") === "true"}
          onChange={(e) => update("includeArchived", e.target.checked ? "true" : "")}
        />
        Incluir archivadas
      </label>
    </div>
  );
}
