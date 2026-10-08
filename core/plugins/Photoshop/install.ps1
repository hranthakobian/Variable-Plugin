# Variable Fonts Controller - Photoshop Installer
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Installing Variable Fonts Controller for Adobe Photoshop..." -ForegroundColor Cyan
$extId = "com.photoshop.variables.panel"
$targetDir = Join-Path $env:APPDATA "Adobe\CEP\extensions\$extId"

7..16 | ForEach-Object {
    $reg = "HKCU:\Software\Adobe\CSXS.$_"
    if (!(Test-Path $reg)) { New-Item -Path $reg -Force | Out-Null }
    Set-ItemProperty -Path $reg -Name "PlayerDebugMode" -Value "1" -Force
}

$cepBase = Join-Path $env:APPDATA "Adobe\CEP\extensions"
if (!(Test-Path $cepBase)) { New-Item -ItemType Directory -Path $cepBase -Force | Out-Null }
if (Test-Path $targetDir) { Remove-Item -Path $targetDir -Recurse -Force | Out-Null }
New-Item -ItemType Directory -Path $targetDir -Force | Out-Null

Get-ChildItem -Path $PSScriptRoot | ForEach-Object {
    if (@('install.ps1','install.bat','uninstall.ps1') -notcontains $_.Name) {
        Copy-Item -Path $_.FullName -Destination $targetDir -Recurse -Force
    }
}

Write-Host "Successfully installed for Adobe Photoshop!" -ForegroundColor Green
Write-Host "Launch in Photoshop: Window > Extensions > Variable Controller (Photoshop)" -ForegroundColor Yellow
