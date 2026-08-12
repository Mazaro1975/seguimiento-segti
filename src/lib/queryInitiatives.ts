import type { Prisma } from "@prisma/client";
import { db } from "./db";

export function buildInitiativeWhere(params: URLSearchParams): Prisma.InitiativeWhereInput {
  const where: Prisma.InitiativeWhereInput = {};

  const direction = params.get("direction");
  if (direction) where.direction = { slug: direction };

  const estado = params.get("estado");
  if (estado) where.estado = estado;

  const clasificacion = params.get("clasificacion");
  if (clasificacion) where.clasificacion = clasificacion;

  const trimestre = params.get("trimestre");
  if (trimestre) where.trimestre = trimestre;

  const tipoSolicitud = params.get("tipoSolicitud");
  if (tipoSolicitud) where.tipoSolicitud = tipoSolicitud;

  const liderTI = params.get("liderTI");
  if (liderTI) where.liderTI = liderTI;

  const q = params.get("q");
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { liderTI: { contains: q } },
      { liderNegocio: { contains: q } },
      { director: { contains: q } },
    ];
  }

  const includeArchived = params.get("includeArchived") === "true";
  if (!includeArchived) where.archivedAt = null;

  return where;
}

export function getFilteredInitiatives(params: URLSearchParams) {
  const where = buildInitiativeWhere(params);
  return db.initiative.findMany({
    where,
    include: { direction: true, seguimientos: { orderBy: { fecha: "desc" } } },
    orderBy: [{ direction: { order: "asc" } }, { legacyNumber: "asc" }],
  });
}
