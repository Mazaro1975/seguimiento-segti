import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const directions = await db.direction.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(directions);
}
