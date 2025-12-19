# 🎯 Guia Completo de APIs Intelbras DVR

Este documento resume como usar as APIs do DVR Intelbras **sem precisar das pastas pesadas** do NetSDK e PlaySDK.

---

## 📚 Índice

1. [Visão Geral](#visão-geral)
2. [HTTP API (Mais Simples)](#http-api-mais-simples)
3. [NetSDK (Avançado)](#netsdk-avançado)
4. [PlaySDK (Reprodução de Vídeo)](#playsdk-reprodução-de-vídeo)
5. [Integração POS (TCP)](#integração-pos-tcp)
6. [Download dos SDKs](#download-dos-sdks)

---

## 🔍 Visão Geral

O DVR Intelbras oferece **3 formas** de integração:

| Método | Uso | Complexidade | Quando Usar |
|--------|-----|--------------|-------------|
| **HTTP API** | Configuração e controle básico | ⭐ Fácil | Configurar DVR, testar conexão |
| **NetSDK** | Controle completo do DVR | ⭐⭐⭐ Difícil | PTZ, snapshots, eventos |
| **PlaySDK** | Reprodução de vídeo | ⭐⭐⭐⭐ Muito Difícil | Player customizado, análise |
| **TCP POS** | Envio de dados PDV | ⭐⭐ Médio | Sobrepor texto no vídeo |

---

## 🌐 HTTP API (Mais Simples)

### O Que é?

API HTTP simples usando **Digest Authentication** para configurar e controlar o DVR.

### Autenticação

```bash
# Formato básico
curl -u usuario:senha --digest "http://IP_DVR/cgi-bin/configManager.cgi?action=ACAO&name=NOME"
```

### Exemplos Práticos

#### 1. Ver Configuração de Email

```bash
curl -u admin:senha --digest "http://10.6.1.123/cgi-bin/configManager.cgi?action=getConfig&name=Email"
```

**Resposta:**
```
table.Email.Enable=true
table.Email.SMTPServer=smtp.gmail.com
table.Email.SMTPPort=587
table.Email.UserName=email@gmail.com
```

#### 2. Configurar Senha de Email

```bash
curl -u admin:senha --digest "http://10.6.1.123/cgi-bin/configManager.cgi?action=setConfig&Email.Password=APP_PASSWORD_16_CHARS"
```

#### 3. Ver Configuração POS

```bash
curl -u admin:senha --digest "http://10.6.1.123/cgi-bin/configManager.cgi?action=getConfig&name=PosConfig"
```

#### 4. Configurar POS como TCP Client

```bash
curl -u admin:senha --digest "http://10.6.1.123/cgi-bin/configManager.cgi?action=setConfig&PosConfig[0].Mode=2&PosConfig[0].ServerIP=10.6.1.75&PosConfig[0].ServerPort=52348"
```

**Valores de Mode:**
- `0` = Desabilitado
- `1` = TCP (DVR é servidor)
- `2` = TCP_CLIENT (DVR é cliente)

#### 5. Desabilitar Overlay POS

```bash
curl -u admin:senha --digest "http://10.6.1.123/cgi-bin/configManager.cgi?action=setConfig&PosConfig[0].OverlayEnable=false"
```

### Principais Endpoints

| Endpoint | Descrição |
|----------|-----------|
| `configManager.cgi?action=getConfig&name=Email` | Ver config de email |
| `configManager.cgi?action=getConfig&name=PosConfig` | Ver config POS |
| `configManager.cgi?action=getConfig&name=General` | Info geral do DVR |
| `configManager.cgi?action=setConfig&PARAM=VALOR` | Alterar configuração |
| `magicBox.cgi?action=reboot` | Reiniciar DVR |

### Vantagens

✅ Não precisa instalar bibliotecas
✅ Funciona em qualquer linguagem
✅ Fácil de testar com curl/Postman
✅ Ideal para configuração remota

### Limitações

❌ Não captura snapshots
❌ Não controla PTZ
❌ Não recebe eventos em tempo real

---

## 🔧 NetSDK (Avançado)

### O Que é?

Biblioteca C/C++ da Intelbras para **controle completo** do DVR.

### Para Que Serve?

✅ Login no DVR
✅ Controle PTZ (câmeras móveis)
✅ Captura de snapshots
✅ Buscar vídeos gravados
✅ Receber eventos (movimento, alarme)
✅ Configuração avançada

### ❌ Não Use Para:

- Configuração simples (use HTTP API)
- Reproduzir vídeo (use PlaySDK)
- Enviar dados POS (use TCP direto)

### Como Baixar

**Site oficial Intelbras:**
```
https://www.intelbras.com.br/downloads
→ Câmeras e DVRs
→ DVR MHDX 5000
→ SDK
```

**Versão recomendada:** NetSDK 3.050+

### Estrutura Básica (Node.js com FFI)

```javascript
const ffi = require('ffi-napi');
const ref = require('ref-napi');

// Carregar DLL/SO
const netSDK = ffi.Library('dhnetsdk.dll', {
  'CLIENT_Init': ['bool', []],
  'CLIENT_Login': ['long', ['string', 'int', 'string', 'string']],
  'CLIENT_Logout': ['bool', ['long']],
  'CLIENT_Cleanup': ['void', []]
});

// Uso
netSDK.CLIENT_Init();
const loginID = netSDK.CLIENT_Login('10.6.1.123', 37777, 'admin', 'senha');
// ... operações ...
netSDK.CLIENT_Logout(loginID);
netSDK.CLIENT_Cleanup();
```

### Principais Funções

```c
// Inicialização
CLIENT_Init()                          // Inicializar SDK
CLIENT_Cleanup()                       // Finalizar SDK

// Login
CLIENT_Login(ip, porta, user, pass)    // Login no DVR
CLIENT_Logout(loginID)                 // Logout

// PTZ
CLIENT_PTZControl(loginID, canal, cmd, speed)
  // Comandos: UP=0, DOWN=1, LEFT=2, RIGHT=3
  //           ZOOM_IN=4, ZOOM_OUT=5

// Snapshot
CLIENT_SnapPicture(loginID, canal, path)

// Eventos
CLIENT_StartListenEx(loginID)          // Escutar eventos
```

### Documentação

Todos os manuais estão em: `API_INTELBRAS/Manual/`

- **NetSDK Programming Guide.pdf** - Guia completo
- **HTTP API Reference.pdf** - Referência da API HTTP
- Exemplos de código em C++

---

## 🎥 PlaySDK (Reprodução de Vídeo)

### O Que é?

Biblioteca para **decodificar e reproduzir** vídeos do DVR.

### Para Que Serve?

✅ Criar player de vídeo customizado
✅ Decodificar streams H.264/H.265
✅ Processar frames individualmente
✅ Análise de vídeo com IA
✅ Capturar snapshots durante reprodução

### ❌ Você NÃO Precisa Dele Para:

- Sistema POS (é só texto!)
- Configurar DVR (use HTTP API)
- Controlar câmeras (use NetSDK)
- Ver vídeo (use interface web do DVR)

### Quando Você VAI Precisar?

**Cenários futuros:**

1. **Player customizado** no frontend
2. **Análise de vídeo** com ML/IA
3. **Processar vídeos** gravados
4. **Multi-visualização** (16 câmeras simultâneas)

### Como Baixar

**Site oficial Intelbras:**
```
https://www.intelbras.com.br/downloads
→ Câmeras e DVRs
→ DVR MHDX 5000
→ SDK
```

**Versão recomendada:** PlaySDK 3.042+

### Principais Funções

```c
// Inicialização
PLAY_InitDDraw()               // Inicializar renderização
PLAY_OpenStream()              // Abrir stream
PLAY_Play()                    // Reproduzir
PLAY_Stop()                    // Parar
PLAY_CloseStream()             // Fechar

// Controle
PLAY_Pause()                   // Pausar
PLAY_Fast()                    // Avançar rápido
PLAY_Slow()                    // Câmera lenta

// Snapshot
PLAY_GetJPEG()                 // Salvar frame como JPEG
PLAY_GetBMP()                  // Salvar frame como BMP
```

### Integração com NetSDK

```
Fluxo típico:
1. NetSDK → Login no DVR
2. NetSDK → Buscar arquivo de vídeo
3. NetSDK → Iniciar download
4. PlaySDK → Decodificar stream
5. PlaySDK → Reproduzir/processar
6. NetSDK → Logout
```

---

## 🧾 Integração POS (TCP)

### O Que é?

Enviar dados de PDV (cupons fiscais) para o DVR sobrepor no vídeo.

### Protocolo

**Conexão TCP simples** na porta configurada (ex: 52348)

### Formato dos Dados

```
LINHA_1\r\nLINHA_2\r\nLINHA_3\r\n
```

**Exemplo:**
```
PREVENCAO NO RADAR\r\nCPF: 123.456.789-00\r\nVALOR: R$ 150,00\r\n
```

### Configuração

1. **Via HTTP API:**
```bash
curl -u admin:senha --digest \
"http://10.6.1.123/cgi-bin/configManager.cgi?action=setConfig&PosConfig[0].Mode=1&PosConfig[0].ServerPort=52348&PosConfig[0].Channel=0"
```

2. **Parâmetros:**
- `Mode=1` → DVR como servidor TCP
- `Mode=2` → DVR como cliente TCP (conecta em ServerIP:ServerPort)
- `Channel=0` → Canal que vai mostrar o overlay
- `OverlayEnable=true` → Habilitar sobreposição

### Exemplo de Cliente (Node.js)

```javascript
const net = require('net');

const client = net.connect(52348, '10.6.1.123', () => {
  const cupom = 'PREVENCAO NO RADAR\r\n' +
                'CPF: 123.456.789-00\r\n' +
                'VALOR: R$ 150,00\r\n';

  client.write(cupom);
  client.end();
});
```

### ⚠️ Problema Conhecido

**Firmware atual trava** ao receber dados POS (bug confirmado).

**Soluções:**
1. Atualizar firmware do DVR
2. Usar modelo diferente
3. Aguardar correção da Intelbras

---

## 📥 Download dos SDKs

### Opção 1: Site Oficial (Recomendado)

```
https://www.intelbras.com.br/downloads

1. Acesse o site
2. Navegue: Produtos → Câmeras e DVRs → DVR MHDX 5000
3. Baixe: "SDK NetSDK" e "SDK PlaySDK"
4. Descompacte conforme sua plataforma (Windows/Linux/Mac)
```

### Opção 2: Suporte Intelbras

**Telefone:** 48 2106-0006
**Email:** suporte@intelbras.com.br
**Chat:** https://www.intelbras.com.br/suporte

### O Que Baixar?

| SDK | Tamanho | Quando Baixar |
|-----|---------|---------------|
| **NetSDK** | ~100 MB | Se precisar PTZ ou snapshots |
| **PlaySDK** | ~150 MB | Se for criar player customizado |
| **HTTP API** | 0 MB | Não precisa baixar nada! |

---

## 🎓 Resumo de Uso

### Para Configurar DVR

```bash
# Use HTTP API (curl)
curl -u admin:senha --digest "http://IP/cgi-bin/configManager.cgi?..."
```

### Para Controlar Câmera PTZ

```javascript
// Use NetSDK (baixe primeiro)
const netSDK = require('./netsdk-wrapper');
netSDK.ptzControl(loginID, canal, 'UP', 4);
```

### Para Reproduzir Vídeo

```javascript
// Use PlaySDK (baixe primeiro) + NetSDK
// 1. NetSDK baixa o vídeo
// 2. PlaySDK decodifica e exibe
```

### Para Enviar Dados POS

```javascript
// Use TCP direto (Node.js nativo)
const net = require('net');
const client = net.connect(porta, ip);
client.write('TEXTO DO CUPOM\r\n');
```

---

## 🔗 Links Úteis

- **Site Intelbras:** https://www.intelbras.com.br
- **Suporte:** https://www.intelbras.com.br/suporte
- **Downloads:** https://www.intelbras.com.br/downloads
- **Manual do DVR:** API_INTELBRAS/Manual/

---

## 📚 Documentação Incluída

Dentro de `API_INTELBRAS/Manual/` você encontra:

- ✅ Guia de Programação NetSDK
- ✅ Referência HTTP API completa
- ✅ Manual da câmera
- ✅ Exemplos de código
- ✅ Guia de troubleshooting

---

## ✅ Conclusão

**Para o seu projeto atual (POS):**

✅ Use **HTTP API** para configurar
✅ Use **TCP direto** para enviar cupons
❌ **NÃO precisa** NetSDK (ainda)
❌ **NÃO precisa** PlaySDK (é só texto!)

**Baixe os SDKs somente quando precisar de:**
- Controle PTZ
- Snapshots programáticos
- Player de vídeo customizado
- Análise de vídeo com IA

---

**Criado em:** 19/12/2025
**Versão:** 1.0
**Status:** 📚 Documentação completa - SDKs podem ser baixados quando necessário
