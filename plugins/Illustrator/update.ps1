# Variable Fonts & Design Space Controller - GitHub Auto-Updater
# Fetches latest release/code from GitHub and deploys to Adobe CEP extensions
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "       Variable Fonts Controller - GitHub Auto-Updater" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

$repo = "hakobian-am/Variables-Plugin"
$sourceDir = $PSScriptRoot
$zipUrl = "https://github.com/$repo/archive/refs/heads/main.zip"
$tempZip = Join-Path $env:TEMP "Variables-Plugin-Latest.zip"
$tempExtract = Join-Path $env:TEMP "Variables-Plugin-Latest"

Write-Host "[1/3] Downloading latest update from GitHub ($repo)..." -ForegroundColor Yellow
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $zipUrl -OutFile $tempZip -UseBasicParsing
    Write-Host "     - Download completed successfully." -ForegroundColor Green
} catch {
    Write-Host "     - Error downloading from GitHub: $_" -ForegroundColor Red
    Write-Host "     - Checking local repository instead..." -ForegroundColor Yellow
}

if (Test-Path $tempZip) {
    Write-Host "[2/3] Extracting update files..." -ForegroundColor Yellow
    if (Test-Path $tempExtract) { Remove-Item -Path $tempExtract -Recurse -Force | Out-Null }
    Expand-Archive -Path $tempZip -DestinationPath $tempExtract -Force
    $extractedFolder = Get-ChildItem -Path $tempExtract | Where-Object { $_.PSIsContainer } | Select-Object -First 1
    if ($extractedFolder) {
        $sourceDir = $extractedFolder.FullName
        Write-Host "     - Extracted to: $sourceDir" -ForegroundColor Green
    }
}

Write-Host "[3/3] Deploying updated plugin to Adobe CC..." -ForegroundColor Yellow
$installScript = Join-Path $sourceDir "install.ps1"
if (Test-Path $installScript) {
    & $installScript
} else {
    # Fallback to local installer
    & (Join-Path $PSScriptRoot "install.ps1")
}

# Cleanup temp files
if (Test-Path $tempZip) { Remove-Item -Path $tempZip -Force | Out-Null }
if (Test-Path $tempExtract) { Remove-Item -Path $tempExtract -Recurse -Force | Out-Null }

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "                PLUGIN UPDATED TO LATEST VERSION!" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "Please restart Adobe Illustrator, InDesign or Photoshop to apply." -ForegroundColor White
Write-Host ""
