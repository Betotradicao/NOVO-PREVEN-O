# 🐳 Instalador Docker - Market Security System

## 🚀 Instalação Rápida

**1 ÚNICO PASSO:**

1. Clique com botão direito em `INSTALAR-AUTO.bat`
2. Selecione "Executar como Administrador"
3. Aguarde a instalação (5-15 minutos)
4. Pronto! ✅

## 📋 O que será instalado:

- ✅ Docker Desktop (se não estiver instalado)
- ✅ PostgreSQL (banco de dados)
- ✅ MinIO (armazenamento de arquivos)
- ✅ Backend (API)
- ✅ Frontend (interface web)
- ✅ Traefik (proxy reverso - se configurado)

## 🌐 Acessos após instalação:

- **Frontend**: http://localhost:3004
- **Backend**: http://localhost:3001
- **MinIO Console**: http://localhost:9011

## 📝 Configuração:

Antes de instalar, edite o arquivo `.env.example` e renomeie para `.env`

## ⚙️ Comandos úteis:

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

## 📞 Suporte:

Problemas? Verifique:
1. Docker Desktop está rodando?
2. Portas 3001, 3004, 5432, 9010, 9011 estão livres?
3. Executou como Administrador?

---

**Versão**: 1.0
**Data**: 2025-12-11
