import * as XLSX from "xlsx";
import {
  cleanText,
  extractDateFromText,
  normalizeClasificacion,
  normalizeEstado,
  normalizeHeaderText,
  normalizeTipoBpOpr,
  normalizeTipoSolicitud,
  normalizeTrimestre,
  parseNumeric,
  parseSeguimientoEntry,
} from "./normalize";
import type {
  DirectionDef,
  ImportResult,
  ImportWarning,
  ParsedInitiative,
} from "./types";

export const DIRECTION_SHEETS: DirectionDef[] = [
  { sheetName: "🏥 Dir. Médica", directionName: "Dirección Médica", slug: "dir-medica", order: 1 },
  { sheetName: "💉 Dir. Enfermería", directionName: "Dirección de Enfermería", slug: "dir-enfermeria", order: 2 },
  { sheetName: "💻 Dir. Tecnología", directionName: "Dirección de Tecnología", slug: "dir-tecnologia", order: 3 },
  { sheetName: "⚙️ Dir. Operaciones", directionName: "Dirección de Operaciones", slug: "dir-operaciones", order: 4 },
  { sheetName: "🏢 Dir. Ejecutiva", directionName: "Dirección Ejecutiva", slug: "dir-ejecutiva", order: 5 },
  { sheetName: "📈 Dir. Comercial", directionName: "Dirección Comercial", slug: "dir-comercial", order: 6 },
  { sheetName: "💰 Dir. Financiera", directionName: "Dirección Financiera", slug: "dir-financiera", order: 7 },
  { sheetName: "👥 Talento & Des.", directionName: "Talento y Desarrollo", slug: "talento-desarrollo", order: 8 },
  { sheetName: "⚖️ Dir. Jurídica", directionName: "Dirección Jurídica", slug: "dir-juridica", order: 9 },
  { sheetName: "🔬 SubDir. Investig.", directionName: "Subdirección de Investigación", slug: "subdir-investigacion", order: 10 },
  { sheetName: "🌿 Dir. Resp. Social", directionName: "Dirección de Responsabilidad Social", slug: "dir-resp-social", order: 11 },
  { sheetName: "🏥 SubDir. Médica", directionName: "Subdirección Médica", slug: "subdir-medica", order: 12 },
];

type Row = (string | number)[];

interface ColumnMap {
  legacyNumber?: number;
  trimestre?: number;
  clasificacion?: number;
  title?: number;
  estado?: number;
  esfuerzo?: number;
  prioridad?: number;
  tipoSolicitud?: number;
  liderTI?: number;
  liderNegocio?: number;
  director?: number;
  tipoBpOpr?: number;
  llaveSync?: number;
}

function cell(row: Row, idx: number | undefined): string {
  if (idx === undefined) return "";
  const v = row[idx];
  return v === undefined || v === null ? "" : String(v);
}

function findHeaderRowIndex(rows: Row[]): number | null {
  const limit = Math.min(rows.length, 15);
  for (let i = 0; i < limit; i++) {
    const first = normalizeHeaderText(cell(rows[i], 0));
    if (first === "n") return i;
  }
  return null;
}

function buildColumnMap(
  headerRow: Row,
  warnings: ImportWarning[],
  sheetName: string
): { map: ColumnMap; seguimientoCols: { index: number; rawHeader: string }[] } {
  const map: ColumnMap = {};
  const seguimientoCandidates: { index: number; rawHeader: string }[] = [];

  headerRow.forEach((rawHeader, idx) => {
    const h = normalizeHeaderText(String(rawHeader ?? ""));
    if (h === "n") map.legacyNumber = idx;
    else if (h === "trimestre") map.trimestre = idx;
    else if (h.startsWith("clasificacion")) map.clasificacion = idx;
    else if (h === "iniciativa") map.title = idx;
    else if (h === "estado") map.estado = idx;
    else if (h === "esfuerzo") map.esfuerzo = idx;
    else if (h === "prioridad") map.prioridad = idx;
    else if (h.includes("tipo") && h.includes("solicitud")) map.tipoSolicitud = idx;
    else if (h.includes("lider") && h.includes("ti")) map.liderTI = idx;
    else if (h.includes("lider") && h.includes("negocio")) map.liderNegocio = idx;
    else if (h === "director") map.director = idx;
    else if (h.includes("tipo") && (h.includes("bp") || h.includes("opr"))) map.tipoBpOpr = idx;
    else if (h.includes("llave")) map.llaveSync = idx;
    else seguimientoCandidates.push({ index: idx, rawHeader: String(rawHeader ?? "") });
  });

  if (map.title === undefined) {
    warnings.push({
      sheet: sheetName,
      row: 0,
      field: "encabezados",
      rawValue: JSON.stringify(headerRow),
      message: "No se encontró la columna 'Iniciativa' en el encabezado; la hoja podría tener un formato distinto al esperado.",
    });
  }

  return { map, seguimientoCols: seguimientoCandidates };
}

