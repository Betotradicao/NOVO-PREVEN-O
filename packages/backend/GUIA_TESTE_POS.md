# 📟 GUIA PRÁTICO - TESTANDO SISTEMA POS DO DVR

## 🎯 O Que é o Sistema POS?

O sistema POS (Point of Sale) do DVR permite **sobrepor dados de vendas no vídeo** em tempo real.

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Sistema   │─────────│     DVR     │─────────│   Câmera    │
│     POS     │  Cupom  │  Intelbras  │  Vídeo  │   Caixa     │
│             │  Fiscal │             │    +    │             │
│             │         │             │  Cupom  │             │
└─────────────┘         └─────────────┘         └─────────────┘
```

**Resultado:** O vídeo mostra a câmera do caixa + dados da venda sobrepostos na tela.

---

## 📝 PASSO A PASSO PARA TESTAR

### **Modo 1: DVR como SERVIDOR (TCP_SERVER)** ⭐ MAIS COMUM

Neste modo:
- DVR escuta em uma porta (ex: 9999)
- Você conecta ao DVR e envia dados
- Mais simples de testar!

#### 1. Configurar o DVR

Via interface web do DVR (http://10.6.1.123):
```
Sistema → POS → Adicionar POS
├── Nome: "Caixa 1"
├── Tipo de Conexão: TCP/IP
├── Modo: TCP_SERVER (DVR escuta)
├── Porta: 9999
├── Canal Linkado: Canal 0 (ou o que você quiser)
└── Salvar
```

#### 2. Testar com o Script

```bash
# Use o script existente
node packages/backend/send-pos-test.js
```

**O que deve acontecer:**
1. Script conecta ao DVR na porta 9999
2. Envia um cupom fiscal de teste
3. **O cupom aparece sobreposto no vídeo do canal linkado**
4. Fica visível por ~30 segundos (configurável)

---

### **Modo 2: DVR como CLIENTE (TCP_CLIENT)**

Neste modo:
- Você cria um servidor
- DVR conecta ao SEU servidor
- DVR puxa os dados de você

#### 1. Configurar o DVR

Via interface web:
```
Sistema → POS → Adicionar POS
├── Nome: "Caixa 1"
├── Tipo de Conexão: TCP/IP
├── Modo: TCP_CLIENT (DVR conecta)
├── IP Servidor: SEU_IP (ex: 192.168.1.100)
├── Porta Servidor: 60020
├── Canal Linkado: Canal 6
└── Salvar
```

#### 2. Iniciar Servidor

```bash
node packages/backend/servidor-pos-tcp-client.js
```

**O que deve acontecer:**
1. Servidor inicia e escuta na porta 60020
2. DVR conecta automaticamente
3. Servidor envia cupom de teste
4. **Cupom aparece no Canal 6**

---

## 🧪 SCRIPTS DE TESTE DISPONÍVEIS

| Script | Função | Uso |
|--------|--------|-----|
| `send-pos-test.js` | Envia cupom simples via TCP | Teste básico |
| `send-pos-spoofed.js` | Envia cupom com dados falsos | Teste de formato |
| `servidor-pos-tcp-client.js` | Servidor para modo TCP_CLIENT | Quando DVR é cliente |
| `servidor-pos-sem-delimitador.js` | Servidor sem delimitadores | Protocolo custom |
| `test-dvr-pos.js` | Teste completo de configuração | Diagnóstico |
| `diagnostico-pos.js` | Verifica problemas de conexão | Debug |
| `show-pos-configs.js` | Mostra POS configurados | Listar configs |

---

## 🔍 FORMATO DO CUPOM FISCAL

O DVR aceita texto simples. Exemplo:

```
=============================
  SUPERMERCADO ABC LTDA
  CNPJ: 12.345.678/0001-90
