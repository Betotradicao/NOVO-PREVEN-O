#!/bin/bash

#####################################################################
# WRAPPER PARA CLAUDE EXECUTAR INSTALAÇÃO REMOTA
# Uso interno do Claude para deploy em VPS remota
#####################################################################

# Validar argumentos
if [ "$#" -lt 4 ]; then
    echo "Uso: $0 <VPS_IP> <ROOT_PASSWORD> <DOMAIN> <TAILSCALE_KEY>"
    exit 1
fi

VPS_IP=$1
ROOT_PASSWORD=$2
DOMAIN=$3
TAILSCALE_KEY=$4

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   INICIANDO DEPLOY REMOTO PARA NOVO CLIENTE              ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "📍 VPS IP: $VPS_IP"
echo "🌐 Domínio: $DOMAIN"
echo ""

# Instalar sshpass se não existir (para automação de senha SSH)
if ! command -v sshpass &> /dev/null; then
    echo "📦 Instalando sshpass..."
    apt-get update -qq > /dev/null 2>&1
    apt-get install -y -qq sshpass > /dev/null 2>&1
    echo "✅ sshpass instalado"
fi

# Copiar script de instalação para a VPS
echo "📤 Copiando script de instalação para VPS..."
sshpass -p "$ROOT_PASSWORD" scp -o StrictHostKeyChecking=no \
    scripts/install-new-client.sh root@${VPS_IP}:/tmp/install.sh

# Dar permissão de execução
sshpass -p "$ROOT_PASSWORD" ssh -o StrictHostKeyChecking=no \
    root@${VPS_IP} "chmod +x /tmp/install.sh"

echo "✅ Script copiado"
echo ""

# Executar instalação na VPS
echo "🚀 Executando instalação remota..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

sshpass -p "$ROOT_PASSWORD" ssh -o StrictHostKeyChecking=no \
    root@${VPS_IP} "/tmp/install.sh $DOMAIN $TAILSCALE_KEY"

EXIT_CODE=$?

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
    echo ""
    echo "📋 Próximos passos:"
    echo "   1. Acesse: https://$DOMAIN"
    echo "   2. Crie a primeira empresa"
    echo "   3. Configure Tailscale com IP do cliente"
    echo ""
    echo "📄 Informações completas salvas em:"
    echo "   /opt/prevencao-radar/INSTALACAO_INFO.txt (na VPS)"
    echo ""
else
    echo "❌ ERRO durante instalação (código: $EXIT_CODE)"
    echo ""
    echo "🔍 Para investigar, conecte na VPS:"
    echo "   ssh root@$VPS_IP"
    echo "   cat /tmp/install.log"
    exit 1
fi
