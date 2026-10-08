@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0core\uninstall.ps1"
echo.
echo Press any key to exit...
pause >nul
