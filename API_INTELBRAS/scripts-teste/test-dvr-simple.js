/**
 * Teste SUPER SIMPLES - DVR Intelbras
 * Envia apenas uma linha curta para testar
 */

const net = require('net');

const DVR_CONFIG = {
  ip: '10.6.1.123',
  port: 38800,
  timeout: 5000
};

function enviarTextoSimples() {
  return new Promise((resolve, reject) => {
    console.log('\n╔═══════════════════════════════════════╗');
    console.log('║      TESTE SIMPLES - DVR INTELBRAS    ║');
    console.log('╚═══════════════════════════════════════╝\n');

    const client = new net.Socket();
    client.setTimeout(DVR_CONFIG.timeout);

    let conectado = false;

    client.on('connect', () => {
      conectado = true;
      console.log('✅ CONECTADO ao DVR!\n');

      // Texto SUPER SIMPLES - apenas uma linha
      const textoSimples = 'TESTE|123|ABC';

      console.log('📤 Enviando:', textoSimples);
      console.log('');

      client.write(textoSimples, 'utf8', (error) => {
        if (error) {
          console.error('❌ Erro ao enviar:', error.message);
          client.destroy();
          reject(error);
        } else {
          console.log('✅ Dados enviados!');
          console.log('👀 OLHE A TELA DO DVR AGORA!\n');

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
        console.log('═══════════════════════════════════════');
        console.log('✅ TESTE CONCLUÍDO!');
        console.log('═══════════════════════════════════════\n');
      }
    });

    console.log('🔌 Conectando ao DVR...\n');
    client.connect(DVR_CONFIG.port, DVR_CONFIG.ip);
  });
}

enviarTextoSimples().catch(error => {
  console.error('\n❌ Teste falhou:', error.message);
  process.exit(1);
});
