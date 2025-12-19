# Integração NetSDK Intelbras - Guia de Instalação

## 📋 Visão Geral

Este backend integra com o DVR Intelbras usando o NetSDK oficial através de FFI (Foreign Function Interface).

## 🔧 Pré-requisitos

### Windows

1. **Visual Studio 2019 ou superior** com:
   - Desktop development with C++
   - Windows 10 SDK

2. **Python 3.x** (para node-gyp)

### Linux

```bash
sudo apt-get install build-essential
```

## 📦 Instalação

### 1. Instalar Dependências Nativas

**Opção A: Instalar Visual Studio Build Tools (Recomendado)**

Baixe e instale:
https://visualstudio.microsoft.com/downloads/

Selecione:
- ☑️ Desktop development with C++
- ☑️ Windows 10 SDK

**Opção B: Usar versão pré-compilada (Mais rápido)**

Use a versão pre-built do NetSDK wrapper que criamos.

### 2. Instalar Pacotes Node.js

```bash
cd packages/backend
npm install ffi-napi ref-napi ref-struct-di
```

## 🎯 Configuração

### Configurações no Banco de Dados

Adicione as seguintes configurações na tabela `configurations`:

| Chave | Valor Padrão | Descrição |
|-------|--------------|-----------|
| `dvr_netsdk_enabled` | `false` | Habilita o NetSDK |
| `dvr_ip` | `192.168.1.108` | IP do DVR |
| `dvr_port` | `37777` | Porta do DVR |
| `dvr_username` | `admin` | Usuário do DVR |
| `dvr_password` | `` | Senha do DVR |
| `dvr_channel_count` | `16` | Número de canais |
| `dvr_snapshot_path` | `./uploads/dvr-snapshots` | Pasta para snapshots |

### SQL para Inserir Configurações

```sql
INSERT INTO configurations (key, value, description, category) VALUES
('dvr_netsdk_enabled', 'false', 'Habilita integração NetSDK', 'DVR'),
('dvr_ip', '192.168.1.108', 'IP do DVR Intelbras', 'DVR'),
('dvr_port', '37777', 'Porta do DVR (padrão 37777)', 'DVR'),
('dvr_username', 'admin', 'Usuário do DVR', 'DVR'),
('dvr_password', '', 'Senha do DVR', 'DVR'),
('dvr_channel_count', '16', 'Número de canais do DVR', 'DVR'),
('dvr_snapshot_path', './uploads/dvr-snapshots', 'Diretório para snapshots', 'DVR');
```

## 🚀 Uso

### Inicializar o Serviço

O serviço é inicializado automaticamente quando o backend inicia:

```typescript
import DVRNetSDKService from './services/dvr-netsdk.service';

// No index.ts ou app.ts
await DVRNetSDKService.initialize();
```

### API Endpoints

#### Testar Conexão
```http
POST /api/dvr/test
Authorization: Bearer <token>
```

#### Capturar Snapshot
```http
POST /api/dvr/snapshot
Authorization: Bearer <token>
Content-Type: application/json

{
  "channel": 0
}
```

#### Controlar PTZ
```http
POST /api/dvr/ptz/up
Authorization: Bearer <token>
Content-Type: application/json

{
  "channel": 0,
  "speed": 4
}
```

#### Outros Endpoints PTZ
- `POST /api/dvr/ptz/down` - Move para baixo
- `POST /api/dvr/ptz/left` - Move para esquerda
- `POST /api/dvr/ptz/right` - Move para direita
- `POST /api/dvr/ptz/zoom-in` - Zoom in
- `POST /api/dvr/ptz/zoom-out` - Zoom out
- `POST /api/dvr/ptz/preset/set` - Define preset
- `POST /api/dvr/ptz/preset/goto` - Vai para preset

## 📖 Documentação da API

Acesse a documentação Swagger em:
```
http://localhost:3001/api-docs
```

## 🔍 Comandos PTZ Disponíveis

```typescript
enum PTZCommand {
  PTZ_UP_CONTROL = 0,           // Cima
  PTZ_DOWN_CONTROL = 1,         // Baixo
  PTZ_LEFT_CONTROL = 2,         // Esquerda
  PTZ_RIGHT_CONTROL = 3,        // Direita
  PTZ_ZOOM_ADD_CONTROL = 4,     // Zoom in
  PTZ_ZOOM_DEC_CONTROL = 5,     // Zoom out
  PTZ_FOCUS_ADD_CONTROL = 6,    // Foco longe
  PTZ_FOCUS_DEC_CONTROL = 7,    // Foco perto
  PTZ_IRIS_ENLARGE_CONTROL = 8, // Abre íris
  PTZ_IRIS_REDUCE_CONTROL = 9,  // Fecha íris
  PTZ_POINT_SET_CONTROL = 100,  // Define preset
  PTZ_POINT_MOVE_CONTROL = 101, // Vai para preset
  PTZ_POINT_DEL_CONTROL = 102,  // Remove preset
}
```

## ⚙️ Códigos de Erro Comuns

| Código | Descrição |
|--------|-----------|
| 0 | Login bem-sucedido |
| 1 | Usuário ou senha incorretos |
| 3 | Timeout de conexão |
| 18 | Dispositivo não inicializado |

## 🐛 Troubleshooting

### Erro: "gyp ERR! find VS"

**Solução**: Instale o Visual Studio Build Tools com "Desktop development with C++"

### Erro: "Cannot find module 'ffi-napi'"

**Solução**:
```bash
npm install ffi-napi ref-napi ref-struct-di
```

### DVR não conecta

**Checklist**:
1. ✅ DVR está ligado e na rede?
2. ✅ IP e porta estão corretos?
3. ✅ Usuário e senha estão corretos?
4. ✅ Firewall permite conexão na porta 37777?
5. ✅ NetSDK está habilitado (`dvr_netsdk_enabled` = `true`)?

### Teste de Conexão Manual

```bash
# Testar ping
ping 192.168.1.108

# Testar porta (PowerShell)
Test-NetConnection -ComputerName 192.168.1.108 -Port 37777
```

## 🔄 Modo de Desenvolvimento (Mock)

Para desenvolvimento sem DVR físico, use o modo mock:

```typescript
// Desabilite o NetSDK real
dvr_netsdk_enabled = false

// Use o serviço mock (a ser criado)
```

## 📚 Documentação Adicional

- [NetSDK Programming Guide](./NetSDK%203.050/Linux/doc/NetSDK%20Programming%20Guide.pdf)
- [Manual da Câmera](./NetSDK%203.050/Linux/doc/NetSDK%20Programming%20Manual%20(Camera).pdf)

## 🤝 Suporte

Para questões técnicas:
- Documentação Intelbras: https://www.intelbras.com.br
- Issues do projeto: [GitHub Issues]

## 📝 Changelog

### v1.0.0 (2025-12-19)
- ✅ Integração inicial com NetSDK
- ✅ Login e autenticação
- ✅ Controle PTZ completo
- ✅ Captura de snapshots
- ✅ API REST documentada
