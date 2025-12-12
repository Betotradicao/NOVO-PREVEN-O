# 🛠️ Utilitários - Scripts de Manutenção

Esta pasta contém scripts utilitários para manutenção e configuração do sistema.

## 📋 Scripts Disponíveis:

### 1. Criação de Usuários

#### `CRIAR-USUARIO-BETO.bat`
**Descrição**: Script Windows para criar usuário Beto automaticamente
**Uso**:
```bash
# Execute clicando duas vezes ou via CMD
CRIAR-USUARIO-BETO.bat
```

#### `criar-usuario.js`
**Descrição**: Script Node.js para criar usuários via terminal
**Uso**:
```bash
cd packages/backend
node ../UTILITARIOS/criar-usuario.js
```

#### `criar-usuario-admin.py`
**Descrição**: Script Python para criar usuário admin
**Uso**:
```bash
python UTILITARIOS/criar-usuario-admin.py
```

### 2. Scripts SQL

#### `CRIAR-USUARIO-ADMIN.sql`
**Descrição**: SQL para criar usuário administrador diretamente no banco
**Uso**:
```bash
# Execute via psql ou pgAdmin
psql -U postgres -d market_security -f UTILITARIOS/CRIAR-USUARIO-ADMIN.sql
```

#### `INSERIR-USUARIO-BETO.sql`
**Descrição**: SQL para inserir usuário Beto
**Uso**:
```bash
psql -U postgres -d market_security -f UTILITARIOS/INSERIR-USUARIO-BETO.sql
```

#### `EXECUTAR-SQL.bat`
**Descrição**: Executor automático de scripts SQL
**Uso**:
```bash
# Execute clicando duas vezes
EXECUTAR-SQL.bat
```

## ⚠️ Importante:

- **Estes scripts são para DESENVOLVIMENTO e TESTES**
- **NÃO execute em produção** sem revisar os dados
- **Senhas padrão** devem ser alteradas após criação
- **Backup** do banco antes de executar qualquer script SQL

## 🔐 Senhas Padrão:

Os scripts usam senhas padrão de teste:
- Usuário Admin: `admin123`
- Usuário Beto: `beto123`

**⚠️ SEMPRE altere as senhas padrão após criar os usuários!**

## 📝 Quando Usar:

### Use estes scripts quando:
- ✅ Estiver configurando ambiente de desenvolvimento
- ✅ Precisar criar usuários de teste rapidamente
- ✅ Resetar senha de algum usuário
- ✅ Fazer testes de permissões

### NÃO use quando:
- ❌ Em ambiente de produção (use o Wizard de Setup)
- ❌ Para criar usuários reais de clientes
- ❌ Sem revisar os dados antes

## 🎯 Melhor Prática:

Para ambiente de produção, use sempre:
1. **Wizard de Primeiro Acesso** (aparece na instalação limpa)
2. **Tela de Gerenciamento de Usuários** no sistema
3. **Função "Esqueci minha senha"** para recuperação

---

**Dica**: Se você não precisa destes scripts, pode ignorar esta pasta completamente. O sistema funciona perfeitamente sem eles!
