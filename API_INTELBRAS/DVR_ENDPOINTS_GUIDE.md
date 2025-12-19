# 📡 Guia Completo de Endpoints DVR NetSDK Intelbras

## 🎯 Visão Geral

Este documento lista TODOS os endpoints/APIs disponíveis no NetSDK da Intelbras que podemos integrar.

---

## 🎥 **1. CÂMERAS & VISUALIZAÇÃO**

### 1.1 Visualização em Tempo Real

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `CLIENT_RealPlay` | POST | Stream ao vivo básico |
| `CLIENT_RealPlayEx` | POST | Stream ao vivo estendido (recomendado) |
| `CLIENT_StartRealPlay` | POST | Stream com callback de dados |
| `CLIENT_StopRealPlay` | POST | Para visualização ao vivo |
| `CLIENT_MultiPlay` | POST | Múltiplos streams simultâneos |
| `CLIENT_PrerecordStream` | POST | Stream com pré-gravação |

**APIs Implementáveis:**
```http
POST /api/dvr/camera/live/start
POST /api/dvr/camera/live/stop
POST /api/dvr/camera/live/multi
```

### 1.2 Snapshots & Capturas

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `CLIENT_CapturePicture` | POST | Captura snapshot do stream |
| `CLIENT_CapturePictureEx` | POST | Captura com formato específico |
| `CLIENT_SnapPicture` | POST | Snapshot direto do DVR |
| `CLIENT_SnapPictureEx` | POST | Snapshot com parâmetros |
| `CLIENT_SnapPictureToFile` | POST | Snapshot direto para arquivo |

**APIs Implementáveis:**
```http
POST /api/dvr/camera/snapshot
POST /api/dvr/camera/snapshot-custom
POST /api/dvr/camera/snapshot-all-channels
```

### 1.3 Controle de Áudio

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `CLIENT_OpenSound` | POST | Abre áudio do stream |
| `CLIENT_CloseSound` | POST | Fecha áudio |
| `CLIENT_SetVolume` | POST | Controla volume |
| `CLIENT_AudioDec` | POST | Decodifica áudio |

**APIs Implementáveis:**
```http
POST /api/dvr/camera/audio/enable
POST /api/dvr/camera/audio/volume
```

---

## 🎮 **2. CONTROLE PTZ (Pan-Tilt-Zoom)**

### 2.1 Movimentos Básicos

| Comando NetSDK | Descrição | API REST |
|----------------|-----------|----------|
| `CLIENT_PTZControl` | Controle PTZ genérico | `POST /api/dvr/ptz/control` |
| `CLIENT_DHPTZControl` | PTZ Dahua/Intelbras | `POST /api/dvr/ptz/move` |
| `CLIENT_DHPTZControlEx` | PTZ estendido | `POST /api/dvr/ptz/move-ex` |

**Comandos de Movimento:**
```typescript
// Direções
PTZ_UP_CONTROL        // ⬆️ Cima
PTZ_DOWN_CONTROL      // ⬇️ Baixo
PTZ_LEFT_CONTROL      // ⬅️ Esquerda
PTZ_RIGHT_CONTROL     // ➡️ Direita
PTZ_UP_LEFT_CONTROL   // ↖️ Diagonal superior esquerda
PTZ_UP_RIGHT_CONTROL  // ↗️ Diagonal superior direita
PTZ_DOWN_LEFT_CONTROL // ↙️ Diagonal inferior esquerda
PTZ_DOWN_RIGHT_CONTROL// ↘️ Diagonal inferior direita
```

**APIs Implementadas:**
```http
POST /api/dvr/ptz/up
POST /api/dvr/ptz/down
POST /api/dvr/ptz/left
POST /api/dvr/ptz/right
```

### 2.2 Zoom & Foco

| Comando | API REST |
|---------|----------|
| `PTZ_ZOOM_ADD_CONTROL` | `POST /api/dvr/ptz/zoom-in` |
| `PTZ_ZOOM_DEC_CONTROL` | `POST /api/dvr/ptz/zoom-out` |
| `PTZ_FOCUS_ADD_CONTROL` | `POST /api/dvr/ptz/focus-far` |
| `PTZ_FOCUS_DEC_CONTROL` | `POST /api/dvr/ptz/focus-near` |
| `PTZ_IRIS_ENLARGE_CONTROL` | `POST /api/dvr/ptz/iris-open` |
| `PTZ_IRIS_REDUCE_CONTROL` | `POST /api/dvr/ptz/iris-close` |

### 2.3 Presets (Posições Salvas)

