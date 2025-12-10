@echo off
chcp 65001 >nul
echo ========================================
echo  INSTALAÇÃO PREVENCAO NO RADAR
echo  Versão Docker para Produção
echo ========================================
echo.

cd /d "%~dp0"

REM ==========================================
REM ETAPA 1: Verificar se Docker está instalado
REM ==========================================
echo [1/5] Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ ERRO: Docker não está instalado!
    echo.
    echo Por favor, instale o Docker Desktop:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)
echo ✅ Docker instalado

REM ==========================================
REM ETAPA 2: Verificar se docker-compose está disponível
REM ==========================================
echo [2/5] Verificando Docker Compose...
docker compose version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ ERRO: Docker Compose não está disponível!
    echo.
    pause
    exit /b 1
)
echo ✅ Docker Compose disponível

REM ==========================================
REM ETAPA 3: Detectar IP da máquina
REM ==========================================
echo [3/5] Detectando IP da máquina...

REM Tentar detectar IP automaticamente
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4" ^| findstr /V "127.0.0.1"') do (
    set DETECTED_IP=%%a
    goto :ip_found
)

:ip_found
set DETECTED_IP=%DETECTED_IP: =%

if "%DETECTED_IP%"=="" (
    echo ⚠️  Não foi possível detectar o IP automaticamente
    set /p HOST_IP="Digite o IP desta máquina (ex: 192.168.1.100): "
) else (
    echo ✅ IP detectado: %DETECTED_IP%
    echo.
    set /p CONFIRM="Usar este IP? (S/n): "
    if /i "%CONFIRM%"=="n" (
        set /p HOST_IP="Digite o IP correto: "
    ) else (
        set HOST_IP=%DETECTED_IP%
    )
)

REM Criar arquivo .env com o IP
echo HOST_IP=%HOST_IP% > .env
echo ✅ IP configurado: %HOST_IP%

REM ==========================================
REM ETAPA 4: Build das imagens
REM ==========================================
echo.
echo [4/5] Construindo imagens Docker...
echo ⏳ Isso pode levar alguns minutos...
echo.

docker compose build
if errorlevel 1 (
    echo.
    echo ❌ ERRO: Falha ao construir imagens Docker
    echo.
    pause
    exit /b 1
)

echo ✅ Imagens construídas com sucesso!

REM ==========================================
REM ETAPA 5: Iniciar containers
REM ==========================================
echo.
echo [5/5] Iniciando containers...
docker compose up -d

if errorlevel 1 (
    echo.
    echo ❌ ERRO: Falha ao iniciar containers
    echo.
    pause
    exit /b 1
)

REM ==========================================
REM AGUARDAR CONTAINERS INICIAREM
REM ==========================================
echo.
echo ⏳ Aguardando containers iniciarem...
timeout /t 10 /nobreak >nul

REM ==========================================
REM VERIFICAR STATUS
REM ==========================================
echo.
echo ========================================
echo  STATUS DOS CONTAINERS
echo ========================================
docker compose ps

echo.
echo ========================================
echo  ✅ INSTALAÇÃO CONCLUÍDA!
echo ========================================
echo.
echo  📍 Acesse o sistema:
echo     http://%HOST_IP%:8080
echo.
echo  🔧 MinIO Console (uploads):
echo     http://%HOST_IP%:9011
echo     Usuário: f0a02f9d4320abc34679f4742eecbad1
echo     Senha: 3e928e13c609385d81df326d680074f2d69434d752c44fa3161ddf89dcdaca55
echo.
echo  📊 Outros acessos:
echo     Backend API: http://%HOST_IP%:3011
echo     Frontend:    http://%HOST_IP%:8080
echo.
echo ========================================
echo.
echo 💡 Comandos úteis:
echo    - Ver logs:     docker compose logs -f
echo    - Parar:        docker compose stop
echo    - Reiniciar:    docker compose restart
echo    - Desinstalar:  docker compose down
echo.
pause
