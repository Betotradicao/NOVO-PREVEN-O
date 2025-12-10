@echo off
chcp 65001 >nul
echo ========================================
echo  PARAR SISTEMA
echo ========================================
echo.

cd /d "%~dp0"

echo Parando containers...
docker compose stop

if errorlevel 1 (
    echo.
    echo ❌ ERRO ao parar containers
    pause
    exit /b 1
)

echo.
echo ✅ Sistema parado com sucesso!
echo.
echo Para iniciar novamente, use: INICIAR.bat
echo.
pause
