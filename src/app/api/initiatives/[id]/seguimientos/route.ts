import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const texto = typeof body?.texto === "string" ? body.texto.trim() : "";
  const autor = typeof body?.autor === "string" && body.autor.trim() !== "" ? body.autor.trim() : null;
  const fechaRaw = typeof body?.fecha === "string" ? body.fecha : "";

  if (!texto) {
    return NextResponse.json({ errors: ["El campo 'texto' es obligatorio."] }, { status: 400 });
  }

  // Un input <input type="date"> envía "YYYY-MM-DD"; parsearlo con `new Date(string)`
  // lo interpreta como medianoche UTC y puede mostrar el día anterior en zonas
  // horarias negativas (p. ej. Colombia, UTC-5). Se construye en hora local.
  const isoDateMatch = fechaRaw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const fecha = isoDateMatch
    ? new Date(Number(isoDateMatch[1]), Number(isoDateMatch[2]) - 1, Number(isoDateMatch[3]))
    : fechaRaw
      ? new Date(fechaRaw)
      : new Date();
  if (Number.isNaN(fecha.getTime())) {
    return NextResponse.json({ errors: ["'fecha' inválida."] }, { status: 400 });
  }

  try {
    const seguimiento = await db.seguimiento.create({
      data: { initiativeId: params.id, texto, autor, fecha },
    });
    await db.initiative.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    });
    return NextResponse.json(seguimiento, { status: 201 });
  } catch {
    return NextResponse.json(
      { errors: ["No se pudo registrar el seguimiento (¿iniciativa inválida?)."] },
      { status: 400 }
    );
  }
}
