import { db } from "@/lib/db";
import { getActiveAlerts } from "@/lib/alerts";
import { AlertsPanel } from "@/components/AlertsPanel";

export const dynamic = "force-dynamic";

export default async function RiesgosPage() {
  const initiatives = await db.initiative.findMany({
    where: { archivedAt: null },
    include: { direction: true, seguimientos: { select: { fecha: true } } },
  });

  const alerts = getActiveAlerts(initiatives);
  const alta = alerts.filter((a) => a.severity === "alta").length;
  const media = alerts.filter((a) => a.severity === "media").length;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Riesgos y Alertas Activas</h2>
        <p className="text-sm text-slate-500">
          {alerts.length} alertas activas — {alta} de severidad alta, {media} media.
        </p>
      </div>
      <AlertsPanel alerts={alerts} />
    </div>
  );
}
