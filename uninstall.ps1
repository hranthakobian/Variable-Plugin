# Variable Fonts & Design Space Controller - Multi-App Uninstaller
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "======================================================================" -ForegroundColor Yellow
Write-Host "   Variable Fonts Controller Suite for Adobe CC - Uninstaller" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Yellow
Write-Host ""

$cepBase = Join-Path $env:APPDATA "Adobe\CEP\extensions"
$panels = @(
    "com.adobe.variables.panel",
    "com.illustrator.variables.panel",
    "com.indesign.variables.panel",
    "com.photoshop.variables.panel"
)

foreach ($p in $panels) {
    $dir = Join-Path $cepBase $p
    if (Test-Path $dir) {
        Write-Host "Removing extension folder: $dir" -ForegroundColor Cyan
        Remove-Item -Path $dir -Recurse -Force
    }
}

Write-Host ""
Write-Host "Successfully uninstalled Variable Fonts Controller extensions." -ForegroundColor Green
Write-Host ""
