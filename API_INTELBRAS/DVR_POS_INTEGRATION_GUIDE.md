# 📟 Guia Completo de Integração POS com NetSDK Intelbras

## 📋 O que é a Integração POS?

A integração POS (Point of Sale / Ponto de Venda) permite que o DVR Intelbras **capture e sobreponha** dados de transações comerciais diretamente no vídeo de segurança.

### 🎯 Casos de Uso

- **Supermercados**: Associar vídeo do caixa com cada venda
- **Lojas de Varejo**: Rastrear transações e descontos
- **Restaurantes**: Vincular pedidos com vídeo
- **Postos de Gasolina**: Monitorar abastecimentos
- **Bancos**: Transações em caixas eletrônicos

---

## 🔧 Como Funciona?

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Sistema   │─────────│     DVR     │─────────│   Câmera    │
│     POS     │  Dados  │  Intelbras  │  Video  │   Caixa 1   │
│  (Caixa)    │   de    │  (NetSDK)   │   +     │             │
│             │ Vendas  │             │  Dados  │             │
└─────────────┘         └─────────────┘         └─────────────┘
                              │
                              │ Overlay
                              ▼
                   ┌─────────────────────┐
                   │  Vídeo com dados    │
                   │  da venda sobrepos- │
                   │  tos na tela        │
                   └─────────────────────┘
