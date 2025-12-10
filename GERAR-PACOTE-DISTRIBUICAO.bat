@echo off
chcp 65001 >nul
echo ========================================
echo  GERAR PACOTE DE DISTRIBUIÇÃO
echo  Prevenção no Radar - Versão Docker
echo ========================================
echo.

cd /d "%~dp0"

REM ==========================================
REM VERIFICAR SE TEM 7-ZIP OU POWERSHELL
REM ==========================================
set USE_POWERSHELL=0

where 7z >nul 2>&1
if errorlevel 1 (
    echo ⚠️  7-Zip não encontrado, usando PowerShell...
    set USE_POWERSHELL=1
) else (
    echo ✅ 7-Zip encontrado
)

REM ==========================================
REM DEFINIR VERSÃO
REM ==========================================
set /p VERSION="Digite a versão (ex: 1.0.0): "
if "%VERSION%"=="" set VERSION=1.0.0

set PACKAGE_NAME=Prevencao-No-Radar-Docker-v%VERSION%
set TEMP_DIR=temp_package_%RANDOM%
set OUTPUT_FILE=%PACKAGE_NAME%.zip

echo.
echo 📦 Preparando pacote: %PACKAGE_NAME%
echo.

REM ==========================================
REM CRIAR PASTA TEMPORÁRIA
REM ==========================================
echo [1/6] Criando estrutura temporária...
if exist "%TEMP_DIR%" rd /s /q "%TEMP_DIR%"
mkdir "%TEMP_DIR%"
mkdir "%TEMP_DIR%\packages"
mkdir "%TEMP_DIR%\packages\backend"
mkdir "%TEMP_DIR%\packages\frontend"

REM ==========================================
REM COPIAR PASTA DOCKER-TESTE-BETO
REM ==========================================
echo [2/6] Copiando arquivos Docker...
xcopy "DOCKER-TESTE-BETO" "%TEMP_DIR%\DOCKER-TESTE-BETO\" /E /I /Y >nul

REM ==========================================
REM COPIAR CÓDIGO DO BACKEND
REM ==========================================
echo [3/6] Copiando código do Backend...
xcopy "packages\backend\src" "%TEMP_DIR%\packages\backend\src\" /E /I /Y >nul
xcopy "packages\backend\package*.json" "%TEMP_DIR%\packages\backend\" /Y >nul
xcopy "packages\backend\tsconfig.json" "%TEMP_DIR%\packages\backend\" /Y >nul
if exist "packages\backend\.dockerignore" copy "packages\backend\.dockerignore" "%TEMP_DIR%\packages\backend\" >nul

REM Copiar .env.example do backend (se existir)
if exist "packages\backend\.env.example" copy "packages\backend\.env.example" "%TEMP_DIR%\packages\backend\" >nul

REM ==========================================
REM COPIAR CÓDIGO DO FRONTEND
REM ==========================================
echo [4/6] Copiando código do Frontend...
xcopy "packages\frontend\src" "%TEMP_DIR%\packages\frontend\src\" /E /I /Y >nul
xcopy "packages\frontend\public" "%TEMP_DIR%\packages\frontend\public\" /E /I /Y >nul
xcopy "packages\frontend\package*.json" "%TEMP_DIR%\packages\frontend\" /Y >nul
xcopy "packages\frontend\vite.config.js" "%TEMP_DIR%\packages\frontend\" /Y >nul
xcopy "packages\frontend\index.html" "%TEMP_DIR%\packages\frontend\" /Y >nul
if exist "packages\frontend\.dockerignore" copy "packages\frontend\.dockerignore" "%TEMP_DIR%\packages\frontend\" >nul
if exist "packages\frontend\.env" copy "packages\frontend\.env" "%TEMP_DIR%\packages\frontend\" >nul

REM ==========================================
REM CRIAR README DE INSTALAÇÃO
REM ==========================================
echo [5/6] Criando documentação de instalação...

