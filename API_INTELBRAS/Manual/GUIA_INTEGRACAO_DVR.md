# 📘 GUIA DE INTEGRAÇÃO - DVR INTELBRAS + ZANTHUS

## 🎯 OBJETIVO
Integrar as vendas do sistema **Zanthus** com o **DVR Intelbras** para exibir informações do cupom fiscal nas câmeras em tempo real (função POS).

---

## 📋 PRÉ-REQUISITOS

### 1. Zanthus (já configurado ✅)
- API rodando em: `http://10.6.1.101`
- Conexão via Tailscale funcionando
- Endpoint: `/manager/restful/integracao/cadastro_sincrono.php5`

### 2. DVR Intelbras (a configurar)
- **IP do DVR**: `192.168.X.X` ou `10.6.1.X` (descobrir)
- **Porta POS**: `38800` (padrão Intelbras)
- **Protocolo**: TCP Socket
- **Formato de dados**: Texto com separador `|` (pipe)

---

## 🔍 PASSO 1: DESCOBRIR O IP DO DVR

### Método 1: Interface do DVR
1. Acesse fisicamente o DVR
2. Menu → Configurações → Rede
3. Anote o **IP**, **Porta**, **Máscara**, **Gateway**

### Método 2: Via Software Intelbras
1. Baixe o **Config Tool** da Intelbras
2. Execute e procure dispositivos na rede
3. Anote o IP que aparece

### Método 3: Escaneamento de rede (Windows)
```powershell
# No PowerShell do Windows onde está o DVR
arp -a
```
Procure por IPs na mesma faixa da rede local (ex: 192.168.1.x ou 10.6.1.x)

---

## 🧪 PASSO 2: TESTAR CONEXÃO BÁSICA

### Teste 1: Ping
No CMD/PowerShell do Windows:
```cmd
ping 192.168.1.100
```
*(Substitua pelo IP do seu DVR)*

✅ Se responder: Conexão de rede OK
❌ Se não responder: Verificar firewall ou cabo de rede

### Teste 2: Testar porta TCP 38800
No PowerShell:
```powershell
Test-NetConnection -ComputerName 192.168.1.100 -Port 38800
```

✅ `TcpTestSucceeded: True` = Porta aberta e escutando
❌ `TcpTestSucceeded: False` = Porta fechada ou DVR não configurado

---

## ⚙️ PASSO 3: CONFIGURAR O DVR INTELBRAS

