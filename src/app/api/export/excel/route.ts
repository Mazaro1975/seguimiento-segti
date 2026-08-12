import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getFilteredInitiatives } from "@/lib/queryInitiatives";
import {
  CLASIFICACION_LABELS,
  ESTADO_LABELS,
  TIPO_SOLICITUD_LABELS,
  TRIMESTRE_LABELS,
} from "@/lib/labels";
import type { Clasificacion, Estado, TipoSolicitud, Trimestre } from "@/lib/types";

export async function GET(req: NextRequest) {
  const initiatives = await getFilteredInitiatives(req.nextUrl.searchParams);

  const rows = initiatives.map((init) => ({
    "N°": init.legacyNumber ?? "",
    Trimestre: TRIMESTRE_LABELS[init.trimestre as Trimestre] ?? init.trimestre,
    Dirección: init.direction.name,
    Iniciativa: init.title,
    Tipo: init.tipoBpOpr ?? "",
    Clasificación: CLASIFICACION_LABELS[init.clasificacion as Clasificacion] ?? init.clasificacion,
    Estado: ESTADO_LABELS[init.estado as Estado] ?? init.estado,
    Esfuerzo: init.esfuerzo ?? "SD",
    Prioridad: init.prioridad ?? "N/D",
    "Líder TI": init.liderTI ?? "",
    "Líder Negocio": init.liderNegocio ?? "",
    "Tipo Solicitud": init.tipoSolicitud
      ? TIPO_SOLICITUD_LABELS[init.tipoSolicitud as TipoSolicitud]
      : "",
    Director: init.director ?? "",
    "Business Partner": init.businessPartner ?? "",
    "Últ. Seguimiento": init.seguimientos[0]?.texto ?? "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Cronograma");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="cronograma-seguimiento.xlsx"`,
    },
  });
}
