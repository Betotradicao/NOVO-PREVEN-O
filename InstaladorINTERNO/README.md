# 🏠 Instalador Interno - Market Security System

## 🚀 Instalação Rápida

**1 ÚNICO PASSO:**

1. Clique com botão direito em `INSTALAR-AUTO.bat`
2. Selecione "Executar como Administrador"
3. Aguarde a instalação
4. Pronto! ✅

## 📋 O que será instalado:

- ✅ Dependências Node.js (backend + frontend)
- ✅ PM2 (gerenciador de processos)
- ✅ PostgreSQL (se não estiver instalado)
- ✅ MinIO (armazenamento local)
- ✅ Auto-start invisível (inicia com o Windows)
- ✅ Monitor automático (reinicia se cair)
- ✅ Ngrok (túneis externos - opcional)

## 🔄 Sistema de Auto-Start:

Após a instalação, o sistema iniciará automaticamente sempre que o Windows iniciar.

**Scripts incluídos:**
- `startup-invisible.ps1` - Inicia tudo de forma invisível
- `monitor-e-reiniciar.vbs` - Monitora e reinicia processos
- `adicionar-autostart.reg` - Configura auto-start no Windows

## 🌐 Acessos após instalação:

- **Frontend**: http://localhost:3004
- **Backend**: http://localhost:3001
- **MinIO Console**: http://localhost:9011

## 🔧 Gerenciar o sistema:

```bash
# Ver processos rodando
pm2 list

# Ver logs
pm2 logs

# Parar tudo
pm2 stop all

# Reiniciar
pm2 restart all
```

## 🌍 Ngrok (Acesso Externo):

1. Edite o arquivo `ngrok.yml`
2. Substitua `YOUR_NGROK_TOKEN_HERE` pelo seu token
3. O Ngrok iniciará automaticamente com o sistema

Token do Ngrok: veja em `../CREDENCIAIS/ngrok.md`

## 📞 Suporte:

Problemas? Verifique:
1. Executou como Administrador?
2. Node.js está instalado?
3. PostgreSQL está rodando?
4. Portas 3001, 3004, 5432, 9010, 9011 estão livres?

---

**Versão**: 1.0
**Data**: 2025-12-11
