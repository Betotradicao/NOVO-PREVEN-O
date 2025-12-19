# ✅ CONFIGURAÇÃO CORRETA - POS INTELBRAS (Zanthus)

## 📚 Baseado em: zanthus.pdf

Documentação oficial da integração Zanthus com DVR Intelbras.

---

## 🔧 **CONFIGURAÇÃO DO DVR**

### **Passo 1: Acessar configuração POS**

```
Menu Principal → POS → Configurar
```

### **Passo 2: Configurar PDV 2 - Canal 6**

| Campo | Valor | Observação |
|-------|-------|------------|
| **Habilitar** | ✅ SIM | Ativar o POS |
| **Tipo de ligação** | TCP | Conexão via rede |
| **IP de Origem** | 10.6.1.171 | IP do PC que envia cupons |
| **IP Destino** | 10.6.1.123 | IP do DVR |
| **Porta POS** | **38800** | ⚠️ IMPORTANTE! Não 60020! |
| **Canal** | 6 | Canal onde aparecerá o cupom |
| **Protocolo** | General | Ou Customizado |
| **Limitador** | **7C** | Código hex do pipe `\|` |
| **Tempo de exibição** | 600 | Segundos (10 minutos) |
| **Tempo de espera** | 100 | Milissegundos |

---

## 📝 **FORMATO DO CUPOM**

### Delimitador de Linha

**Caractere:** `|` (pipe)
**Código ASCII Hexadecimal:** `7C`

### Estrutura

```javascript
const cupom = [
  'Linha 1',
  'Linha 2',
  'Linha 3'
].join('|');  // ← Delimitador PIPE
```

### Exemplo Real

```javascript
const cupom = [
  '=============================',
  '     SUPERMERCADO ABC',
  '=============================',
  'Data: 19/12/2025',
  'Hora: 16:30:45',
  '',
  'Produto: CERVEJA',
  'Qtd: 12',
  'Valor: R$ 47,88',
  '',
  'Total: R$ 47,88',
  '============================='
].join('|');
```

**Resultado enviado ao DVR:**
```
=============================|     SUPERMERCADO ABC|=============================|Data: 19/12/2025|...
```

---

## 🚀 **COMO TESTAR**

### 1. Configurar o DVR

Siga a tabela acima e configure o PDV 2.

### 2. Executar o script de teste

```bash
node packages/backend/teste-pos-zanthus-correto.js
```

### 3. Verificar resultado

- **Abrir canal 6** no DVR
- **Cupom deve aparecer** sobreposto no vídeo
- **Fica visível** por ~600 segundos (10 minutos)

---

## ⚠️ **PROBLEMAS COMUNS**

### ❌ "Connection refused"

**Causa:** DVR não está escutando na porta 38800

**Solução:**
1. Verificar se porta POS está configurada como **38800**
2. Confirmar que POS está **habilitado**
3. Verificar se tipo de ligação é **TCP** (não TCP_CLIENT)

### ❌ "DVR trava ao receber cupom"

**Causa:** Cupom muito grande ou caracteres especiais

**Solução:**
1. Usar cupons **pequenos** (10-15 linhas)
2. Usar apenas **ASCII** (evitar UTF-8, emojis, acentos)
3. Linhas com máximo de **40-50 caracteres**

### ❌ "Cupom não aparece no vídeo"

**Causa:** Canal não está linkado

**Solução:**
1. Verificar se **Canal 6** está configurado no POS
2. Confirmar que está **olhando para o Canal 6**
3. Habilitar "**POS Info**" nas configurações

---

## 📊 **DIFERENÇAS: TCP_SERVER vs TCP_CLIENT**

| Modo | DVR | Aplicação | Quando Usar |
|------|-----|-----------|-------------|
| **TCP_SERVER** | Escuta | Conecta | ✅ Recomendado |
| **TCP_CLIENT** | Conecta | Escuta | ⚠️ Pode travar |

### TCP_SERVER (Recomendado)

```
┌──────────┐         ┌──────────┐
│   DVR    │←────────│    PC    │
│ (Escuta) │         │ (Conecta)│
│ Porta:   │         │          │
│ 38800    │         │          │
└──────────┘         └──────────┘
```

- DVR fica **passivo** (só escuta)
- PC **conecta quando quer** enviar
- **Menos chance de travar**
- **Mais fácil de controlar**

### TCP_CLIENT (Problemático)

```
┌──────────┐         ┌──────────┐
│   DVR    │────────→│    PC    │
│ (Conecta)│         │ (Escuta) │
│          │         │ Porta:   │
│          │         │ 60020    │
└──────────┘         └──────────┘
```

- DVR tenta **conectar ativamente**
- PC precisa ter **servidor rodando**
- **Pode causar travamentos**
- **Mais complexo**

---

## 🔍 **TABELA ASCII - DELIMITADOR**

| Decimal | Hex | Char | Uso |
|---------|-----|------|-----|
| 124 | **7C** | **\|** | **Delimitador Zanthus** |
| 10 | 0A | \n | Line feed |
| 13 | 0D | \r | Carriage return |
| 45 | 2D | - | Hífen (alternativa) |

**No DVR Intelbras:**
- Configure o campo "**Limitador**" como: **7C**
- Isso corresponde ao caractere `|` (pipe)

---

## 📋 **CHECKLIST DE CONFIGURAÇÃO**

### No DVR:
- [ ] POS habilitado
- [ ] Porta configurada como **38800**
- [ ] IP de origem: **10.6.1.171**
- [ ] IP destino: **10.6.1.123**
- [ ] Canal 6 linkado
- [ ] Limitador: **7C**
- [ ] Tipo de ligação: **TCP**

### No PC:
- [ ] IP configurado: **10.6.1.171**
- [ ] Firewall permite conexão
- [ ] Script teste pronto
- [ ] Consegue pingar DVR

### Teste:
- [ ] DVR ligado e acessível
- [ ] Canal 6 visível na tela
- [ ] Script executado sem erro
- [ ] Cupom apareceu no vídeo

---

## 🎯 **RESUMO EXECUTIVO**

| Item | Valor Correto |
|------|---------------|
| **Porta DVR** | 38800 |
| **Delimitador** | \| (pipe - hex 7C) |
| **Modo** | TCP_SERVER |
| **IP PC** | 10.6.1.171 |
| **IP DVR** | 10.6.1.123 |
| **Canal** | 6 |
| **Codificação** | ASCII puro |
| **Tamanho cupom** | 10-15 linhas |

---

## 📚 **REFERÊNCIAS**

1. **zanthus.pdf** - Documentação oficial Zanthus
2. **DVR_POS_INTEGRATION_GUIDE.md** - Guia NetSDK
3. **Manual Intelbras** - Configuração DVR

---

**Criado em:** 19/12/2025
**Baseado em:** Documentação Zanthus (GCIF0086)
**Status:** ✅ Configuração Validada
