/**
 * Teste de MÚLTIPLOS FORMATOS para DVR Intelbras
 *
 * Testa diferentes formatos de mensagem para descobrir
 * qual o DVR aceita e exibe na tela
 */

const net = require('net');

const DVR_CONFIG = {
  ip: '10.6.1.123',
  port: 38800,
  timeout: 5000
};

// Formatos diferentes para testar
const FORMATOS = [
  {
    nome: 'Formato 1: Pipe simples (|)',
    dados: 'CUPOM 001|PRODUTO TESTE|R$ 15.90|TOTAL: R$ 15.90'
  },
  {
    nome: 'Formato 2: Pipe com quebra de linha (|\\n)',
    dados: 'CUPOM 002|\nPRODUTO TESTE|\nR$ 15.90|\nTOTAL: R$ 15.90'
  },
  {
    nome: 'Formato 3: Quebra de linha apenas (\\n)',
    dados: 'CUPOM 003\nPRODUTO TESTE\nR$ 15.90\nTOTAL: R$ 15.90'
  },
  {
    nome: 'Formato 4: Quebra de linha Windows (\\r\\n)',
    dados: 'CUPOM 004\r\nPRODUTO TESTE\r\nR$ 15.90\r\nTOTAL: R$ 15.90'
  },
  {
    nome: 'Formato 5: Texto simples sem separadores',
    dados: 'CUPOM 005 PRODUTO TESTE R$ 15.90 TOTAL: R$ 15.90'
  },
  {
    nome: 'Formato 6: Com caractere especial inicio (STX)',
    dados: '\x02CUPOM 006|PRODUTO TESTE|R$ 15.90|TOTAL: R$ 15.90\x03'
  },
  {
    nome: 'Formato 7: Hex 7C puro (byte)',
    dados: Buffer.from([0x43, 0x55, 0x50, 0x4F, 0x4D, 0x20, 0x30, 0x30, 0x37, 0x7C, 0x50, 0x52, 0x4F, 0x44, 0x55, 0x54, 0x4F, 0x20, 0x54, 0x45, 0x53, 0x54, 0x45])
  }
];

let testeAtual = 0;

function enviarFormato(formato) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📝 Testando: ${formato.nome}`);
    console.log(`${'='.repeat(60)}`);

    const client = new net.Socket();
    client.setTimeout(DVR_CONFIG.timeout);

    let conectado = false;

    client.on('connect', () => {
      conectado = true;
      console.log('✅ Conectado ao DVR');

      // Mostrar o que será enviado
      if (Buffer.isBuffer(formato.dados)) {
        console.log('📤 Enviando (bytes):', formato.dados);
        console.log('📤 Enviando (texto):', formato.dados.toString());
      } else {
        console.log('📤 Enviando:', JSON.stringify(formato.dados));
      }

      // Enviar
      client.write(formato.dados, 'utf8', (error) => {
        if (error) {
          console.error('❌ Erro ao enviar:', error.message);
          client.destroy();
          reject(error);
        } else {
          console.log('✅ Enviado com sucesso!');
          console.log('⏳ Aguardando 3 segundos...');
          console.log('👀 VERIFIQUE A TELA DO DVR AGORA!\n');

          // Aguardar 3 segundos para o usuário ver na tela
          setTimeout(() => {
            client.destroy();
            resolve(true);
          }, 3000);
        }
      });
    });

    client.on('error', (error) => {
      console.error('❌ Erro de conexão:', error.message);
      reject(error);
    });

    client.on('timeout', () => {
      console.error('⏱️  Timeout');
      client.destroy();
      reject(new Error('Timeout'));
    });

    client.on('close', () => {
      if (conectado) {
        console.log('🔌 Conexão fechada');
      }
    });

    // Conectar
    client.connect(DVR_CONFIG.port, DVR_CONFIG.ip);
  });
}

async function testarTodosFormatos() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       TESTE DE FORMATOS - DVR INTELBRAS                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n📡 DVR: ${DVR_CONFIG.ip}:${DVR_CONFIG.port}`);
  console.log(`🧪 Total de formatos a testar: ${FORMATOS.length}\n`);
  console.log('⚠️  IMPORTANTE: Fique de olho na tela do DVR!');
  console.log('    Anote qual CUPOM (001 a 007) apareceu na tela\n');
  console.log('Pressione ENTER para começar...');

  // Aguardar Enter do usuário
  await new Promise(resolve => {
    process.stdin.once('data', () => resolve());
  });

  console.log('\n🚀 Iniciando testes em 2 segundos...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));

  for (let i = 0; i < FORMATOS.length; i++) {
    try {
      await enviarFormato(FORMATOS[i]);

      // Pausa entre os testes
      if (i < FORMATOS.length - 1) {
        console.log('\n⏳ Aguardando 2 segundos para próximo teste...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error('❌ Teste falhou:', error.message);
    }
  }

  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    TESTES CONCLUÍDOS                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n📋 RESULTADO:');
  console.log('   Qual(is) CUPOM apareceu(ram) na tela do DVR?');
  console.log('   CUPOM 001 = Pipe simples');
  console.log('   CUPOM 002 = Pipe com \\n');
  console.log('   CUPOM 003 = Quebra de linha');
  console.log('   CUPOM 004 = Windows \\r\\n');
  console.log('   CUPOM 005 = Texto simples');
  console.log('   CUPOM 006 = Com STX/ETX');
  console.log('   CUPOM 007 = Hex puro');
  console.log('\n');

  process.exit(0);
}

// Executar
testarTodosFormatos().catch(error => {
  console.error('\n❌ Erro geral:', error);
  process.exit(1);
});
