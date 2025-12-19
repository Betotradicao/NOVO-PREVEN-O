/**
 * Teste final para PDV2 com IP configurado
 */

const net = require('net');

const CONFIG = {
  dvrIP: '10.6.1.123',
  dvrPort: 38800,
  myIP: '10.6.1.171'
};

console.log('='.repeat(60));
console.log('🚀 ENVIANDO TESTE PARA PDV2');
console.log('='.repeat(60));
console.log(`\n📡 DVR: ${CONFIG.dvrIP}:${CONFIG.dvrPort}`);
console.log(`📍 Meu IP: ${CONFIG.myIP}`);
console.log(`📺 Canal: 1 (PDV 3)\n`);

function sendMessage(message) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.setTimeout(5000);

    client.on('connect', () => {
      console.log(`✅ Conectado!`);
      console.log(`   ${client.localAddress}:${client.localPort} -> ${client.remoteAddress}:${client.remotePort}\n`);

      // Enviar com delimitador pipe
      const data = message + '|';
      const buffer = Buffer.from(data, 'utf-8');

      console.log(`📤 Enviando:`);
      console.log(`   "${message}"`);
      console.log(`   Tamanho: ${buffer.length} bytes\n`);

      client.write(buffer);

      setTimeout(() => {
        client.end();
      }, 2000);
    });

    client.on('data', (data) => {
      console.log(`📥 Resposta: ${data.toString()}`);
    });

    client.on('close', () => {
      console.log(`✅ Enviado com sucesso!\n`);
      resolve(true);
    });

    client.on('error', (error) => {
      console.error(`❌ Erro: ${error.message}\n`);
      resolve(false);
    });

    client.on('timeout', () => {
      console.error(`⏱️  Timeout\n`);
      client.destroy();
      resolve(false);
    });

    client.connect(CONFIG.dvrPort, CONFIG.dvrIP);
  });
}

async function main() {
  const messages = [
    '═════════════════════════════',
    'TESTE CLAUDE - OK!',
    'PDV2 FUNCIONANDO',
    new Date().toLocaleString('pt-BR'),
    'Produto: TESTE 001',
    'Valor: R$ 99,90',
    'Operador: ADMIN',
    '═════════════════════════════'
  ];

  console.log('📝 Mensagem que será exibida:\n');
  messages.forEach(m => console.log(`   ${m}`));
  console.log('\n' + '─'.repeat(60) + '\n');

  // Enviar mensagem completa com múltiplas linhas
  const fullMessage = messages.join('|');

  console.log('⏳ Enviando...\n');

  await sendMessage(fullMessage);

  console.log('='.repeat(60));
  console.log('🎯 VERIFIQUE AGORA:');
  console.log('='.repeat(60));
  console.log('\n1. Olhe para a tela do DVR');
  console.log('2. No canal 1 (PDV 3)');
  console.log('3. O texto deve aparecer LARANJA no vídeo');
  console.log('4. Ficará visível por 120 segundos (2 minutos)');
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Se o texto apareceu: FUNCIONOU!');
  console.log('❌ Se não apareceu: me avise!\n');
}

main().catch(console.error);
