# Variable Fonts & Design Space Controller for Adobe Illustrator - Uninstaller
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "======================================================================" -ForegroundColor Yellow
Write-Host "   Variable Fonts Controller for Adobe Illustrator - Uninstaller" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Yellow
Write-Host ""

$cepBase = Join-Path $env:APPDATA "Adobe\CEP\extensions"
$panels = @(
    "com.illustrator.variables.panel",
    "com.adobe.variables.panel"
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
