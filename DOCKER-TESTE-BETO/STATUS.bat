@echo off
chcp 65001 >nul
echo ========================================
echo  STATUS DO SISTEMA
echo ========================================
echo.

cd /d "%~dp0"

docker compose ps

echo.
echo ========================================
echo  USO DE RECURSOS
echo ========================================
echo.

docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo.
pause
