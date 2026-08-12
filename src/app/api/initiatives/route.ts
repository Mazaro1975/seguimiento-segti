import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getFilteredInitiatives } from "@/lib/queryInitiatives";
import { validateInitiativeInput } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const initiatives = await getFilteredInitiatives(req.nextUrl.searchParams);
  return NextResponse.json(initiatives);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const result = validateInitiativeInput(body);
  if ("errors" in result) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  try {
    const initiative = await db.initiative.create({
      data: result.data,
      include: { direction: true, seguimientos: true },
    });
    return NextResponse.json(initiative, { status: 201 });
  } catch {
    return NextResponse.json(
      { errors: ["No se pudo crear la iniciativa (¿directionId válido?)."] },
      { status: 400 }
    );
  }
}
