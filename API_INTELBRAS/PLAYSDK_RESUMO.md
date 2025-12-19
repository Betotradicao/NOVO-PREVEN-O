# 🎥 PlaySDK - Resumo e Quando Usar

## 📌 O Que é o PlaySDK?

O **PlaySDK** é uma biblioteca da Intelbras/Dahua para **reprodução e processamento de vídeo**.

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│     DVR     │────────▶│   PlaySDK   │────────▶│   Aplicação │
│  (Vídeo)    │  Stream │ (Decoder)   │  Frames │   (Display) │
└─────────────┘         └─────────────┘         └─────────────┘
```

---

## 🎯 Para Que Serve?

### ✅ Use PlaySDK Para:

1. **Reproduzir vídeo gravado** do DVR
   - Baixar arquivo de vídeo e reproduzir
   - Controlar playback (play, pause, seek)
   - Avançar/retroceder frames

2. **Processar stream em tempo real**
   - Decodificar H.264/H.265
   - Renderizar frames
   - Processar áudio

3. **Capturar snapshots**
   - Extrair frame específico do vídeo
   - Salvar como imagem (JPEG, BMP)

4. **Análise de vídeo**
   - Processar frames individualmente
   - Aplicar filtros
   - Detecção de movimento (customizado)

5. **Player customizado**
   - Criar interface de reprodução própria
   - Multi-stream (várias câmeras simultâneas)
   - Picture-in-Picture

---

## ❌ NÃO Use PlaySDK Para:

- ❌ Controlar DVR (use **NetSDK**)
- ❌ Configurar câmeras (use **NetSDK**)
- ❌ Enviar dados POS (use **TCP direto**)
- ❌ Login no DVR (use **NetSDK**)
- ❌ Buscar eventos (use **NetSDK**)

---

## 📁 Estrutura do PlaySDK 3.042

```
PlaySDK 3.042/
├── Windows C++/
│   └── 191225/
│       ├── General_PlaySDK_Eng_Windows64_IS_V3.042.zip
│       └── General_PlaySDK_Eng_Windows32_IS_V3.042.zip
├── Linux/
│   ├── Bin/
│   │   ├── dhplay.h          ← Arquivo de header principal
│   │   └── libdhplay.so      ← Biblioteca compartilhada
│   ├── Demo_Src/
│   │   └── PlayDemo/         ← Exemplo completo de uso
│   └── Manual/
│       └── PLAYSDK.chm       ← Documentação (formato CHM)
└── MAC OS/
```

---

## 🔧 Principais Funções

### 1. Inicialização

```c
PLAY_InitDDraw()           // Inicializar renderização
PLAY_OpenStream()          // Abrir stream de vídeo
PLAY_Play()                // Iniciar reprodução
PLAY_Stop()                // Parar reprodução
PLAY_CloseStream()         // Fechar stream
PLAY_ReleaseDDraw()        // Liberar recursos
```

### 2. Controle de Playback

```c
PLAY_Pause()               // Pausar
PLAY_Fast()                // Avançar rápido
PLAY_Slow()                // Câmera lenta
PLAY_SetPlayPos()          // Pular para posição
PLAY_GetPlayPos()          // Obter posição atual
```

### 3. Áudio

```c
PLAY_PlaySound()           // Reproduzir áudio
PLAY_StopSound()           // Parar áudio
PLAY_SetVolume()           // Ajustar volume
PLAY_OpenAudioRecord()     // Gravar áudio
```

### 4. Snapshot

```c
PLAY_GetBMP()              // Capturar frame como BMP
PLAY_GetJPEG()             // Capturar frame como JPEG
PLAY_SnapShotToBuffer()    // Capturar para buffer
```

### 5. Processamento

```c
PLAY_SetDisplayCallBack()  // Callback para cada frame
PLAY_SetDecCallBack()      // Callback após decodificação
PLAY_SetFileEndCallBack()  // Callback ao fim do arquivo
```

---

## 💡 Exemplo de Uso (Conceitual)

### Cenário: Reproduzir Vídeo Gravado

```c
// 1. Inicializar
PLAY_InitDDraw(hwnd);

// 2. Abrir stream
DWORD port = 0;
PLAY_OpenStream(port, buffer, bufLen, BUF_VIDEO_SRC);

// 3. Configurar janela de exibição
PLAY_Play(port, hwnd);

// 4. Alimentar dados
while (hasMoreData) {
    PLAY_InputData(port, videoData, dataLen);
}

