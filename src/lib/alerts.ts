import type { Seguimiento } from "@prisma/client";
import type { Estado, Trimestre } from "./types";
import { ESTADO_LABELS, TRIMESTRE_LABELS } from "./labels";

export const ALERT_THRESHOLDS = {
  diasSinSeguimientoPrendida: 15,
  diasLimitePausado: 30,
  diasCercaFinTrimestre: 10,
  prioridadAlta: 2, // prioridad <= este valor se considera alta
  esfuerzoAlto: 4, // esfuerzo >= este valor se considera alto
  diasSinSeguimientoDesdeCreacion: 30,
} as const;

export interface AlertableInitiative {
  id: string;
  title: string;
  estado: string;
  trimestre: string;
  prioridad: number | null;
  esfuerzo: number | null;
  createdAt: Date;
  updatedAt: Date;
  direction: { name: string };
  seguimientos: Pick<Seguimiento, "fecha">[];
}

export type AlertRule =
  | "SIN_INICIAR_PRIORITARIA"
  | "PRENDIDA_SIN_SEGUIMIENTO"
  | "FIN_TRIMESTRE_SIN_AVANCE"
  | "PAUSADA_TIEMPO_LIMITE"
  | "DESVIACION_ESFUERZO";

export interface Alert {
  rule: AlertRule;
  ruleLabel: string;
  severity: "alta" | "media";
  initiativeId: string;
  initiativeTitle: string;
  directionName: string;
  detail: string;
}

const RULE_LABELS: Record<AlertRule, string> = {
  SIN_INICIAR_PRIORITARIA: "Sin Iniciar con alta prioridad/esfuerzo",
  PRENDIDA_SIN_SEGUIMIENTO: "Prendida sin seguimiento reciente",
  FIN_TRIMESTRE_SIN_AVANCE: "Próxima a fin de trimestre sin avance",
  PAUSADA_TIEMPO_LIMITE: "Pausada/Aplazada por tiempo prolongado",
  DESVIACION_ESFUERZO: "Posible desviación de esfuerzo",
};

// Trimestres asumidos sobre el año calendario del ciclo de planeación (2026).
const QUARTER_END: Record<Trimestre, Date | null> = {
  Q1: new Date("2026-03-31T23:59:59"),
  Q2: new Date("2026-06-30T23:59:59"),
  Q3: new Date("2026-09-30T23:59:59"),
  Q4: new Date("2026-12-31T23:59:59"),
  CONTINUO: null,
  SIN_Q: null,
};

