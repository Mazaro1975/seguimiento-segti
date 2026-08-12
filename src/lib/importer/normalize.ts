import type {
  Clasificacion,
  Estado,
  TipoBpOpr,
  TipoSolicitud,
  Trimestre,
} from "../types";

const COMBINING_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

export function stripAccents(str: string): string {
  return str.normalize("NFD").replace(COMBINING_DIACRITICS, "");
}

export function normalizeHeaderText(str: string): string {
  return stripAccents(String(str ?? ""))
    .toLowerCase()
    .replace(/[°º]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

function norm(str: string): string {
  return stripAccents(String(str ?? "")).toLowerCase().trim();
}

const ESTADO_MAP: Record<string, Estado> = {
  prendido: "PRENDIDO",
  "prendido / en ejecucion": "PRENDIDO",
  "en ejecucion": "PRENDIDO",
  "sin iniciar": "SIN_INICIAR",
  pausado: "PAUSADO",
  aplazado: "APLAZADO",
  cerrado: "CERRADO",
  cancelado: "CANCELADO",
  "sin estado": "SIN_ESTADO",
};

export function normalizeEstado(
  raw: string
): { value: Estado; warning: boolean } {
  const key = norm(raw);
  if (key === "") return { value: "SIN_ESTADO", warning: false };
  const mapped = ESTADO_MAP[key];
  if (mapped) return { value: mapped, warning: false };
  return { value: "SIN_ESTADO", warning: true };
}

const CLASIFICACION_MAP: Record<string, Clasificacion> = {
  proyecto: "PROYECTO",
  "plan mejora": "PLAN_MEJORA",
  "plan de mejora": "PLAN_MEJORA",
  iniciativa: "INICIATIVA",
  actividad: "ACTIVIDAD",
  "sin clasificar": "SIN_CLASIFICAR",
};

export function normalizeClasificacion(
  raw: string
): { value: Clasificacion; warning: boolean } {
  const key = norm(raw);
  if (key === "") return { value: "SIN_CLASIFICAR", warning: false };
  const mapped = CLASIFICACION_MAP[key];
  if (mapped) return { value: mapped, warning: false };
  return { value: "SIN_CLASIFICAR", warning: true };
}

const TIPO_SOLICITUD_MAP: Record<string, TipoSolicitud> = {
  software: "SOFTWARE",
  datos: "DATOS",
  procesos: "PROCESOS",
  infraestructura: "INFRAESTRUCTURA",
  integracion: "INTEGRACION",
  "gobierno de datos": "GOBIERNO_DATOS",
  agente: "AGENTE",
  soporte: "SOPORTE",
  "n/d": "ND",
  nd: "ND",
};

export function normalizeTipoSolicitud(
  raw: string
): { value: TipoSolicitud | null; warning: boolean } {
  const key = norm(raw);
  if (key === "") return { value: null, warning: false };
  const mapped = TIPO_SOLICITUD_MAP[key];
  if (mapped) return { value: mapped, warning: false };
  return { value: null, warning: true };
}

const TRIMESTRE_MAP: Record<string, Trimestre> = {
  q1: "Q1",
  q2: "Q2",
  q3: "Q3",
  q4: "Q4",
  continuo: "CONTINUO",
  "sin q": "SIN_Q",
  sinq: "SIN_Q",
};

export function normalizeTrimestre(
  raw: string
): { value: Trimestre; warning: boolean } {
  const key = norm(raw);
  if (key === "") return { value: "SIN_Q", warning: false };
  const mapped = TRIMESTRE_MAP[key];
  if (mapped) return { value: mapped, warning: false };
  return { value: "SIN_Q", warning: true };
}

export function normalizeTipoBpOpr(
  raw: string
): { value: TipoBpOpr | null; warning: boolean } {
  const key = norm(raw);
  if (key === "") return { value: null, warning: false };
  if (key === "bp") return { value: "BP", warning: false };
  if (key === "opr") return { value: "OPR", warning: false };
  return { value: null, warning: true };
}

export function parseNumeric(raw: string): number | null {
  const trimmed = String(raw ?? "").trim();
  if (trimmed === "") return null;
  const n = Number(trimmed.replace(",", "."));
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

export function cleanText(raw: string): string | null {
  const trimmed = String(raw ?? "").trim();
  return trimmed === "" ? null : trimmed;
}

/** Construye una fecha a partir de día/mes/año, o null si no es válida. */
function buildDate(day: number, month: number, year: number): Date | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = new Date(year, month - 1, day);
  if (d.getMonth() !== month - 1) return null; // ej. 31/02 se desborda a marzo
  return d;
}

/** Intenta parsear una fecha en formato DD/MM/YYYY, DDMMYYYY o DDMMYY. */
export function parseFlexibleDate(raw: string): Date | null {
  const s = String(raw ?? "").trim();

  let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return buildDate(Number(m[1]), Number(m[2]), Number(m[3]));

  m = s.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (m) return buildDate(Number(m[1]), Number(m[2]), Number(m[3]));

  m = s.match(/^(\d{2})(\d{2})(\d{2})$/);
  if (m) return buildDate(Number(m[1]), Number(m[2]), 2000 + Number(m[3]));

  return null;
}

/** Busca un token de fecha (DD/MM/YYYY o 6-8 dígitos) en cualquier parte del texto. */
export function extractDateFromText(text: string): Date | null {
  const s = String(text ?? "");
  let m = s.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
  if (m) return parseFlexibleDate(m[0]);
  m = s.match(/\d{8}/);
  if (m) return parseFlexibleDate(m[0]);
  m = s.match(/\d{6}/);
  if (m) return parseFlexibleDate(m[0]);
  return null;
}

export interface SeguimientoParseResult {
  fecha: Date;
  texto: string;
  fechaAproximada: boolean;
}

/**
 * Parsea una entrada individual de seguimiento (ya separada por "|").
 * Prioridad de fecha: fecha al inicio del texto > fecha del encabezado de columna > fecha de respaldo.
 */
export function parseSeguimientoEntry(
  entry: string,
  headerDate: Date | null,
  fallbackDate: Date
): SeguimientoParseResult | null {
  const trimmed = entry.trim();
  if (trimmed === "") return null;

  const leadingMatch = trimmed.match(
    /^(\d{1,2}\/\d{1,2}\/\d{4}|\d{6,8})\s*:?\s*/
  );
  if (leadingMatch) {
    const date = parseFlexibleDate(leadingMatch[1]);
    if (date) {
      const texto = trimmed.slice(leadingMatch[0].length).trim();
      return { fecha: date, texto: texto || trimmed, fechaAproximada: false };
    }
  }

  if (headerDate) {
    return { fecha: headerDate, texto: trimmed, fechaAproximada: false };
  }

  return { fecha: fallbackDate, texto: trimmed, fechaAproximada: true };
}
