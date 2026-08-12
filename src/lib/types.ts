import type { Prisma } from "@prisma/client";

export type InitiativeWithRelations = Prisma.InitiativeGetPayload<{
  include: { direction: true; seguimientos: true };
}>;

// SQLite (vía Prisma) no soporta enums nativos, así que los catálogos
// controlados se guardan como String en la base de datos y se tipan
// aquí como uniones literales para el resto de la aplicación.

export const ESTADOS = [
  "PRENDIDO",
  "SIN_INICIAR",
  "PAUSADO",
  "APLAZADO",
  "CERRADO",
  "CANCELADO",
  "SIN_ESTADO",
] as const;
export type Estado = (typeof ESTADOS)[number];

export const CLASIFICACIONES = [
  "PROYECTO",
  "PLAN_MEJORA",
  "INICIATIVA",
  "ACTIVIDAD",
  "SIN_CLASIFICAR",
] as const;
export type Clasificacion = (typeof CLASIFICACIONES)[number];

export const TIPOS_SOLICITUD = [
  "SOFTWARE",
  "DATOS",
  "PROCESOS",
  "INFRAESTRUCTURA",
  "INTEGRACION",
  "GOBIERNO_DATOS",
  "AGENTE",
  "SOPORTE",
  "ND",
] as const;
export type TipoSolicitud = (typeof TIPOS_SOLICITUD)[number];

export const TRIMESTRES = ["Q1", "Q2", "Q3", "Q4", "CONTINUO", "SIN_Q"] as const;
export type Trimestre = (typeof TRIMESTRES)[number];

export const TIPOS_BP_OPR = ["BP", "OPR"] as const;
export type TipoBpOpr = (typeof TIPOS_BP_OPR)[number];

export function isEstado(value: string): value is Estado {
  return (ESTADOS as readonly string[]).includes(value);
}

export function isClasificacion(value: string): value is Clasificacion {
  return (CLASIFICACIONES as readonly string[]).includes(value);
}

export function isTipoSolicitud(value: string): value is TipoSolicitud {
  return (TIPOS_SOLICITUD as readonly string[]).includes(value);
}

export function isTrimestre(value: string): value is Trimestre {
  return (TRIMESTRES as readonly string[]).includes(value);
}

export function isTipoBpOpr(value: string): value is TipoBpOpr {
  return (TIPOS_BP_OPR as readonly string[]).includes(value);
}
