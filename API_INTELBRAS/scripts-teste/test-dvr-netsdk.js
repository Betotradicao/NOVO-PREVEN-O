/**
 * Script de teste para conexão NetSDK com DVR Intelbras
 * IP: 10.6.1.123
 * Porta: 37777 (padrão Intelbras/Dahua)
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
console.log('🔍 TESTE DE CONEXÃO DVR INTELBRAS - NetSDK');
console.log('='.repeat(60));
console.log(`\n📡 Conectando ao DVR...`);
console.log(`   IP: ${DVR_CONFIG.ip}`);
console.log(`   Porta: ${DVR_CONFIG.port}`);
console.log(`   Usuário: ${DVR_CONFIG.username}`);
console.log(`\n`);

// Criar cliente TCP
const client = new net.Socket();

// Timeout de 10 segundos
client.setTimeout(10000);

// Evento de conexão
client.on('connect', () => {
  console.log('✅ Conectado ao DVR via TCP!');
  console.log(`   Endereço local: ${client.localAddress}:${client.localPort}`);
  console.log(`   Endereço remoto: ${client.remoteAddress}:${client.remotePort}`);
  console.log('\n📤 Tentando login via protocolo Dahua/Intelbras...\n');

  // Enviar comando de login (protocolo Dahua)
  // Formato: LOGIN_REQ2
  const loginPacket = createLoginPacket();
  client.write(loginPacket);
});

// Evento de dados recebidos
client.on('data', (data) => {
  console.log('📥 Dados recebidos do DVR:');
  console.log(`   Tamanho: ${data.length} bytes`);
  console.log(`   Hex: ${data.toString('hex')}`);

  // Tentar decodificar resposta
  parseResponse(data);

  // Encerrar conexão após receber resposta
  setTimeout(() => {
    client.end();
  }, 1000);
});

// Evento de erro
client.on('error', (error) => {
  console.error('\n❌ ERRO DE CONEXÃO:');
  console.error(`   ${error.message}`);
  console.error('\n💡 Possíveis causas:');
  console.error('   1. IP ou porta incorretos');
  console.error('   2. DVR desligado ou fora da rede');
  console.error('   3. Firewall bloqueando a conexão');
  console.error('   4. Porta 37777 não está aberta no DVR\n');
});

// Evento de timeout
client.on('timeout', () => {
  console.error('\n⏱️  TIMEOUT: DVR não respondeu em 10 segundos');
  client.destroy();
});

// Evento de desconexão
client.on('close', () => {
  console.log('\n🔌 Conexão encerrada.\n');
  console.log('='.repeat(60));

  // Executar testes adicionais
  runAdditionalTests();
});

// Conectar ao DVR
console.log('⏳ Estabelecendo conexão TCP...\n');
client.connect(DVR_CONFIG.port, DVR_CONFIG.ip);

/**
 * Cria pacote de login Dahua/Intelbras
 * Protocolo: LOGIN_REQ2
 */
function createLoginPacket() {
  // Header Dahua: 0x20000000 (LOGIN_REQ2)
  const header = Buffer.alloc(32);

  // Magic number
  header.writeUInt32LE(0x20000000, 0);

  // Session ID (0 para novo login)
  header.writeUInt32LE(0, 4);

  // Sequence number
  header.writeUInt32LE(0, 8);

  // Total packets
  header.writeUInt8(0, 12);

  // Current packet
  header.writeUInt8(0, 13);

  // Dados de login
  const username = Buffer.alloc(32);
  username.write(DVR_CONFIG.username, 'utf8');

  // Hash MD5 da senha (protocolo Dahua)
  const passwordHash = crypto
    .createHash('md5')
    .update(DVR_CONFIG.password)
    .digest();

  // Montar pacote completo
  const packet = Buffer.concat([header, username, passwordHash]);

  console.log('📦 Pacote de login criado:');
  console.log(`   Tamanho: ${packet.length} bytes`);
  console.log(`   Usuário: ${DVR_CONFIG.username}`);
  console.log(`   Senha (MD5): ${passwordHash.toString('hex')}`);
  console.log('');

  return packet;
}

/**
 * Decodifica resposta do DVR
 */