// 5. Limpar
PLAY_Stop(port);
PLAY_CloseStream(port);
PLAY_ReleaseDDraw();
```

### Cenário: Capturar Snapshot

```c
// Durante reprodução...
PLAY_GetJPEG(port, "snapshot.jpg", 80); // Qualidade 80%
```

---

## 🔗 Integração com NetSDK

O PlaySDK geralmente é usado **junto** com o NetSDK:

```
┌──────────────────────────────────────────────────────────────┐
│                    Sua Aplicação                             │
├──────────────────────────────────────────────────────────────┤
│  NetSDK                          │  PlaySDK                  │
│  ├── Login no DVR                │  ├── Decodificar stream   │
│  ├── Buscar vídeo gravado        │  ├── Renderizar vídeo     │
│  ├── Baixar arquivo              │  ├── Controlar playback   │
│  └── Obter stream                │  └── Capturar snapshot    │
└──────────────────────────────────────────────────────────────┘
         │                                    │
         ▼                                    ▼
    ┌─────────────────────────────────────────────┐
    │              DVR Intelbras                  │
    └─────────────────────────────────────────────┘
```

**Fluxo típico:**
1. **NetSDK**: Login no DVR
2. **NetSDK**: Buscar arquivo de vídeo
3. **NetSDK**: Iniciar download/stream
4. **PlaySDK**: Decodificar e reproduzir
5. **PlaySDK**: Capturar snapshots se necessário
6. **NetSDK**: Logout

---

## 🚫 Por Que NÃO Precisamos Dele Agora?

Para testar o **sistema POS**, você **NÃO precisa** do PlaySDK porque:

1. **POS é texto**, não vídeo
   - Você envia dados via TCP
   - DVR sobrepõe texto no vídeo
   - Você vê o resultado direto na tela do DVR

2. **Não estamos processando vídeo**
   - Não estamos decodificando streams
   - Não estamos criando player customizado
   - Apenas enviando dados de transação

3. **NetSDK já faz tudo que precisamos**
   - Configurar POS no DVR
   - Monitorar transações
   - Buscar histórico

---

## 🎓 Quando Você VAI Precisar do PlaySDK?

Use o PlaySDK no futuro quando precisar:

### 1. **Criar um Player de Vídeo Customizado**
```
Exemplo: Interface web para ver vídeos do DVR
```

### 2. **Processar Vídeos Gravados**
```
Exemplo: Extrair todos os frames de um vídeo
         Aplicar filtros/marca d'água
         Converter formato
```

### 3. **Análise de Vídeo**
```
Exemplo: Contagem de pessoas
         Detecção de placas
         Análise de comportamento
```

### 4. **Integração com IA**
```
Exemplo: Processar frames com modelo de ML
         Detecção de objetos
         Reconhecimento facial
```

### 5. **Multi-Visualização Customizada**
```
Exemplo: Mostrar 16 câmeras simultaneamente
         Com controles independentes
         Picture-in-Picture
```

---

## 📚 Documentação Disponível

1. **Manual CHM**: `PlaySDK 3.042/Linux/Manual/PLAYSDK.chm`
   - Documentação completa em inglês
   - Lista de todas as funções
   - Exemplos de código

2. **Headers**: `PlaySDK 3.042/Linux/Bin/dhplay.h`
   - Definições de funções
   - Estruturas de dados
   - Constantes e enums

3. **Demos**: `PlaySDK 3.042/Linux/Demo_Src/`
   - Código fonte completo de exemplos
   - Interface gráfica (Qt)
   - Casos de uso práticos

---

## ⚠️ Compatibilidade

- **Plataformas**: Windows, Linux, MacOS
- **Codecs**: H.264, H.265, MJPEG
- **Formatos**: Arquivos .dav, .mp4, streams RTSP
- **Áudio**: G.711, G.726, AAC

---

## 📝 Resumo Executivo

| Aspecto | Descrição |
|---------|-----------|
| **Função** | Reproduzir e processar vídeo do DVR |
| **Necessário para POS?** | ❌ NÃO |
| **Quando usar?** | Player customizado, análise de vídeo |
| **Complexidade** | Alta (C/C++, baixo nível) |
| **Alternativa** | Ver vídeo direto na interface do DVR |

---

## ✅ Conclusão

Para o seu caso atual (testar sistema POS):
- ✅ **Use NetSDK** - Para configurar e monitorar POS
- ✅ **Use TCP direto** - Para enviar cupons
- ❌ **NÃO precisa PlaySDK** - POS é só texto

Guarde o PlaySDK para quando precisar trabalhar com **reprodução de vídeo**.

---

**Criado em:** 19/12/2025
**Status:** 📚 Documentação de Referência