```

### Fluxo de Dados

1. **POS gera transação** → Venda de produto
2. **POS envia para DVR** → Via TCP/IP, RS232 ou RS485
3. **DVR sobrepõe no vídeo** → OSD com dados da venda
4. **DVR grava vídeo + dados** → Tudo sincronizado
5. **Busca inteligente** → Procurar venda por valor, produto, etc.

---

## 🔌 Tipos de Conexão POS

### 1. **TCP/IP (Rede)** ⭐ RECOMENDADO
```c
EM_CONN_TYPE_NET = 1
```

**Configuração:**
- IP do POS
- Porta do POS (origem)
- IP do DVR (destino)
- Porta do DVR (destino)

### 2. **RS232 (Serial)**
```c
EM_CONN_TYPE_RS232 = 2
```

**Configuração:**
- Canal COM (porta serial)
- Baud rate
- Data bits
- Stop bits
- Parity

### 3. **RS485 (Serial Multi-Drop)**
```c
EM_CONN_TYPE_RS485 = 3
```

**Configuração:**
- Canal COM
- Endereço do POS
- Configurações seriais

---

## 📦 Protocolo de Dados

### Protocolo Padrão (POS Protocol)
```c
EM_CONN_PROT_POS = 1
```
Protocolo pré-definido da Intelbras.

### Protocolo Customizado
```c
EM_CONN_PROT_NONE = 0
```

**Permite definir:**
```c
typedef struct {
    char szStartStr[32];        // String inicial (ex: "INICIO")
    BOOL bAnyCharater;          // Usar qualquer prefixo?
    char szEndStr[32];          // String final (ex: "FIM")
    char szLineDelimiter[32];   // Delimitador de linha (ex: "|")
    int  nMoreLine;             // Número de linhas por transação
    char szIgnoreStr[32];       // String para ignorar
    BOOL bCaseSensitive;        // Case sensitive?
} NET_POS_CUSTOM_PROT;
```

---

## 🎨 Estrutura de Dados POS

### 1. **Informação Básica do POS**

```c
typedef struct {
    BOOL         bEnable;                   // Habilitado?
    DWORD        dwPosId;                   // ID único do POS
    char         szName[64];                // Nome do POS (ex: "Caixa 1")

    // Conexão
    EM_CONN_TYPE emConnType;                // TCP, RS232 ou RS485
    NET_POS_NET_ATT stuNetAtt;              // Atributos de rede (se TCP)
    NET_POS_COM_ATT stuComAtt;              // Atributos serial (se RS232/485)

    // Protocolo
    EM_CONN_PROT emConnProt;                // Protocolo padrão ou custom
    NET_POS_CUSTOM_PROT stuCustom;          // Config de protocolo custom

    // Configurações
    int  nTimeOut;                          // Timeout (segundos)
    int  nLinkChannel[32];                  // Canais de câmera linkados
    int  nLinkChannelNum;                   // Quantidade de canais
    int  nPlayBackTime;                     // Tempo de playback associado (s)
    BOOL bPreviewBlend;                     // Sobrepor no preview?
} NET_POS_INFO;
```

### 2. **Dados da Transação**

```c
typedef struct {
    DWORD        dwPosId;                   // ID do POS
    NET_TIME     stuTime;                   // Timestamp da transação
    BYTE*        pbyComment;                // Dados da transação (texto)
    DWORD        dwCommentLen;              // Tamanho dos dados

    EM_POS_DATA_TYPE emDataType;           // Tipo: Loja ou Produto
    BOOL         bEnd;                      // Flag de fim de cupom
    void*        pPosData;                  // Dados estruturados
} NET_POS_TRADE_INFO;
```

### 3. **Dados da Loja** (Store Info)

```c
typedef struct {
    char   szDealNum[64];                   // Número da transação
    char   szShopName[256];                 // Nome da loja
    char   szCashier[64];                   // Nome do operador
    char   szMember[64];                    // Número do membro/cliente
    double dbCash;                          // Valor em dinheiro
    double dbCard;                          // Valor em cartão
    double dbTotal;                         // Total da compra
    double dbDiscount;                      // Desconto aplicado
} NET_STORE_INFO;
```

### 4. **Dados do Produto** (Product Info)

```c
typedef struct {
    char   szDealNum[64];                   // Número da transação
    char   szBarCode[64];                   // Código de barras
    char   szName[256];                     // Nome do produto
    double dbPrice;                         // Preço unitário
    double dbQuantity;                      // Quantidade (peças ou kg)
    double dbAmount;                        // Valor total (preço x qtd)
    char   szUnit[8];                       // Unidade (un, kg, etc)
} NET_PRODUCT_INFO;
```

---

## 🔗 Eventos e Linkagens POS

### Configuração de Linkagem

```c
typedef struct {
    DH_TSECT stuTimeSection[7][6];         // Horários ativos (7 dias x 6 períodos)

    // Gravação
    BOOL  bRecordEnable;                   // Gravar quando POS ativo?
    BOOL  bRecordCloudEnable;              // Gravar na nuvem?
    DWORD dwRecordMask[32];                // Canais para gravar
    int   nRecordLatch;                    // Tempo de gravação pós-evento (s)

    // Alarme
    BOOL  bAlarmOutEnable;                 // Ativar saída de alarme?
    DWORD dwAlarmOutMask[32];              // Saídas de alarme
    int   nAlarmOutLatch;                  // Tempo de alarme (s)

    // PTZ
    BOOL  bPtzLinkEnable;                  // Mover PTZ?
    int   nPtzLinkNum;                     // Quantidade de PTZ links
    NET_PTZ_LINK stuPtzLink[256];          // Configurações PTZ
    int   nPtzLinkDelay;                   // Delay do PTZ (s)

    // Snapshot
    BOOL  bSnapshotEnable;                 // Capturar snapshot?
    BOOL  bSnapshotCloudEnable;            // Snapshot na nuvem?
    DWORD dwSnapshotMask[32];              // Canais para snapshot
    int   nSnapshotPeriod;                 // Período de snapshot (s)

    // Outros
    int   nDejitter;                       // Anti-trepidação (s)
    BOOL  bLogEnable;                      // Registrar em log?
} NET_POS_EVENT_LINK;
```

---

## 🚀 API - Como Usar

### 1. **Adicionar um POS ao DVR**

```typescript
// Configurar informações do POS
const posInfo: NET_POS_INFO = {
    bEnable: true,
    szName: "Caixa 1 - Loja Principal",

    // Conexão TCP/IP
    emConnType: EM_CONN_TYPE.NET,
    stuNetAtt: {
        szSrcIp: "192.168.1.100",      // IP do sistema POS
        nSrcPort: 8888,                 // Porta do POS
        szDstIp: "192.168.1.108",      // IP do DVR
        nDstPort: 9999                  // Porta do DVR
    },

    // Protocolo
    emConnProt: EM_CONN_PROT.POS,      // Usar protocolo padrão

    // Configurações
    nTimeOut: 30,                       // 30 segundos timeout
    nLinkChannel: [0, 1],              // Canais 0 e 1 linkados
    nLinkChannelNum: 2,
    nPlayBackTime: 10,                  // 10s de vídeo antes da transação
    bPreviewBlend: true                 // Mostrar no preview
};

