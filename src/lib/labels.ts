import type {
  Clasificacion,
  Estado,
  TipoBpOpr,
  TipoSolicitud,
  Trimestre,
} from "./types";

export const ESTADO_LABELS: Record<Estado, string> = {
  PRENDIDO: "Prendido / En ejecución",
  SIN_INICIAR: "Sin Iniciar",
  PAUSADO: "Pausado",
  APLAZADO: "Aplazado",
  CERRADO: "Cerrado",
  CANCELADO: "Cancelado",
  SIN_ESTADO: "Sin Estado",
};

// Paleta de estado (good/warning/serious/critical/neutral) validada para
// contraste y distinción bajo daltonismo — ver skill dataviz.
export const ESTADO_COLORS: Record<Estado, string> = {
  PRENDIDO: "#0ca30c", // good
  SIN_INICIAR: "#fab219", // warning
  PAUSADO: "#ec835a", // serious
  APLAZADO: "#ec835a", // serious
  CANCELADO: "#d03b3b", // critical
  CERRADO: "#898781", // neutral (completado, no requiere atención)
  SIN_ESTADO: "#c3c2b7", // neutral tenue
};

export const CLASIFICACION_LABELS: Record<Clasificacion, string> = {
  PROYECTO: "Proyecto",
  PLAN_MEJORA: "Plan Mejora",
  INICIATIVA: "Iniciativa",
  ACTIVIDAD: "Actividad",
  SIN_CLASIFICAR: "Sin Clasificar",
};

export const TIPO_SOLICITUD_LABELS: Record<TipoSolicitud, string> = {
  SOFTWARE: "Software",
  DATOS: "Datos",
  PROCESOS: "Procesos",
  INFRAESTRUCTURA: "Infraestructura",
  INTEGRACION: "Integración",
  GOBIERNO_DATOS: "Gobierno de datos",
  AGENTE: "Agente",
  SOPORTE: "Soporte",
  ND: "N/D",
};

export const TRIMESTRE_LABELS: Record<Trimestre, string> = {
  Q1: "Q1",
  Q2: "Q2",
  Q3: "Q3",
  Q4: "Q4",
  CONTINUO: "Continuo",
  SIN_Q: "Sin Q",
};

export const TIPO_BP_OPR_LABELS: Record<TipoBpOpr, string> = {
  BP: "BP",
  OPR: "OPR",
};

export function enumOptions<T extends string>(
  labels: Record<T, string>
): { value: T; label: string }[] {
  return (Object.keys(labels) as T[]).map((value) => ({
    value,
    label: labels[value],
  }));
}
