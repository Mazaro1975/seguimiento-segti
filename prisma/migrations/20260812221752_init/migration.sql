-- CreateTable
CREATE TABLE "Direction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Initiative" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "legacyNumber" INTEGER,
    "title" TEXT NOT NULL,
    "tipoBpOpr" TEXT,
    "clasificacion" TEXT NOT NULL DEFAULT 'SIN_CLASIFICAR',
    "estado" TEXT NOT NULL DEFAULT 'SIN_ESTADO',
    "esfuerzo" INTEGER,
    "prioridad" INTEGER,
    "trimestre" TEXT NOT NULL DEFAULT 'SIN_Q',
    "liderTI" TEXT,
    "liderNegocio" TEXT,
    "tipoSolicitud" TEXT,
    "director" TEXT,
    "businessPartner" TEXT,
    "directionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "archivedAt" DATETIME,
    CONSTRAINT "Initiative_directionId_fkey" FOREIGN KEY ("directionId") REFERENCES "Direction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Seguimiento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "initiativeId" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "autor" TEXT,
    "texto" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Seguimiento_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Direction_name_key" ON "Direction"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Direction_slug_key" ON "Direction"("slug");

-- CreateIndex
CREATE INDEX "Initiative_directionId_idx" ON "Initiative"("directionId");

-- CreateIndex
CREATE INDEX "Initiative_estado_idx" ON "Initiative"("estado");

-- CreateIndex
CREATE INDEX "Initiative_trimestre_idx" ON "Initiative"("trimestre");

-- CreateIndex
CREATE INDEX "Initiative_clasificacion_idx" ON "Initiative"("clasificacion");

-- CreateIndex
CREATE INDEX "Seguimiento_initiativeId_idx" ON "Seguimiento"("initiativeId");

-- CreateIndex
CREATE INDEX "Seguimiento_fecha_idx" ON "Seguimiento"("fecha");