// Configurar eventos linkados
const posEventLink: NET_POS_EVENT_LINK = {
    bRecordEnable: true,               // Gravar quando houver transação
    nRecordLatch: 60,                  // Gravar por 60s após transação
    bSnapshotEnable: true,             // Capturar snapshot
    bLogEnable: true                   // Registrar em log
};

// Adicionar ao DVR
const inputParam = {
    stuPosInfo: posInfo,
    stuPosEventLink: posEventLink
};

CLIENT_ControlDeviceEx(
    loginHandle,
    DH_CTRL_POS_ADD,
    inputParam,
    outputParam,
    5000
);

console.log(`POS adicionado com ID: ${outputParam.dwPosId}`);
```

### 2. **Modificar Configuração de POS**

```typescript
// Mesmo formato do adicionar, mas precisa do dwPosId
inputParam.stuPosInfo.dwPosId = 1;  // ID do POS existente

CLIENT_ControlDeviceEx(
    loginHandle,
    DH_CTRL_POS_MODIFY,
    inputParam,
    outputParam,
    5000
);
```

### 3. **Remover POS**

```typescript
const removeParam = {
    dwPosId: 1  // ID do POS para remover
};

CLIENT_ControlDeviceEx(
    loginHandle,
    DH_CTRL_POS_REMOVE,
    removeParam,
    outputParam,
    5000
);
```

### 4. **Listar Todos os POS**

```typescript
const allPosInfo = Buffer.alloc(sizeof_NET_POS_ALL_INFO);

CLIENT_QueryDevState(
    loginHandle,
    DH_DEVSTATE_GET_ALL_POS,
    allPosInfo,
    bufferSize,
    returnedSize,
    5000
);

console.log(`Total de POS: ${allPosInfo.nRetPosNum}`);
for (let i = 0; i < allPosInfo.nRetPosNum; i++) {
    console.log(`POS ${i}: ${allPosInfo.stuPos[i].szName}`);
}
```

### 5. **Monitorar Transações em Tempo Real** ⭐

```typescript
// Callback que recebe dados de transação
const posTradeCallback = (
    loginId: number,
    attachHandle: number,
    tradeInfo: NET_POS_TRADE_INFO,
    bufLen: number,
    user: any
) => {
    console.log(`[POS ${tradeInfo.dwPosId}] Transação recebida`);
    console.log(`Timestamp: ${tradeInfo.stuTime}`);

    if (tradeInfo.emDataType === EM_POS_DATA_TYPE.STORE_INFO) {
        const storeInfo = tradeInfo.pPosData as NET_STORE_INFO;
        console.log(`Loja: ${storeInfo.szShopName}`);
        console.log(`Operador: ${storeInfo.szCashier}`);
        console.log(`Total: R$ ${storeInfo.dbTotal}`);
        console.log(`Desconto: R$ ${storeInfo.dbDiscount}`);
    }

    if (tradeInfo.emDataType === EM_POS_DATA_TYPE.PRODUCT_INFO) {
        const productInfo = tradeInfo.pPosData as NET_PRODUCT_INFO;
        console.log(`Produto: ${productInfo.szName}`);
        console.log(`Código: ${productInfo.szBarCode}`);
        console.log(`Qtd: ${productInfo.dbQuantity} ${productInfo.szUnit}`);
        console.log(`Valor: R$ ${productInfo.dbAmount}`);
    }

    if (tradeInfo.bEnd) {
        console.log('✅ Fim do cupom fiscal');
        // Aqui você pode processar o cupom completo
    }
};

