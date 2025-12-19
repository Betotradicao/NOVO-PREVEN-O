# 🔧 TROUBLESHOOTING - DVR INTELBRAS NÃO EXIBE TEXTO

## ❌ PROBLEMA: "Conexão OK mas NADA aparece na tela"

Este é o problema mais comum! Vamos resolver passo a passo.

---

## ✅ SOLUÇÃO 1: Verificar Configuração POS no DVR

### 1.1 Acessar Menu POS
1. Acesse a interface WEB do DVR: `http://IP_DO_DVR`
2. Login: `admin` / senha
3. **Menu Principal → POS → Configurar**

### 1.2 Configurações OBRIGATÓRIAS

#### ⚠️ ATENÇÃO: Estas configurações são CRÍTICAS!

| Configuração | Valor Correto | Por quê? |
|--------------|---------------|----------|
| **Habilitar POS** | ✅ **MARCADO** | Se não estiver marcado, NADA funciona |
| **Gravar Canal** | ✅ **MARCADO** | Grava as informações do POS |
| **Prioridade** | ✅ **MARCADO** | |
| **Protocolo** | `General` ou `TCP` | Depende do modelo |
| **Tipo de ligação** | `TCP` | Não use Serial/RS232 |
| **IP de Origem** | `0.0.0.0` | Aceita qualquer IP |
| **Porta de Origem** | (vazio ou 0) | |
| **IP de Destino** | (vazio ou IP do servidor) | Pode deixar vazio |
| **Porta de Destino** | `38800` | Porta padrão |
| **Limitador** | `7C` | **MUITO IMPORTANTE!** |
| **Tempo de exibição** | `100` a `600` ms | Tempo por linha |
| **Tempo de exibição (Geral)** | `10000` ms | Tempo total do cupom |
| **POS Info** | ✅ **MARCADO** | Exibe na tela |
| **Cor da Fonte** | Branco ou outra | Cor do texto |
| **Tamanho da Fonte** | `Grande` | Texto visível |

### 1.3 LIMITADOR - O QUE É?

O **limitador** define qual caractere separa as linhas!

- **7C** = Pipe `|` em hexadecimal
- **0A** = Line Feed `\n`
- **0D0A** = Carriage Return + Line Feed `\r\n`

**TESTE**: Se `7C` não funcionar, tente:
- `0A` (mais comum em Linux)
- `0D0A` (Windows/DOS)
- `20` (espaço - não recomendado)

---

## ✅ SOLUÇÃO 2: Verificar Câmera Selecionada

### Problema: POS configurado mas não aparece em NENHUMA câmera

1. **Menu Principal → POS → Configurar**
2. Procure por: **"Vincular Canal"** ou **"Canal"** ou **"Gravar Canal"**
3. **MARQUE a câmera** onde quer exibir o POS (ex: Canal 1)
4. **SALVAR**

⚠️ **DICA**: Alguns DVRs exigem que você selecione QUAL câmera vai receber o POS!

---

## ✅ SOLUÇÃO 3: Verificar Porta 38800

### 3.1 No DVR
1. **Configurações → Rede → Portas**
2. Procure por: **"Porta POS"** ou **"TCP Port"**
3. Confirme que está **38800**

### 3.2 Firewall do DVR
Alguns DVRs têm firewall interno:
1. **Configurações → Segurança → Firewall**
2. Se estiver **Habilitado**, adicione exceção para porta 38800
3. Ou **Desabilite** o firewall (temporariamente para teste)

### 3.3 Testar Porta (Windows)
No PowerShell:
```powershell
Test-NetConnection -ComputerName 192.168.1.100 -Port 38800
```

✅ `TcpTestSucceeded: True` → Porta aberta
❌ `TcpTestSucceeded: False` → Porta fechada, revisar configuração

---

## ✅ SOLUÇÃO 4: Formato dos Dados

### 4.1 Tamanho das Linhas
❌ **ERRADO**: Linhas muito longas
```
Item: REFRIGERANTE COCA-COLA 2 LITROS SABOR ORIGINAL RETORNÁVEL COM AÇÚCAR
```

✅ **CORRETO**: Máximo 40-50 caracteres por linha
```
Item: REFRIGERANTE 2L|Marca: COCA-COLA|Qtd: 2
```

### 4.2 Caracteres Especiais
Evite:
- Emojis (🎉, ✅, ❌)
- Símbolos especiais (™, ®, ©)
- Aspas duplas `"` (use aspas simples `'`)

Permitido:
- Acentos (á, é, í, ó, ú, ã, õ, ç)
- Números e letras
- Símbolos básicos (-, =, |, /, :)

### 4.3 Encoding
O DVR geralmente aceita:
- **ASCII** (mais seguro)
- **UTF-8** (permite acentos)
- **ISO-8859-1** / **Latin-1**