=============================
Data: 19/12/2025
Hora: 15:30:45
Operador: MARIA.SILVA
Cupom: 0001234
-----------------------------
ITEM      QTD    VL UNIT  TOTAL
-----------------------------
CERVEJA    12     3.99   47.88
REFRIG      3     7.99   23.97
PÃO         5     8.90   44.50
-----------------------------
SUBTOTAL:              116.35
DESCONTO:              -11.64
TOTAL:                 104.71
-----------------------------
DINHEIRO:              110.00
TROCO:                   5.29
=============================
  OBRIGADO PELA PREFERÊNCIA
=============================
```

**Delimitador de linhas:** Use `|` ou `\n`

Exemplo programático:
```javascript
const cupom = [
  '=============================',
  '  TESTE POS',
  '=============================',
  'Data: ' + new Date().toLocaleDateString(),
  'Hora: ' + new Date().toLocaleTimeString(),
  'Total: R$ 10,00',
  '============================='
].join('|');  // Ou join('\n')
```

---

## ✅ CHECKLIST DE TESTE

### Antes de Começar
- [ ] DVR está ligado e conectado na rede
- [ ] Você consegue acessar a interface web (http://10.6.1.123)
- [ ] Você sabe em qual canal quer ver o cupom
- [ ] Firewall não está bloqueando a porta

### Configuração no DVR
- [ ] POS foi adicionado na interface do DVR
- [ ] Canal foi linkado ao POS
- [ ] Porta está configurada corretamente
- [ ] Modo TCP está correto (SERVER ou CLIENT)

### Teste de Conexão
- [ ] Porta do DVR está aberta (testar com `telnet 10.6.1.123 9999`)
- [ ] Script conecta sem erro
- [ ] DVR aceita a conexão

### Validação Visual
- [ ] Abrir preview do canal linkado
- [ ] Executar script de teste
- [ ] **Cupom aparece sobreposto no vídeo** ✨
- [ ] Cupom fica visível por tempo configurado
- [ ] Cupom desaparece automaticamente

---

## 🐛 PROBLEMAS COMUNS

### ❌ "Connection refused"
**Causa:** DVR não está escutando na porta
**Solução:**
1. Verificar se POS está habilitado no DVR
2. Confirmar número da porta (9999, 60020, etc.)
3. Reiniciar serviço POS no DVR

### ❌ "Cupom não aparece no vídeo"
**Causa:** Canal não está linkado
**Solução:**
1. Verificar configuração de "Canal Linkado" no DVR
2. Confirmar que está olhando para o canal correto
3. Habilitar "Preview Blend" nas configurações POS

### ❌ "Texto aparece cortado ou ilegível"
**Causa:** Formato do cupom muito largo
**Solução:**
1. Reduzir largura das linhas (máx 30-40 caracteres)
2. Usar fonte menor nas configurações do DVR
3. Ajustar posição do overlay

### ❌ "DVR não conecta no servidor (modo CLIENT)"
**Causa:** IP ou porta incorretos
**Solução:**
1. Verificar IP do servidor com `ipconfig` (Windows) ou `ifconfig` (Linux)
2. Confirmar que servidor está rodando antes de configurar DVR
3. Desabilitar firewall temporariamente para testar

---

## 📊 TESTE AVANÇADO: CUPOM COMPLETO

Crie este arquivo: `packages/backend/teste-pos-avancado.js`

```javascript
const net = require('net');

const DVR_CONFIG = {
  ip: '10.6.1.123',
  porta: 9999
};

