# XORA · asistente para preparar la publicación en Microsoft Store.
# Uso: clic derecho → Ejecutar con PowerShell.

$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

# Microsoft Store usa una versión de cuatro componentes.
$ver = '0.0.0.0'
try {
    $pkg = Get-Content (Join-Path $root 'package.json') -Raw -Encoding UTF8 | ConvertFrom-Json
    $ver = ('{0}.0' -f $pkg.version)
} catch {
    Write-Host '  [!] No se pudo leer la versión; revisa package.json.' -ForegroundColor Yellow
}

$msix = Join-Path $root ('dist\store\XORA_{0}_x64.msix' -f $ver)
$guide = Join-Path $root 'docs\store-upload-walkthrough.md'
$listing = Join-Path $root 'docs\store-listing.md'

Write-Host ''
Write-Host '  Asistente de publicación de XORA' -ForegroundColor Green
Write-Host '  ─────────────────────────────────' -ForegroundColor DarkGray

if (-not (Test-Path $msix)) {
    Write-Host "  [!] No se encontró el paquete: $msix" -ForegroundColor Red
    Write-Host '      Ejecuta node build/msix.js para generarlo.' -ForegroundColor DarkGray
} else {
    $mb = [math]::Round((Get-Item $msix).Length / 1MB, 1)
    Write-Host "  [1] Paquete  $mb MB" -ForegroundColor Cyan
    Write-Host '      Quedará seleccionado en el Explorador para subirlo.' -ForegroundColor DarkGray
    Start-Process explorer.exe "/select,`"$msix`""
}

Write-Host '  [2] Partner Center (se abrirá el navegador)' -ForegroundColor Cyan
Start-Process 'https://partner.microsoft.com/dashboard/apps-and-games'

if (Test-Path $guide) {
    Write-Host '  [3] Guía de publicación' -ForegroundColor Cyan
    Start-Process $guide
}

if (Test-Path $listing) {
    Write-Host '  [4] Texto de la ficha de la tienda' -ForegroundColor Cyan
    Start-Process $listing
}

Write-Host ''
Write-Host '  Orden: crear producto → subir paquete → pegar ficha → enviar.' -ForegroundColor Yellow
Write-Host '  Política de privacidad: https://github.com/elx19/xora-emulator/blob/main/docs/privacy.md' -ForegroundColor DarkGray
Write-Host ''
