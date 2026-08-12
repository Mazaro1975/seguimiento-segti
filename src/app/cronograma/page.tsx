import { db } from "@/lib/db";
import { getFilteredInitiatives } from "@/lib/queryInitiatives";
import { Filters } from "@/components/Filters";
import { InitiativeTable } from "@/components/InitiativeTable";

export const dynamic = "force-dynamic";

export default async function CronogramaPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const params = new URLSearchParams(
    Object.entries(searchParams).filter(([, v]) => v !== undefined) as [string, string][]
  );
  const [directions, initiatives] = await Promise.all([
    db.direction.findMany({ orderBy: { order: "asc" } }),
    getFilteredInitiatives(params),
  ]);

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Cronograma de Priorización</h2>
        <p className="text-sm text-slate-500">{initiatives.length} iniciativas</p>
      </div>
      <Filters directions={directions} />
      <InitiativeTable initiatives={initiatives} />
    </div>
  );
}
