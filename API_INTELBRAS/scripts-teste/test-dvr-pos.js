/**
 * Script de teste para verificar e testar POS/PDV no DVR Intelbras
 * IP: 10.6.1.123
 * Porta: 37777 (NetSDK) / 80 (HTTP)
 */

const net = require('net');
const http = require('http');
const crypto = require('crypto');

const DVR_CONFIG = {
  ip: '10.6.1.123',
  port: 37777,
  httpPort: 80,
  username: 'admin',
  password: 'beto3107@'
};

console.log('='.repeat(60));
console.log('🔍 TESTE DE CONFIGURAÇÃO POS/PDV - DVR INTELBRAS');
console.log('='.repeat(60));
console.log(`\n📡 DVR: ${DVR_CONFIG.ip}`);
console.log(`   Porta NetSDK: ${DVR_CONFIG.port}`);
console.log(`   Porta HTTP: ${DVR_CONFIG.httpPort}`);
console.log(`\n`);

// Função para fazer requisição HTTP ao DVR
function dvrHttpRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${DVR_CONFIG.username}:${DVR_CONFIG.password}`).toString('base64');

    const options = {
      hostname: DVR_CONFIG.ip,
      port: DVR_CONFIG.httpPort,
      path: path,
      method: method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    };

    if (data && method === 'POST') {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data && method === 'POST') {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Função para enviar comando NetSDK via TCP
function sendNetSDKCommand(commandId, data) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.setTimeout(5000);

    let responseData = Buffer.alloc(0);

    client.on('connect', () => {
      console.log('   ✅ Conectado ao DVR via NetSDK');

      // Criar pacote de comando
      const packet = createNetSDKPacket(commandId, data);
      client.write(packet);
    });

    client.on('data', (data) => {
      responseData = Buffer.concat([responseData, data]);
    });

    client.on('end', () => {
      resolve(responseData);
    });

    client.on('error', (error) => {
      reject(error);
    });

    client.on('timeout', () => {
      client.destroy();
      reject(new Error('Connection timeout'));
    });

    client.connect(DVR_CONFIG.port, DVR_CONFIG.ip);

    // Auto-close após 2 segundos
    setTimeout(() => {
      client.end();
    }, 2000);
  });
}

// Criar pacote NetSDK
function createNetSDKPacket(commandId, data) {
  const header = Buffer.alloc(32);

  // Message ID
  header.writeUInt32LE(commandId, 0);

  // Session ID (0 para comandos sem login)
  header.writeUInt32LE(0, 4);

  // Sequence number
  header.writeUInt32LE(Math.floor(Math.random() * 0xFFFFFFFF), 8);

  if (data) {
    return Buffer.concat([header, Buffer.from(JSON.stringify(data))]);
  }

  return header;
}

async function testPOSConfiguration() {
  console.log('1️⃣  Verificando configurações de POS/PDV...\n');

  try {
    // Tentar via HTTP CGI (comum em DVRs Dahua/Intelbras)
    console.log('   📡 Tentando via HTTP CGI...');

    // Endpoint comum para listar dispositivos POS
    const posListEndpoints = [
      '/cgi-bin/configManager.cgi?action=getConfig&name=POS',
      '/cgi-bin/devManage.cgi?action=getConfig&name=POS',
      '/cgi-bin/posConfig.cgi?action=getConfig',
      '/cgi-bin/configManager.cgi?action=getConfig&name=POSDevice',
      '/cgi-bin/magicBox.cgi?action=getProductDefinition'
    ];

    for (const endpoint of posListEndpoints) {
      try {
        console.log(`\n   Testando: ${endpoint}`);
        const response = await dvrHttpRequest(endpoint);
        console.log(`   Status: ${response.status}`);

        if (response.status === 200) {
          console.log(`   ✅ Resposta recebida:`);
          console.log(JSON.stringify(response.data, null, 2));
        } else {
          console.log(`   ℹ️  Status ${response.status}: ${response.data}`);
        }
      } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
      }
    }

  } catch (error) {
    console.error(`\n   ❌ Erro ao verificar POS: ${error.message}`);
  }
}

async function sendTestPOSData() {
  console.log('\n\n2️⃣  Enviando dados de teste para PDV2/PDV3...\n');

  const testTransaction = {
    dealNumber: 'TEST-' + Date.now(),
    cashier: 'TESTE CLAUDE',
    total: 100.00,
    discount: 0.00,
    change: 0.00,
    timestamp: new Date().toISOString(),
    products: [
      {
        barcode: '7891234567890',
        name: 'TESTE PRODUTO CLAUDE',
        price: 50.00,
        quantity: 2
      }
    ]
  };

  console.log('   📦 Dados de teste:');
  console.log(JSON.stringify(testTransaction, null, 2));
  console.log('\n');

  try {
    // Tentar enviar via HTTP
    const endpoints = [
      '/cgi-bin/pos.cgi?action=insert',
      '/cgi-bin/posData.cgi?action=insert',
      '/cgi-bin/configManager.cgi?action=setConfig&name=POSData'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`\n   Tentando: ${endpoint}`);
        const response = await dvrHttpRequest(endpoint, 'POST', testTransaction);
        console.log(`   Status: ${response.status}`);
        console.log(`   Resposta:`, response.data);
      } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
      }
    }

  } catch (error) {
    console.error(`\n   ❌ Erro ao enviar dados: ${error.message}`);
  }
}

async function getChannelInfo() {
  console.log('\n\n3️⃣  Verificando informações dos canais...\n');

  try {
    const endpoints = [
      '/cgi-bin/configManager.cgi?action=getConfig&name=ChannelTitle',
      '/cgi-bin/configManager.cgi?action=getConfig&name=VideoChannel',
      '/cgi-bin/encode.cgi?action=getConfigCaps'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`\n   Tentando: ${endpoint}`);
        const response = await dvrHttpRequest(endpoint);
        console.log(`   Status: ${response.status}`);

        if (response.status === 200) {
          console.log(`   Resposta:`);
          const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2);
          console.log(data.substring(0, 500) + (data.length > 500 ? '...' : ''));
        }
      } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
      }
    }

  } catch (error) {
    console.error(`\n   ❌ Erro ao buscar canais: ${error.message}`);
  }
}

async function testPOSViaSerial() {
  console.log('\n\n4️⃣  Verificando configuração de porta serial...\n');

  try {
    const endpoints = [
      '/cgi-bin/configManager.cgi?action=getConfig&name=RS232',
      '/cgi-bin/configManager.cgi?action=getConfig&name=RS485',
      '/cgi-bin/configManager.cgi?action=getConfig&name=SerialPort'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`\n   Tentando: ${endpoint}`);
        const response = await dvrHttpRequest(endpoint);
        console.log(`   Status: ${response.status}`);

        if (response.status === 200) {
          console.log(`   Resposta:`, response.data);
        }
      } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
      }
    }

  } catch (error) {
    console.error(`\n   ❌ Erro: ${error.message}`);
  }
}

async function main() {
  try {
    await testPOSConfiguration();
    await getChannelInfo();
    await testPOSViaSerial();
    await sendTestPOSData();

    console.log('\n\n' + '='.repeat(60));
    console.log('✅ TESTES CONCLUÍDOS');
    console.log('='.repeat(60));
    console.log('\n💡 PRÓXIMOS PASSOS:\n');
    console.log('1. Se nenhum POS foi encontrado, precisa configurar no DVR');
    console.log('2. Acessar DVR via web: http://10.6.1.123');
    console.log('3. Menu: Configurações > POS > Adicionar Dispositivo');
    console.log('4. Configurar:');
    console.log('   - Nome: PDV2 ou PDV3');
    console.log('   - Tipo: TCP/IP ou Serial');
    console.log('   - IP/Porta (se TCP): IP do servidor POS');
    console.log('   - Canal vinculado: canal da câmera do caixa');
    console.log('5. Habilitar overlay de texto no vídeo\n');
    console.log('='.repeat(60));
    console.log('\n');

  } catch (error) {
    console.error('\n❌ ERRO GERAL:', error);
  }
}

// Executar testes
main();
