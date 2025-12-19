/**
 * Script de teste POS com autenticação NetSDK correta
 * DVR Intelbras: 10.6.1.123
 */

const net = require('net');
const crypto = require('crypto');

const DVR_CONFIG = {
  ip: '10.6.1.123',
  port: 37777,
  username: 'admin',
  password: 'beto3107@'
};

console.log('='.repeat(60));
console.log('🔍 TESTE POS/PDV - DVR INTELBRAS (COM AUTENTICAÇÃO)');
console.log('='.repeat(60));
console.log(`\n📡 DVR: ${DVR_CONFIG.ip}:${DVR_CONFIG.port}`);
console.log(`   Usuário: ${DVR_CONFIG.username}\n`);

let sessionId = 0;
let sequenceNumber = 0;

// Comandos NetSDK (baseado no dhnetsdk.h)
const NET_SDK_COMMANDS = {
  LOGIN_REQ2: 0x20000000,
  LOGIN_RSP2: 0x20010000,
  QUERY_DEV_STATE: 0x03e8,  // DH_DEVSTATE_GET_ALL_POS
  CONTROL_DEVICE: 0x0460,   // CLIENT_ControlDevice
  CONFIG_GET: 0x04e2,       // DH_CONFIG_GET
  CONFIG_SET: 0x04e3        // DH_CONFIG_SET
};

function createLoginPacket() {
  // Header (32 bytes)
  const header = Buffer.alloc(32);
  header.writeUInt32LE(NET_SDK_COMMANDS.LOGIN_REQ2, 0);  // Command
  header.writeUInt32LE(0, 4);                             // Session ID (0 = new)
  header.writeUInt32LE(0, 8);                             // Sequence
  header.writeUInt8(0, 12);                               // Total packets
  header.writeUInt8(0, 13);                               // Current packet

  // Username (32 bytes)
  const username = Buffer.alloc(32);
  username.write(DVR_CONFIG.username, 'utf8');

  // Password MD5 hash (16 bytes)
  const passwordHash = crypto.createHash('md5').update(DVR_CONFIG.password).digest();

  // Montar pacote completo: header + username + password
  const packet = Buffer.concat([header, username, passwordHash]);

  console.log(`   📦 Pacote: ${packet.length} bytes (header:32 + user:32 + pass:16)`);

  return packet;
}

function parseLoginResponse(data) {
  console.log(`\n   📥 Resposta do DVR (${data.length} bytes):`);
  console.log(`   Hex: ${data.toString('hex').substring(0, 128)}...`);

  if (data.length < 32) {
    return { success: false, error: `Resposta muito curta: ${data.length} bytes` };
  }

  const messageId = data.readUInt32LE(0);
  const receivedSessionId = data.readUInt32LE(4);
  const sequence = data.readUInt32LE(8);

  console.log(`   - Message ID: 0x${messageId.toString(16)}`);
  console.log(`   - Session ID: ${receivedSessionId}`);
  console.log(`   - Sequence: ${sequence}`);

  if (messageId === NET_SDK_COMMANDS.LOGIN_RSP2) {
    sessionId = receivedSessionId;
    console.log(`   ✅ Login bem-sucedido! Session ID: ${sessionId}\n`);
    return { success: true, sessionId: receivedSessionId };
  } else {
    console.log(`   ❌ Login falhou! Message ID esperado: 0x${NET_SDK_COMMANDS.LOGIN_RSP2.toString(16)}\n`);
    return { success: false, error: 'Login rejected' };
  }
}

function createConfigGetPacket(configName) {
  const jsonData = JSON.stringify({
    Name: configName,
    SessionID: sessionId.toString(16)
  });

  const jsonBuffer = Buffer.from(jsonData, 'utf8');
  const packet = Buffer.alloc(32 + jsonBuffer.length);

  // Header
  packet.writeUInt32LE(NET_SDK_COMMANDS.CONFIG_GET, 0);
  packet.writeUInt32LE(sessionId, 4);
  packet.writeUInt32LE(sequenceNumber++, 8);
  packet.writeUInt8(0, 12);
  packet.writeUInt8(0, 13);
  packet.writeUInt16LE(jsonBuffer.length, 14);

  // JSON data
  jsonBuffer.copy(packet, 32);

  return packet;
}

function createPOSTestDataPacket() {
  const testData = {
    Name: "PosInfo",
    SessionID: sessionId.toString(16),
    PosInfo: {
      dealNumber: 'TEST-' + Date.now(),
      cashier: 'TESTE CLAUDE',
      total: 100.00,
      discount: 0.00,
      change: 0.00,
      products: [
        {
          barcode: '7891234567890',
          name: 'TESTE PRODUTO CLAUDE',
          price: 50.00,
          quantity: 2
        }
      ]
    }
  };

  const jsonData = JSON.stringify(testData);
  const jsonBuffer = Buffer.from(jsonData, 'utf8');
  const packet = Buffer.alloc(32 + jsonBuffer.length);

  // Header
  packet.writeUInt32LE(NET_SDK_COMMANDS.CONFIG_SET, 0);
  packet.writeUInt32LE(sessionId, 4);
  packet.writeUInt32LE(sequenceNumber++, 8);
  packet.writeUInt8(0, 12);
  packet.writeUInt8(0, 13);
  packet.writeUInt16LE(jsonBuffer.length, 14);

  // JSON data
  jsonBuffer.copy(packet, 32);

  return packet;
}

