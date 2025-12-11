# Market Security System - Sistema de Prevenção e Inteligência Contra Furtos

Sistema completo de monitoramento e prevenção de furtos desenvolvido para mercados, com funcionalidades de rastreamento de produtos, análise de bipagens e detecção de fraudes.

---

## 🚀 Instalação Rápida

Escolha o método de instalação de acordo com sua necessidade:

### 📁 Opção 1: Instalação via Docker (Recomendado para Produção)

**Ideal para**: Instalações rápidas, ambientes isolados, produção

```bash
cd InstaladorDOCKER
# Clique com botão direito em INSTALAR-AUTO.bat
# Selecione "Executar como Administrador"
```

📖 **Documentação completa**: [InstaladorDOCKER/README.md](InstaladorDOCKER/README.md)

---

### 🏠 Opção 2: Instalação Interna (Desenvolvimento/Rede Local)

**Ideal para**: Desenvolvimento, rede interna, máquinas 24/7

```bash
cd InstaladorINTERNO
# Clique com botão direito em INSTALAR-AUTO.bat
# Selecione "Executar como Administrador"
```

**Inclui**:
- ✅ Auto-start invisível (inicia com Windows)
- ✅ Monitor automático (reinicia se cair)
- ✅ PM2 (gerenciamento de processos)
- ✅ Ngrok (acesso externo - opcional)

📖 **Documentação completa**: [InstaladorINTERNO/README.md](InstaladorINTERNO/README.md)

---

## 📂 Estrutura do Projeto

```
roberto-prevencao-no-radar-main/
│
├── 📁 InstaladorDOCKER/           # Instalação via Docker
│   ├── INSTALAR-AUTO.bat          # ← Instalador automático
│   ├── docker-compose.yml
│   ├── docker-compose.portainer.yml
│   └── README.md
│
├── 📁 InstaladorINTERNO/          # Instalação local/rede interna
│   ├── INSTALAR-AUTO.bat          # ← Instalador automático
│   ├── startup-invisible.ps1      # Auto-start invisível
│   ├── monitor-e-reiniciar.vbs    # Monitor de processos
│   ├── ngrok.yml                  # Configuração Ngrok
│   └── README.md
│
├── 📁 CREDENCIAIS/                 # ⚠️ Senhas e acessos importantes
│   ├── portainer.md               # Credenciais Portainer
│   ├── seguranca-sistema.md       # Sistema de proteção
│   └── ngrok.md                   # Token Ngrok
│
├── 📁 packages/                    # Código-fonte
│   ├── backend/                   # API Express + TypeScript
│   └── frontend/                  # React + TypeScript
│
└── 📄 README.md                    # Este arquivo
```

---

## 🔒 Credenciais e Segurança

Todas as credenciais importantes estão organizadas na pasta **`CREDENCIAIS/`**:

- **Portainer**: Admin do painel Docker
- **Segurança do Sistema**: Usuário: `Beto` / Senha: `Beto3107`
- **Ngrok**: Token de autenticação para túneis externos

⚠️ **IMPORTANTE**: Mantenha esta pasta segura e não compartilhe publicamente!

---

## 🌐 Acessos após Instalação

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | http://localhost:3004 | Interface web do sistema |
| **Backend** | http://localhost:3001 | API REST |
| **MinIO Console** | http://localhost:9011 | Gerenciamento de arquivos |
| **Swagger** | http://localhost:3001/api-docs | Documentação da API |

**Login padrão**:
- Email: `admin@tradicaosjc.com.br`
- Senha: `admin123`

⚠️ **Altere a senha após o primeiro login!**

---

## 🏗️ Arquitetura do Sistema

### Backend
- **Express.js** - Framework web
- **TypeScript** - Tipagem estática
- **TypeORM** - ORM para PostgreSQL
- **JWT** - Autenticação
- **Swagger** - Documentação da API
- **node-cron** - Agendamento de tarefas

### Frontend
- **React 19** - Interface de usuário
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **Vite** - Build tool

### Infraestrutura
- **PostgreSQL** - Banco de dados
- **MinIO** - Armazenamento de objetos (S3-compatible)
- **PM2** - Gerenciador de processos Node.js
- **Docker** - Containerização
- **Ngrok** - Túneis externos (opcional)

---

## 🎯 Funcionalidades Principais

### Dashboard
- Visão geral do sistema
- Métricas em tempo real
- Navegação principal

### Bipagens Ao Vivo
- Monitoramento em tempo real
- Filtros avançados
- Fotos e vídeos das bipagens
- Lazy loading para performance

### Ativar Produtos
- Gestão de produtos do ERP
- Ativação/desativação individual e em massa
- Interface otimizada para mobile
- Sincronização com Zanthus ERP