export function parseDirectionSheet(
  workbook: XLSX.WorkBook,
  def: DirectionDef,
  fallbackDate: Date
): { initiatives: ParsedInitiative[]; warnings: ImportWarning[] } {
  const warnings: ImportWarning[] = [];
  const ws = workbook.Sheets[def.sheetName];
  if (!ws) {
    warnings.push({
      sheet: def.sheetName,
      row: 0,
      field: "hoja",
      rawValue: "",
      message: `No se encontró la hoja '${def.sheetName}' en el libro. Se omite esta dirección.`,
    });
    return { initiatives: [], warnings };
  }

  const rows = XLSX.utils.sheet_to_json<Row>(ws, {
    header: 1,
    raw: false,
    defval: "",
  });

  const headerIdx = findHeaderRowIndex(rows);
  const resolvedHeaderIdx = headerIdx ?? 7;
  if (headerIdx === null) {
    warnings.push({
      sheet: def.sheetName,
      row: 0,
      field: "encabezados",
      rawValue: "",
      message: "No se pudo localizar automáticamente la fila de encabezados (se esperaba 'N°' en columna A); se asumió la fila 8.",
    });
  }

  const headerRow = rows[resolvedHeaderIdx] ?? [];
  const { map, seguimientoCols: rawCandidates } = buildColumnMap(
    headerRow,
    warnings,
    def.sheetName
  );

  const dataRows = rows.slice(resolvedHeaderIdx + 1);

  // Confirmar cuáles columnas candidatas a "seguimiento" realmente tienen datos.
  const seguimientoCols = rawCandidates.filter((c) =>
    dataRows.some((r) => cell(r, c.index).trim() !== "")
  );
  for (const c of seguimientoCols) {
    if (normalizeHeaderText(c.rawHeader) === "") {
      warnings.push({
        sheet: def.sheetName,
        row: 0,
        field: "encabezados",
        rawValue: "",
        message: `Columna sin encabezado (índice ${c.index}) contiene datos; se trató como columna de seguimiento.`,
      });
    }
  }

  const initiatives: ParsedInitiative[] = [];

  dataRows.forEach((row, i) => {
    const excelRow = resolvedHeaderIdx + 2 + i;
    const titleRaw = cleanText(cell(row, map.title));
    const legacyRaw = cell(row, map.legacyNumber);
    const legacyNumber = parseNumeric(legacyRaw);

    if (!titleRaw) return; // fila vacía o separador de sección
    if (legacyNumber === null) {
      // Sin N° numérico: normalmente son mini-tablas de resumen al final de
      // la hoja (ej. "RESUMEN POR CLASIFICACIÓN"), no iniciativas reales.
      warnings.push({
        sheet: def.sheetName,
        row: excelRow,
        field: "N°",
        rawValue: legacyRaw,
        message: `Fila omitida: tiene texto en la columna 'Iniciativa' ('${titleRaw}') pero no un N° numérico válido; probablemente es una tabla de resumen, no una iniciativa. Revisar manualmente si no es el caso.`,
      });
      return;
    }

    const estadoRaw = cell(row, map.estado);
    const { value: estado, warning: estadoWarn } = normalizeEstado(estadoRaw);
    if (estadoWarn) {
      warnings.push({
        sheet: def.sheetName,
        row: excelRow,
        field: "Estado",
        rawValue: estadoRaw,
        message: `Valor de Estado no reconocido ('${estadoRaw}'), se dejó como 'Sin Estado'. Revisar y corregir manualmente.`,
      });
    }

    const clasifRaw = cell(row, map.clasificacion);
    const { value: clasificacion, warning: clasifWarn } = normalizeClasificacion(clasifRaw);
    if (clasifWarn) {
      warnings.push({
        sheet: def.sheetName,
        row: excelRow,
        field: "Clasificación",
        rawValue: clasifRaw,
        message: `Valor de Clasificación no reconocido ('${clasifRaw}'), se dejó como 'Sin Clasificar'.`,
      });
    }

    const tipoSolRaw = cell(row, map.tipoSolicitud);
    const { value: tipoSolicitud, warning: tipoSolWarn } = normalizeTipoSolicitud(tipoSolRaw);
    if (tipoSolWarn) {
      warnings.push({
        sheet: def.sheetName,
        row: excelRow,
        field: "Tipo Solicitud",
        rawValue: tipoSolRaw,
        message: `Valor de Tipo Solicitud no reconocido ('${tipoSolRaw}'), se dejó en blanco.`,
      });
    }

    const trimRaw = cell(row, map.trimestre);
    const { value: trimestre, warning: trimWarn } = normalizeTrimestre(trimRaw);
    if (trimWarn) {
      warnings.push({
        sheet: def.sheetName,
        row: excelRow,
        field: "Trimestre",
        rawValue: trimRaw,
        message: `Valor de Trimestre no reconocido ('${trimRaw}'), se dejó como 'Sin Q'.`,
      });
    }

    const tipoBpOprRaw = cell(row, map.tipoBpOpr);
    const { value: tipoBpOpr, warning: bpWarn } = normalizeTipoBpOpr(tipoBpOprRaw);
    if (bpWarn) {
      warnings.push({
        sheet: def.sheetName,
        row: excelRow,
        field: "Tipo (BP/OPR)",
        rawValue: tipoBpOprRaw,
        message: `Valor de Tipo (BP/OPR) no reconocido ('${tipoBpOprRaw}').`,
      });
    }

    const directorRaw = cell(row, map.director);
    if (/^\d{1,2}\/\d{1,2}\/\d{4}\s*:/.test(directorRaw.trim())) {
      warnings.push({
        sheet: def.sheetName,
        row: excelRow,
        field: "Director",
        rawValue: directorRaw,
        message: "El contenido de la columna Director parece texto de seguimiento mal ubicado; se importó tal cual, revisar manualmente.",
      });
    }

    const seguimientos: ParsedInitiative["seguimientos"] = [];
    for (const col of seguimientoCols) {
      const raw = cell(row, col.index);
      if (!raw.trim()) continue;
      const headerDate = extractDateFromText(col.rawHeader);
      for (const entryRaw of raw.split("|")) {
        const parsed = parseSeguimientoEntry(entryRaw, headerDate, fallbackDate);
        if (!parsed) continue;
        seguimientos.push(parsed);
        if (parsed.fechaAproximada) {
          warnings.push({
            sheet: def.sheetName,
            row: excelRow,
            field: "Seguimiento",
            rawValue: entryRaw.slice(0, 80),
            message: "No se pudo determinar la fecha exacta del seguimiento; se usó una fecha aproximada.",
          });
        }
      }
    }

    initiatives.push({
      sheetName: def.sheetName,
      directionSlug: def.slug,
      rowNumber: excelRow,
      legacyNumber,
      title: titleRaw,
      tipoBpOpr,
      clasificacion,
      estado,
      esfuerzo: parseNumeric(cell(row, map.esfuerzo)),
      prioridad: parseNumeric(cell(row, map.prioridad)),
      trimestre,
      liderTI: cleanText(cell(row, map.liderTI)),
      liderNegocio: cleanText(cell(row, map.liderNegocio)),
      tipoSolicitud,
      director: cleanText(directorRaw),
      seguimientos,
    });
  });

  return { initiatives, warnings };
}

export function parseWorkbookFile(filePath: string, fallbackDate: Date): ImportResult {
  const workbook = XLSX.readFile(filePath);
  const initiatives: ParsedInitiative[] = [];
  const warnings: ImportWarning[] = [];

  for (const def of DIRECTION_SHEETS) {
    const result = parseDirectionSheet(workbook, def, fallbackDate);
    initiatives.push(...result.initiatives);
    warnings.push(...result.warnings);
  }

  return { initiatives, warnings };
}