// Anexar callback
const attachHandle = CLIENT_AttachPosTrade(
    loginHandle,
    {
        cbCallState: posTradeCallback,
        dwUser: null
    },
    outputParam,
    5000
);

// Para desanexar depois
CLIENT_DetachPosTrade(attachHandle);
```

### 6. **Buscar Transações por Critérios** 🔍

```typescript
// Buscar transações de um período
const searchParam = {
    nChannel: 0,                        // Canal 0
    stuStartTime: new Date('2025-01-01'),
    stuEndTime: new Date('2025-01-31'),
    szGoods: ['Cerveja', 'Refrigerante', '', ''],  // Produtos
    szFuzzyPattern: [
        EM_NET_POS_EXCHANGE_FUSSY_KEY.GOODS,  // Busca fuzzy por produto
        EM_NET_POS_EXCHANGE_FUSSY_KEY.NULL,
        EM_NET_POS_EXCHANGE_FUSSY_KEY.NULL,
        EM_NET_POS_EXCHANGE_FUSSY_KEY.NULL
    ],
    nPosId: -1                          // Todos os POS (-1 = todos)
};

// Iniciar busca
const findHandle = CLIENT_StartFind(
    loginHandle,
    NET_FIND.NET_FIND_POS_EXCHANGE,
    searchParam
);

// Buscar resultados
const results = CLIENT_DoFind(findHandle, 0, 100);  // Buscar 100 resultados

for (const result of results.arrPOSExchangeInfo) {
    console.log(`Transação em ${result.stuExchangeTime}`);
    console.log(`Detalhes: ${result.stuInfoEx.cDetail}`);
}

// Parar busca
CLIENT_StopFind(findHandle);
```

---

## 🎯 Exemplo Completo de Integração

```typescript
import IntelbrasNetSDK from './lib/intelbras-netsdk';

class POSIntegration {
    private sdk: IntelbrasNetSDK;
    private loginHandle: number;
    private attachHandle: number;
    private transactions: Map<string, any[]> = new Map();

    async initialize() {
        // 1. Inicializar SDK
        this.sdk = new IntelbrasNetSDK();
        this.sdk.init();

        // 2. Login no DVR
        this.loginHandle = this.sdk.login(
            '192.168.1.108',
            37777,
            'admin',
            'senha123'
        );

        // 3. Configurar POS
        await this.setupPOS();

        // 4. Monitorar transações
        await this.startMonitoring();
    }

    async setupPOS() {
        const posConfig = {
            stuPosInfo: {
                bEnable: true,
                szName: 'Caixa Principal',
                emConnType: EM_CONN_TYPE.NET,
                stuNetAtt: {
                    szSrcIp: '192.168.1.100',
                    nSrcPort: 8888,
                    szDstIp: '192.168.1.108',
                    nDstPort: 9999
                },
                emConnProt: EM_CONN_PROT.POS,
                nLinkChannel: [0],
                nLinkChannelNum: 1,
                nPlayBackTime: 10,
                bPreviewBlend: true
            },
            stuPosEventLink: {
                bRecordEnable: true,
                nRecordLatch: 60,
                bSnapshotEnable: true,
                bLogEnable: true
            }
        };

        const result = this.sdk.controlDevice(
            this.loginHandle,
            DH_CTRL_POS_ADD,
            posConfig
        );

        console.log(`✅ POS configurado com ID: ${result.dwPosId}`);
    }

    async startMonitoring() {
        this.attachHandle = this.sdk.attachPosTrade(
            this.loginHandle,
            this.onPOSTransaction.bind(this)
        );

        console.log('📡 Monitorando transações POS...');
    }

