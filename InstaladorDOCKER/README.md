# 🐳 Instalador Docker - Prevenção no Radar

## 🚀 Instalação Rápida

**1 ÚNICO PASSO:**

1. Clique com botão direito em `INSTALAR-AUTO.bat`
2. Selecione "Executar como Administrador"
3. Aguarde a instalação (5-15 minutos)
4. Pronto! ✅

## 📋 O que o instalador faz:

### Etapa 1: Verificações
- ✅ Verifica se Docker está instalado
- ✅ Verifica Docker Compose

### Etapa 2: Configuração
- ✅ Detecta automaticamente o IP da máquina
- ✅ Gera senhas seguras aleatórias para:
  - PostgreSQL
  - MinIO (Access Key e Secret Key)
- ✅ Salva tudo no arquivo `.env`

### Etapa 3: Limpeza de Dados
- ❓ **PERGUNTA IMPORTANTE**: Deseja limpar dados existentes?
  - **S (Sim)**: Apaga TUDO e faz instalação limpa
    - Vai aparecer o **Wizard de Primeiro Acesso** 🎉
    - Você vai configurar:
      - Dados da empresa
      - Usuário Master
      - Senhas iniciais
  - **N (Não)**: Mantém dados existentes
    - Use credenciais anteriores para login
    - Útil para atualizações

### Etapa 4-7: Instalação
- ✅ Para containers antigos
- ✅ Constrói imagens Docker
- ✅ Inicia todos os serviços
- ✅ Aguarda inicialização

## 🌐 Após instalação - Acessos:

O instalador mostrará o IP configurado. Exemplo: `192.168.0.145`

- **Frontend (Sistema)**: http://192.168.0.145:8080
- **MinIO Console**: http://192.168.0.145:9011

## 🎯 Primeiro Acesso (Instalação Limpa)

Se você escolheu **LIMPAR DADOS (S)**, ao acessar pela primeira vez:

1. **Wizard de Configuração Inicial** aparecerá automaticamente
2. Configure:
   - **Passo 1**: Dados da Empresa
     - Nome da empresa
     - CNPJ
   - **Passo 2**: Usuário Master
     - Nome completo
     - Email
     - Senha segura
   - **Passo 3**: Configurações iniciais
3. Pronto! Sistema configurado ✅

## 🔒 Senhas Geradas

O instalador gera e salva senhas automaticamente:

```
PostgreSQL:
  Usuario: postgres
  Senha: [16 caracteres aleatórios]
  Porta: 5434

MinIO:
  Access Key: [32 caracteres hex]
  Secret Key: [64 caracteres hex]
  Console: http://[SEU_IP]:9011
```

**⚠️ IMPORTANTE**: Anote estas senhas! Elas estão salvas em `InstaladorDOCKER/.env`

## 🛠️ Serviços Instalados:

- ✅ **PostgreSQL** (porta 5434) - Banco de dados
- ✅ **MinIO** (portas 9010/9011) - Armazenamento de vídeos/imagens
- ✅ **Backend** (porta 3001) - API do sistema
- ✅ **Frontend** (porta 8080) - Interface web
- ✅ **Cron** - Verificação automática de vendas (roda a cada 1 minuto, invisível)

## ⚙️ Comandos Úteis:

```bash
# Ver status dos containers
docker compose -f docker-compose-producao.yml ps

# Ver logs do backend
docker compose -f docker-compose-producao.yml logs -f backend

# Ver logs de todos os serviços
docker compose -f docker-compose-producao.yml logs -f

# Parar tudo
docker compose -f docker-compose-producao.yml down

# Parar e LIMPAR TUDO (apaga dados)
docker compose -f docker-compose-producao.yml down -v

# Reiniciar
docker compose -f docker-compose-producao.yml restart

# Reiniciar apenas o backend
docker compose -f docker-compose-producao.yml restart backend
```

## 🔄 Atualização do Sistema

Para atualizar para uma nova versão:

1. Baixe o código atualizado do GitHub
2. Execute `INSTALAR-AUTO.bat` como Administrador
3. Quando perguntar sobre limpar dados:
   - **N (Não)**: Mantém seus dados e apenas atualiza o código ✅
   - **S (Sim)**: Limpa tudo e reconfigura do zero

## 📞 Troubleshooting:

### Problema: Instalação falhou ao construir imagens
**Solução**:
- Verifique se tem internet
- Execute novamente o instalador

### Problema: Containers não iniciam
**Solução**:
- Verifique se as portas estão livres: 5434, 9010, 9011, 3001, 8080
- Veja os logs: `docker compose -f docker-compose-producao.yml logs`

### Problema: Frontend não carrega
**Solução**:
- Aguarde 1-2 minutos após instalação
- Verifique se todos os containers estão rodando:
  ```bash
  docker compose -f docker-compose-producao.yml ps
  ```

### Problema: Não apareceu o Wizard de Primeiro Acesso
**Causa**: Você escolheu **N (Não)** para limpar dados, então o banco manteve dados antigos

**Solução**:
1. Pare tudo: `docker compose -f docker-compose-producao.yml down -v`
2. Execute o instalador novamente
3. Escolha **S (Sim)** para limpar dados

### Problema: Esqueci a senha do usuário
**Solução**:
- Use a função "Esqueci minha senha" na tela de login
- Configure o email no `.env` do backend (veja README principal)

## 📁 Estrutura de Arquivos:

```
InstaladorDOCKER/
├── INSTALAR-AUTO.bat           # Instalador principal
├── docker-compose-producao.yml # Configuração Docker
├── .env                        # Senhas geradas (criado pelo instalador)
├── Dockerfile.backend          # Build do backend
├── Dockerfile.frontend         # Build do frontend
├── Dockerfile.cron             # Build do cron
└── README.md                   # Este arquivo
```

## 🔐 Segurança:

- ✅ Senhas geradas automaticamente e aleatórias
- ✅ PostgreSQL acessível apenas internamente
- ✅ MinIO com credenciais seguras
- ✅ Arquivo `.env` não vai para o GitHub (está no .gitignore)
- ✅ Sistema de primeiro acesso com validação

---

**Versão**: 2.0
**Data**: 2025-12-12
**Recursos**:
- ✅ Wizard de primeiro acesso
- ✅ Limpeza opcional de dados
- ✅ Recuperação de senha por email
- ✅ Cron job automático (1 minuto, invisível)
- ✅ PDV fix (vendas verificadas mostram PDV e horário)
