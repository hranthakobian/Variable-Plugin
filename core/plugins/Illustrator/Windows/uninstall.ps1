# Variable Fonts Controller - Illustrator Uninstaller
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Uninstalling Variable Fonts Controller for Adobe Illustrator..." -ForegroundColor Yellow
$extId = "com.illustrator.variables.panel"
$targetDir = Join-Path $env:APPDATA "Adobe\CEP\extensions\$extId"

if (Test-Path $targetDir) {
    Remove-Item -Path $targetDir -Recurse -Force
    Write-Host "Successfully uninstalled Illustrator extension." -ForegroundColor Green
} else {
    Write-Host "Extension folder not found: $targetDir" -ForegroundColor Gray
}
