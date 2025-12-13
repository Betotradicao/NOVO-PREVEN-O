@echo off
cd /d "%~dp0"

echo ========================================
echo  INSTALADOR PREVENCAO NO RADAR
echo  Baixando versao mais recente do GitHub
echo ========================================
echo.

REM ETAPA 1: Verificar Docker
echo [1/8] Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERRO: Docker nao esta instalado!
    echo.
    echo Por favor, instale o Docker Desktop:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)
echo Docker instalado OK

REM ETAPA 2: Verificar docker-compose
echo [2/8] Verificando Docker Compose...
docker compose version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERRO: Docker Compose nao disponivel!
    echo.
    pause
    exit /b 1
)
echo Docker Compose OK

REM ETAPA 3: Parar containers antigos
echo.
echo [3/8] Parando containers antigos (se existirem)...
docker compose -f docker-compose-producao.yml down -v >nul 2>&1
echo Containers antigos removidos!

REM ETAPA 4: Baixar código atualizado do GitHub
echo.
echo [4/8] Baixando codigo atualizado do GitHub...
cd ..
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/Betotradicao/NOVO-PREVEN-O/archive/refs/heads/main.zip' -OutFile 'codigo-atualizado.zip'"
if errorlevel 1 (
    echo ERRO ao baixar codigo do GitHub!
    pause
    exit /b 1
)
echo Download concluido!

REM ETAPA 5: Extrair código
echo.
echo [5/8] Extraindo arquivos...
powershell -Command "Expand-Archive -Path 'codigo-atualizado.zip' -DestinationPath 'codigo-temp' -Force"
if errorlevel 1 (
    echo ERRO ao extrair arquivos!
    pause
    exit /b 1
)
echo Arquivos extraidos!

REM ETAPA 6: Copiar arquivos atualizados
echo.
echo [6/8] Atualizando arquivos...
xcopy /E /I /Y "codigo-temp\NOVO-PREVEN-O-main\*" "." >nul
echo Arquivos atualizados!

REM ETAPA 7: Limpar arquivos temporários
echo.
echo [7/8] Limpando arquivos temporarios...
del /F /Q "codigo-atualizado.zip" >nul 2>&1
rmdir /S /Q "codigo-temp" >nul 2>&1
echo Limpeza concluida!

REM ETAPA 8: Executar instalador principal
echo.
echo [8/8] Iniciando instalacao...
cd InstaladorDOCKER
call INSTALAR-AUTO.bat

echo.
echo ========================================
echo  INSTALACAO CONCLUIDA!
echo ========================================
pause
