#!/bin/bash

# ============================================
# SCRIPT DE SINCRONIZAÇÃO AUTOMÁTICA DO IP TAILSCALE
# Monitora o Tailscale e salva o IP no banco automaticamente
# ============================================

echo "🔄 Iniciando monitoramento do IP Tailscale..."

# Aguardar até 60 segundos para o Tailscale gerar o IP
MAX_ATTEMPTS=12
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    # Tentar obter o IP do Tailscale
    TAILSCALE_IP=$(tailscale ip -4 2>/dev/null || echo "")

    if [ -n "$TAILSCALE_IP" ]; then
        echo "✅ IP Tailscale detectado: $TAILSCALE_IP"

        # Aguardar containers estarem prontos
        sleep 10

        # Salvar no banco de dados
        echo "💾 Salvando IP no banco de dados..."
        docker exec prevencao-postgres-prod psql -U postgres -d prevencao_db -c "
        INSERT INTO configurations (key, value, encrypted, created_at, updated_at)
        VALUES ('tailscale_vps_ip', '$TAILSCALE_IP', false, NOW(), NOW())
        ON CONFLICT (key) DO UPDATE SET value = '$TAILSCALE_IP', updated_at = NOW();
        " 2>/dev/null

        if [ $? -eq 0 ]; then
            echo "✅ IP Tailscale salvo com sucesso no banco!"
            echo "📍 IP: $TAILSCALE_IP"
            exit 0
        else
            echo "⚠️  Erro ao salvar no banco. Tentando novamente em 5s..."
            sleep 5
        fi
    else
        echo "⏳ Aguardando IP Tailscale... (tentativa $((ATTEMPT+1))/$MAX_ATTEMPTS)"
        sleep 5
        ATTEMPT=$((ATTEMPT+1))
    fi
done

echo "⚠️  Timeout: IP Tailscale não foi detectado após 60 segundos"
echo "ℹ️  O IP pode ser configurado manualmente pela interface web"
exit 1
