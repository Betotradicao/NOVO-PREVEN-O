# Scripts SQL de Manutenção

Esta pasta contém scripts SQL úteis para manutenção e troubleshooting do sistema.

## 📁 Scripts Disponíveis

### clear-equipments.sql
**Propósito**: Zerar completamente a tabela de equipamentos e sessões

**Quando usar**:
- Após mudanças na lógica de identificação de equipamentos
- Para limpar dados de teste
- Ao resetar o sistema para uma nova configuração

**O que faz**:
- Deleta todas as sessões de equipamentos
- Deleta todos os equipamentos cadastrados
- Reseta o auto-incremento da sequência para começar do ID 1
- Mostra contagem final de equipamentos (deve ser 0)

**Como usar**:
```bash
# Windows
PGPASSWORD=admin123 psql -h localhost -U postgres -d market_security -f scripts-sql/clear-equipments.sql

# Linux/Mac
PGPASSWORD=admin123 psql -h localhost -U postgres -d market_security -f scripts-sql/clear-equipments.sql
```

---

### fix-minio-urls.sql
**Propósito**: Corrigir URLs antigas do MinIO após mudança de porta

**Quando usar**:
- Após atualização que mudou porta do MinIO de 9000 para 9010
- Quando imagens/vídeos não carregam devido a URLs antigas
- Após restauração de backup antigo

**O que faz**:
- Atualiza URLs de imagens de bipagens (`:9000/` → `:9010/`)
- Atualiza URLs de vídeos de bipagens (`:9000/` → `:9010/`)
- Atualiza URLs de avatares de colaboradores (`:9000/` → `:9010/`)
- Mostra estatísticas de quantos registros foram atualizados

**Como usar**:
```bash
# Windows
PGPASSWORD=admin123 psql -h localhost -U postgres -d market_security -f scripts-sql/fix-minio-urls.sql

# Linux/Mac
PGPASSWORD=admin123 psql -h localhost -U postgres -d market_security -f scripts-sql/fix-minio-urls.sql
```

---

## ⚠️ IMPORTANTE

**Antes de executar qualquer script**:
1. ✅ Faça backup do banco de dados
2. ✅ Verifique se está conectando ao banco correto
3. ✅ Leia o conteúdo do script para entender o que ele faz
4. ✅ Teste primeiro em ambiente de desenvolvimento

**Credenciais padrão**:
- Host: `localhost`
- Porta: `5432`
- Usuário: `postgres`
- Senha: `admin123` (padrão - pode ter sido alterada na instalação)
- Database: `market_security`

---

## 🔐 Segurança

- ⚠️ Nunca execute scripts SQL de fontes não confiáveis
- ⚠️ Sempre revise o conteúdo antes de executar
- ⚠️ Use `PGPASSWORD` com cuidado (não deixe em histórico do terminal)
- ✅ Prefira `.pgpass` ou `pg_service.conf` para credenciais em produção

---

## 📝 Criando Novos Scripts

Ao criar novos scripts SQL de manutenção:

1. **Documente bem**: Adicione comentários explicando o que o script faz
2. **Use transações**: Envolva operações críticas em `BEGIN` e `COMMIT`
3. **Mostre resultados**: Inclua `SELECT` de verificação no final
4. **Evite hard-coding**: Use variáveis quando possível
5. **Adicione aqui**: Documente o novo script neste README

Exemplo de estrutura:
```sql
-- Nome do Script: exemplo.sql
-- Propósito: Descrever o que o script faz
-- Data: YYYY-MM-DD

BEGIN;

-- Suas operações SQL aqui
UPDATE tabela SET campo = 'valor';

-- Verificação
SELECT COUNT(*) as registros_atualizados FROM tabela WHERE campo = 'valor';

COMMIT;
```

---

Última atualização: 2025-12-11
