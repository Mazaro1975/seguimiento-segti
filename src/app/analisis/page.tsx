import { db } from "@/lib/db";
import { KPICards } from "@/components/charts/KPICards";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import { EstadoStackedBarChart, type EstadoStackedDatum } from "@/components/charts/EstadoStackedBarChart";
import { PrioridadEsfuerzoHeatmap } from "@/components/charts/PrioridadEsfuerzoHeatmap";
import {
  CLASIFICACION_LABELS,
  ESTADO_COLORS,
  TIPO_SOLICITUD_LABELS,
  TRIMESTRE_LABELS,
} from "@/lib/labels";
import { CLASIFICACIONES, ESTADOS, TIPOS_SOLICITUD, TRIMESTRES } from "@/lib/types";
import type { Clasificacion, Estado, TipoSolicitud, Trimestre } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AnalisisPage() {
  const initiatives = await db.initiative.findMany({
    where: { archivedAt: null },
    include: { direction: true },
  });

  const total = initiatives.length;
  const countEstado = (estado: Estado) => initiatives.filter((i) => i.estado === estado).length;
  const kpis = [
    { label: "Total Iniciativas", value: total },
    { label: "Prendidas", value: countEstado("PRENDIDO"), accent: ESTADO_COLORS.PRENDIDO },
    { label: "Sin Iniciar", value: countEstado("SIN_INICIAR"), accent: ESTADO_COLORS.SIN_INICIAR },
    {
      label: "Pausadas/Aplazadas",
      value: countEstado("PAUSADO") + countEstado("APLAZADO"),
      accent: ESTADO_COLORS.PAUSADO,
    },
    { label: "Cerradas", value: countEstado("CERRADO"), accent: ESTADO_COLORS.CERRADO },
    { label: "Canceladas", value: countEstado("CANCELADO"), accent: ESTADO_COLORS.CANCELADO },
  ];

  const directions = await db.direction.findMany({ orderBy: { order: "asc" } });
  const porDireccion: EstadoStackedDatum[] = directions.map((d) => {
    const row: EstadoStackedDatum = { name: d.name };
    for (const estado of ESTADOS) {
      row[estado] = initiatives.filter(
        (i) => i.directionId === d.id && i.estado === estado
      ).length;
    }
    return row;
  });

  const porTrimestre = TRIMESTRES.map((t) => ({
    name: TRIMESTRE_LABELS[t as Trimestre],
    value: initiatives.filter((i) => i.trimestre === t).length,
  }));

  const porClasificacion = CLASIFICACIONES.map((c) => ({
    name: CLASIFICACION_LABELS[c as Clasificacion],
    value: initiatives.filter((i) => i.clasificacion === c).length,
  }));

  const porTipoSolicitud = [
    ...TIPOS_SOLICITUD.map((t) => ({
      name: TIPO_SOLICITUD_LABELS[t as TipoSolicitud],
      value: initiatives.filter((i) => i.tipoSolicitud === t).length,
    })),
    { name: "Sin especificar", value: initiatives.filter((i) => !i.tipoSolicitud).length },
  ].filter((d) => d.value > 0);

  const liderCounts = new Map<string, number>();
  for (const i of initiatives) {
    if (!i.liderTI) continue;
    liderCounts.set(i.liderTI, (liderCounts.get(i.liderTI) ?? 0) + 1);
  }
  const porLiderTI = [...liderCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  const matrix: Record<string, number> = {};
  for (const i of initiatives) {
    if (i.prioridad === null || i.esfuerzo === null) continue;
    const key = `${i.prioridad}-${i.esfuerzo}`;
    matrix[key] = (matrix[key] ?? 0) + 1;
  }
  const prioridadesPresentes = [
    ...new Set(initiatives.map((i) => i.prioridad).filter((p): p is number => p !== null)),
  ].sort((a, b) => a - b);
  const esfuerzosPresentes = [1, 2, 3, 4, 5];

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Análisis General</h2>

      <KPICards items={kpis} />

      <div className="mb-4">
        <EstadoStackedBarChart title="Iniciativas por Dirección (por Estado)" data={porDireccion} />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SimpleBarChart title="Iniciativas por Trimestre" data={porTrimestre} />
        <SimpleBarChart title="Iniciativas por Clasificación" data={porClasificacion} />
        <SimpleBarChart title="Iniciativas por Tipo de Solicitud" data={porTipoSolicitud} />
        <SimpleBarChart title="Carga por Líder TI (top 10)" data={porLiderTI} horizontal />
      </div>

      <PrioridadEsfuerzoHeatmap
        matrix={matrix}
        prioridades={prioridadesPresentes.length > 0 ? prioridadesPresentes : [1, 2, 3]}
        esfuerzos={esfuerzosPresentes}
      />
    </div>
  );
}
