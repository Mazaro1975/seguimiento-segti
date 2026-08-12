import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { DIRECTION_SHEETS, parseWorkbookFile } from "../src/lib/importer/parseWorkbook";

const db = new PrismaClient();

const EXCEL_PATH = path.resolve(
  __dirname,
  "..",
  "Planeacion_Estrategica_2026_SEGTI_v2JMG.xlsx"
);

async function main() {
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error(`No se encontró el archivo Excel en: ${EXCEL_PATH}`);
    process.exit(1);
  }

  const existingCount = await db.initiative.count();
  const force = process.argv.includes("--force");
  if (existingCount > 0 && !force) {
    console.error(
      `La base de datos ya tiene ${existingCount} iniciativas (posiblemente con seguimientos y ediciones reales).\n` +
        `'db:seed' BORRA todos los datos y vuelve a importar desde el Excel — no es un paso de actualización normal.\n` +
        `Si estás seguro de querer reemplazar todo, vuelve a ejecutar: npm run db:seed -- --force`
    );
    process.exit(1);
  }

  const fallbackDate = fs.statSync(EXCEL_PATH).mtime;
  const { initiatives, warnings } = parseWorkbookFile(EXCEL_PATH, fallbackDate);

  console.log(`Iniciativas parseadas: ${initiatives.length}`);
  console.log(`Advertencias de importación: ${warnings.length}`);

  // Reinicia los datos para permitir reimportar de forma idempotente.
  await db.seguimiento.deleteMany();
  await db.initiative.deleteMany();
  await db.direction.deleteMany();

  const directionIdBySlug = new Map<string, string>();
  for (const def of DIRECTION_SHEETS) {
    const direction = await db.direction.create({
      data: { name: def.directionName, slug: def.slug, order: def.order },
    });
    directionIdBySlug.set(def.slug, direction.id);
  }

  let created = 0;
  for (const init of initiatives) {
    const directionId = directionIdBySlug.get(init.directionSlug);
    if (!directionId) continue;

    await db.initiative.create({
      data: {
        legacyNumber: init.legacyNumber,
        title: init.title,
        tipoBpOpr: init.tipoBpOpr,
        clasificacion: init.clasificacion,
        estado: init.estado,
        esfuerzo: init.esfuerzo,
        prioridad: init.prioridad,
        trimestre: init.trimestre,
        liderTI: init.liderTI,
        liderNegocio: init.liderNegocio,
        tipoSolicitud: init.tipoSolicitud,
        director: init.director,
        directionId,
        seguimientos: {
          create: init.seguimientos.map((s) => ({
            fecha: s.fecha,
            texto: s.texto,
          })),
        },
      },
    });
    created++;
  }

  console.log(`Iniciativas creadas en la base de datos: ${created}`);

  const warningsPath = path.resolve(__dirname, "..", "docs", "import-warnings.txt");
  fs.mkdirSync(path.dirname(warningsPath), { recursive: true });
  const warningsText = warnings
    .map(
      (w) =>
        `[${w.sheet}] fila ${w.row} — ${w.field}: ${w.message} (valor original: "${w.rawValue}")`
    )
    .join("\n");
  fs.writeFileSync(warningsPath, warningsText || "Sin advertencias.", "utf-8");
  console.log(`Reporte de advertencias escrito en: ${warningsPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