    private onPOSTransaction(tradeInfo: NET_POS_TRADE_INFO) {
        const dealNum = tradeInfo.pPosData?.szDealNum || 'unknown';

        // Inicializar cupom se novo
        if (!this.transactions.has(dealNum)) {
            this.transactions.set(dealNum, []);
        }

        // Adicionar item ao cupom
        this.transactions.get(dealNum)!.push(tradeInfo);

        // Se fim do cupom, processar
        if (tradeInfo.bEnd) {
            this.processCompletedTransaction(dealNum);
        }
    }

    private processCompletedTransaction(dealNum: string) {
        const items = this.transactions.get(dealNum);

        if (!items) return;

        console.log(`\n🧾 Cupom Fiscal Completo: ${dealNum}`);
        console.log('='.repeat(50));

        let storeInfo: NET_STORE_INFO | null = null;
        const products: NET_PRODUCT_INFO[] = [];

        for (const item of items) {
            if (item.emDataType === EM_POS_DATA_TYPE.STORE_INFO) {
                storeInfo = item.pPosData;
            } else if (item.emDataType === EM_POS_DATA_TYPE.PRODUCT_INFO) {
                products.push(item.pPosData);
            }
        }

        if (storeInfo) {
            console.log(`Loja: ${storeInfo.szShopName}`);
            console.log(`Operador: ${storeInfo.szCashier}`);
            console.log(`Cliente: ${storeInfo.szMember || 'N/A'}`);
            console.log('');
        }

        console.log('Produtos:');
        for (const product of products) {
            console.log(`  ${product.szName}`);
            console.log(`    Código: ${product.szBarCode}`);
            console.log(`    Qtd: ${product.dbQuantity} ${product.szUnit}`);
            console.log(`    Valor: R$ ${product.dbAmount.toFixed(2)}`);
        }

        if (storeInfo) {
            console.log('');
            console.log(`Subtotal: R$ ${storeInfo.dbTotal.toFixed(2)}`);
            if (storeInfo.dbDiscount > 0) {
                console.log(`Desconto: R$ ${storeInfo.dbDiscount.toFixed(2)}`);
            }
            console.log(`Total: R$ ${(storeInfo.dbTotal - storeInfo.dbDiscount).toFixed(2)}`);
        }

        console.log('='.repeat(50));

        // Limpar cupom processado
        this.transactions.delete(dealNum);

        // Aqui você pode:
        // - Salvar no banco de dados
        // - Enviar para sistema de BI
        // - Gerar relatórios
        // - Detectar fraudes
    }

    async cleanup() {
        if (this.attachHandle) {
            this.sdk.detachPosTrade(this.attachHandle);
        }
        if (this.loginHandle) {
            this.sdk.logout(this.loginHandle);
        }
        this.sdk.cleanup();
    }
}