| Função NetSDK | API REST |
|---------------|----------|
| `CLIENT_DHPTZControl` (SET) | `POST /api/dvr/ptz/preset/set` |
| `CLIENT_DHPTZControl` (GOTO) | `POST /api/dvr/ptz/preset/goto` |
| `CLIENT_DHPTZControl` (DEL) | `POST /api/dvr/ptz/preset/delete` |

---

## 📼 **3. GRAVAÇÕES & PLAYBACK**

### 3.1 Buscar Gravações

| Função NetSDK | Descrição | API REST |
|---------------|-----------|----------|
| `CLIENT_QueryRecordFile` | Busca arquivos gravados | `GET /api/dvr/recordings/search` |
| `CLIENT_QueryRecordTime` | Verifica se tem gravação | `GET /api/dvr/recordings/check` |
| `CLIENT_QueryRecordStatus` | Status de gravação | `GET /api/dvr/recordings/status` |
| `CLIENT_FindFile` | Busca por período | `POST /api/dvr/recordings/find` |
| `CLIENT_FindNextFile` | Próximo arquivo | `GET /api/dvr/recordings/next` |

**APIs Implementáveis:**
```http
GET  /api/dvr/recordings/search?channel=0&start=2025-01-01&end=2025-01-31
GET  /api/dvr/recordings/status/channel/:id
POST /api/dvr/recordings/find
```

### 3.2 Reprodução (Playback)

| Função NetSDK | Descrição | API REST |
|---------------|-----------|----------|
| `CLIENT_PlayBackByTime` | Reproduz por período | `POST /api/dvr/playback/by-time` |
| `CLIENT_PlayBackByRecordFile` | Reproduz arquivo específico | `POST /api/dvr/playback/by-file` |
| `CLIENT_SeekPlayBack` | Avança/retrocede | `POST /api/dvr/playback/seek` |
| `CLIENT_PausePlayBack` | Pausa/resume | `POST /api/dvr/playback/pause` |
| `CLIENT_StopPlayBack` | Para reprodução | `POST /api/dvr/playback/stop` |
| `CLIENT_SetPlayBackSpeed` | Controla velocidade | `POST /api/dvr/playback/speed` |

**Velocidades de Reprodução:**
```typescript
EM_PLAY_BACK_SPEED_1 = 0    // Normal
EM_PLAY_BACK_SPEED_2 = 1    // 2x
EM_PLAY_BACK_SPEED_4 = 2    // 4x
EM_PLAY_BACK_SPEED_8 = 3    // 8x
EM_PLAY_BACK_SPEED_SLOW_4 = 4  // 1/4x
EM_PLAY_BACK_SPEED_SLOW_8 = 5  // 1/8x
```

### 3.3 Download de Gravações

| Função NetSDK | API REST |
|---------------|----------|
| `CLIENT_DownloadByTime` | `POST /api/dvr/download/by-time` |
| `CLIENT_DownloadByRecordFile` | `POST /api/dvr/download/by-file` |
| `CLIENT_GetDownloadPos` | `GET /api/dvr/download/progress` |
| `CLIENT_StopDownload` | `POST /api/dvr/download/cancel` |

---

## 🚨 **4. EVENTOS & ALARMES**

### 4.1 Escutar Eventos

| Função NetSDK | Descrição | API REST |
|---------------|-----------|----------|
| `CLIENT_StartListen` | Escuta eventos básicos | WebSocket `/ws/dvr/events` |
| `CLIENT_StartListenEx` | Escuta eventos estendidos | WebSocket `/ws/dvr/events-ex` |
| `CLIENT_StopListen` | Para escuta | - |

**Tipos de Eventos Suportados:**
```typescript
DH_COMM_ALARM                // Alarme geral
DH_MOTION_ALARM_EX           // Detecção de movimento
DH_VIDEOLOST_ALARM_EX        // Perda de vídeo
DH_SHELTER_ALARM_EX          // Câmera obstruída
DH_SOUND_DETECT_ALARM_EX     // Detecção de áudio
DH_DISKFULL_ALARM_EX         // Disco cheio
DH_DISKERROR_ALARM_EX        // Erro no disco
DH_ALARM_ACCESS_CTL_EVENT    // Evento de controle de acesso
DH_EVENT_FACE_DETECTION      // Detecção de rosto
DH_EVENT_CROSSLINE_DETECTION // Cruzamento de linha
DH_ALARM_IVS                 // Análise inteligente
```

**APIs Implementáveis:**
```http
WebSocket: ws://localhost:3001/ws/dvr/events
GET /api/dvr/events/history
GET /api/dvr/events/types
```

### 4.2 Reset de Alarmes

| Função NetSDK | API REST |
|---------------|----------|
| `CLIENT_AlarmReset` | `POST /api/dvr/alarm/reset` |

---

