import { db } from "@/lib/db";
import { NewInitiativeClient } from "@/components/NewInitiativeClient";

export const dynamic = "force-dynamic";

export default async function NuevaIniciativaPage() {
  const directions = await db.direction.findMany({ orderBy: { order: "asc" } });
  return <NewInitiativeClient directions={directions} />;
}
