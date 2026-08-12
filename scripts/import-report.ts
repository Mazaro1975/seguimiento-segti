import fs from "node:fs";
import path from "node:path";
import { parseWorkbookFile } from "../src/lib/importer/parseWorkbook";

const EXCEL_PATH = path.resolve(
  __dirname,
  "..",
  "Planeacion_Estrategica_2026_SEGTI_v2JMG.xlsx"
);

function main() {
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error(`No se encontró el archivo Excel en: ${EXCEL_PATH}`);
    process.exit(1);
  }

  const fallbackDate = fs.statSync(EXCEL_PATH).mtime;
  const { initiatives, warnings } = parseWorkbookFile(EXCEL_PATH, fallbackDate);

  console.log(`\n=== Reporte de importación (dry run) ===`);
  console.log(`Total iniciativas parseadas: ${initiatives.length}`);

  const byDirection = new Map<string, number>();
  for (const init of initiatives) {
    byDirection.set(init.directionSlug, (byDirection.get(init.directionSlug) ?? 0) + 1);
  }
  console.log(`\nPor dirección:`);
  for (const [slug, count] of byDirection) {
    console.log(`  ${slug}: ${count}`);
  }

  console.log(`\nTotal advertencias: ${warnings.length}`);
  const byField = new Map<string, number>();
  for (const w of warnings) {
    byField.set(w.field, (byField.get(w.field) ?? 0) + 1);
  }
  console.log(`Advertencias por campo:`);
  for (const [field, count] of byField) {
    console.log(`  ${field}: ${count}`);
  }

  console.log(`\nPrimeras 15 advertencias:`);
  for (const w of warnings.slice(0, 15)) {
    console.log(`  [${w.sheet}] fila ${w.row} — ${w.field}: ${w.message} ("${w.rawValue}")`);
  }
}

main();
