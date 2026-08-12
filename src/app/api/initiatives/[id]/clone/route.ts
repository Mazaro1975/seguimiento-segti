import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const original = await db.initiative.findUnique({ where: { id: params.id } });
  if (!original) {
    return NextResponse.json({ errors: ["Iniciativa no encontrada."] }, { status: 404 });
  }

  const clone = await db.initiative.create({
    data: {
      legacyNumber: null,
      title: `${original.title} (copia)`,
      tipoBpOpr: original.tipoBpOpr,
      clasificacion: original.clasificacion,
      estado: "SIN_INICIAR",
      esfuerzo: original.esfuerzo,
      prioridad: original.prioridad,
      trimestre: original.trimestre,
      liderTI: original.liderTI,
      liderNegocio: original.liderNegocio,
      tipoSolicitud: original.tipoSolicitud,
      director: original.director,
      businessPartner: original.businessPartner,
      directionId: original.directionId,
    },
    include: { direction: true, seguimientos: true },
  });

  return NextResponse.json(clone, { status: 201 });
}
