# 🚀 COMO INSTALAR PARA NOVO CLIENTE - GUIA COMPLETO

## ⚡ TL;DR (Versão Super Rápida)

```
Você fala para o Claude:
"Claude, instale o sistema para um novo cliente SEM Tailscale.
VPS IP: 123.45.67.89
Senha root: SuaSenhaAqui"

Eu instalo TUDO em ~15 minutos automaticamente!

Depois você acessa: http://123.45.67.89:3000/first-setup
```

---

## 📋 O Que Você Precisa

1. **VPS nova** com Ubuntu/Debian 20.04+
2. **Acesso root via SSH** (IP + senha)
3. **Domínio** (opcional - pode usar apenas IP)
4. **Chave Tailscale** (opcional - pode instalar sem e configurar depois)

---

## ⚡ INSTALAÇÃO RÁPIDA (Sem Tailscale - Recomendado)

Se você quer testar primeiro SEM Tailscale, é ainda mais simples:

### Passo 1: Me passe apenas 2 informações

```
Claude, instale o sistema para um novo cliente SEM Tailscale.

VPS IP: 123.45.67.89
Senha root: SuaSenhaAqui123
```

**PRONTO!** Eu instalo tudo e você configura o Tailscale depois dentro do sistema.

---

## 🔐 INSTALAÇÃO COMPLETA (Com Tailscale)

Se você quer já deixar o Tailscale configurado na instalação:

### Passo 1: Gerar Chave Tailscale

**Via Interface Web (Mais Fácil):**

1. Acesse: https://login.tailscale.com/admin/settings/keys
2. Clique em **"Generate auth key"**
3. Configure:
   - ✅ Marque **"Reusable"** (pode ser usada várias vezes)
   - ✅ Marque **"Ephemeral"** (opcional)
   - ⏰ Expiração: 90 dias
4. Clique em **"Generate key"**
5. Copie a chave (formato: `tskey-auth-xxxxx...`)

**Via CLI (Se já tem Tailscale):**
```bash
tailscale up --authkey=$(tailscale admin auth-keys create --reusable --ephemeral)
```

---

### Passo 2: Me passe as informações

```
Claude, instale o sistema para um novo cliente COM Tailscale.

VPS IP: 123.45.67.89
Senha root: SuaSenhaAqui123
Tailscale Key: tskey-auth-kXxXxXxXxXxXxXxXx-xxxxxxxxxxxxxxxxx
```

---

## 📝 EXEMPLOS PRÁTICOS

### Exemplo 1: Instalação SEM Tailscale (Mais Rápido)

```
Claude, instale o sistema para um novo cliente SEM Tailscale.

VPS IP: 46.202.150.64
Senha root: Beto3107@@##
```

**Resultado:** Sistema instalado em ~15 minutos, você configura Tailscale depois.

### Exemplo 2: Instalação COM Tailscale (Completo)

```
Claude, instale o sistema para um novo cliente COM Tailscale.

VPS IP: 45.76.123.45
Senha root: SenhaForte123!
Tailscale Key: tskey-auth-kX8fN2mP9vL4nQ1wR8tY3zK7H6-xxxxxxxxx
```

**Resultado:** Sistema instalado com Tailscale já conectado, IP da VPS detectado automaticamente.

---

## ⚡ O QUE EU FAÇO AUTOMATICAMENTE

Quando você me passa os dados, eu faço TUDO sozinho:

### ✅ Fase 1: Preparação (2-3 min)
- [x] Conecto na VPS via SSH (sem pedir senha!)
- [x] Atualizo sistema operacional
- [x] Instalo Docker e Docker Compose
- [x] Instalo Tailscale (se você passou a chave)
- [x] Conecto Tailscale e detecto IP automaticamente

### ✅ Fase 2: Configuração (1 min)
- [x] Copio todos os arquivos do projeto para VPS
- [x] Gero senhas aleatórias super seguras:
  - Senha do PostgreSQL (32 caracteres)
  - JWT Secret (64 caracteres)
  - Chaves do MinIO (32-64 caracteres)
- [x] Crio arquivo `.env` com tudo configurado

### ✅ Fase 3: Deploy (10-15 min)
- [x] Faço build do Backend (TypeScript → JavaScript)
- [x] Faço build do Frontend (React + Vite)
- [x] Faço build do Cron (tarefas agendadas)
- [x] Subo PostgreSQL
- [x] Subo MinIO (armazenamento de arquivos)
- [x] Subo todos os containers

### ✅ Resultado Final

Você recebe:
- 🌐 **URL do Frontend:** http://IP_VPS:3000
- 🌐 **URL da API:** http://IP_VPS:3001
- 🔐 **Senhas Geradas** (salvas automaticamente)
- 🌐 **IP Tailscale da VPS** (se instalou com Tailscale)
- 📄 **Arquivo INFO.txt** com todas as credenciais

---

## 📝 APÓS A INSTALAÇÃO

### 🎯 PASSO 1: Acessar o Sistema (Primeiro Acesso)

Acesse no navegador: **http://IP_DA_VPS:3000/first-setup**

Exemplo: http://46.202.150.64:3000/first-setup

**⚠️ IMPORTANTE:**
- Use `/first-setup` no final da URL para o primeiro acesso!
- Se cair direto no dashboard, **limpe o cache do navegador** (Ctrl+Shift+Del)
- Ou use **aba anônima/privada** (Ctrl+Shift+N)
- Ou force refresh (Ctrl+F5)

O sistema detecta automaticamente que é primeira instalação e redireciona para essa tela.

### 🏢 PASSO 2: Criar Empresa (Tela de Primeiro Acesso)

Preencha os dados da empresa:
- **Nome da Empresa**
- **CNPJ**
- **Email**
- **Telefone**
- **Criar primeiro usuário:**
  - Nome completo
  - Email de login
  - Senha (mínimo 6 caracteres)

Após criar, você será redirecionado para o sistema!

### 🌐 PASSO 3: Configurar Tailscale

**Se você NÃO instalou Tailscale na VPS:**

1. Acesse a VPS via SSH:
   ```bash
   ssh root@IP_DA_VPS
   ```

2. Instale Tailscale:
   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   tailscale up
   tailscale ip -4  # Anote este IP!
   ```

**No PC/Servidor do Cliente:**

1. Instale Tailscale:
   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   tailscale up
   tailscale ip -4  # Anote este IP!
   ```

**No Sistema Web:**

1. Menu: **Configurações de Rede → Tailscale**
2. Preencher:
   - **IP VPS**: (obtido acima)
   - **IP Cliente**: (obtido acima)
3. **"Salvar Configuração"**
4. **"Testar Conectividade Agora"** ✅

### 📹 PASSO 4: Configurar DVR

1. Menu: **Configurações de Rede → APIs**
2. Preencher aba **DVR**:
   - **IP DVR**: `10.6.1.123` (ou IP do DVR do cliente)
   - **Porta**: `80`
   - **Usuário**: `admin`
   - **Senha**: (senha do DVR do cliente)
3. **"Testar Conexão"** ✅

### ⚙️ PASSO 5: APIs Já Pré-Configuradas!

As seguintes APIs já vêm configuradas automaticamente:
- ✅ **Zanthus ERP** (http://10.6.1.101)
- ✅ **Intersolid ERP** (http://10.6.1.102 + credenciais)
- ✅ **Evolution API (WhatsApp)** (já configurado com token e grupo)

**Você só precisa ajustar se os IPs forem diferentes!**

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
