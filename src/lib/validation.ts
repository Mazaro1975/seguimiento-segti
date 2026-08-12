import {
  isClasificacion,
  isEstado,
  isTipoBpOpr,
  isTipoSolicitud,
  isTrimestre,
} from "./types";

export interface InitiativeInput {
  title: string;
  directionId: string;
  tipoBpOpr: string | null;
  clasificacion: string;
  estado: string;
  esfuerzo: number | null;
  prioridad: number | null;
  trimestre: string;
  liderTI: string | null;
  liderNegocio: string | null;
  tipoSolicitud: string | null;
  director: string | null;
  businessPartner: string | null;
}

function optionalString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed === "" ? null : trimmed;
}

function optionalInt(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : null;
}

export function validateInitiativeInput(
  body: unknown
): { data: InitiativeInput } | { errors: string[] } {
  const errors: string[] = [];
  const b = (body ?? {}) as Record<string, unknown>;

  const title = typeof b.title === "string" ? b.title.trim() : "";
  if (!title) errors.push("El campo 'title' es obligatorio.");

  const directionId = typeof b.directionId === "string" ? b.directionId : "";
  if (!directionId) errors.push("El campo 'directionId' es obligatorio.");

  const tipoBpOpr = optionalString(b.tipoBpOpr);
  if (tipoBpOpr && !isTipoBpOpr(tipoBpOpr)) errors.push("'tipoBpOpr' inválido.");

  const clasificacion =
    optionalString(b.clasificacion) ?? "SIN_CLASIFICAR";
  if (!isClasificacion(clasificacion)) errors.push("'clasificacion' inválida.");

  const estado = optionalString(b.estado) ?? "SIN_ESTADO";
  if (!isEstado(estado)) errors.push("'estado' inválido.");

  const trimestre = optionalString(b.trimestre) ?? "SIN_Q";
  if (!isTrimestre(trimestre)) errors.push("'trimestre' inválido.");

  const tipoSolicitud = optionalString(b.tipoSolicitud);
  if (tipoSolicitud && !isTipoSolicitud(tipoSolicitud))
    errors.push("'tipoSolicitud' inválido.");

  if (errors.length > 0) return { errors };

  return {
    data: {
      title,
      directionId,
      tipoBpOpr,
      clasificacion,
      estado,
      esfuerzo: optionalInt(b.esfuerzo),
      prioridad: optionalInt(b.prioridad),
      trimestre,
      liderTI: optionalString(b.liderTI),
      liderNegocio: optionalString(b.liderNegocio),
      tipoSolicitud,
      director: optionalString(b.director),
      businessPartner: optionalString(b.businessPartner),
    },
  };
}
