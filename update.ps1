$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function Write-Step($msg) {
    Write-Host ""
    Write-Host "==> $msg" -ForegroundColor Cyan
}

Write-Host "==========================================" -ForegroundColor Green
Write-Host " Actualizando Seguimiento Estratégico SEGTI 2026" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

Write-Step "Descargando los últimos cambios (git pull)..."
git pull

Write-Step "Actualizando dependencias..."
npm install

Write-Step "Aplicando migraciones de base de datos nuevas (si las hay)..."
npx prisma generate
npx prisma migrate deploy

Write-Step "Recompilando la aplicación..."
npm run build

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host " Actualización completa. Tus iniciativas y seguimientos no se modificaron." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANTE: 'npm run db:seed' vuelve a importar el Excel desde cero y" -ForegroundColor Yellow
Write-Host "BORRA las iniciativas y seguimientos existentes. No forma parte de esta" -ForegroundColor Yellow
Write-Host "actualización — solo debe usarse a propósito, sabiendo que reemplaza los datos." -ForegroundColor Yellow
