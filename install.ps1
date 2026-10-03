# Variable Fonts & Design Space Controller - Windows PowerShell Multi-App Installer
# Supports Adobe Illustrator, Adobe InDesign, and Adobe Photoshop
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "    Variable Fonts & Design Space Controller Suite for Adobe CC" -ForegroundColor Cyan
Write-Host "        (Adobe Illustrator, Adobe InDesign, Adobe Photoshop)" -ForegroundColor Cyan
Write-Host "                    One-Click Automatic Installer" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

$sourceDir = $PSScriptRoot
$extensionId = "com.adobe.variables.panel"
$targetDir = Join-Path $env:APPDATA "Adobe\CEP\extensions\$extensionId"

# 1. Enable PlayerDebugMode in Windows Registry for CSXS 7 to 16 (Illustrator, InDesign, Photoshop)
Write-Host "[1/3] Configuring Adobe CEP Debug Registry Settings for Illustrator, InDesign & Photoshop..." -ForegroundColor Yellow
$versions = 7..16
foreach ($ver in $versions) {
    $regPath = "HKCU:\Software\Adobe\CSXS.$ver"
    if (!(Test-Path $regPath)) {
        New-Item -Path $regPath -Force | Out-Null
    }
    Set-ItemProperty -Path $regPath -Name "PlayerDebugMode" -Value "1" -Force
}
Write-Host "     - Successfully enabled PlayerDebugMode for CSXS 7..16 across all Adobe apps." -ForegroundColor Green
Write-Host ""

# 2. Prepare Destination Directory
Write-Host "[2/3] Preparing Destination Directory..." -ForegroundColor Yellow
$cepBase = Join-Path $env:APPDATA "Adobe\CEP\extensions"
if (!(Test-Path $cepBase)) {
    New-Item -ItemType Directory -Path $cepBase -Force | Out-Null
}

if (Test-Path $targetDir) {
    Write-Host "     - Removing previous installation version..." -ForegroundColor Gray
    Remove-Item -Path $targetDir -Recurse -Force | Out-Null
}

New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
Write-Host "     - Multi-Host Target: $targetDir" -ForegroundColor Gray
Write-Host ""

# 3. Copy Extension Files
Write-Host "[3/3] Deploying Extension Bundle..." -ForegroundColor Yellow
$excludePatterns = @('.git', '.vscode', 'install.bat', 'uninstall.bat', 'install.ps1', 'uninstall.ps1', 'install.sh', 'plugins')

Get-ChildItem -Path $sourceDir | ForEach-Object {
    if ($excludePatterns -notcontains $_.Name) {
        Copy-Item -Path $_.FullName -Destination $targetDir -Recurse -Force
    }
}

# Also install individual modular app plugins if plugins folder exists
$pluginsDir = Join-Path $sourceDir "plugins"
if (Test-Path $pluginsDir) {
    $apps = @("Illustrator", "InDesign", "Photoshop")
    foreach ($app in $apps) {
        $appSrc = Join-Path $pluginsDir $app
        if (Test-Path $appSrc) {
            $appTarget = Join-Path $cepBase "com.$($app.ToLower()).variables.panel"
            if (Test-Path $appTarget) { Remove-Item -Path $appTarget -Recurse -Force | Out-Null }
            Copy-Item -Path $appSrc -Destination $appTarget -Recurse -Force
            Write-Host "     - Deployed standalone $app plugin to: $appTarget" -ForegroundColor Gray
        }
    }
}

Write-Host "     - All extension files deployed successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "======================================================================" -ForegroundColor Green
Write-Host "                        INSTALLATION COMPLETED!" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "How to Launch in Adobe Applications:" -ForegroundColor White
Write-Host "  1. Adobe Illustrator: Window > Extensions > Variable Controller" -ForegroundColor Cyan
Write-Host "  2. Adobe InDesign:    Window > Extensions > Variable Controller" -ForegroundColor Cyan
Write-Host "  3. Adobe Photoshop:   Window > Extensions > Variable Controller" -ForegroundColor Cyan
Write-Host ""
