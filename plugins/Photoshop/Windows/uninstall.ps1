# Variable Fonts Controller - Photoshop Uninstaller
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Uninstalling Variable Fonts Controller for Adobe Photoshop..." -ForegroundColor Yellow
$extId = "com.photoshop.variables.panel"
$targetDir = Join-Path $env:APPDATA "Adobe\CEP\extensions\$extId"

if (Test-Path $targetDir) {
    Remove-Item -Path $targetDir -Recurse -Force
    Write-Host "Successfully uninstalled Photoshop extension." -ForegroundColor Green
} else {
    Write-Host "Extension folder not found: $targetDir" -ForegroundColor Gray
}