## ⚙️ **5. CONFIGURAÇÕES DO DISPOSITIVO**

### 5.1 Configurações Gerais

| Função NetSDK | Descrição | API REST |
|---------------|-----------|----------|
| `CLIENT_GetDevConfig` | Busca configuração | `GET /api/dvr/config/:type` |
| `CLIENT_SetDevConfig` | Altera configuração | `PUT /api/dvr/config/:type` |
| `CLIENT_QuerySystemInfo` | Info do sistema | `GET /api/dvr/system/info` |
| `CLIENT_QueryDevState` | Estado do dispositivo | `GET /api/dvr/device/state` |

**Tipos de Configuração:**
```typescript
DH_DEV_DEVICECFG          // Config geral
DH_DEV_NETCFG             // Config de rede
DH_DEV_CHANNELCFG         // Config de canal
DH_DEV_RECORDCFG          // Config de gravação
DH_DEV_TIMECFG            // Config de hora
DH_DEV_ALARM_SCHEDULE     // Agenda de alarmes
```

### 5.2 Informações do Sistema

| Função NetSDK | API REST |
|---------------|----------|
| `CLIENT_QueryChannelName` | `GET /api/dvr/channels/names` |
| `CLIENT_QueryDeviceTime` | `GET /api/dvr/device/time` |
| `CLIENT_SetupDeviceTime` | `PUT /api/dvr/device/time` |
| `CLIENT_GetSDKVersion` | `GET /api/dvr/sdk/version` |

---

## 🏢 **6. CONTROLE DE ACESSO**

### 6.1 Usuários e Autenticação

| Função NetSDK | Descrição | API REST |
|---------------|-----------|----------|
| `CLIENT_QueryUserInfo` | Lista usuários | `GET /api/dvr/users` |
| `CLIENT_OperateUserInfo` | Gerencia usuários | `POST /api/dvr/users/manage` |
| `CLIENT_OperateUserInfoEx` | Gerencia usuários (Ex) | `POST /api/dvr/users/manage-ex` |

### 6.2 Eventos de Acesso

| Evento | Webhook |
|--------|---------|
| `DH_ALARM_ACCESS_CTL_EVENT` | `POST /webhook/access/event` |
| `DH_ALARM_ACCESS_SNAP` | `POST /webhook/access/snapshot` |
| `DH_ALARM_CARD_RECORD` | `POST /webhook/access/card` |

---

## 🎯 **7. ANÁLISE INTELIGENTE (IVS)**

### 7.1 Eventos Inteligentes

| Evento NetSDK | Descrição |
|---------------|-----------|
| `DH_EVENT_FACE_DETECTION` | Detecção de rosto |
| `DH_EVENT_CROSSLINE_DETECTION` | Cruzamento de linha |
| `DH_EVENT_CROSSREGION_DETECTION` | Intrusão em área |
| `DH_EVENT_LEFT_DETECTION` | Objeto abandonado |
| `DH_EVENT_TAKENAWAYDETECTION` | Objeto removido |
| `DH_ALARM_MOVEDETECTION` | Movimento |
| `DH_ALARM_WANDERDETECTION` | Perambulação |
| `DH_ALARM_PARKINGDETECTION` | Estacionamento proibido |

**APIs Implementáveis:**
```http
GET  /api/dvr/ivs/events
POST /api/dvr/ivs/config
GET  /api/dvr/ivs/statistics
```

### 7.2 Reconhecimento Facial

| Função NetSDK | API REST |
|---------------|----------|
| `CLIENT_FaceRecognitionPutDisposition` | `POST /api/dvr/face/add` |
| `CLIENT_FaceRecognitionDelDisposition` | `DELETE /api/dvr/face/:id` |
| `CLIENT_StartFindFaceRecognition` | `POST /api/dvr/face/search` |
| `CLIENT_DetectFace` | `POST /api/dvr/face/detect` |

---

## 📊 **8. INTEGRAÇÕES ESPECIAIS**

### 8.1 POS (Ponto de Venda)

| Função NetSDK | Descrição | API REST |
|---------------|-----------|----------|
| `CLIENT_AttachPosTrade` | Monitora transações POS | WebSocket `/ws/dvr/pos` |
| `CLIENT_DetachPosTrade` | Para monitoramento | - |

**Eventos POS:**
- Transação iniciada
- Pagamento processado
- Cancelamento
- Fechamento de caixa

**Dados Capturados:**
```typescript
interface POSTransaction {
  transactionId: string;
  timestamp: Date;
  amount: number;
  items: POSItem[];
  cashier: string;
  cameraChannel: number;
  videoTimestamp: Date;
}
```

### 8.2 ATM (Caixa Eletrônico)

