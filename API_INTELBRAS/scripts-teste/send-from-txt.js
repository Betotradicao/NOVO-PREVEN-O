/**
 * Programa para enviar dados de arquivo TXT para o DVR POS
 * Similar ao programa da Intelbras
 */

const net = require('net');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  dvrIP: '10.6.1.123',
  dvrPort: 38800,
  txtFile: 'teste-pdv.txt',
  encoding: 'utf-8'
};

console.log('='.repeat(70));
console.log('📄 ENVIO DE TESTE VIA ARQUIVO TXT - INTELBRAS POS');
console.log('='.repeat(70));
console.log(`\n📡 DVR: ${CONFIG.dvrIP}:${CONFIG.dvrPort}`);
console.log(`📄 Arquivo: ${CONFIG.txtFile}\n`);

function sendPOSData(data) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.setTimeout(10000);

    client.on('connect', () => {
      console.log(`✅ Conectado ao DVR!`);
      console.log(`   ${client.localAddress}:${client.localPort} -> ${client.remoteAddress}:${client.remotePort}\n`);

      console.log(`📤 Enviando dados (${data.length} bytes)...\n`);

      // Enviar dados
      client.write(data);

      // Aguardar resposta
      setTimeout(() => {
        console.log(`✅ Dados enviados!\n`);
        client.end();
      }, 2000);
    });

    client.on('data', (response) => {
      console.log(`📥 Resposta do DVR:`);
      console.log(response.toString());
    });

    client.on('close', () => {
      console.log(`🔌 Conexão encerrada.\n`);
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

    console.log(`⏳ Conectando em ${CONFIG.dvrIP}:${CONFIG.dvrPort}...\n`);
    client.connect(CONFIG.dvrPort, CONFIG.dvrIP);
  });
}

async function main() {
  try {
    // Verificar se arquivo existe
    const filePath = path.join(__dirname, CONFIG.txtFile);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ Arquivo não encontrado: ${filePath}\n`);
      return;
    }

    // Ler arquivo
    console.log(`📖 Lendo arquivo: ${CONFIG.txtFile}\n`);
    const content = fs.readFileSync(filePath, CONFIG.encoding);

    console.log('═'.repeat(70));
    console.log('📄 CONTEÚDO DO ARQUIVO:');
    console.log('═'.repeat(70));
    console.log(content);
    console.log('═'.repeat(70));
    console.log('\n');

    // Perguntar confirmação
    console.log('💡 IMPORTANTE:');
    console.log('   - PDV2 #1 (canal 1 "PDV 3"): usa delimitador | (pipe)');
    console.log('   - PDV2 #2 (canal 5 "PDV 2"): usa quebra de linha\n');

    console.log('🔄 Vou tentar enviar de DUAS formas:\n');
    console.log('   1️⃣  Com quebras de linha normais (para PDV2 #2)');
    console.log('   2️⃣  Com delimitador pipe (para PDV2 #1)\n');

    console.log('─'.repeat(70));
    console.log('TESTE 1: ENVIANDO COM QUEBRA DE LINHA (PDV2 #2 - canal 5)');
    console.log('─'.repeat(70));
    console.log('\n');

    // Enviar com quebras de linha normais
    const buffer1 = Buffer.from(content, CONFIG.encoding);
    await sendPOSData(buffer1);

    console.log('\n⏳ Aguardando 3 segundos...\n\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('─'.repeat(70));
    console.log('TESTE 2: ENVIANDO COM PIPE | (PDV2 #1 - canal 1)');
    console.log('─'.repeat(70));
    console.log('\n');

    // Converter quebras de linha para pipe
    const withPipe = content.replace(/\r?\n/g, '|');
    const buffer2 = Buffer.from(withPipe, CONFIG.encoding);
    await sendPOSData(buffer2);

    console.log('═'.repeat(70));
    console.log('✅ TESTES CONCLUÍDOS');
    console.log('═'.repeat(70));
    console.log('\n🎯 VERIFIQUE AGORA NAS CÂMERAS:\n');
    console.log('   Canal 1 (PDV 3): O texto deve aparecer');
    console.log('   Canal 5 (PDV 2): O texto deve aparecer');
    console.log('\n💡 Se aparecer em algum deles, FUNCIONOU!\n');
    console.log('⚠️  LEMBRE-SE: Só vai aparecer se o IP estiver configurado');
    console.log('   corretamente (10.6.1.171) no DVR!\n');
    console.log('═'.repeat(70));
    console.log('\n');

  } catch (error) {
    console.error(`\n❌ Erro geral: ${error.message}\n`);
  }
}

main();
