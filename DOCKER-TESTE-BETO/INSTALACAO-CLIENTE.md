# 📦 GUIA DE INSTALAÇÃO PARA CLIENTES

## ✅ TUDO JÁ ESTÁ CONFIGURADO E PRONTO!

Este pacote Docker já contém **TODAS as correções e configurações necessárias**:

- ✅ **CRON automático** (verifica vendas a cada 2 minutos)
- ✅ **Timezone correto** (horário de Brasília UTC-3)
- ✅ **Backend, Frontend, PostgreSQL, MinIO** pré-configurados
- ✅ **Sem janelas pretas** (tudo roda dentro dos containers)
- ✅ **Inicialização automática** com o Windows (opcional)

---

## 📋 PRÉ-REQUISITOS

Antes de instalar, certifique-se que o cliente tem:

1. **Windows 10/11** (64 bits)
2. **8 GB de RAM** (mínimo 4 GB)
3. **10 GB de espaço livre** no disco
4. **Acesso à internet** (apenas na instalação)
5. **Portas livres:**
   - `8080` - Frontend
   - `3011` - Backend
   - `9010` - MinIO Console
   - `9011` - MinIO API
   - `5434` - PostgreSQL

---

## 🚀 INSTALAÇÃO RÁPIDA (3 PASSOS)

### Passo 1: Copiar a Pasta

Copie a pasta **DOCKER-TESTE-BETO** completa para o Desktop do cliente.

### Passo 2: Executar Instalação

1. Entre na pasta `DOCKER-TESTE-BETO`
2. Clique duplo em: **`INSTALAR.bat`**
3. Aguarde 10-15 minutos (vai baixar Docker Desktop e instalar tudo)

### Passo 3: Configurar Zanthus

1. Acesse: `http://localhost:8080`
2. Faça login com:
   - **Usuário:** Beto
   - **Senha:** Beto3107@
3. Vá em **Configurações** → Configure a API do Zanthus:
   - URL da API
   - Usuário
   - Senha

**PRONTO! Sistema funcionando 100% automaticamente!**

---

## 🔧 COMANDOS ÚTEIS

Na pasta `DOCKER-TESTE-BETO`:

- **`INICIAR.bat`** - Inicia o sistema
- **`PARAR.bat`** - Para o sistema
- **`ATUALIZAR.bat`** - Atualiza para nova versão
- **`LOGS.bat`** - Ver logs de todos os serviços
- **`STATUS.bat`** - Verificar status dos containers

---

## 🌐 ACESSOS

Após a instalação, o cliente acessa:

- **Sistema:** http://localhost:8080
- **MinIO Console:** http://localhost:9010 (admin / admin123)
- **Banco de Dados:** localhost:5434 (postgres / postgres123)

---

## ⚡ VERIFICAÇÃO AUTOMÁTICA (CRÍTICO)

O sistema **JÁ ESTÁ CONFIGURADO** para verificar vendas automaticamente:

### Como funciona:

**A cada 2 minutos:**
- Busca vendas do Zanthus (dia atual)
- Cruza com bipagens pendentes
- Atualiza status automaticamente

**Às 8h da manhã:**
- Verificação completa do dia anterior
- Envia relatório (se configurado)

**A cada 1 hora:**
- Verifica se está recebendo bipagens
- Alerta se o scanner parar de funcionar

### Para verificar se está funcionando:

1. Faça uma bipagem de teste
2. Aguarde até 2 minutos
3. Veja se a bipagem mudou de "Pendente" para "Verificado"

---

## 🔍 VERIFICAÇÃO DOS CONTAINERS

Para garantir que tudo está rodando, execute: `STATUS.bat`

Deve mostrar 5 containers **running**:
```
✅ prevencao-backend-prod   - Backend (API)
✅ prevencao-frontend-prod  - Frontend (Interface)
✅ prevencao-postgres-prod  - Banco de dados
✅ prevencao-minio-prod     - Armazenamento de arquivos
✅ prevencao-cron-prod      - Verificação automática (CRÍTICO!)
```

---

## 📊 LOGS DO CRON (Verificação Automática)

Para ver os logs da verificação automática:

```bash
# Ver logs em tempo real
docker logs -f prevencao-cron-prod

# Ver últimas 50 linhas
docker logs --tail 50 prevencao-cron-prod
```

**Exemplo de log bem-sucedido:**
```
[2025-12-10 10:00:00] 🔄 Iniciando verificação diária...
[2025-12-10 10:00:02] ✅ Buscadas 45 vendas da Zanthus
[2025-12-10 10:00:03] ✅ Encontradas 12 bipagens pendentes
[2025-12-10 10:00:04] ✅ 8 bipagens verificadas com sucesso
[2025-12-10 10:00:04] ⚠️  4 bipagens sem match (aguardando venda)
```

---

## 🆘 SOLUÇÃO DE PROBLEMAS

### Problema 1: Containers não sobem

**Causa:** Portas em uso ou Docker não instalado

**Solução:**
1. Feche aplicações que possam estar usando as portas
2. Execute `INSTALAR.bat` novamente

---

### Problema 2: Frontend não carrega

**Causa:** Container do frontend não iniciou

**Solução:**
```bash
docker restart prevencao-frontend-prod
```

---

### Problema 3: Banco de dados com erro

**Causa:** Container do PostgreSQL não iniciou completamente

**Solução:**
```bash
docker restart prevencao-postgres-prod
# Aguarde 30 segundos
docker restart prevencao-backend-prod
docker restart prevencao-cron-prod
```

---

### Problema 4: CRON não está verificando

**Causa:** Container do CRON não está rodando

**Solução:**
```bash
# Verificar status
docker ps | findstr cron

# Se não aparecer, reiniciar
docker restart prevencao-cron-prod

# Ver logs
docker logs prevencao-cron-prod
```

---

### Problema 5: "Resultados do Dia" mostra 0 vendas

**Causas possíveis:**
1. API Zanthus não configurada
2. Produtos não ativados
3. CRON não está rodando

**Solução:**
1. Vá em Configurações → Configure API Zanthus
2. Vá em Ativar Produto → Ative os produtos necessários
3. Execute: `docker restart prevencao-cron-prod`
4. Aguarde 2 minutos para o CRON rodar

---

## 🔄 ATUALIZAÇÃO DO SISTEMA

Quando houver uma nova versão:

1. Baixe o novo código do GitHub
2. Copie os arquivos atualizados para a pasta do cliente
3. Execute: **`ATUALIZAR.bat`**
4. O sistema vai:
   - Parar os containers
   - Fazer rebuild com o novo código
   - Iniciar tudo novamente
   - **Manter os dados** (banco + arquivos)

---

## 🎯 INICIALIZAÇÃO AUTOMÁTICA COM WINDOWS

Para o sistema iniciar automaticamente quando o Windows reiniciar:

1. Execute: **`INICIAR-COM-WINDOWS.bat`** (como Administrador)
2. Confirme a instalação
3. Reinicie o computador para testar

Para **desabilitar** a inicialização automática:
```bash
schtasks /delete /tn "PrevencaoRadar-AutoStart" /f
```

---

## 📞 SUPORTE

Se o cliente tiver problemas:

1. Tire print da tela de erro
2. Execute `LOGS.bat` e copie o conteúdo
3. Execute `STATUS.bat` e tire print
4. Entre em contato com o suporte

---

## ✅ CHECKLIST DE INSTALAÇÃO

Após a instalação, verificar:

- [ ] Docker Desktop instalado e rodando
- [ ] 5 containers com status "running"
- [ ] Frontend acessível em http://localhost:8080
- [ ] Login funcionando (Beto / Beto3107@)
- [ ] API Zanthus configurada
- [ ] Produtos ativados
- [ ] CRON verificando automaticamente (fazer teste de bipagem)

---

## 🎉 SUCESSO!

Quando tudo estiver funcionando:

- ✅ Bipagens são recebidas automaticamente do scanner
- ✅ Sistema busca vendas da Zanthus a cada 2 minutos
- ✅ Status das bipagens atualiza automaticamente
- ✅ Tela "Resultados do Dia" mostra as vendas corretamente
- ✅ Sistema funciona 24/7 sem intervenção manual

**O cliente pode fechar todas as janelas - o sistema continua rodando em segundo plano!**