function daysBetween(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function lastSeguimientoDate(seguimientos: Pick<Seguimiento, "fecha">[]): Date | null {
  if (seguimientos.length === 0) return null;
  return seguimientos.reduce(
    (latest, s) => (s.fecha > latest ? s.fecha : latest),
    seguimientos[0].fecha
  );
}

export function getActiveAlerts(
  initiatives: AlertableInitiative[],
  now: Date = new Date()
): Alert[] {
  const alerts: Alert[] = [];

  for (const init of initiatives) {
    const last = lastSeguimientoDate(init.seguimientos);
    const directionName = init.direction.name;

    // Regla 1: Sin Iniciar con alta prioridad o alto esfuerzo
    if (
      init.estado === "SIN_INICIAR" &&
      ((init.prioridad !== null && init.prioridad <= ALERT_THRESHOLDS.prioridadAlta) ||
        (init.esfuerzo !== null && init.esfuerzo >= ALERT_THRESHOLDS.esfuerzoAlto))
    ) {
      alerts.push({
        rule: "SIN_INICIAR_PRIORITARIA",
        ruleLabel: RULE_LABELS.SIN_INICIAR_PRIORITARIA,
        severity: "alta",
        initiativeId: init.id,
        initiativeTitle: init.title,
        directionName,
        detail: `Prioridad ${init.prioridad ?? "N/D"}, Esfuerzo ${init.esfuerzo ?? "SD"} — sin iniciar todavía.`,
      });
    }

    // Regla 2: Prendida sin actualización de seguimiento en X días
    if (init.estado === "PRENDIDO") {
      const reference = last ?? init.createdAt;
      const dias = daysBetween(now, reference);
      if (dias >= ALERT_THRESHOLDS.diasSinSeguimientoPrendida) {
        alerts.push({
          rule: "PRENDIDA_SIN_SEGUIMIENTO",
          ruleLabel: RULE_LABELS.PRENDIDA_SIN_SEGUIMIENTO,
          severity: dias >= ALERT_THRESHOLDS.diasSinSeguimientoPrendida * 2 ? "alta" : "media",
          initiativeId: init.id,
          initiativeTitle: init.title,
          directionName,
          detail: `${dias} días sin un seguimiento registrado (última actualización: ${
            last ? last.toLocaleDateString("es-CO") : "nunca"
          }).`,
        });
      }
    }

    // Regla 3: Próxima a fin de trimestre sin avance suficiente
    const quarterEnd = QUARTER_END[init.trimestre as Trimestre];
    if (
      quarterEnd &&
      init.estado !== "CERRADO" &&
      init.estado !== "CANCELADO" &&
      now <= quarterEnd
    ) {
      const diasRestantes = daysBetween(quarterEnd, now);
      const diasDesdeUltimoSeguimiento = daysBetween(now, last ?? init.createdAt);
      if (
        diasRestantes <= ALERT_THRESHOLDS.diasCercaFinTrimestre &&
        diasDesdeUltimoSeguimiento > ALERT_THRESHOLDS.diasCercaFinTrimestre
      ) {
        alerts.push({
          rule: "FIN_TRIMESTRE_SIN_AVANCE",
          ruleLabel: RULE_LABELS.FIN_TRIMESTRE_SIN_AVANCE,
          severity: "alta",
          initiativeId: init.id,
          initiativeTitle: init.title,
          directionName,
          detail: `Quedan ${diasRestantes} días para el fin de ${TRIMESTRE_LABELS[init.trimestre as Trimestre]} y no hay seguimiento reciente (estado: ${ESTADO_LABELS[init.estado as Estado]}).`,
        });
      }
    }

    // Regla 4: Pausada/Aplazada que supera tiempo límite
    if (init.estado === "PAUSADO" || init.estado === "APLAZADO") {
      const reference = last ?? init.updatedAt;
      const dias = daysBetween(now, reference);
      if (dias >= ALERT_THRESHOLDS.diasLimitePausado) {
        alerts.push({
          rule: "PAUSADA_TIEMPO_LIMITE",
          ruleLabel: RULE_LABELS.PAUSADA_TIEMPO_LIMITE,
          severity: "media",
          initiativeId: init.id,
          initiativeTitle: init.title,
          directionName,
          detail: `${ESTADO_LABELS[init.estado as Estado]} desde hace ${dias} días sin resolución.`,
        });
      }
    }

    // Regla 5: Posible desviación de esfuerzo (alto esfuerzo declarado, sin evidencia de avance)
    if (
      init.estado === "PRENDIDO" &&
      init.esfuerzo !== null &&
      init.esfuerzo >= ALERT_THRESHOLDS.esfuerzoAlto &&
      init.seguimientos.length === 0 &&
      daysBetween(now, init.createdAt) >= ALERT_THRESHOLDS.diasSinSeguimientoDesdeCreacion
    ) {
      alerts.push({
        rule: "DESVIACION_ESFUERZO",
        ruleLabel: RULE_LABELS.DESVIACION_ESFUERZO,
        severity: "media",
        initiativeId: init.id,
        initiativeTitle: init.title,
        directionName,
        detail: `Esfuerzo declarado ${init.esfuerzo}/5 sin ningún seguimiento registrado desde su creación.`,
      });
    }
  }

  return alerts.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "alta" ? -1 : 1));
}
