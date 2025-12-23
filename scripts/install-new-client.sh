#!/bin/bash

#####################################################################
# SCRIPT DE INSTALAÇÃO AUTOMÁTICA - PREVENÇÃO NO RADAR
# Uso: ./install-new-client.sh <DOMINIO> <TAILSCALE_AUTH_KEY>
#####################################################################

set -e  # Para em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função de log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   PREVENÇÃO NO RADAR - INSTALADOR AUTOMÁTICO             ║
║   Instalação Zero para Novo Cliente                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Validar argumentos
if [ "$#" -lt 2 ]; then
    log_error "Uso incorreto!"
    echo ""
    echo "Uso: $0 <DOMINIO> <TAILSCALE_AUTH_KEY>"
    echo ""
    echo "Exemplo:"
    echo "  $0 cliente.prevencao.com.br tskey-auth-xxxxxxxxxxxxx"
    echo ""
    echo "Para obter uma chave Tailscale:"
    echo "  1. Acesse: https://login.tailscale.com/admin/settings/keys"
    echo "  2. Clique em 'Generate auth key'"
    echo "  3. Marque 'Reusable' e 'Ephemeral'"
    echo "  4. Copie a chave gerada"
    exit 1
fi

DOMAIN=$1
TAILSCALE_AUTH_KEY=$2
INSTALL_DIR="/opt/prevencao-radar"

log_info "Domínio: ${DOMAIN}"
log_info "Diretório de instalação: ${INSTALL_DIR}"
echo ""

#####################################################################
# FASE 1: ATUALIZAR SISTEMA E INSTALAR DEPENDÊNCIAS
#####################################################################

log_info "FASE 1/7: Atualizando sistema operacional..."
apt-get update -qq > /dev/null 2>&1
apt-get upgrade -y -qq > /dev/null 2>&1
log_success "Sistema atualizado"

log_info "Instalando dependências essenciais..."
apt-get install -y -qq curl git ufw nginx certbot python3-certbot-nginx > /dev/null 2>&1
log_success "Dependências instaladas"

#####################################################################
# FASE 2: INSTALAR DOCKER E DOCKER COMPOSE
#####################################################################

log_info "FASE 2/7: Instalando Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh > /dev/null 2>&1
    systemctl enable docker > /dev/null 2>&1
    systemctl start docker > /dev/null 2>&1
    log_success "Docker instalado"
else
    log_warning "Docker já estava instalado"
fi

log_info "Instalando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    apt-get install -y -qq docker-compose > /dev/null 2>&1
    log_success "Docker Compose instalado"
else
    log_warning "Docker Compose já estava instalado"
fi

#####################################################################
# FASE 3: INSTALAR E CONFIGURAR TAILSCALE
#####################################################################

log_info "FASE 3/7: Instalando Tailscale..."
if ! command -v tailscale &> /dev/null; then
    curl -fsSL https://tailscale.com/install.sh | sh > /dev/null 2>&1
    log_success "Tailscale instalado"
else
    log_warning "Tailscale já estava instalado"
fi

log_info "Conectando ao Tailscale..."
tailscale up --authkey="${TAILSCALE_AUTH_KEY}" --accept-routes > /dev/null 2>&1
log_success "Tailscale conectado"

log_info "Obtendo IP Tailscale da VPS..."
TAILSCALE_VPS_IP=$(tailscale ip -4)
log_success "IP Tailscale VPS: ${TAILSCALE_VPS_IP}"

#####################################################################
# FASE 4: CLONAR REPOSITÓRIO
#####################################################################

log_info "FASE 4/7: Clonando repositório..."
if [ -d "${INSTALL_DIR}" ]; then
    log_warning "Diretório já existe, fazendo backup..."
    mv "${INSTALL_DIR}" "${INSTALL_DIR}.backup.$(date +%s)"
fi

mkdir -p "${INSTALL_DIR}"
cd "${INSTALL_DIR}"

# Clone do repositório (ALTERAR PARA SEU REPOSITÓRIO)
git clone https://github.com/seu-usuario/prevencao-radar.git . > /dev/null 2>&1
log_success "Repositório clonado"

#####################################################################
# FASE 5: GERAR SENHAS E CRIAR .ENV
#####################################################################

log_info "FASE 5/7: Gerando senhas seguras..."
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
log_success "Senhas geradas"

log_info "Criando arquivo .env..."
cat > "${INSTALL_DIR}/.env" <<EOF
# ============================================
# CONFIGURAÇÃO AUTOMÁTICA - NÃO EDITAR
# Gerado em: $(date)
# ============================================

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=prevencao_user
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=prevencao_db

# Backend
JWT_SECRET=${JWT_SECRET}
PORT=3333
NODE_ENV=production

# URLs
VITE_API_URL=https://api.${DOMAIN}
VITE_FRONTEND_URL=https://${DOMAIN}

# Tailscale (Auto-configurado)
TAILSCALE_VPS_IP=${TAILSCALE_VPS_IP}
EOF

log_success "Arquivo .env criado"

#####################################################################
# FASE 6: DEPLOY COM DOCKER
#####################################################################

log_info "FASE 6/7: Fazendo build e deploy dos containers..."
cd "${INSTALL_DIR}"

