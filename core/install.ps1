# Variable Fonts & Design Space Controller - Windows PowerShell Installer for Adobe Illustrator
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "    Variable Fonts & Design Space Controller for Adobe Illustrator" -ForegroundColor Cyan
Write-Host "                    One-Click Automatic Installer" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

$sourceDir = $PSScriptRoot
$extensionId = "com.illustrator.variables.panel"
$cepBase = Join-Path $env:APPDATA "Adobe\CEP\extensions"
$targetDir = Join-Path $cepBase $extensionId
$altTargetDir = Join-Path $cepBase "com.adobe.variables.panel"

# 1. Enable PlayerDebugMode in Windows Registry for CSXS 7 to 16
Write-Host "[1/3] Configuring Adobe CEP Debug Registry Settings..." -ForegroundColor Yellow
$versions = 7..16
foreach ($ver in $versions) {
    $regPath = "HKCU:\Software\Adobe\CSXS.$ver"
    if (!(Test-Path $regPath)) {
        New-Item -Path $regPath -Force | Out-Null
    }
    Set-ItemProperty -Path $regPath -Name "PlayerDebugMode" -Value "1" -Force
}
Write-Host "     - Successfully enabled PlayerDebugMode for CSXS 7..16." -ForegroundColor Green
Write-Host ""

# 2. Prepare Destination Directories
Write-Host "[2/3] Preparing Destination Directory..." -ForegroundColor Yellow
if (!(Test-Path $cepBase)) {
    New-Item -ItemType Directory -Path $cepBase -Force | Out-Null
}

if (Test-Path $targetDir) {
    Write-Host "     - Removing previous installation version..." -ForegroundColor Gray
    Remove-Item -Path $targetDir -Recurse -Force | Out-Null
}
New-Item -ItemType Directory -Path $targetDir -Force | Out-Null

if (Test-Path $altTargetDir) {
    Remove-Item -Path $altTargetDir -Recurse -Force | Out-Null
}
New-Item -ItemType Directory -Path $altTargetDir -Force | Out-Null

Write-Host "     - Target: $targetDir" -ForegroundColor Gray
Write-Host ""

# 3. Copy Extension Files
Write-Host "[3/3] Deploying Extension Bundle..." -ForegroundColor Yellow
$excludePatterns = @('.git', '.vscode', 'install.bat', 'uninstall.bat', 'update.bat', 'install.ps1', 'uninstall.ps1', 'update.ps1', 'install.sh', 'uninstall.sh', 'plugins', 'figma')

Get-ChildItem -Path $sourceDir | ForEach-Object {
    if ($excludePatterns -notcontains $_.Name) {
        Copy-Item -Path $_.FullName -Destination $targetDir -Recurse -Force
        Copy-Item -Path $_.FullName -Destination $altTargetDir -Recurse -Force
    }
}

# Also copy from plugins/Illustrator if present
$illustratorPluginSrc = Join-Path $sourceDir "plugins\Illustrator"
if (Test-Path $illustratorPluginSrc) {
    Get-ChildItem -Path $illustratorPluginSrc | ForEach-Object {
        if ($excludePatterns -notcontains $_.Name) {
            Copy-Item -Path $_.FullName -Destination $targetDir -Recurse -Force
            Copy-Item -Path $_.FullName -Destination $altTargetDir -Recurse -Force
        }
    }
}

Write-Host "     - All extension files deployed successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "======================================================================" -ForegroundColor Green
Write-Host "                        INSTALLATION COMPLETED!" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "How to Launch in Adobe Illustrator:" -ForegroundColor White
Write-Host "  Window > Extensions > Variable Controller" -ForegroundColor Cyan
Write-Host ""
