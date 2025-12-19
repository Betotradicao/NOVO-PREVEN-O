/**
 * Script para enviar dados POS se passando pelo IP correto
 * Tenta ambos os PDV2 configurados
 */

const net = require('net');
const os = require('os');

const DVR_IP = '10.6.1.123';

// Configurações dos PDV2 encontrados
const PDV_CONFIGS = [
  {
    name: 'PDV2 #1',
    channel: 1,
    expectedSourceIP: '100.81.126.110',
    expectedSourcePort: 37777,
    dvrListenPort: 38800
  },
  {
    name: 'PDV2 #5',
    channel: 5,
    expectedSourceIP: '192.168.0.5',
    expectedSourcePort: 37777,
    dvrListenPort: 38800
  }
];

console.log('='.repeat(60));
console.log('📤 TESTE POS - TENTANDO AMBOS PDV2');
console.log('='.repeat(60));

// Mostrar IPs locais
console.log('\n🖥️  IPs da máquina local:');
const interfaces = os.networkInterfaces();
for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name]) {
    if (iface.family === 'IPv4' && !iface.internal) {
      console.log(`   ${name}: ${iface.address}`);
    }
  }
}

function sendPOSMessage(config, message) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📍 Testando: ${config.name}`);
    console.log(`${'═'.repeat(60)}`);
    console.log(`Canal: ${config.channel}`);
    console.log(`IP Esperado pelo DVR: ${config.expectedSourceIP}`);
    console.log(`Porta Esperada: ${config.expectedSourcePort}`);
    console.log(`Porta do DVR: ${config.dvrListenPort}`);

    const client = new net.Socket();
    client.setTimeout(5000);

    client.on('connect', () => {
      console.log(`\n✅ Conectado ao DVR!`);
      console.log(`   Origem: ${client.localAddress}:${client.localPort}`);
      console.log(`   Destino: ${client.remoteAddress}:${client.remotePort}`);

      // Enviar mensagem
      const data = message + '|'; // Delimitador pipe
      const buffer = Buffer.from(data, 'utf-8');

      console.log(`\n📤 Enviando: "${message}"`);
      console.log(`   Tamanho: ${buffer.length} bytes`);

      client.write(buffer);

      setTimeout(() => {
        client.end();
      }, 1000);
    });

    client.on('data', (data) => {
      console.log(`📥 Resposta do DVR: ${data.toString()}`);
    });

    client.on('close', () => {
      console.log(`🔌 Conexão encerrada`);
      resolve(true);
    });

    client.on('error', (error) => {
      console.error(`❌ Erro: ${error.message}`);
      resolve(false);
    });

    client.on('timeout', () => {
      console.error(`⏱️  Timeout`);
      client.destroy();
      resolve(false);
    });

    console.log(`\n⏳ Conectando em ${DVR_IP}:${config.dvrListenPort}...`);

    // Tentar conectar
    client.connect(config.dvrListenPort, DVR_IP);
  });
}

async function main() {
  const testMessage = `TESTE CLAUDE ${new Date().toLocaleTimeString()}|Produto XYZ|R$ 123,45`;

  console.log(`\n📝 Mensagem de teste:\n   "${testMessage}"\n`);

  console.log('🔍 IMPORTANTE:');
  console.log('   O DVR pode estar verificando o IP de origem.');
  console.log('   Se não funcionar, pode ser necessário:');
  console.log('   1. Enviar do IP correto (100.81.126.110 ou 192.168.0.5)');
  console.log('   2. Alterar a config do DVR para aceitar qualquer IP');
  console.log('   3. Usar modo "Servidor" ao invés de "Cliente"\n');

  // Testar ambos
  for (const config of PDV_CONFIGS) {
    await sendPOSMessage(config, testMessage);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ TESTES CONCLUÍDOS');
  console.log('='.repeat(60));
  console.log('\n💡 SOLUÇÃO:');
  console.log('\nSe o texto não apareceu, você precisa:');
  console.log('\n1️⃣  Alterar configuração do DVR para modo SERVIDOR:');
  console.log('   - Acessar: http://10.6.1.123');
  console.log('   - Menu: Configurações > POS > PDV2');
  console.log('   - Mudar SrcIP para: 0.0.0.0 (aceita qualquer IP)');
  console.log('   - Ou mudar para o IP desta máquina\n');
  console.log('2️⃣  OU configurar para escutar na porta ao invés de conectar\n');
  console.log('3️⃣  OU enviar de uma máquina com IP 100.81.126.110 ou 192.168.0.5\n');
  console.log('='.repeat(60));
  console.log('\n');
}

main();
