import Link from "next/link";
import type { Alert, AlertRule } from "@/lib/alerts";

const SEVERITY_COLOR: Record<Alert["severity"], string> = {
  alta: "#d03b3b",
  media: "#fab219",
};

export function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) {
    return (
      <div className="card text-sm text-slate-500">
        No hay alertas activas en este momento. 🎉
      </div>
    );
  }

  const byRule = new Map<AlertRule, Alert[]>();
  for (const a of alerts) {
    if (!byRule.has(a.rule)) byRule.set(a.rule, []);
    byRule.get(a.rule)!.push(a);
  }

  return (
    <div className="flex flex-col gap-4">
      {[...byRule.entries()].map(([rule, items]) => (
        <div key={rule} className="card">
          <h3 className="mb-2 text-sm font-semibold text-slate-900">
            {items[0].ruleLabel} <span className="text-slate-400">({items.length})</span>
          </h3>
          <ul className="flex flex-col divide-y divide-slate-100">
            {items.map((a, idx) => (
              <li key={`${a.initiativeId}-${idx}`} className="flex items-start gap-3 py-2">
                <span
                  className="mt-1 h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: SEVERITY_COLOR[a.severity] }}
                  title={`Severidad ${a.severity}`}
                />
                <div>
                  <Link
                    href={`/iniciativas/${a.initiativeId}`}
                    className="text-sm font-medium text-slate-900 hover:underline"
                  >
                    {a.initiativeTitle}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {a.directionName} — {a.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
