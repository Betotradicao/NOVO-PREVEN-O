/**
 * Script para identificar o IP correto para configurar no DVR
 */

const os = require('os');
const net = require('net');

const DVR_IP = '10.6.1.123';

console.log('='.repeat(60));
console.log('🔍 QUAL IP USAR NO DVR?');
console.log('='.repeat(60));

console.log('\n🖥️  IPs desta máquina:\n');

const interfaces = os.networkInterfaces();
let recommendedIP = null;

for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name]) {
    if (iface.family === 'IPv4') {
      const isInternal = iface.internal;
      const marker = isInternal ? '🔒' : '🌐';

      console.log(`${marker} ${name.padEnd(20)} ${iface.address}`);

      // Recomendar IP da mesma rede que o DVR (10.6.1.x)
      if (!isInternal && iface.address.startsWith('10.6.1.')) {
        recommendedIP = iface.address;
      }
    }
  }
}

console.log('\n' + '='.repeat(60));
console.log('💡 RESPOSTA:');
console.log('='.repeat(60));

if (recommendedIP) {
  console.log(`\n✅ USE ESTE IP NO DVR:\n`);
  console.log(`   ╔${'═'.repeat(30)}╗`);
  console.log(`   ║  IP de Origem (SrcIP):       ║`);
  console.log(`   ║                              ║`);
  console.log(`   ║      ${recommendedIP.padEnd(18)}  ║`);
  console.log(`   ╚${'═'.repeat(30)}╝`);

  console.log('\n📝 PASSOS:');
  console.log('   1. No DVR, vá em: Configurações > POS > PDV2');
  console.log('   2. Procure "IP de Origem" ou "SrcIP"');
  console.log(`   3. Altere de "100.81.126.110" para "${recommendedIP}"`);
  console.log('   4. Salve a configuração');
  console.log('   5. Volte aqui e me avise!\n');
} else {
  console.log(`\n⚠️  Não encontrei IP na rede 10.6.1.x`);
  console.log(`\n💡 ALTERNATIVA - Use qualquer IP:\n`);
  console.log(`   ╔${'═'.repeat(30)}╗`);
  console.log(`   ║  IP de Origem (SrcIP):       ║`);
  console.log(`   ║                              ║`);
  console.log(`   ║      0.0.0.0                 ║`);
  console.log(`   ╚${'═'.repeat(30)}╝`);
  console.log('\n   Isso fará o DVR aceitar de QUALQUER IP.\n');
}

console.log('='.repeat(60));

// Verificar conexão com DVR
console.log('\n🔍 Testando conexão com DVR...\n');

const testClient = new net.Socket();
testClient.setTimeout(3000);

testClient.on('connect', () => {
  const localIP = testClient.localAddress;
  console.log(`✅ Conectado ao DVR!`);
  console.log(`   Meu IP (visto pelo DVR): ${localIP}`);
  console.log(`   DVR IP: ${testClient.remoteAddress}`);

  if (recommendedIP && localIP === recommendedIP) {
    console.log(`\n✅ CONFIRMADO! Use ${recommendedIP} no DVR!\n`);
  } else if (localIP) {
    console.log(`\n💡 Use ${localIP} no DVR!\n`);
  }

  testClient.destroy();
});

testClient.on('error', (error) => {
  console.log(`❌ Erro ao conectar: ${error.message}\n`);
});

testClient.on('timeout', () => {
  console.log(`⏱️  Timeout\n`);
  testClient.destroy();
});

testClient.connect(38800, DVR_IP);
