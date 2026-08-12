# Seguimiento Estratégico SEGTI 2026

Aplicación web local para gestionar, visualizar y controlar un portafolio de iniciativas de Planeación Estratégica: cronograma priorizado, vistas por Dirección, dashboard ejecutivo, historial de seguimientos, alertas de riesgo y exportación a Excel.

Diseñada para reemplazar el seguimiento manual en Excel — ver el diseño completo de la solución en [`docs/DISEÑO-SOLUCION.md`](docs/DISEÑO-SOLUCION.md).

## Instalación (Windows)

**Opción 1 — Instalador descargable (recomendada):**

1. Ve a la sección [Releases](../../releases) de este repositorio y descarga el `.zip` del instalador.
2. Descomprímelo y ejecuta `Instalar.bat` (doble clic).
3. El instalador verifica/instala Node.js y Git si faltan, descarga la aplicación, instala dependencias, prepara la base de datos y crea un acceso directo en el escritorio.

**Opción 2 — Clonando el repositorio:**

```powershell
git clone https://github.com/Mazaro1975/seguimiento-segti.git
cd seguimiento-segti
.\Instalar.bat
```

### Cargar tus datos

Por privacidad, este repositorio **no incluye** el archivo Excel real de la organización. Para importar tus propias iniciativas:

1. Copia tu archivo a la raíz del proyecto con el nombre exacto: `Planeacion_Estrategica_2026_SEGTI_v2JMG.xlsx`
2. Ejecuta `npm run db:seed` (o vuelve a correr `Instalar.bat`, que lo detecta automáticamente).

El importador espera 12 hojas de dirección con la estructura descrita en la sección 10 de [`docs/DISEÑO-SOLUCION.md`](docs/DISEÑO-SOLUCION.md).

### Iniciar la aplicación

Usa el acceso directo del escritorio **"SEGTI 2026 - Seguimiento"**, o ejecuta `Iniciar-App.bat` dentro de la carpeta del proyecto. Se abre automáticamente en `http://localhost:3000`.

### Actualizar a la última versión

Ejecuta `Actualizar.bat` dentro de la carpeta del proyecto. Descarga las mejoras más recientes, actualiza dependencias y la base de datos **sin borrar tus iniciativas ni seguimientos**.

> `npm run db:seed` sí borra y reemplaza todos los datos por lo que haya en el Excel — solo úsalo a propósito, nunca como parte de una actualización normal.

## Desarrollo

Requiere [Node.js](https://nodejs.org) 18+.

```powershell
npm install
npx prisma migrate deploy
npm run dev          # http://localhost:3000, modo desarrollo
npm run db:seed      # importa Planeacion_Estrategica_2026_SEGTI_v2JMG.xlsx
npm run import:report # valida el importador sin tocar la base de datos
```

## Stack técnico

Next.js 14 (App Router) + TypeScript, Prisma + SQLite, Recharts, TanStack Table, SheetJS (`xlsx`), Tailwind CSS. Detalle completo y justificación en [`docs/DISEÑO-SOLUCION.md`](docs/DISEÑO-SOLUCION.md) sección 8.

## Estructura

```
src/app/          páginas (App Router) y rutas de API
src/components/   componentes de UI
src/lib/          modelo de dominio, importador de Excel, lógica de alertas
prisma/           schema, migraciones y script de importación (seed)
docs/             documento de diseño de la solución
```
