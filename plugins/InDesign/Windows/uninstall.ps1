# Variable Fonts Controller - InDesign Uninstaller
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Uninstalling Variable Fonts Controller for Adobe InDesign..." -ForegroundColor Yellow
$extId = "com.indesign.variables.panel"
$targetDir = Join-Path $env:APPDATA "Adobe\CEP\extensions\$extId"

if (Test-Path $targetDir) {
    Remove-Item -Path $targetDir -Recurse -Force
    Write-Host "Successfully uninstalled InDesign extension." -ForegroundColor Green
} else {
    Write-Host "Extension folder not found: $targetDir" -ForegroundColor Gray
}
