@echo off
chcp 65001 >nul
echo ========================================
echo  LOGS DO SISTEMA
echo ========================================
echo.

cd /d "%~dp0"

echo Acompanhando logs em tempo real...
echo Pressione Ctrl+C para sair
echo.

docker compose logs -f
