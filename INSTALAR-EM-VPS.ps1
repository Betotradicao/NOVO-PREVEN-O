# ============================================
# INSTALADOR AUTOMÁTICO PARA VPS
# Sistema: Prevenção no Radar
# Execute este script no WINDOWS
# ============================================

param(
    [Parameter(Mandatory=$true)]
    [string]$IpVPS,

    [Parameter(Mandatory=$false)]
    [string]$Usuario = "root"
)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║     INSTALADOR AUTOMÁTICO - PREVENÇÃO NO RADAR (VPS)      ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎯 IP da VPS: $IpVPS" -ForegroundColor Green
Write-Host "👤 Usuário: $Usuario" -ForegroundColor Green
Write-Host ""

# Verificar se SCP está disponível
if (!(Get-Command scp -ErrorAction SilentlyContinue)) {
    Write-Host "❌ ERRO: SCP não encontrado!" -ForegroundColor Red
    Write-Host "   Instale o OpenSSH Client no Windows" -ForegroundColor Yellow
    Write-Host "   Configurações > Aplicativos > Recursos Opcionais > OpenSSH Client" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Copiando pasta InstaladorVPS para a VPS..." -ForegroundColor Yellow
Write-Host ""

# Copiar pasta InstaladorVPS para a VPS
$LocalPath = "$PSScriptRoot\InstaladorVPS"
$RemotePath = "${Usuario}@${IpVPS}:/root/"

Write-Host "   Origem: $LocalPath" -ForegroundColor Gray
Write-Host "   Destino: $RemotePath" -ForegroundColor Gray
Write-Host ""

scp -r "$LocalPath" "$RemotePath"

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ ERRO ao copiar arquivos!" -ForegroundColor Red
    Write-Host "   Verifique se você tem acesso SSH à VPS" -ForegroundColor Yellow
    Write-Host "   Teste: ssh ${Usuario}@${IpVPS}" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Arquivos copiados com sucesso!" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Executando instalador na VPS..." -ForegroundColor Yellow
Write-Host ""

# Executar instalador na VPS
$Commands = @"
cd /root/InstaladorVPS
chmod +x INSTALAR-AUTO.sh
./INSTALAR-AUTO.sh
"@

ssh "${Usuario}@${IpVPS}" $Commands

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║            ✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!            ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 ACESSE O SISTEMA:" -ForegroundColor Cyan
Write-Host "   http://${IpVPS}:3000/first-setup" -ForegroundColor White
Write-Host ""
Write-Host "📋 As credenciais foram salvas na VPS em:" -ForegroundColor Cyan
Write-Host "   /root/InstaladorVPS/CREDENCIAIS.txt" -ForegroundColor White
Write-Host ""
Write-Host "💡 Para ver as credenciais, execute:" -ForegroundColor Yellow
Write-Host "   ssh ${Usuario}@${IpVPS} 'cat /root/InstaladorVPS/CREDENCIAIS.txt'" -ForegroundColor White
Write-Host ""