// Uso
const pos = new POSIntegration();
await pos.initialize();
```

---

## 📊 Casos de Uso Avançados

### 1. **Detecção de Fraude**

```typescript
private detectFraud(storeInfo: NET_STORE_INFO, products: NET_PRODUCT_INFO[]) {
    // Desconto muito alto
    if (storeInfo.dbDiscount / storeInfo.dbTotal > 0.5) {
        console.warn('⚠️ ALERTA: Desconto suspeito > 50%');
        this.triggerAlarm('HIGH_DISCOUNT', storeInfo);
    }

    // Muitos produtos sem código de barras
    const noBarcode = products.filter(p => !p.szBarCode).length;
    if (noBarcode / products.length > 0.3) {
        console.warn('⚠️ ALERTA: Muitos produtos sem código de barras');
    }

    // Venda fora do horário
    const hour = new Date().getHours();
    if (hour < 6 || hour > 23) {
        console.warn('⚠️ ALERTA: Venda fora do horário comercial');
    }
}
```

### 2. **Captura Automática de Snapshot**

```typescript
private async captureTransactionSnapshot(dealNum: string) {
    // Capturar snapshot no momento da transação
    const snapshotPath = await DVRNetSDKService.captureSnapshot(0);

    // Salvar referência no banco
    await database.saveTransaction({
        dealNum,
        snapshotPath,
        timestamp: new Date()
    });
}
```

### 3. **Busca de Transação por Vídeo**

```typescript
async searchTransactionByTime(channel: number, timestamp: Date) {
    // Buscar transação que ocorreu em determinado horário
    const searchParam = {
        nChannel: channel,
        stuStartTime: new Date(timestamp.getTime() - 60000),  // 1 min antes
        stuEndTime: new Date(timestamp.getTime() + 60000),    // 1 min depois
        nPosId: -1
    };

    const results = await this.findPOSTransactions(searchParam);

    return results;
}
```

---

## 🔍 Estados e Códigos de Erro

### Status do POS

```typescript
enum EM_POS_STATUS {
    NO = 0,                             // Sem erro
    PROT_FORMAT = 1,                    // Erro de formato de protocolo
    NET_ADDR_CONFLICT = 2,              // Conflito de endereço de rede
    RS232_ADDR_CONFLICT = 3,            // Conflito de endereço RS232
    RS485_ADDR_CONFLICT = 4,            // Conflito de endereço RS485
    LINK_CHANNEL_CONFLICT = 5,          // Conflito de canal linkado
    NOT_EXIST = 6,                      // POS não existe
    NUM_LIMIT = 7,                      // Limite de POS atingido
    NAME_CONFLICT = 8,                  // Conflito de nome
    OTHER = -1                          // Outro erro
}
```

---

## 💡 Dicas e Boas Práticas

### ✅ FAZER:
1. **Sempre validar dados** antes de processar transações
2. **Usar timeout adequado** (30-60 segundos)
3. **Implementar reconexão automática** se conexão cair
4. **Logar todas as transações** para auditoria
5. **Testar com dados reais** antes de produção
6. **Configurar linkagens** para gravar automaticamente

### ❌ NÃO FAZER:
1. **Não processar transações incompletas** (sem bEnd = true)
2. **Não ignorar erros de conexão**
3. **Não usar porta padrão** se já estiver em uso
4. **Não deixar POS sem canal linkado**
5. **Não esquecer de desanexar callbacks** ao finalizar

---

## 📋 Checklist de Implementação

- [ ] DVR conectado e acessível
- [ ] Sistema POS configurado para enviar dados
- [ ] Protocolo definido (padrão ou custom)
- [ ] Canais de câmera linkados ao POS
- [ ] Callback de transação implementado
- [ ] Gravação automática configurada
- [ ] Testes com transações reais
- [ ] Busca de transações funcionando
- [ ] Sistema de detecção de fraude ativo
- [ ] Logs e auditoria configurados

---

## 🎓 Exemplo de Dados Recebidos

```json
{
  "posId": 1,
  "timestamp": "2025-01-15T14:30:45",
  "storeInfo": {
    "dealNum": "0001234",
    "shopName": "Supermercado ABC",
    "cashier": "MARIA.SILVA",
    "member": "12345678900",
    "total": 152.80,
    "discount": 15.28,
    "cash": 137.52,
    "card": 0.00
  },
  "products": [
    {
      "dealNum": "0001234",
      "barCode": "7891234567890",
      "name": "CERVEJA SKOL 350ML",
      "price": 3.99,
      "quantity": 12,
      "amount": 47.88,
      "unit": "UN"
    },
    {
      "dealNum": "0001234",
      "barCode": "7891234567891",
      "name": "REFRIGERANTE COCA 2L",
      "price": 7.99,
      "quantity": 3,
      "amount": 23.97,
      "unit": "UN"
    }
  ],
  "videoReference": {
    "channel": 0,
    "snapshotPath": "/uploads/pos_snapshot_0001234.jpg",
    "playbackTime": 10
  }
}
```

---

**Criado em:** 2025-01-15
**Versão:** 1.0
**Status:** ✅ Documentação Completa
