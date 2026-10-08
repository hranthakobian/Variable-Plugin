@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0update.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Update failed or was cancelled.
)
echo.
echo Press any key to exit...
pause >nul
