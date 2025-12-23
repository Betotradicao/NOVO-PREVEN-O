# 🚀 COMO INSTALAR PARA NOVO CLIENTE

## 📋 Pré-requisitos

Você precisa ter:

1. **VPS nova** com Ubuntu/Debian
2. **Domínio configurado** apontando para o IP da VPS
3. **Chave Tailscale** (veja como gerar abaixo)

---

## 🔑 PASSO 1: Obter Chave Tailscale

### Opção A: Via Interface Web (Mais Fácil)

1. Acesse: https://login.tailscale.com/admin/settings/keys
2. Clique em **"Generate auth key"**
3. Configure:
   - ✅ Marque **"Reusable"** (pode ser usada várias vezes)
   - ✅ Marque **"Ephemeral"** (será removida quando dispositivo desconectar)
   - ⏰ Expiração: 90 dias (recomendado)
4. Clique em **"Generate key"**
5. Copie a chave (começa com `tskey-auth-`)

### Opção B: Via CLI (Se já tem Tailscale instalado)

```bash
tailscale up --authkey=$(tailscale admin auth-keys create --reusable --ephemeral)
```

---

## 🤖 PASSO 2: Comando para Claude

Copie e cole este comando para o Claude:

```
Claude, instale o sistema para um novo cliente usando o script de instalação automática.

Dados do cliente:
- VPS IP: [COLE O IP AQUI]
- Senha root: [COLE A SENHA AQUI]
- Domínio: [exemplo: cliente.prevencao.com.br]
- Tailscale Auth Key: [COLE A CHAVE AQUI]

Execute: scripts/install-new-client.sh
```

### Exemplo Real:

```
Claude, instale o sistema para um novo cliente usando o script de instalação automática.

Dados do cliente:
- VPS IP: 45.76.123.45
- Senha root: SenhaForte123!
- Domínio: tradicaosjc.prevencao.com.br
- Tailscale Auth Key: tskey-auth-kXxXxXxXxXxXxXxXx-xxxxxxxxxxxxxxxxx

Execute: scripts/install-new-client.sh
```

---

## ⚡ O QUE O SCRIPT FAZ AUTOMATICAMENTE

O script faz TUDO sozinho:

### ✅ Instalação e Configuração
- [x] Atualiza sistema operacional
- [x] Instala Docker e Docker Compose
- [x] Instala e configura Tailscale
- [x] Obtém IP Tailscale da VPS automaticamente
- [x] Clona repositório do projeto
- [x] Gera senhas seguras aleatórias
- [x] Cria arquivo .env com todas configurações
- [x] Faz build dos containers Docker
- [x] Sobe todos os serviços

### ✅ Infraestrutura
- [x] Configura Nginx
- [x] Instala certificado SSL (Let's Encrypt)
- [x] Configura firewall (UFW)
- [x] Ativa renovação automática de SSL

### ✅ Informações Geradas

O script retorna automaticamente:
- 🌐 URL do frontend (https://cliente.prevencao.com.br)
- 🌐 URL da API (https://api.cliente.prevencao.com.br)
- 🔐 Senha do banco de dados
- 🔑 JWT Secret
- 🌐 **IP Tailscale da VPS** (automaticamente detectado)
- 📄 Arquivo com todas as informações (`INSTALACAO_INFO.txt`)

---

## 📝 APÓS INSTALAÇÃO

### Passo 1: Instalar Tailscale no Cliente

No PC/Servidor do cliente, execute:

```bash
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up
tailscale ip -4  # Copie este IP!
```

### Passo 2: Acessar Sistema

Acesse: `https://cliente.prevencao.com.br`

### Passo 3: Criar Empresa (Primeira vez)

O sistema abre direto na tela de **"Criar Empresa"**

### Passo 4: Configurar Tailscale

1. Menu: **Configurações de Rede → Tailscale**
2. Preencher:
   - **IP VPS**: (foi fornecido no output da instalação)
   - **IP Cliente**: (obtido no Passo 1 acima)
3. Clicar em **"Salvar Configuração"**
4. Clicar em **"Testar Conectividade Agora"**

### Passo 5: Configurar DVR

1. Menu: **Configurações de Rede → APIs**
2. Preencher:
   - **IP DVR**: `10.6.1.123`
   - **Usuário**: `admin`
   - **Senha**: (senha do DVR do cliente)

### Passo 6: Configurar APIs Externas (Opcional)

Se o cliente usar:
- **Intelbras**: Configurar token
- **Outros**: Configurar conforme necessário

---

## 🔍 VERIFICAR STATUS

Após instalação, você pode verificar:

```bash
# Conectar na VPS
ssh root@IP_DA_VPS

# Ver containers rodando
cd /opt/prevencao-radar
docker-compose ps

# Ver logs
docker-compose logs -f

# Ver IP Tailscale
tailscale ip -4

# Ver informações da instalação
cat /opt/prevencao-radar/INSTALACAO_INFO.txt
```

---

## 🆘 TROUBLESHOOTING

### Problema: SSL não funcionou
```bash
# Retentar certificado SSL
certbot --nginx -d cliente.prevencao.com.br -d api.cliente.prevencao.com.br --force-renewal
```

### Problema: Container não sobe
```bash
cd /opt/prevencao-radar
docker-compose down
docker-compose up -d --build
docker-compose logs -f
```

### Problema: Tailscale não conectou
```bash
tailscale up --authkey=NOVA_CHAVE
tailscale status
```

---

## 📞 SUPORTE

Se houver qualquer problema, informe o Claude com:
- IP da VPS
- Mensagem de erro completa
- Output do comando: `docker-compose logs`

---

## 🎯 CHECKLIST RÁPIDO

- [ ] VPS criada e acessível
- [ ] Domínio apontando para IP da VPS
- [ ] Chave Tailscale gerada
- [ ] Script executado via Claude
- [ ] Sistema acessível via browser
- [ ] Empresa criada
- [ ] Tailscale configurado no cliente
- [ ] Tailscale configurado no sistema
- [ ] DVR configurado
- [ ] Teste de conectividade OK

---

**Tempo total estimado:** 15-20 minutos ⚡
