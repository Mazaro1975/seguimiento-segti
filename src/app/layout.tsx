import "./globals.css";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "Seguimiento Estratégico SEGTI 2026",
  description: "Aplicación de seguimiento de Planeación Estratégica de Iniciativas/Proyectos",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const directions = await db.direction.findMany({ orderBy: { order: "asc" } });

  return (
    <html lang="es">
      <body>
        <Shell directions={directions}>{children}</Shell>
      </body>
    </html>
  );
}
