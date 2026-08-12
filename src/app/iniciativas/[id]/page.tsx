import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { InitiativeDetailClient } from "@/components/InitiativeDetailClient";

export const dynamic = "force-dynamic";

export default async function IniciativaPage({ params }: { params: { id: string } }) {
  const [initiative, directions] = await Promise.all([
    db.initiative.findUnique({
      where: { id: params.id },
      include: { direction: true, seguimientos: { orderBy: { fecha: "desc" } } },
    }),
    db.direction.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!initiative) notFound();

  return <InitiativeDetailClient initiative={initiative} directions={directions} />;
}
