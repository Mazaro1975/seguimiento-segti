$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path ".next")) {
    Write-Host "Primera ejecución: compilando la aplicación (puede tardar uno o dos minutos)..."
    npm run build
}

# Abre el navegador un momento después de arrancar, mientras el servidor sigue
# ejecutándose en primer plano en esta misma ventana.
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 4
    Start-Process "http://localhost:3000"
} | Out-Null

Write-Host ""
Write-Host "Iniciando SEGTI 2026 en http://localhost:3000 ..."
Write-Host "No cierres esta ventana mientras uses la aplicación. Para salir, ciérrala o presiona Ctrl+C."
Write-Host ""

npm start
