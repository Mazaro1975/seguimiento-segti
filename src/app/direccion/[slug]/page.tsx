import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getFilteredInitiatives } from "@/lib/queryInitiatives";
import { Filters } from "@/components/Filters";
import { InitiativeTable } from "@/components/InitiativeTable";
import { ESTADO_LABELS } from "@/lib/labels";
import type { Estado } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DireccionPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | undefined>;
}) {
  const direction = await db.direction.findUnique({ where: { slug: params.slug } });
  if (!direction) notFound();

  const urlParams = new URLSearchParams(
    Object.entries(searchParams).filter(([, v]) => v !== undefined) as [string, string][]
  );
  urlParams.set("direction", params.slug);

  const initiatives = await getFilteredInitiatives(urlParams);

  const total = initiatives.length;
  const porEstado = new Map<string, number>();
  for (const init of initiatives) {
    porEstado.set(init.estado, (porEstado.get(init.estado) ?? 0) + 1);
  }
  const activas = initiatives.filter((i) => i.estado === "PRENDIDO").length;
  const pctActivo = total > 0 ? Math.round((activas / total) * 100) : 0;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">{direction.name}</h2>
        <p className="text-sm text-slate-500">{total} iniciativas · {pctActivo}% prendidas</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <div className="card">
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-xl font-semibold">{total}</p>
        </div>
        {Object.keys(ESTADO_LABELS).map((estado) => (
          <div key={estado} className="card">
            <p className="text-xs text-slate-500">{ESTADO_LABELS[estado as Estado]}</p>
            <p className="text-xl font-semibold">{porEstado.get(estado) ?? 0}</p>
          </div>
        ))}
      </div>

      <Filters />
      <InitiativeTable initiatives={initiatives} showDirectionColumn={false} />
    </div>
  );
}