### 3.1 Acessar Interface WEB
1. Abra navegador (Chrome, Edge)
2. Digite: `http://IP_DO_DVR` (ex: http://192.168.1.100)
3. Login: `admin` / Senha: (a senha que você configurou)

### 3.2 Criar Usuário (se necessário)
**Menu Principal → Sistemas → Conta → Adicionar usuário**
- Nome: `zanthus` ou `pos`
- Senha: (anote a senha)
- Permissões: Marcar tudo

### 3.3 Configurar Câmera
**Configurações → Câmera → Visualizar**
- Marcar a câmera que quer exibir o POS
- Salvar

### 3.4 Configurar Rede
**Configurações → Rede → TCP/IP**
- Anotar o IP atual
- Verificar se porta POS está em **38800**

**Configurações → Rede → Portas**
- **Porta POS**: 38800
- Salvar

### 3.5 Configurar POS (CRUCIAL!)
**Menu Principal → POS → Configurar**

#### Tipo de Ligação:
- **Tipo**: TCP
- **IP de Origem**: `0.0.0.0` (aceita qualquer)
- **IP de Destino**: (deixar vazio ou colocar IP do servidor)
- **Porta**: `38800`

#### Limitador:
- **Valor**: `7C` (hexadecimal do caractere `|`)
  - Isso significa que cada linha do texto é separada por `|`

#### Tempo de Exibição:
- **Tempo de exibição**: `600` ms (0,6 segundos por linha)
- **Tempo de exibição geral**: Deixar em 10000 ms (10 segundos)

#### Protocolo:
- **Protocolo**: General (ou Unicode/UTF-8 se disponível)

**SALVAR TUDO!**

---

## 📡 PASSO 4: FORMATO DOS DADOS

### Protocolo Intelbras POS
O DVR espera receber texto puro via TCP com:
- **Separador de linha**: `|` (pipe = 0x7C em hexa)
- **Encoding**: UTF-8 ou ASCII
- **Quebra final**: Opcional `\n` ou `\r\n`

### Exemplo de cupom formatado:
```
===== CUPOM FISCAL 12345 =====|Data: 19/12/2025 10:30|Caixa: 01||Item: REFRIGERANTE 2L|Qtd: 2 x R$ 10.50|Total: R$ 21.00|================================
```

Cada `|` representa uma nova linha na tela do DVR.

---

## 🧪 PASSO 5: TESTAR ENVIO MANUAL (Python)

Crie um arquivo `test_dvr_manual.py`:

```python
import socket

# CONFIGURAÇÕES
DVR_IP = "192.168.1.100"  # TROCAR PELO IP DO SEU DVR
DVR_PORT = 38800

# Texto de teste
texto = "===== TESTE DE CONEXAO =====|Sistema Prevencao no Radar|Data: 19/12/2025|================================"

try:
    # Conectar ao DVR
    print(f"Conectando ao DVR {DVR_IP}:{DVR_PORT}...")
    sock = socket.socket(socket.FAMILY, socket.SOCK_STREAM)
    sock.settimeout(10)
    sock.connect((DVR_IP, DVR_PORT))
    print("✅ Conectado!")

    # Enviar dados
    print(f"Enviando: {texto}")
    sock.send(texto.encode('utf-8'))
    print("✅ Dados enviados!")

    # Aguardar resposta (opcional)
    # resposta = sock.recv(1024)
    # print(f"Resposta: {resposta}")

    sock.close()
    print("✅ Conexão fechada com sucesso!")

except socket.timeout:
    print("❌ ERRO: Timeout - DVR não respondeu")
except ConnectionRefusedError:
    print("❌ ERRO: Conexão recusada - Porta fechada ou DVR desligado")
except Exception as e:
    print(f"❌ ERRO: {e}")
```

**Como executar:**
```cmd
python test_dvr_manual.py
```

✅ Se aparecer "✅ Dados enviados!" → Verifique na câmera do DVR se apareceu o texto!

---

## 🔧 PASSO 6: TESTAR COM NODE.JS

Arquivo `test_dvr_node.js`:

```javascript
const net = require('net');

const DVR_IP = '192.168.1.100'; // TROCAR
const DVR_PORT = 38800;

const texto = '===== TESTE NODE.JS =====|Sistema Prevencao|Data: 19/12/2025|================================';

const client = new net.Socket();
client.setTimeout(10000);

client.connect(DVR_PORT, DVR_IP, () => {
    console.log('✅ Conectado ao DVR!');
    console.log('📤 Enviando:', texto);

    client.write(texto, 'utf8', () => {
        console.log('✅ Dados enviados com sucesso!');
        client.destroy();
    });
});

client.on('timeout', () => {
    console.error('❌ ERRO: Timeout');
    client.destroy();
});

client.on('error', (err) => {
    console.error('❌ ERRO:', err.message);
});

client.on('close', () => {
    console.log('🔌 Conexão fechada');
});
```

**Executar:**
```cmd
node test_dvr_node.js
```

---

## 📋 CHECKLIST DE TROUBLESHOOTING

### ❌ "Conexão recusada"
- [ ] DVR está ligado?
- [ ] IP está correto?
- [ ] Porta 38800 está aberta no DVR?
- [ ] Firewall do Windows bloqueando?

### ❌ "Conexão OK mas não aparece texto"
- [ ] POS habilitado no DVR?
- [ ] Limitador configurado como `7C`?
- [ ] Câmera selecionada corretamente?
- [ ] Tempo de exibição configurado?

### ❌ "Texto aparece cortado ou errado"
- [ ] Encoding UTF-8 correto?
- [ ] Separador `|` está presente?
- [ ] Linhas muito longas? (máximo ~50 caracteres por linha)

---

## 🚀 PRÓXIMOS PASSOS (após testes funcionando)

1. ✅ Testar conexão manual → **VOCÊ ESTÁ AQUI**
2. Integrar com a API Zanthus (pegar vendas)
3. Formatar cupons da Zanthus no padrão DVR
4. Criar endpoint no backend para envio automático
5. Agendar envio automático (cron ou webhook)

---

## 📞 SUPORTE

Se precisar de ajuda:
1. Anote os erros exatos que aparecem
2. Tire print da configuração do DVR
3. Verifique os logs do sistema

**BOA SORTE!** 🎉
