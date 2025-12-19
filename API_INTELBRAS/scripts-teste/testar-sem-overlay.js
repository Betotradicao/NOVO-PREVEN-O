/**
 * TESTE SEM OVERLAY
 * Enviar dados POS sem overlay habilitado para ver se para de travar
 */

const net = require('net');

const DVR_CONFIG = {
  ip: '10.6.1.123',
  port: 52348,  // Porta atual do PDV2 em modo TCP
  timeout: 5000
};

// Cupom simples
const cupomSimples = 'TESTE PDV2 SEM OVERLAY';

function enviarCupom() {
  return new Promise((resolve, reject) => {
    console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║           TESTE SEM OVERLAY - PDV2                               ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

    const client = new net.Socket();
    client.setTimeout(DVR_CONFIG.timeout);

    let conectado = false;

    client.on('connect', () => {
      conectado = true;
      console.log(`✅ Conectado ao DVR na porta ${DVR_CONFIG.port}!\n`);
      console.log('📤 Enviando cupom SIMPLES (sem overlay)...\n');
      console.log('   Texto: "' + cupomSimples + '"\n');

      client.write(cupomSimples, 'utf8', (error) => {
        if (error) {
          console.error('❌ Erro ao enviar:', error.message);
          client.destroy();
          reject(error);
        } else {
          console.log('✅ Dados enviados com sucesso!');
          console.log('\n💡 IMPORTANTE: Overlay está DESABILITADO');
          console.log('   O texto NÃO vai aparecer na tela');
          console.log('   Mas o DVR deve processar e gravar nos logs\n');

          setTimeout(() => {
            client.destroy();
            resolve(true);
          }, 2000);
        }
      });
    });

    client.on('error', (error) => {
      console.error('❌ Erro:', error.message);
      reject(error);
    });

    client.on('timeout', () => {
      console.error('⏱️  Timeout');
      client.destroy();
      reject(new Error('Timeout'));
    });

    client.on('close', () => {
      if (conectado) {
        console.log('🔌 Conexão fechada\n');
        console.log('═'.repeat(70));
        console.log('❓ O DVR TRAVOU?');
        console.log('═'.repeat(70));
        console.log('\n   ✅ NÃO travou? = Problema é o OVERLAY!');
        console.log('   ❌ Travou? = Problema é mais profundo...\n');
        console.log('═'.repeat(70));
        console.log('\n');
      }
    });

    console.log('🔌 Conectando ao DVR...');
    console.log(`   IP: ${DVR_CONFIG.ip}`);
    console.log(`   Porta: ${DVR_CONFIG.port}\n`);

    client.connect(DVR_CONFIG.port, DVR_CONFIG.ip);
  });
}

// Executar
enviarCupom().catch(error => {
  console.error('\n❌ Falha:', error.message);
  process.exit(1);
});
