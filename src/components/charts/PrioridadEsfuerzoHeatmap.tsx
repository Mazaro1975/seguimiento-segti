import { sequentialStep } from "@/lib/chartColors";

export function PrioridadEsfuerzoHeatmap({
  matrix,
  prioridades,
  esfuerzos,
}: {
  matrix: Record<string, number>; // key: `${prioridad}-${esfuerzo}`
  prioridades: number[];
  esfuerzos: number[];
}) {
  const max = Math.max(1, ...Object.values(matrix));

  return (
    <div className="card">
      <h3 className="mb-2 text-sm font-semibold text-slate-900">
        Matriz Prioridad × Esfuerzo
      </h3>
      <p className="mb-3 text-xs text-slate-500">
        Número de iniciativas activas por combinación. Colores más oscuros = más iniciativas.
      </p>
      <div className="overflow-x-auto">
        <table className="border-collapse text-center text-xs">
          <thead>
            <tr>
              <th className="p-1 text-slate-400">Prioridad \ Esfuerzo</th>
              {esfuerzos.map((e) => (
                <th key={e} className="p-1 font-medium text-slate-500">
                  {e}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {prioridades.map((p) => (
              <tr key={p}>
                <th className="p-1 text-right font-medium text-slate-500">{p}</th>
                {esfuerzos.map((e) => {
                  const count = matrix[`${p}-${e}`] ?? 0;
                  const bg = count === 0 ? "#f3f2ee" : sequentialStep(count / max);
                  const textColor = count / max > 0.55 ? "#ffffff" : "#0b0b0b";
                  return (
                    <td
                      key={e}
                      title={`Prioridad ${p}, Esfuerzo ${e}: ${count} iniciativa(s)`}
                      className="h-10 w-10 border border-white font-medium"
                      style={{ backgroundColor: bg, color: textColor }}
                    >
                      {count > 0 ? count : ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