log_info "Building containers (isso pode levar alguns minutos)..."
docker-compose build > /dev/null 2>&1
log_success "Build concluído"

log_info "Iniciando containers..."
docker-compose up -d > /dev/null 2>&1
log_success "Containers iniciados"

log_info "Aguardando containers ficarem prontos (30s)..."
sleep 30
log_success "Containers prontos"

#####################################################################
# FASE 7: CONFIGURAR NGINX E SSL
#####################################################################

log_info "FASE 7/7: Configurando Nginx..."

# Configuração Nginx para frontend
cat > /etc/nginx/sites-available/${DOMAIN} <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Configuração Nginx para API
cat > /etc/nginx/sites-available/api.${DOMAIN} <<EOF
server {
    listen 80;
    server_name api.${DOMAIN};

    location / {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Ativar sites
ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/api.${DOMAIN} /etc/nginx/sites-enabled/

# Testar configuração
nginx -t > /dev/null 2>&1
systemctl reload nginx > /dev/null 2>&1
log_success "Nginx configurado"

log_info "Configurando certificados SSL (Let's Encrypt)..."
certbot --nginx -d ${DOMAIN} -d api.${DOMAIN} --non-interactive --agree-tos --register-unsafely-without-email > /dev/null 2>&1
log_success "SSL configurado"

# Ativar renovação automática
systemctl enable certbot.timer > /dev/null 2>&1
log_success "Renovação automática de SSL ativada"

#####################################################################
# FASE 8: CONFIGURAR FIREWALL
#####################################################################

log_info "Configurando firewall..."
ufw --force enable > /dev/null 2>&1
ufw allow ssh > /dev/null 2>&1
ufw allow 'Nginx Full' > /dev/null 2>&1
ufw allow 41641/udp > /dev/null 2>&1  # Tailscale
log_success "Firewall configurado"

#####################################################################
# INSTALAÇÃO COMPLETA!
#####################################################################

echo ""
echo -e "${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              ✓ INSTALAÇÃO CONCLUÍDA COM SUCESSO!         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}📋 INFORMAÇÕES DO SISTEMA INSTALADO${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}🌐 URLs de Acesso:${NC}"
echo -e "   Frontend: ${GREEN}https://${DOMAIN}${NC}"
echo -e "   API:      ${GREEN}https://api.${DOMAIN}${NC}"
echo ""
echo -e "${YELLOW}🔐 Credenciais do Banco de Dados:${NC}"
echo -e "   Usuário:  ${GREEN}prevencao_user${NC}"
echo -e "   Senha:    ${GREEN}${DB_PASSWORD}${NC}"
echo -e "   Database: ${GREEN}prevencao_db${NC}"
echo ""
echo -e "${YELLOW}🔑 JWT Secret:${NC}"
echo -e "   ${GREEN}${JWT_SECRET}${NC}"
echo ""
echo -e "${YELLOW}🌐 Tailscale VPS:${NC}"
echo -e "   IP da VPS: ${GREEN}${TAILSCALE_VPS_IP}${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}📝 PRÓXIMOS PASSOS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "1. ${YELLOW}Instalar Tailscale no PC/Servidor do Cliente${NC}"
echo -e "   curl -fsSL https://tailscale.com/install.sh | sh"
echo -e "   tailscale up"
echo -e "   tailscale ip -4  ${GREEN}# Copie este IP${NC}"
echo ""
echo -e "2. ${YELLOW}Acessar sistema:${NC} https://${DOMAIN}"
echo ""
echo -e "3. ${YELLOW}Primeira vez: Criar Empresa${NC}"
echo ""
echo -e "4. ${YELLOW}Configurar Tailscale no sistema:${NC}"
echo -e "   Menu: Configurações de Rede → Tailscale"
echo -e "   IP VPS:     ${GREEN}${TAILSCALE_VPS_IP}${NC}"
echo -e "   IP Cliente: ${YELLOW}[IP obtido no passo 1]${NC}"
echo ""
echo -e "5. ${YELLOW}Configurar DVR:${NC}"
echo -e "   Menu: Configurações de Rede → APIs"
echo -e "   IP DVR: 10.6.1.123"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Salvar informações em arquivo
cat > "${INSTALL_DIR}/INSTALACAO_INFO.txt" <<EOF
INFORMAÇÕES DA INSTALAÇÃO
========================

Data de Instalação: $(date)
Domínio: ${DOMAIN}

URLs:
- Frontend: https://${DOMAIN}
- API: https://api.${DOMAIN}

Banco de Dados:
- Host: postgres
- Usuário: prevencao_user
- Senha: ${DB_PASSWORD}
- Database: prevencao_db

JWT Secret: ${JWT_SECRET}

Tailscale:
- IP VPS: ${TAILSCALE_VPS_IP}

Diretório de Instalação: ${INSTALL_DIR}

Status dos Containers:
$(docker-compose ps)
EOF

log_success "Informações salvas em: ${INSTALL_DIR}/INSTALACAO_INFO.txt"
echo ""

# Mostrar status dos containers
log_info "Status dos containers:"
docker-compose ps

echo ""
log_success "Sistema pronto para uso! 🚀"
echo ""
