#Requires -Version 5.1
param(
    [string]$InstallPath = "$env:USERPROFILE\SEGTI-2026-Seguimiento",
    [string]$RepoUrl = "https://github.com/Mazaro1975/seguimiento-segti.git"
)

$ErrorActionPreference = "Stop"

function Write-Step($msg) {
    Write-Host ""
    Write-Host "==> $msg" -ForegroundColor Cyan
}

function Update-SessionPath {
    $machine = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
    $user = [System.Environment]::GetEnvironmentVariable("Path", "User")
    $env:Path = "$machine;$user"
}

Write-Host "==========================================" -ForegroundColor Green
Write-Host " Instalador - Seguimiento Estrategico SEGTI 2026" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# 1. Node.js
Write-Step "Verificando Node.js..."
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Host "Node.js no está instalado. Instalando con winget (puede tardar varios minutos)..."
    winget install --id OpenJS.NodeJS.LTS -e --accept-package-agreements --accept-source-agreements
    Update-SessionPath
    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    if (-not $nodeCmd) {
        Write-Host "No se pudo instalar Node.js automáticamente." -ForegroundColor Red
        Write-Host "Instálalo manualmente desde https://nodejs.org (versión LTS) y vuelve a ejecutar este instalador." -ForegroundColor Red
        exit 1
    }
}
Write-Host "Node.js: $(node --version)"

# 2. Git
Write-Step "Verificando Git..."
$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCmd) {
    Write-Host "Git no está instalado. Instalando con winget..."
    winget install --id Git.Git -e --accept-package-agreements --accept-source-agreements
    Update-SessionPath
    $gitCmd = Get-Command git -ErrorAction SilentlyContinue
    if (-not $gitCmd) {
        Write-Host "No se pudo instalar Git automáticamente." -ForegroundColor Red
        Write-Host "Instálalo manualmente desde https://git-scm.com y vuelve a ejecutar este instalador." -ForegroundColor Red
        exit 1
    }
}
Write-Host "Git: $(git --version)"

# 3. Ubicar o clonar el proyecto
$scriptDir = $PSScriptRoot
$localPackageJson = Join-Path $scriptDir "package.json"

if (Test-Path $localPackageJson) {
    Write-Step "Instalador ejecutado dentro del proyecto. Usando esta carpeta:"
    Write-Host $scriptDir
    $ProjectPath = $scriptDir
} else {
    if (Test-Path (Join-Path $InstallPath "package.json")) {
        Write-Step "Ya existe una instalación en: $InstallPath"
        Write-Host "Se usará esa carpeta (para traer las últimas actualizaciones ejecuta Actualizar.bat en vez de este instalador)."
    } else {
        Write-Step "Descargando la aplicación en: $InstallPath"
        if (-not (Test-Path $InstallPath)) {
            New-Item -ItemType Directory -Path $InstallPath | Out-Null
        }
        git clone $RepoUrl $InstallPath
    }
    $ProjectPath = $InstallPath
}

Set-Location $ProjectPath

# 4. Dependencias
Write-Step "Instalando dependencias (npm install)..."
npm install

# 5. Base de datos
Write-Step "Generando cliente de Prisma..."
npx prisma generate

Write-Step "Aplicando migraciones de base de datos..."
npx prisma migrate deploy

# 6. Importar datos si hay un Excel presente
$excelFile = Join-Path $ProjectPath "Planeacion_Estrategica_2026_SEGTI_v2JMG.xlsx"
if (Test-Path $excelFile) {
    Write-Step "Se encontró el archivo Excel. Importando datos iniciales..."
    npx tsx prisma/seed.ts
} else {
    Write-Host ""
    Write-Host "AVISO: no se encontró 'Planeacion_Estrategica_2026_SEGTI_v2JMG.xlsx' en:" -ForegroundColor Yellow
    Write-Host "  $ProjectPath" -ForegroundColor Yellow
    Write-Host "Copia ahí tu archivo Excel con ese nombre exacto y luego ejecuta:" -ForegroundColor Yellow
    Write-Host "  npm run db:seed" -ForegroundColor Yellow
}

# 7. Compilar para producción
Write-Step "Compilando la aplicación (puede tardar uno o dos minutos)..."
npm run build

# 8. Acceso directo en el escritorio
Write-Step "Creando acceso directo en el escritorio..."
try {
    $desktop = [Environment]::GetFolderPath("Desktop")
    $shortcutPath = Join-Path $desktop "SEGTI 2026 - Seguimiento.lnk"
    $targetBat = Join-Path $ProjectPath "Iniciar-App.bat"
    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $targetBat
    $shortcut.WorkingDirectory = $ProjectPath
    $shortcut.IconLocation = "shell32.dll,220"
    $shortcut.Description = "Seguimiento Estrategico SEGTI 2026"
    $shortcut.Save()
    Write-Host "Acceso directo creado: $shortcutPath"
} catch {
    Write-Host "No se pudo crear el acceso directo automáticamente. Puedes iniciar la app ejecutando Iniciar-App.bat en $ProjectPath" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host " Instalación completa" -ForegroundColor Green
Write-Host " Carpeta de la aplicación: $ProjectPath" -ForegroundColor Green
Write-Host " Usa el acceso directo del escritorio 'SEGTI 2026 - Seguimiento' para iniciarla." -ForegroundColor Green
Write-Host " Para instalar mejoras futuras, ejecuta Actualizar.bat dentro de esa carpeta." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
