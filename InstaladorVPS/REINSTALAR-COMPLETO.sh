#!/bin/bash

###############################################################################
# Script de Reinstalação Completa
# Remove TUDO e reinstala automaticamente do zero
# Versão ALL-IN-ONE: Limpa + Instala em um único comando
###############################################################################

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${RED}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           ⚠️  REINSTALAÇÃO COMPLETA DO ZERO                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}Este script irá:${NC}"
echo "  1️⃣  Parar e remover todos os containers"
echo "  2️⃣  Apagar todos os volumes (banco, MinIO, uploads)"
echo "  3️⃣  Limpar imagens Docker antigas"
echo "  4️⃣  Atualizar código do GitHub"
echo "  5️⃣  Instalar tudo do zero novamente"
echo ""
echo -e "${RED}⚠️  TODOS OS DADOS ATUAIS SERÃO PERDIDOS!${NC}"
echo ""
read -p "Tem certeza que deseja continuar? (digite 'SIM' para confirmar): " confirmacao

if [ "$confirmacao" != "SIM" ]; then
    echo -e "${YELLOW}Operação cancelada pelo usuário.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    ETAPA 1: LIMPEZA TOTAL                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. Parar e remover containers
echo -e "${YELLOW}[1/6] Parando containers...${NC}"
cd ~/NOVO-PREVEN-O/InstaladorVPS
docker compose -f docker-compose-producao.yml down 2>/dev/null || true
echo -e "${GREEN}✅ Containers parados${NC}"

# 2. Remover volumes
echo -e "${YELLOW}[2/6] Removendo volumes...${NC}"
docker volume rm instaladorvps_postgres-data 2>/dev/null || true
docker volume rm instaladorvps_minio-data 2>/dev/null || true
docker volume rm instaladorvps_backend-uploads 2>/dev/null || true
echo -e "${GREEN}✅ Volumes removidos${NC}"

# 3. Remover imagens do projeto
echo -e "${YELLOW}[3/6] Removendo imagens Docker...${NC}"
docker rmi instaladorvps-backend 2>/dev/null || true
docker rmi instaladorvps-frontend 2>/dev/null || true
docker rmi instaladorvps-cron 2>/dev/null || true
echo -e "${GREEN}✅ Imagens removidas${NC}"

# 4. Limpar cache
echo -e "${YELLOW}[4/6] Limpando cache do Docker...${NC}"
docker system prune -f 2>/dev/null || true
echo -e "${GREEN}✅ Cache limpo${NC}"

# 5. Remover .env e credenciais
echo -e "${YELLOW}[5/6] Removendo configurações antigas...${NC}"
rm -f ~/NOVO-PREVEN-O/InstaladorVPS/.env
rm -f ~/NOVO-PREVEN-O/InstaladorVPS/CREDENCIAIS.txt
echo -e "${GREEN}✅ Configurações removidas${NC}"

# 6. Atualizar código
echo -e "${YELLOW}[6/6] Atualizando código do GitHub...${NC}"
cd ~/NOVO-PREVEN-O
git pull origin main
echo -e "${GREEN}✅ Código atualizado${NC}"

echo ""
echo -e "${GREEN}✅ Limpeza concluída!${NC}"
echo ""

# Aguardar 2 segundos
sleep 2

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                 ETAPA 2: INSTALAÇÃO COMPLETA                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Executar instalação
cd ~/NOVO-PREVEN-O/InstaladorVPS
chmod +x INSTALAR-AUTO.sh
./INSTALAR-AUTO.sh

echo ""
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║            ✅ REINSTALAÇÃO COMPLETA FINALIZADA!                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