// Gerar cupom completo
function gerarCupomCompleto() {
  const agora = new Date();
  const produtos = [
    { nome: 'CERVEJA SKOL 350ML', qtd: 12, preco: 3.99 },
    { nome: 'REFRIG COCA 2L', qtd: 3, preco: 7.99 },
    { nome: 'PÃO FRANCÊS KG', qtd: 0.5, preco: 8.90 }
  ];

  let total = 0;
  const linhasProdutos = produtos.map(p => {
    const subtotal = p.qtd * p.preco;
    total += subtotal;
    const nome = p.nome.padEnd(20);
    const qtd = String(p.qtd).padStart(4);
    const preco = p.preco.toFixed(2).padStart(7);
    const valor = subtotal.toFixed(2).padStart(8);
    return `${nome}${qtd}${preco}${valor}`;
  });

  const desconto = total * 0.10;
  const totalFinal = total - desconto;

  return [
    '═'.repeat(50),
    '           SUPERMERCADO ABC LTDA',
    '         CNPJ: 12.345.678/0001-90',
    '═'.repeat(50),
    `Data: ${agora.toLocaleDateString('pt-BR')}    Hora: ${agora.toLocaleTimeString('pt-BR')}`,
    'Operador: MARIA.SILVA',
    `Cupom Fiscal: ${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
    '─'.repeat(50),
    'PRODUTO              QTD  PREÇO    TOTAL',
    '─'.repeat(50),
    ...linhasProdutos,
    '─'.repeat(50),
    `SUBTOTAL:                        R$ ${total.toFixed(2).padStart(8)}`,
    `DESCONTO (10%):                  R$ ${desconto.toFixed(2).padStart(8)}`,
    '═'.repeat(50),
    `TOTAL:                           R$ ${totalFinal.toFixed(2).padStart(8)}`,
    '═'.repeat(50),
    'FORMA DE PAGAMENTO: DINHEIRO',
    `RECEBIDO:                        R$ ${(totalFinal + 10).toFixed(2).padStart(8)}`,
    `TROCO:                           R$ ${(10).toFixed(2).padStart(8)}`,
    '═'.repeat(50),
    '        OBRIGADO PELA PREFERÊNCIA!',
    '      Volte sempre! :)',
    '═'.repeat(50)
  ].join('|');
}

// Enviar cupom
function enviarCupom() {
  const cupom = gerarCupomCompleto();

  console.log('\n📤 ENVIANDO CUPOM PARA DVR...\n');
  console.log('═'.repeat(70));
  console.log(cupom.replace(/\|/g, '\n'));
  console.log('═'.repeat(70));
  console.log('\n');

  const cliente = new net.Socket();

  cliente.connect(DVR_CONFIG.porta, DVR_CONFIG.ip, () => {
    console.log(`✅ Conectado ao DVR ${DVR_CONFIG.ip}:${DVR_CONFIG.porta}\n`);

    cliente.write(cupom, 'utf8', (error) => {
      if (error) {
        console.error('❌ Erro ao enviar:', error.message);
      } else {
        console.log('✅ Cupom enviado com sucesso!');
        console.log('👀 Verifique a tela do DVR agora!\n');
      }

      setTimeout(() => {
        cliente.end();
      }, 1000);
    });
  });

  cliente.on('error', (error) => {
    console.error(`\n❌ ERRO: ${error.message}\n`);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 DICA: Verifique se:');
      console.log('   1. O DVR está ligado');
      console.log('   2. A porta 9999 está configurada no POS');
      console.log('   3. O POS está habilitado no DVR\n');
    }
  });

  cliente.on('close', () => {
    console.log('🔌 Conexão encerrada\n');
  });
}

// Executar
enviarCupom();
```

Execute:
```bash
node packages/backend/teste-pos-avancado.js
```

---

## 🎓 PRÓXIMOS PASSOS

1. **Teste Básico:**
   - Configurar 1 POS no DVR
   - Enviar cupom simples
   - Validar que aparece no vídeo

2. **Integração Real:**
   - Conectar ao sistema de vendas real
   - Capturar dados do PDV
   - Enviar em tempo real para DVR

3. **Monitoramento:**
   - Usar NetSDK para monitorar transações
   - Buscar transações por período
   - Gerar relatórios

4. **Gravação:**
   - Configurar gravação automática quando houver venda
   - Criar snapshots de cada transação
   - Buscar vídeo por número de cupom

---

## 📚 DOCUMENTAÇÃO DE REFERÊNCIA

- **DVR_POS_INTEGRATION_GUIDE.md** - Guia completo da API POS
- **NetSDK Manual** - Documentação do NetSDK 3.050
- **PlaySDK Manual** - Para reprodução de vídeo (se necessário)

---

**Última atualização:** 19/12/2025
**Testado em:** DVR Intelbras 10.6.1.123
**Status:** ✅ Funcionando