(
echo ========================================
echo   PREVENCAO NO RADAR - VERSAO DOCKER
echo   Versão %VERSION%
echo ========================================
echo.
echo 📋 REQUISITOS:
echo.
echo - Windows 10/11 Pro ou Windows Server
echo - Docker Desktop instalado
echo - Mínimo 4GB de RAM disponível
echo.
echo ========================================
echo 🚀 INSTALAÇÃO RÁPIDA:
echo ========================================
echo.
echo 1. Extraia este ZIP para uma pasta ^(ex: C:\Prevencao^)
echo.
echo 2. Entre na pasta DOCKER-TESTE-BETO
echo.
echo 3. Clique duas vezes em: INSTALAR.bat
echo.
echo 4. Aguarde a instalação ^(5-10 minutos^)
echo.
echo 5. Acesse: http://IP-DA-MAQUINA:8080
echo.
echo ========================================
echo 📊 PORTAS UTILIZADAS:
echo ========================================
echo.
echo Frontend:        8080
echo Backend API:     3011
echo MinIO Storage:   9010
echo MinIO Console:   9011
echo PostgreSQL:      5434
echo.
echo ========================================
echo 📁 ARQUIVOS IMPORTANTES:
echo ========================================
echo.
echo INSTALAR.bat    - Instalar pela primeira vez
echo INICIAR.bat     - Iniciar o sistema
echo PARAR.bat       - Parar o sistema
echo ATUALIZAR.bat   - Atualizar versão
echo STATUS.bat      - Ver status
echo VER-LOGS.bat    - Ver logs
echo README.md       - Documentação completa
echo.
echo ========================================
echo ❓ PRECISA DE AJUDA?
echo ========================================
echo.
echo Leia a documentação completa em:
echo DOCKER-TESTE-BETO\README.md
echo.
echo ========================================
) > "%TEMP_DIR%\LEIA-ME-PRIMEIRO.txt"

REM ==========================================
REM COMPACTAR TUDO
REM ==========================================
echo [6/6] Compactando pacote...

if exist "%OUTPUT_FILE%" del "%OUTPUT_FILE%"

if %USE_POWERSHELL%==1 (
    REM Usar PowerShell para compactar
    powershell -Command "Compress-Archive -Path '%TEMP_DIR%\*' -DestinationPath '%OUTPUT_FILE%' -Force"
) else (
    REM Usar 7-Zip
    7z a -tzip "%OUTPUT_FILE%" ".\%TEMP_DIR%\*" -mx9 >nul
)

if errorlevel 1 (
    echo.
    echo ❌ ERRO ao criar arquivo ZIP
    rd /s /q "%TEMP_DIR%"
    pause
    exit /b 1
)

REM ==========================================
REM LIMPAR PASTA TEMPORÁRIA
REM ==========================================
rd /s /q "%TEMP_DIR%"

REM ==========================================
REM CALCULAR TAMANHO DO ARQUIVO
REM ==========================================
for %%A in ("%OUTPUT_FILE%") do set SIZE=%%~zA
set /a SIZE_MB=%SIZE% / 1048576

echo.
echo ========================================
echo  ✅ PACOTE CRIADO COM SUCESSO!
echo ========================================
echo.
echo 📦 Arquivo: %OUTPUT_FILE%
echo 💾 Tamanho: %SIZE_MB% MB
echo.
echo ========================================
echo  PRÓXIMOS PASSOS:
echo ========================================
echo.
echo 1. Fazer upload no GitHub Releases:
echo    - Vá para: https://github.com/Betotradicao/roberto-prevencao-no-radar/releases
echo    - Clique em "Create a new release"
echo    - Tag: v%VERSION%
echo    - Anexe o arquivo: %OUTPUT_FILE%
echo    - Publique
echo.
echo 2. Ou compartilhe o arquivo direto:
echo    - Google Drive
echo    - Pen Drive
echo    - Rede local
echo.
echo 3. Na máquina destino:
echo    - Extrair o ZIP
echo    - Entrar em DOCKER-TESTE-BETO
echo    - Executar INSTALAR.bat
echo.
echo ========================================
echo.
pause