Se acentos não aparecem → Tente ASCII puro (sem acentos)

---

## ✅ SOLUÇÃO 5: Sequência Correta de Envio

Alguns DVRs exigem uma sequência específica:

### Opção A: Envio Simples
```javascript
const texto = 'Linha 1|Linha 2|Linha 3';
socket.write(texto, 'utf8');
```

### Opção B: Com Cabeçalho
Alguns DVRs precisam de um "cabeçalho" antes do texto:
```javascript
// Exemplo de cabeçalho (varia por modelo)
const header = Buffer.from([0x00, 0x01]); // 2 bytes de header
const texto = 'Linha 1|Linha 2|Linha 3';
socket.write(Buffer.concat([header, Buffer.from(texto, 'utf8')]));
```

### Opção C: Com Terminador
```javascript
const texto = 'Linha 1|Linha 2|Linha 3';
socket.write(texto + '\0', 'utf8'); // Null terminator
```

---

## ✅ SOLUÇÃO 6: Timing e Delays

### Problema: Texto aparece mas muito rápido ou desaparece

Ajustar no DVR:
1. **POS → Configurar → Tempo de exibição**: Aumentar para `500-1000` ms
2. **Tempo de exibição geral**: Aumentar para `20000` ms (20 segundos)

No código (lado servidor):
```javascript
// Enviar linha por linha com delay
const linhas = ['Linha 1', 'Linha 2', 'Linha 3'];
for (const linha of linhas) {
  socket.write(linha + '|', 'utf8');
  await new Promise(r => setTimeout(r, 200)); // 200ms entre linhas
}
```

---

## ✅ SOLUÇÃO 7: Resetar Configurações do DVR

Se NADA funciona:

### Método Seguro (via menu):
1. **Menu → Manutenção → Padrão de Fábrica**
2. Selecione: **"Apenas Rede e POS"** (não reseta tudo)
3. Reconfigurar POS do zero

### Método Completo:
1. **Backup das configurações** antes!
2. Reset completo de fábrica
3. Reconfigurar tudo (câmeras, rede, usuários, POS)

---

## ✅ SOLUÇÃO 8: Verificar Versão do Firmware

### DVRs Intelbras antigos podem ter bugs no POS!

1. **Menu → Informações → Versão**
2. Anotar: Modelo, Versão do Firmware
3. Acessar: https://www.intelbras.com/pt-br/suporte
4. Procurar atualizações para o seu modelo
5. Se houver versão mais nova: **ATUALIZAR FIRMWARE**

⚠️ **CUIDADO**: Atualização errada pode "bricar" o DVR! Siga manual oficial.

---

## ✅ SOLUÇÃO 9: Usar Software da Intelbras para Teste

### Net Assistant (Software Oficial)
1. Baixar: https://www.intelbras.com/pt-br/suporte
2. Instalar e conectar ao DVR
3. Ir em: **"POS"** ou **"Configurações Avançadas"**
4. Testar envio direto pelo software

Se funcionar pelo software → Problema está no seu código
Se NÃO funcionar → Problema está no DVR/Configuração

---

## 📋 CHECKLIST FINAL

Antes de desistir, confirme:

- [ ] POS está **HABILITADO** no DVR?
- [ ] Porta **38800** está **ABERTA**?
- [ ] Limitador configurado como **7C**?
- [ ] Câmera **SELECIONADA** para exibir POS?
- [ ] IP do DVR está **CORRETO**?
- [ ] Consegue fazer **PING** no DVR?
- [ ] Porta 38800 responde no **Test-NetConnection**?
- [ ] Firmware do DVR está **ATUALIZADO**?
- [ ] Texto tem menos de **50 caracteres por linha**?
- [ ] Formato está usando pipe **|** como separador?
- [ ] Testou diferentes **encodings** (UTF-8, ASCII)?
- [ ] Testou com o **Software Oficial** da Intelbras?

---

## 🆘 ÚLTIMO RECURSO

Se NADA funcionou:

1. **Contate Suporte Intelbras**: 0800 7042767
2. Informe:
   - Modelo exato do DVR
   - Versão do firmware
   - "Não consigo configurar função POS"
3. Peça manual técnico da função POS
4. Verifique se seu modelo **SUPORTA** POS (alguns modelos básicos não têm)

---

## 📞 MODELOS CONHECIDOS COM POS

Intelbras com suporte POS confirmado:
- MHDX 1104, 1108, 1116, 1132
- MHDX 3104, 3108, 3116, 3132
- NVD 1108, 1116, 1132, 1304, 1308, 1316

Se seu modelo não está na lista → CONFIRME com suporte!

---

**BOA SORTE!** 🍀
