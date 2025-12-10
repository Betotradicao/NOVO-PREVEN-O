@echo off
chcp 65001 >nul
echo ========================================
echo  ATUALIZAR SISTEMA
echo ========================================
echo.

cd /d "%~dp0"

echo ⚠️  ATENÇÃO: Este processo vai:
echo    1. Parar os containers
echo    2. Rebuild das imagens
echo    3. Reiniciar o sistema
echo.
echo Os DADOS não serão perdidos (volumes são mantidos)
echo.
set /p CONFIRM="Deseja continuar? (S/n): "

if /i not "%CONFIRM%"=="s" if /i not "%CONFIRM%"=="" (
    echo.
    echo Atualização cancelada.
    pause
    exit /b 0
)

echo.
echo [1/3] Parando containers...
docker compose down

echo.
echo [2/3] Reconstruindo imagens...
echo ⏳ Isso pode levar alguns minutos...
docker compose build

if errorlevel 1 (
    echo.
    echo ❌ ERRO ao reconstruir imagens
    pause
    exit /b 1
)

echo.
echo [3/3] Iniciando sistema atualizado...
docker compose up -d

if errorlevel 1 (
    echo.
    echo ❌ ERRO ao iniciar containers
    pause
    exit /b 1
)

echo.
echo ⏳ Aguardando containers iniciarem...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo  ✅ SISTEMA ATUALIZADO COM SUCESSO!
echo ========================================
echo.

REM Ler IP do arquivo .env
for /f "tokens=2 delims==" %%a in ('findstr HOST_IP .env 2^>nul') do set HOST_IP=%%a
if "%HOST_IP%"=="" set HOST_IP=localhost

echo  📍 Acesse: http://%HOST_IP%:8080
echo.
pause