function parseResponse(data) {
  if (data.length < 32) {
    console.log('   ⚠️  Resposta muito curta, pode não ser um pacote válido\n');
    return;
  }

  // Ler header
  const messageId = data.readUInt32LE(0);
  const sessionId = data.readUInt32LE(4);
  const sequence = data.readUInt32LE(8);

  console.log('   Análise do pacote:');
  console.log(`   - Message ID: 0x${messageId.toString(16)}`);
  console.log(`   - Session ID: ${sessionId}`);
  console.log(`   - Sequence: ${sequence}`);

  // Verificar tipo de resposta
  switch (messageId) {
    case 0x20010000:
      console.log('   ✅ LOGIN_RSP: Login aceito!');
      console.log(`   🎉 DVR autenticado com sucesso!\n`);
      break;

    case 0x20020000:
      console.log('   ❌ LOGIN_FAILED: Login rejeitado');
      console.log('   💡 Verifique usuário e senha\n');
      break;

    default:
      console.log('   ℹ️  Tipo de mensagem desconhecido\n');
  }
}

/**
 * Testes adicionais de diagnóstico
 */
function runAdditionalTests() {
  console.log('\n🔬 TESTES ADICIONAIS:\n');

  // Teste 1: Ping
  console.log('1️⃣  Testando conectividade (ping)...');
  const { exec } = require('child_process');

  exec(`ping -n 2 ${DVR_CONFIG.ip}`, (error, stdout, stderr) => {
    if (error) {
      console.log('   ❌ Ping falhou - DVR pode estar offline\n');
    } else {
      const lines = stdout.split('\n');
      const resultLine = lines.find(l => l.includes('Packets:')) ||
                        lines.find(l => l.includes('Pacotes:'));
      console.log(`   ✅ ${resultLine ? resultLine.trim() : 'Ping OK'}\n`);
    }

    // Teste 2: Portas comuns
    console.log('2️⃣  Testando portas comuns Intelbras:');
    testPort(DVR_CONFIG.ip, 37777, 'NetSDK (principal)');
    testPort(DVR_CONFIG.ip, 80, 'HTTP (web interface)');
    testPort(DVR_CONFIG.ip, 554, 'RTSP (streaming)');
    testPort(DVR_CONFIG.ip, 8000, 'iSCSI');

    setTimeout(() => {
      console.log('\n✅ Testes concluídos!\n');
      showNextSteps();
    }, 3000);
  });
}

/**
 * Testa se uma porta está aberta
 */
function testPort(host, port, description) {
  const testClient = new net.Socket();

  testClient.setTimeout(2000);

  testClient.on('connect', () => {
    console.log(`   ✅ Porta ${port} (${description}): ABERTA`);
    testClient.destroy();
  });

  testClient.on('error', () => {
    console.log(`   ❌ Porta ${port} (${description}): FECHADA`);
  });

  testClient.on('timeout', () => {
    console.log(`   ⏱️  Porta ${port} (${description}): TIMEOUT`);
    testClient.destroy();
  });

  testClient.connect(port, host);
}

/**
 * Mostra próximos passos
 */
function showNextSteps() {
  console.log('='.repeat(60));
  console.log('📋 PRÓXIMOS PASSOS:\n');
  console.log('1. Instalar Visual Studio Build Tools para compilar FFI');
  console.log('   https://visualstudio.microsoft.com/downloads/\n');
  console.log('2. Instalar dependências nativas:');
  console.log('   cd packages/backend');
  console.log('   npm install ffi-napi ref-napi ref-struct-di\n');
  console.log('3. Habilitar NetSDK no banco de dados:');
  console.log("   UPDATE configurations SET value='true' WHERE key='dvr_netsdk_enabled';");
  console.log(`   UPDATE configurations SET value='${DVR_CONFIG.ip}' WHERE key='dvr_ip';`);
  console.log(`   UPDATE configurations SET value='37777' WHERE key='dvr_port';`);
  console.log(`   UPDATE configurations SET value='${DVR_CONFIG.username}' WHERE key='dvr_username';`);
  console.log(`   UPDATE configurations SET value='${DVR_CONFIG.password}' WHERE key='dvr_password';\n`);
  console.log('4. Iniciar backend:');
  console.log('   npm run dev\n');
  console.log('5. Testar API:');
  console.log('   POST http://localhost:3001/api/dvr/test\n');
  console.log('='.repeat(60));
  console.log('\n📚 Documentação completa: DVR_NETSDK_README.md\n');
}