| Função NetSDK | API REST |
|---------------|----------|
| `CLIENT_SetDevConfig(DH_DEV_ATM_OVERLAY_CFG)` | `PUT /api/dvr/atm/overlay` |

### 8.3 Tráfego (ITS)

| Função NetSDK | Descrição |
|---------------|-----------|
| `CLIENT_TrafficSnapByNetwork` | Captura por rede |
| `CLIENT_TrafficForceLightState` | Controla semáforo |
| `CLIENT_StartTrafficFluxStat` | Estatísticas de fluxo |

---

## 🔧 **9. MANUTENÇÃO & DIAGNÓSTICO**

### 9.1 Controle do Dispositivo

| Função NetSDK | API REST |
|---------------|----------|
| `CLIENT_RebootDev` | `POST /api/dvr/device/reboot` |
| `CLIENT_ShutDownDev` | `POST /api/dvr/device/shutdown` |
| `CLIENT_ControlDevice` | `POST /api/dvr/device/control` |

### 9.2 Logs e Diagnóstico

| Função NetSDK | API REST |
|---------------|----------|
| `CLIENT_QueryLog` | `GET /api/dvr/logs` |
| `CLIENT_QueryDeviceLog` | `GET /api/dvr/logs/device` |
| `CLIENT_QueryLogEx` | `GET /api/dvr/logs/extended` |

### 9.3 Backup & Restore

| Função NetSDK | API REST |
|---------------|----------|
| `CLIENT_ImportConfigFile` | `POST /api/dvr/config/import` |
| `CLIENT_ExportConfigFile` | `GET /api/dvr/config/export` |

---

## 📱 **10. COMUNICAÇÃO**

### 10.1 Áudio Bidirecional (Talk)

| Função NetSDK | Descrição | API REST |
|---------------|-----------|----------|
| `CLIENT_StartTalkEx` | Inicia talk | `POST /api/dvr/talk/start` |
| `CLIENT_TalkSendData` | Envia áudio | WebSocket `/ws/dvr/talk` |
| `CLIENT_StopTalkEx` | Para talk | `POST /api/dvr/talk/stop` |

---

## 🗺️ **ROADMAP DE IMPLEMENTAÇÃO**

### ✅ Fase 1 - COMPLETA
- [x] Login/Logout
- [x] Controle PTZ básico
- [x] Captura de snapshots
- [x] Status da conexão

### 🚧 Fase 2 - EM PROGRESSO
- [ ] Eventos e alarmes (WebSocket)
- [ ] Busca de gravações
- [ ] Playback de vídeos

### 📋 Fase 3 - PLANEJADA
- [ ] Download de gravações
- [ ] Integração POS
- [ ] Reconhecimento facial
- [ ] Análise inteligente (IVS)

### 🔮 Fase 4 - FUTURO
- [ ] Áudio bidirecional
- [ ] Controle de acesso
- [ ] Integração ATM
- [ ] Estatísticas de tráfego

---

## 📚 REFERÊNCIAS

- **NetSDK Programming Guide**: [PDF](./NetSDK%203.050/Linux/doc/)
- **Header File**: `dhnetsdk.h` - Contém todas as definições
- **Demos**: `NetSDK 3.050/Linux/demo/` - Exemplos em C++

---

## 🎓 EXEMPLOS DE USO

### Exemplo 1: Buscar gravações e capturar snapshot

```http
# 1. Buscar gravações do dia
GET /api/dvr/recordings/search?channel=0&date=2025-01-15

# 2. Capturar snapshot do momento
POST /api/dvr/camera/snapshot
{
  "channel": 0
}
```

### Exemplo 2: Controlar PTZ e salvar preset

```http
# 1. Mover câmera
POST /api/dvr/ptz/up
{ "channel": 0, "speed": 6 }

# 2. Dar zoom
POST /api/dvr/ptz/zoom-in
{ "channel": 0, "speed": 4 }

# 3. Salvar posição como preset
POST /api/dvr/ptz/preset/set
{ "channel": 0, "presetNumber": 1 }

# 4. Voltar ao preset depois
POST /api/dvr/ptz/preset/goto
{ "channel": 0, "presetNumber": 1 }
```

### Exemplo 3: Monitorar eventos em tempo real

```javascript
const ws = new WebSocket('ws://localhost:3001/ws/dvr/events');

ws.on('message', (event) => {
  console.log('Evento recebido:', event);

  if (event.type === 'MOTION_DETECTION') {
    // Capturar snapshot automaticamente
    captureSnapshot(event.channel);
  }
});
```

---

**Total de Endpoints Disponíveis: 200+**
**Endpoints Implementados: ~15**
**Cobertura: ~7.5%**

Há muito espaço para expandir a integração! 🚀
