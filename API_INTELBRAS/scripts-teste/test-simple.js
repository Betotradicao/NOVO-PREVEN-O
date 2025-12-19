/**
 * Teste super simples - apenas uma linha
 */

const net = require('net');

const DVR_IP = '10.6.1.123';
const DVR_PORT = 38800;

console.log('='.repeat(60));
console.log('🚀 TESTE SUPER SIMPLES - APENAS UMA LINHA');
console.log('='.repeat(60));

function sendSimpleTest(message) {
  return new Promise((resolve) => {
    const client = new net.Socket();
    client.setTimeout(5000);

    client.on('connect', () => {
      console.log(`\n✅ Conectado: ${client.localAddress}:${client.localPort} -> ${DVR_IP}:${DVR_PORT}`);

      // Enviar mensagem SIMPLES
      console.log(`\n📤 Enviando: "${message}"\n`);

      const buffer = Buffer.from(message, 'utf-8');
      client.write(buffer);

      setTimeout(() => {
        console.log(`✅ Enviado!\n`);
        client.end();
      }, 1000);
    });

    client.on('data', (data) => {
      console.log(`📥 Resposta: ${data.toString()}\n`);
    });

    client.on('close', () => {
      console.log(`🔌 Conexão fechada\n`);
      resolve();
    });

    client.on('error', (error) => {
      console.error(`❌ Erro: ${error.message}\n`);
      resolve();
    });

    client.on('timeout', () => {
      console.error(`⏱️  Timeout\n`);
      client.destroy();
      resolve();
    });

    console.log(`\n⏳ Conectando...\n`);
    client.connect(DVR_PORT, DVR_IP);
  });
}

async function main() {
  const messages = [
    'TESTE 1',
    'TESTE 2\n',
    'TESTE 3\r\n',
    'TESTE|4',
    'A',
    'XPTO'
  ];

  console.log('\n🔄 Vou enviar 6 testes diferentes:\n');

  for (let i = 0; i < messages.length; i++) {
    console.log('─'.repeat(60));
    console.log(`TESTE ${i + 1} de ${messages.length}`);
    console.log('─'.repeat(60));

    await sendSimpleTest(messages[i]);

    if (i < messages.length - 1) {
      console.log('⏳ Aguardando 3 segundos...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log('═'.repeat(60));
  console.log('✅ TODOS OS TESTES ENVIADOS');
  console.log('═'.repeat(60));
  console.log('\n🎯 OLHE PARA A TELA DO DVR AGORA!\n');
  console.log('Se algum teste apareceu, você vai ver:');
  console.log('   TESTE 1, TESTE 2, TESTE 3, TESTE 4, A, ou XPTO\n');
  console.log('Se aparecer QUALQUER COISA, FUNCIONOU!\n');
  console.log('═'.repeat(60));
  console.log('\n');
}

main();
