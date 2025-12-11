@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: ═══════════════════════════════════════════════════════════════════════════
::  INSTALADOR AUTOMÁTICO - Market Security System (Instalação Interna)
:: ═══════════════════════════════════════════════════════════════════════════

title Instalador Market Security System

echo.
echo ═══════════════════════════════════════════════════════════════════════════
echo   INSTALADOR MARKET SECURITY SYSTEM - Instalação Interna
echo ═══════════════════════════════════════════════════════════════════════════
echo.

:: Verificar privilégios de administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERRO] Este script precisa ser executado como Administrador!
    echo.
    echo Clique com botão direito e selecione "Executar como Administrador"
    echo.
    pause
    exit /b 1
)

:: ═══════════════════════════════════════════════════════════════════════════
:: PASSO 1: Verificar Node.js
:: ═══════════════════════════════════════════════════════════════════════════
echo [1/7] Verificando Node.js...
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERRO] Node.js não encontrado!
    echo.
    echo Por favor, instale Node.js 18+ de: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js encontrado: %NODE_VERSION%

:: ═══════════════════════════════════════════════════════════════════════════
:: PASSO 2: Instalar PM2 globalmente
:: ═══════════════════════════════════════════════════════════════════════════
echo.
echo [2/7] Instalando PM2 (gerenciador de processos)...
where pm2 >nul 2>&1
if %errorLevel% neq 0 (
    echo Instalando PM2...
    call npm install -g pm2
    if %errorLevel% neq 0 (
        echo [ERRO] Falha ao instalar PM2
        pause
        exit /b 1
    )
)
echo ✓ PM2 instalado

:: ═══════════════════════════════════════════════════════════════════════════
:: PASSO 3: Instalar dependências do projeto
:: ═══════════════════════════════════════════════════════════════════════════
echo.
echo [3/7] Instalando dependências do projeto...

cd "%~dp0.."

:: Raiz
echo Instalando dependências da raiz...
call npm install
if %errorLevel% neq 0 (
    echo [AVISO] Erro ao instalar dependências da raiz
)

:: Backend
echo Instalando dependências do backend...
cd packages\backend
call npm install
if %errorLevel% neq 0 (
    echo [ERRO] Falha ao instalar dependências do backend
    pause
    exit /b 1
)

:: Frontend
echo Instalando dependências do frontend...
cd ..\frontend
call npm install
if %errorLevel% neq 0 (
    echo [ERRO] Falha ao instalar dependências do frontend
    pause
    exit /b 1
)

cd "%~dp0.."
echo ✓ Dependências instaladas

:: ═══════════════════════════════════════════════════════════════════════════
:: PASSO 4: Configurar variáveis de ambiente
:: ═══════════════════════════════════════════════════════════════════════════
echo.
echo [4/7] Configurando variáveis de ambiente...

if not exist "packages\backend\.env" (
    if exist "packages\backend\.env.example" (
        echo Criando .env a partir do .env.example...
        copy "packages\backend\.env.example" "packages\backend\.env" >nul
        echo.
        echo [IMPORTANTE] Configure o arquivo packages\backend\.env com suas credenciais!
        echo.
    ) else (
        echo [AVISO] Arquivo .env.example não encontrado
    )
) else (
    echo ✓ Arquivo .env já existe
)

:: ═══════════════════════════════════════════════════════════════════════════
:: PASSO 5: Configurar PM2 com ecosystem.config.js
:: ═══════════════════════════════════════════════════════════════════════════
echo.
echo [5/7] Configurando PM2...

cd "%~dp0.."

if exist "ecosystem.config.js" (
    echo Iniciando processos com PM2...
    call pm2 start ecosystem.config.js
    if %errorLevel% neq 0 (
        echo [AVISO] Erro ao iniciar PM2, mas continuando...
    ) else (
        echo ✓ Processos iniciados com PM2
    )
) else (
    echo [AVISO] ecosystem.config.js não encontrado
)

:: Salvar configuração do PM2
call pm2 save
echo ✓ Configuração PM2 salva

:: ═══════════════════════════════════════════════════════════════════════════
:: PASSO 6: Configurar auto-start invisível
:: ═══════════════════════════════════════════════════════════════════════════
echo.
echo [6/7] Configurando auto-start invisível...

cd "%~dp0"

:: Adicionar registro do Windows para auto-start
if exist "adicionar-autostart.reg" (
    echo Configurando auto-start no registro do Windows...
    reg import "adicionar-autostart.reg" >nul 2>&1
    if %errorLevel% equ 0 (
        echo ✓ Auto-start configurado
    ) else (
        echo [AVISO] Erro ao configurar auto-start via registro
    )
)

:: ═══════════════════════════════════════════════════════════════════════════
:: PASSO 7: Configurar PM2 startup
:: ═══════════════════════════════════════════════════════════════════════════
echo.
echo [7/7] Configurando PM2 startup...
call pm2 startup
echo.
echo IMPORTANTE: Execute o comando acima que o PM2 sugeriu (se houver)
echo.

:: ═══════════════════════════════════════════════════════════════════════════
:: FINALIZAÇÃO
:: ═══════════════════════════════════════════════════════════════════════════
echo.
echo ═══════════════════════════════════════════════════════════════════════════
echo   ✓ INSTALAÇÃO CONCLUÍDA COM SUCESSO!
echo ═══════════════════════════════════════════════════════════════════════════
echo.
echo Sistema instalado e configurado!
echo.
echo 🌐 ACESSOS:
echo    Frontend: http://localhost:3004
echo    Backend:  http://localhost:3001
echo.
echo 🔧 GERENCIAR PROCESSOS:
echo    Ver status:   pm2 list
echo    Ver logs:     pm2 logs
echo    Parar tudo:   pm2 stop all
echo    Reiniciar:    pm2 restart all
echo.
echo 🔄 AUTO-START:
echo    O sistema iniciará automaticamente com o Windows
echo    Script: startup-invisible.ps1
echo.
echo 📁 PRÓXIMOS PASSOS:
echo    1. Configure o arquivo packages\backend\.env
echo    2. Configure o arquivo InstaladorINTERNO\ngrok.yml (se usar Ngrok)
echo    3. Reinicie o Windows para testar o auto-start
echo.
echo ═══════════════════════════════════════════════════════════════════════════
echo.

pause