### Resultados do Dia
- Análise de vendas vs bipagens
- Identificação de possíveis furtos
- Relatórios detalhados
- Alertas automáticos

### Configurações
- **APIs**: Integração com Zanthus, Intersolid, Evolution API
- **WhatsApp**: Notificações automáticas via Evolution API
- **Rede**: Gerenciamento de equipamentos e scanners
- **Segurança**: Controle de acesso e permissões
- **Simulador**: Teste de bipagens para desenvolvimento

---

## 🔄 Processo de Cron Jobs

O sistema possui cron jobs automáticos que rodam às **5h da manhã**:

1. Busca vendas do dia anterior via API do ERP
2. Filtra produtos ativos no sistema
3. Valida contra bipagens registradas
4. Salva resultados na tabela `sells`
5. Envia alertas via WhatsApp (se configurado)

---

## 🛠️ Comandos Úteis

### Docker (InstaladorDOCKER):
```bash
# Ver status dos containers
docker-compose ps

# Ver logs
docker-compose logs -f

# Parar tudo
docker-compose down

# Reiniciar
docker-compose restart
```

### PM2 (InstaladorINTERNO):
```bash
# Ver processos rodando
pm2 list

# Ver logs em tempo real
pm2 logs

# Parar tudo
pm2 stop all

# Reiniciar
pm2 restart all
```

---

## 📱 Responsividade

O sistema foi desenvolvido com **mobile-first approach**:
- Interface adaptativa para todos os tamanhos de tela
- Touch-friendly para tablets e smartphones
- Componentes otimizados para performance mobile

---

## 🔒 Segurança

- Autenticação JWT
- Middleware de autenticação em todas as rotas protegidas
- Hash de senhas com bcrypt
- Validação de entrada com express-validator
- CORS configurado
- Sistema de proteção de arquivos (ver `CREDENCIAIS/seguranca-sistema.md`)

---

## 📞 Suporte e Documentação

### Documentação Específica:
- **Instalação Docker**: [InstaladorDOCKER/README.md](InstaladorDOCKER/README.md)
- **Instalação Interna**: [InstaladorINTERNO/README.md](InstaladorINTERNO/README.md)
- **Credenciais**: Pasta `CREDENCIAIS/`

### Solução de Problemas:

**Sistema não inicia**:
1. Verifique se todas as portas estão livres (3001, 3004, 5432, 9010, 9011)
2. Confirme que executou o instalador como Administrador
3. Verifique os logs: `pm2 logs` ou `docker-compose logs`

**Erro de conexão com banco**:
1. Verifique se PostgreSQL está rodando
2. Confirme as credenciais no arquivo `.env`
3. Teste a conexão: `psql -h localhost -U admin -d market_security`

**Problemas com auto-start (InstaladorINTERNO)**:
1. Verifique o registro do Windows: `Win+R` → `regedit` → `HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run`
2. Confirme que o script `startup-invisible.ps1` existe
3. Execute manualmente para testar: `powershell -File InstaladorINTERNO\startup-invisible.ps1`

---

## 🚀 Deploy em Produção

Para deploy em produção via Docker + Portainer:

1. Acesse a pasta `InstaladorDOCKER/`
2. Configure o arquivo `.env` com credenciais de produção
3. Use o `docker-compose.portainer.yml` para deploy via Portainer
4. Configure certificados SSL/TLS
5. Configure backup automático do banco de dados

**Credenciais do Portainer**: Ver `CREDENCIAIS/portainer.md`

---

## 📝 Licença e Versão

- **Versão**: 1.0
- **Data**: 2025-12-11
- **Desenvolvido para**: Tradicão SJC e clientes
- **Stack**: Node.js + React + PostgreSQL + MinIO

---

## 🎓 Para Desenvolvedores

### Estrutura de Código:
```
packages/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Controladores da API
│   │   ├── entities/       # Entidades TypeORM
│   │   ├── middleware/     # Middlewares Express
│   │   ├── migrations/     # Migrations do banco
│   │   ├── routes/         # Rotas da API
│   │   ├── services/       # Serviços e lógica de negócio
│   │   └── config/         # Configurações
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/     # Componentes React
    │   ├── pages/          # Páginas da aplicação
    │   ├── services/       # Serviços HTTP (Axios)
    │   └── utils/          # Utilitários
    └── package.json
```

### Desenvolvimento Local:
```bash
# Instalar dependências
npm install
cd packages/backend && npm install
cd ../frontend && npm install

# Executar migrações
cd packages/backend
npm run migration:run

# Iniciar backend (modo dev)
npm run dev

# Iniciar frontend (modo dev)
cd packages/frontend
npm run dev
```

---

**🔥 Pronto para começar? Escolha um instalador acima e execute!**
