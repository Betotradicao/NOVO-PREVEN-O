# 📦 Scripts de Instalação - Prevenção no Radar

Scripts automatizados para instalação e deploy do sistema em novas VPS.

---

## 🎯 Para que serve?

Permite instalar o sistema **COMPLETO** em uma VPS zerada em **menos de 20 minutos**, incluindo:

- ✅ Docker e Docker Compose
- ✅ PostgreSQL (com senhas aleatórias)
- ✅ Backend (Node.js + TypeScript)
- ✅ Frontend (React + Vite)
- ✅ Nginx com SSL automático (Let's Encrypt)
- ✅ **Tailscale configurado automaticamente**
- ✅ Firewall configurado
- ✅ Sistema pronto para usar

---

## 🚀 MODO DE USO RÁPIDO

### Comando para o Claude:

```
Claude, instale o sistema para um novo cliente.

Dados:
- VPS IP: 45.76.123.45
- Senha root: SenhaForte123!
- Domínio: cliente.prevencao.com.br
- Tailscale Key: tskey-auth-kXxXxXxXxXxXx-xxxxxxxxx

Execute: bash scripts/deploy-client.sh 45.76.123.45 "SenhaForte123!" cliente.prevencao.com.br tskey-auth-kXxXxXxXxXxXx-xxxxxxxxx
```

**PRONTO!** O Claude executa tudo automaticamente e te retorna:
- URLs do sistema
- Senhas geradas
- **IP Tailscale da VPS**
- Próximos passos

---

## 📋 Pré-requisitos

### 1. VPS Nova
- Ubuntu 20.04+ ou Debian 11+
- Mínimo 2GB RAM
- Acesso root via SSH
- Porta 22 aberta

### 2. Domínio Configurado
Configure no seu DNS:
```
A     cliente.prevencao.com.br     →  IP_DA_VPS
A     api.cliente.prevencao.com.br →  IP_DA_VPS
```

### 3. Chave Tailscale

**Obter chave:**
1. Acesse: https://login.tailscale.com/admin/settings/keys
2. Clique em **"Generate auth key"**
3. Marque:
   - ✅ **Reusable** (pode usar múltiplas vezes)
   - ✅ **Ephemeral** (remove ao desconectar)
   - ⏰ Expiração: 90 dias
4. Copie a chave (formato: `tskey-auth-...`)

---

## 📁 Arquivos

### `install-new-client.sh`
Script principal que roda **DENTRO DA VPS**.

**O que faz:**
- Instala todas dependências
- Configura Tailscale e obtém IP automaticamente
- Cria banco de dados com senha aleatória
- Faz deploy completo do sistema
- Configura SSL

### `deploy-client.sh`
Script wrapper para execução **REMOTA**.

**O que faz:**
- Conecta na VPS via SSH
- Copia `install-new-client.sh` para a VPS
- Executa instalação remotamente
- Retorna resultado

### `COMO_USAR_INSTALACAO.md`
Documentação completa com:
- Passo a passo detalhado
- Troubleshooting
- Checklist
- Comandos úteis

---

## 🎬 Fluxo de Instalação

```
┌─────────────────────────────────────────────────────────┐
│  1. Você passa dados para o Claude                     │
│     - IP VPS                                            │
│     - Senha root                                        │
│     - Domínio                                           │
│     - Chave Tailscale                                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  2. Claude executa deploy-client.sh                     │
│     - Conecta na VPS via SSH                            │
│     - Copia script de instalação                        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  3. Script install-new-client.sh roda na VPS            │
│     ✅ Instala Docker                                   │
│     ✅ Instala Tailscale                                │
│     ✅ Conecta Tailscale (obtém IP automaticamente)     │
│     ✅ Clona repositório                                │
│     ✅ Gera senhas aleatórias                           │
│     ✅ Deploy com Docker Compose                        │
│     ✅ Configura Nginx + SSL                            │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  4. Sistema instalado e rodando!                        │
│     🌐 Frontend: https://cliente.prevencao.com.br       │
│     🌐 API: https://api.cliente.prevencao.com.br        │
│     🔐 Credenciais geradas automaticamente              │
│     📡 IP Tailscale VPS detectado                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Uso Manual (sem Claude)

Se preferir executar manualmente:

### 1. Conectar na VPS
```bash
ssh root@IP_DA_VPS
```

### 2. Baixar script
```bash
curl -sSL https://raw.githubusercontent.com/seu-repo/prevencao-radar/main/scripts/install-new-client.sh -o install.sh
chmod +x install.sh
```

### 3. Executar
```bash
./install.sh cliente.prevencao.com.br tskey-auth-XXXXXXXXX
```

---

## 📊 Output da Instalação

O script retorna todas informações necessárias:

```
╔═══════════════════════════════════════════════════════════╗
║              ✓ INSTALAÇÃO CONCLUÍDA COM SUCESSO!         ║
╚═══════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════
📋 INFORMAÇÕES DO SISTEMA INSTALADO
═══════════════════════════════════════════════════════════

🌐 URLs de Acesso:
   Frontend: https://cliente.prevencao.com.br
   API:      https://api.cliente.prevencao.com.br

🔐 Credenciais do Banco de Dados:
   Usuário:  prevencao_user
   Senha:    Xs7K2mP9vL4nQ1wR8tY3...
   Database: prevencao_db

🔑 JWT Secret:
   hG9jF2kL5pN8vM1wQ4xR7...

🌐 Tailscale VPS:
   IP da VPS: 100.64.0.15

═══════════════════════════════════════════════════════════
📝 PRÓXIMOS PASSOS
═══════════════════════════════════════════════════════════

1. Instalar Tailscale no PC/Servidor do Cliente
2. Acessar sistema: https://cliente.prevencao.com.br
3. Primeira vez: Criar Empresa
4. Configurar Tailscale no sistema
5. Configurar DVR
```

Todas essas informações também são salvas em:
`/opt/prevencao-radar/INSTALACAO_INFO.txt`

---

## 🔍 Verificar Instalação

Após instalação, você pode verificar:

```bash
# Status dos containers
cd /opt/prevencao-radar
docker-compose ps

# Logs em tempo real
docker-compose logs -f

# Ver IP Tailscale
tailscale ip -4

# Testar frontend
curl https://cliente.prevencao.com.br

# Testar API
curl https://api.cliente.prevencao.com.br/health
```

---

## 📝 Configuração Pós-Instalação

### 1. No PC/Servidor do Cliente

```bash
# Instalar Tailscale
curl -fsSL https://tailscale.com/install.sh | sh

# Conectar
tailscale up

# Obter IP (IMPORTANTE: copie este IP!)
tailscale ip -4
```

### 2. No Sistema Web

1. Acesse: `https://cliente.prevencao.com.br`
2. **Criar Empresa** (tela inicial)
3. **Menu: Configurações de Rede → Tailscale**
   - IP VPS: `100.64.0.15` (fornecido na instalação)
   - IP Cliente: `100.64.0.XX` (obtido no passo 1 acima)
   - Clicar em **"Salvar Configuração"**
   - Clicar em **"Testar Conectividade"**
4. **Menu: Configurações de Rede → APIs**
   - IP DVR: `10.6.1.123`
   - Usuário DVR: `admin`
   - Senha DVR: `[senha do cliente]`

---

## 🆘 Troubleshooting

### SSL falhou
```bash
certbot --nginx -d cliente.prevencao.com.br -d api.cliente.prevencao.com.br --force-renewal
```

### Container não sobe
```bash
cd /opt/prevencao-radar
docker-compose down
docker-compose up -d --build
docker-compose logs -f
```

### Tailscale não conecta
```bash
tailscale down
tailscale up --authkey=NOVA_CHAVE
tailscale status
```

### Banco de dados travado
```bash
docker-compose restart postgres
docker-compose logs postgres
```

---

## 🔐 Segurança

O script implementa:
- ✅ Senhas aleatórias de 32+ caracteres
- ✅ Firewall configurado (UFW)
- ✅ SSL/HTTPS obrigatório
- ✅ Tailscale VPN (criptografia end-to-end)
- ✅ Containers isolados (Docker networks)
- ✅ Renovação automática de certificados

---

## 📞 Suporte

Em caso de problemas:

1. **Ver logs completos:**
   ```bash
   cd /opt/prevencao-radar
   docker-compose logs --tail=100
   ```

2. **Informar ao Claude:**
   - IP da VPS
   - Domínio usado
   - Mensagem de erro completa
   - Output de `docker-compose ps`

---

## ⚡ Performance

**Tempo de instalação:**
- VPS básica (2GB RAM): ~15 minutos
- VPS potente (4GB+ RAM): ~10 minutos

**Recursos utilizados:**
- Disco: ~5GB após instalação
- RAM: ~1.5GB em uso normal
- CPU: Baixo (<10% idle)

---

## 🎯 Checklist Rápido

Antes de iniciar:
- [ ] VPS criada e acessível
- [ ] Domínio configurado no DNS
- [ ] Chave Tailscale gerada
- [ ] Senha root da VPS em mãos

Durante instalação:
- [ ] Script executado sem erros
- [ ] Todos containers rodando
- [ ] SSL configurado
- [ ] IP Tailscale obtido

Após instalação:
- [ ] Sistema acessível via browser
- [ ] Empresa criada
- [ ] Tailscale instalado no cliente
- [ ] Tailscale configurado no sistema
- [ ] DVR configurado e testado

---

**Desenvolvido para automação total via Claude Code** 🤖
