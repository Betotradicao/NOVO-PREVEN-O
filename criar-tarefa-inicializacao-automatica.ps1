# Script para iniciar o sistema automaticamente após reinicialização do Windows
# Executa INICIAR-TUDO.bat quando o Windows iniciar

$taskName = "Prevencao-Radar-AutoStart"
$scriptPath = "C:\Users\Administrator\Desktop\roberto-prevencao-no-radar-main"
$batFile = "$scriptPath\INICIAR-TUDO.bat"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURANDO INICIALIZACAO AUTOMATICA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o arquivo existe
if (-not (Test-Path $batFile)) {
    Write-Host "ERRO: Arquivo INICIAR-TUDO.bat nao encontrado!" -ForegroundColor Red
    Write-Host "Caminho esperado: $batFile" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Pressione ENTER para sair"
    exit 1
}

Write-Host "Arquivo encontrado: INICIAR-TUDO.bat" -ForegroundColor Green
Write-Host ""

# Remove tarefa se já existir
Write-Host "Removendo tarefa antiga (se existir)..." -ForegroundColor Yellow
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

# Criar XML da tarefa
$xml = @"
<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.4" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Description>Inicia automaticamente o sistema Prevencao no Radar apos reinicializacao do Windows</Description>
    <Author>$env:USERNAME</Author>
  </RegistrationInfo>
  <Triggers>
    <BootTrigger>
      <Enabled>true</Enabled>
      <Delay>PT30S</Delay>
    </BootTrigger>
  </Triggers>
  <Principals>
    <Principal id="Author">
      <UserId>$env:USERDOMAIN\$env:USERNAME</UserId>
      <LogonType>InteractiveToken</LogonType>
      <RunLevel>HighestAvailable</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <AllowHardTerminate>false</AllowHardTerminate>
    <StartWhenAvailable>true</StartWhenAvailable>
    <RunOnlyIfNetworkAvailable>false</RunOnlyIfNetworkAvailable>
    <IdleSettings>
      <StopOnIdleEnd>false</StopOnIdleEnd>
      <RestartOnIdle>false</RestartOnIdle>
    </IdleSettings>
    <AllowStartOnDemand>true</AllowStartOnDemand>
    <Enabled>true</Enabled>
    <Hidden>false</Hidden>
    <RunOnlyIfIdle>false</RunOnlyIfIdle>
    <WakeToRun>false</WakeToRun>
    <ExecutionTimeLimit>PT0S</ExecutionTimeLimit>
    <Priority>7</Priority>
  </Settings>
  <Actions Context="Author">
    <Exec>
      <Command>cmd.exe</Command>
      <Arguments>/c "$batFile"</Arguments>
      <WorkingDirectory>$scriptPath</WorkingDirectory>
    </Exec>
  </Actions>
</Task>
"@

# Salvar XML temporário
$tempXml = "$env:TEMP\prevencao-autostart.xml"
$xml | Out-File -FilePath $tempXml -Encoding unicode

Write-Host "Criando tarefa de inicializacao..." -ForegroundColor Yellow

# Registrar tarefa usando XML
schtasks /create /tn "$taskName" /xml "$tempXml" /f | Out-Null

# Remover arquivo temporário
Remove-Item $tempXml -ErrorAction SilentlyContinue

# Verificar se funcionou
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  SUCESSO!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Configuracao:" -ForegroundColor Cyan
    Write-Host "  Nome da tarefa: $taskName" -ForegroundColor White
    Write-Host "  Executa: INICIAR-TUDO.bat" -ForegroundColor White
    Write-Host "  Quando: 30 segundos apos o Windows iniciar" -ForegroundColor White
    Write-Host ""
    Write-Host "O que acontece agora:" -ForegroundColor Cyan
    Write-Host "  1. Windows reinicia" -ForegroundColor White
    Write-Host "  2. Aguarda 30 segundos" -ForegroundColor White
    Write-Host "  3. Executa INICIAR-TUDO.bat automaticamente" -ForegroundColor White
    Write-Host "  4. Todo o sistema sobe - backend, frontend, MinIO" -ForegroundColor White
    Write-Host ""
    Write-Host "Sistema vai iniciar automaticamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para testar, reinicie o computador." -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ERRO AO CRIAR TAREFA" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possíveis causas:" -ForegroundColor Yellow
    Write-Host "1. Execute este script como Administrador" -ForegroundColor White
    Write-Host "2. Verifique se o caminho esta correto" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "Comandos uteis:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ver tarefa:" -ForegroundColor White
Write-Host "  schtasks /query /tn $taskName /v" -ForegroundColor Gray
Write-Host ""
Write-Host "Executar manualmente:" -ForegroundColor White
Write-Host "  schtasks /run /tn $taskName" -ForegroundColor Gray
Write-Host ""
Write-Host "Desabilitar:" -ForegroundColor White
Write-Host "  schtasks /change /tn $taskName /disable" -ForegroundColor Gray
Write-Host ""
Write-Host "Habilitar:" -ForegroundColor White
Write-Host "  schtasks /change /tn $taskName /enable" -ForegroundColor Gray
Write-Host ""
Write-Host "Remover:" -ForegroundColor White
Write-Host "  schtasks /delete /tn $taskName /f" -ForegroundColor Gray
Write-Host ""
