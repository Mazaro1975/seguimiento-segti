import type {
  Clasificacion,
  Estado,
  TipoBpOpr,
  TipoSolicitud,
  Trimestre,
} from "../types";

export interface ParsedSeguimiento {
  fecha: Date;
  texto: string;
  fechaAproximada: boolean;
}

export interface ParsedInitiative {
  sheetName: string;
  directionSlug: string;
  rowNumber: number;
  legacyNumber: number | null;
  title: string;
  tipoBpOpr: TipoBpOpr | null;
  clasificacion: Clasificacion;
  estado: Estado;
  esfuerzo: number | null;
  prioridad: number | null;
  trimestre: Trimestre;
  liderTI: string | null;
  liderNegocio: string | null;
  tipoSolicitud: TipoSolicitud | null;
  director: string | null;
  seguimientos: ParsedSeguimiento[];
}

export interface ImportWarning {
  sheet: string;
  row: number;
  field: string;
  rawValue: string;
  message: string;
}

export interface ImportResult {
  initiatives: ParsedInitiative[];
  warnings: ImportWarning[];
}

export interface DirectionDef {
  sheetName: string;
  directionName: string;
  slug: string;
  order: number;
}
