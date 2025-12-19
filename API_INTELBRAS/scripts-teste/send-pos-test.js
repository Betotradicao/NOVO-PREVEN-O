/**
 * Script para enviar texto de teste para o PDV2 via TCP
 * Porta: 38800 (configurada no DVR)
 */

const net = require('net');

const POS_CONFIG = {
  ip: '10.6.1.123',
  port: 38800,
  channel: 1, // PDV 3
  delimiter: '|', // 0x7C
  encoding: 'utf-8'
};

console.log('='.repeat(60));
console.log('📤 ENVIO DE TESTE PARA PDV2 (CANAL 1 - PDV 3)');
console.log('='.repeat(60));
console.log(`\n🎯 Alvo: ${POS_CONFIG.ip}:${POS_CONFIG.port}`);
console.log(`📺 Canal: ${POS_CONFIG.channel} (PDV 3)`);
console.log(`📏 Delimitador: "${POS_CONFIG.delimiter}" (0x${POS_CONFIG.delimiter.charCodeAt(0).toString(16)})`);
console.log('\n');

// Mensagens de teste
const testMessages = [
  'TESTE CLAUDE - LINHA 1',
  'Produto: TESTE 123',
  'Valor: R$ 99,90',
  'Operador: ADMIN',
  'Data: ' + new Date().toLocaleString('pt-BR')
];

function sendPOSMessage(message) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();

    client.setTimeout(5000);

    client.on('connect', () => {
      console.log(`✅ Conectado ao DVR porta ${POS_CONFIG.port}!`);

      // Enviar mensagem com delimitador
      // Formato: MENSAGEM|
      const data = message + POS_CONFIG.delimiter;
      const buffer = Buffer.from(data, POS_CONFIG.encoding);

      console.log(`\n📤 Enviando: "${message}"`);
      console.log(`   Tamanho: ${buffer.length} bytes`);
      console.log(`   Hex: ${buffer.toString('hex')}`);

      client.write(buffer);

      // Aguardar um pouco antes de fechar
      setTimeout(() => {
        client.end();
      }, 1000);
    });

    client.on('data', (data) => {
      console.log(`📥 Resposta do DVR: ${data.toString()}`);
    });

    client.on('close', () => {
      console.log(`🔌 Conexão encerrada.`);
      resolve();
    });

    client.on('error', (error) => {
      console.error(`❌ Erro: ${error.message}`);
      reject(error);
    });

    client.on('timeout', () => {
      console.error(`⏱️  Timeout`);
      client.destroy();
      reject(new Error('Timeout'));
    });

    console.log(`⏳ Conectando em ${POS_CONFIG.ip}:${POS_CONFIG.port}...`);
    client.connect(POS_CONFIG.port, POS_CONFIG.ip);
  });
}

async function sendMultipleLines() {
  console.log('📝 Enviando múltiplas linhas de teste...\n');

  // Concatenar todas as mensagens com delimitador
  const fullMessage = testMessages.join(POS_CONFIG.delimiter);

  try {
    await sendPOSMessage(fullMessage);
    console.log('\n✅ Mensagem enviada com sucesso!');
  } catch (error) {
    console.error('\n❌ Falha ao enviar mensagem:', error.message);
  }
}

async function sendSequential() {
  console.log('🔄 Enviando mensagens sequencialmente...\n');

  for (const message of testMessages) {
    try {
      await sendPOSMessage(message);
      console.log('');

      // Aguardar 2 segundos entre mensagens
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Erro ao enviar "${message}":`, error.message);
    }
  }
}

async function main() {
  try {
    // Testar enviando todas as linhas de uma vez
    console.log('═'.repeat(60));
    console.log('TESTE 1: ENVIO DE MÚLTIPLAS LINHAS');
    console.log('═'.repeat(60));
    await sendMultipleLines();

    console.log('\n\n');

    // Testar enviando linha por linha
    console.log('═'.repeat(60));
    console.log('TESTE 2: ENVIO SEQUENCIAL');
    console.log('═'.repeat(60));
    await sendSequential();

    console.log('\n' + '='.repeat(60));
    console.log('✅ TESTES CONCLUÍDOS');
    console.log('='.repeat(60));
    console.log('\n💡 VERIFICAÇÃO:\n');
    console.log('1. Abrir visualização do DVR');
    console.log('2. Ir para Canal 1 (PDV 3)');
    console.log('3. Verificar se o texto apareceu sobreposto no vídeo');
    console.log('4. A cor deve ser LARANJA (243, 89, 0)');
    console.log('5. Tamanho da fonte: 32');
    console.log('\n' + '='.repeat(60));
    console.log('\n');

  } catch (error) {
    console.error('\n❌ ERRO GERAL:', error);
  }
}

// Executar
main();