async function sendCommand(socket, packet, description) {
  return new Promise((resolve, reject) => {
    let responseData = Buffer.alloc(0);
    let timeout;
    let dataReceived = false;

    const dataHandler = (data) => {
      console.log(`   🔄 Recebendo dados... (+${data.length} bytes)`);
      responseData = Buffer.concat([responseData, data]);
      dataReceived = true;

      // Continue esperando por mais dados
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        socket.removeListener('data', dataHandler);
        console.log(`   ⏱️  Timeout após receber ${responseData.length} bytes`);
        resolve(responseData);
      }, 1000);
    };

    socket.on('data', dataHandler);

    timeout = setTimeout(() => {
      socket.removeListener('data', dataHandler);
      if (!dataReceived) {
        console.log(`   ⏱️  Timeout sem receber dados`);
      }
      resolve(responseData);
    }, 5000);

    socket.write(packet, (err) => {
      if (err) {
        clearTimeout(timeout);
        socket.removeListener('data', dataHandler);
        reject(err);
      } else {
        console.log(`   ✅ Pacote enviado com sucesso`);
      }
    });
  });
}

async function main() {
  const client = new net.Socket();

  client.setTimeout(10000);

  client.on('timeout', () => {
    console.error('\n⏱️  TIMEOUT: DVR não respondeu');
    client.destroy();
  });

  client.on('error', (error) => {
    console.error(`\n❌ ERRO: ${error.message}`);
  });

  client.on('connect', async () => {
    console.log('✅ Conectado ao DVR!\n');

    try {
      // PASSO 1: LOGIN
      console.log('1️⃣  Fazendo login...');
      const loginPacket = createLoginPacket();
      console.log(`   📤 Enviando ${loginPacket.length} bytes...`);
      console.log(`   Hex: ${loginPacket.toString('hex').substring(0, 128)}...`);
      const loginResponse = await sendCommand(client, loginPacket, 'Login');

      const loginResult = parseLoginResponse(loginResponse);

      if (!loginResult.success) {
        console.error('❌ Falha no login. Encerrando...\n');
        client.end();
        return;
      }

      // PASSO 2: BUSCAR CONFIGURAÇÕES POS
      console.log('2️⃣  Buscando configurações de POS...\n');

      const configNames = [
        'POS',
        'POSDevice',
        'POSInfo',
        'ChannelTitle',
        'VideoChannel'
      ];

      for (const configName of configNames) {
        try {
          console.log(`   Consultando: ${configName}`);
          const configPacket = createConfigGetPacket(configName);
          const configResponse = await sendCommand(client, configPacket, configName);

          if (configResponse.length > 32) {
            const dataLength = configResponse.readUInt16LE(14);
            const jsonData = configResponse.slice(32, 32 + dataLength).toString('utf8');

            console.log(`   ✅ Resposta (${jsonData.length} bytes):`);
            try {
              const parsed = JSON.parse(jsonData);
              console.log(JSON.stringify(parsed, null, 2).substring(0, 500));
            } catch {
              console.log(jsonData.substring(0, 500));
            }
            console.log('');
          } else {
            console.log(`   ℹ️  Sem dados ou configuração não existe\n`);
          }
        } catch (error) {
          console.log(`   ❌ Erro: ${error.message}\n`);
        }
      }

      // PASSO 3: ENVIAR DADOS DE TESTE
      console.log('3️⃣  Enviando dados de teste para POS...\n');

      const testDataPacket = createPOSTestDataPacket();
      console.log('   📦 Pacote de teste criado');
      console.log('   📤 Enviando...');

      const testResponse = await sendCommand(client, testDataPacket, 'Teste POS');

      if (testResponse.length > 0) {
        const messageId = testResponse.readUInt32LE(0);
        console.log(`   📥 Resposta: 0x${messageId.toString(16)}`);

        if (testResponse.length > 32) {
          const dataLength = testResponse.readUInt16LE(14);
          const responseData = testResponse.slice(32, 32 + dataLength).toString('utf8');
          console.log(`   Dados:`, responseData);
        }
      } else {
        console.log(`   ℹ️  Sem resposta`);
      }

      console.log('\n' + '='.repeat(60));
      console.log('✅ TESTES CONCLUÍDOS');
      console.log('='.repeat(60));

    } catch (error) {
      console.error('\n❌ ERRO durante testes:', error);
    } finally {
      client.end();
    }
  });

  console.log('⏳ Conectando ao DVR...\n');
  client.connect(DVR_CONFIG.port, DVR_CONFIG.ip);
}

main().catch(console.error);
