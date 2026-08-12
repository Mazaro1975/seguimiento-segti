import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  isClasificacion,
  isEstado,
  isTipoBpOpr,
  isTipoSolicitud,
  isTrimestre,
} from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const initiative = await db.initiative.findUnique({
    where: { id: params.id },
    include: { direction: true, seguimientos: { orderBy: { fecha: "desc" } } },
  });
  if (!initiative) {
    return NextResponse.json({ errors: ["Iniciativa no encontrada."] }, { status: 404 });
  }
  return NextResponse.json(initiative);
}

const EDITABLE_STRING_FIELDS = [
  "title",
  "liderTI",
  "liderNegocio",
  "director",
  "businessPartner",
  "directionId",
] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ errors: ["Cuerpo de la solicitud inválido."] }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  for (const field of EDITABLE_STRING_FIELDS) {
    if (field in body) {
      const v = body[field];
      data[field] = typeof v === "string" && v.trim() !== "" ? v.trim() : field === "directionId" ? undefined : null;
    }
  }

  if ("estado" in body) {
    if (typeof body.estado === "string" && isEstado(body.estado)) data.estado = body.estado;
    else return NextResponse.json({ errors: ["'estado' inválido."] }, { status: 400 });
  }
  if ("clasificacion" in body) {
    if (typeof body.clasificacion === "string" && isClasificacion(body.clasificacion))
      data.clasificacion = body.clasificacion;
    else return NextResponse.json({ errors: ["'clasificacion' inválida."] }, { status: 400 });
  }
  if ("trimestre" in body) {
    if (typeof body.trimestre === "string" && isTrimestre(body.trimestre))
      data.trimestre = body.trimestre;
    else return NextResponse.json({ errors: ["'trimestre' inválido."] }, { status: 400 });
  }
  if ("tipoSolicitud" in body) {
    const v = body.tipoSolicitud;
    if (v === null || v === "") data.tipoSolicitud = null;
    else if (typeof v === "string" && isTipoSolicitud(v)) data.tipoSolicitud = v;
    else return NextResponse.json({ errors: ["'tipoSolicitud' inválido."] }, { status: 400 });
  }
  if ("tipoBpOpr" in body) {
    const v = body.tipoBpOpr;
    if (v === null || v === "") data.tipoBpOpr = null;
    else if (typeof v === "string" && isTipoBpOpr(v)) data.tipoBpOpr = v;
    else return NextResponse.json({ errors: ["'tipoBpOpr' inválido."] }, { status: 400 });
  }
  if ("esfuerzo" in body) {
    const v = body.esfuerzo;
    data.esfuerzo = v === null || v === "" ? null : Math.round(Number(v));
  }
  if ("prioridad" in body) {
    const v = body.prioridad;
    data.prioridad = v === null || v === "" ? null : Math.round(Number(v));
  }
  if ("legacyNumber" in body) {
    const v = body.legacyNumber;
    data.legacyNumber = v === null || v === "" ? null : Math.round(Number(v));
  }
  if ("archived" in body) {
    data.archivedAt = body.archived ? new Date() : null;
  }

  try {
    const initiative = await db.initiative.update({
      where: { id: params.id },
      data,
      include: { direction: true, seguimientos: { orderBy: { fecha: "desc" } } },
    });
    return NextResponse.json(initiative);
  } catch {
    return NextResponse.json({ errors: ["No se pudo actualizar la iniciativa."] }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const initiative = await db.initiative.update({
      where: { id: params.id },
      data: { archivedAt: new Date() },
    });
    return NextResponse.json(initiative);
  } catch {
    return NextResponse.json({ errors: ["No se pudo archivar la iniciativa."] }, { status: 400 });
  }
}
