/**
 * BATERIA DE TESTES - DVR INTELBRAS
 * Testa diferentes formatos de envio para descobrir o correto
 */

const net = require('net');

const DVR_CONFIG = {
  ip: '10.6.1.123',
  port: 38800,
  timeout: 5000
};

const TESTES = [
  {
    nome: 'TESTE 1: Pipe simples (|)',
    dados: 'TESTE 1|LINHA 2|LINHA 3'
  },
  {
    nome: 'TESTE 2: Pipe com \\n no final',
    dados: 'TESTE 2|LINHA 2|LINHA 3\n'
  },
  {
    nome: 'TESTE 3: Pipe com \\r\\n no final',
    dados: 'TESTE 3|LINHA 2|LINHA 3\r\n'
  },
  {
    nome: 'TESTE 4: Quebra de linha \\n',
    dados: 'TESTE 4\nLINHA 2\nLINHA 3'
  },
  {
    nome: 'TESTE 5: Quebra de linha \\r\\n',
    dados: 'TESTE 5\r\nLINHA 2\r\nLINHA 3'
  },
  {
    nome: 'TESTE 6: Texto curto simples',
    dados: 'FUNCIONA?'
  },
  {
    nome: 'TESTE 7: Com header (bytes)',
    dados: Buffer.concat([
      Buffer.from([0x00, 0x01]),
      Buffer.from('TESTE 7|COM|HEADER', 'utf8')
    ])
  },
  {
    nome: 'TESTE 8: Com null terminator',
    dados: 'TESTE 8|LINHA 2|LINHA 3\0'
  },
  {
    nome: 'TESTE 9: Cupom formatado',
    dados: '===== CUPOM 001 =====|Item: PRODUTO TESTE|Qtd: 1 x R$ 10.00|Total: R$ 10.00|====================='
  },
  {
    nome: 'TESTE 10: Apenas ASCII (sem acentos)',
    dados: 'TESTE 10|SEM ACENTOS|SIMPLES'
  }
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function enviarTeste(teste, numero, total) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🧪 ${teste.nome} (${numero}/${total})`);
    console.log(`${'='.repeat(70)}`);

    const client = new net.Socket();
    client.setTimeout(DVR_CONFIG.timeout);

    let conectado = false;

    client.on('connect', () => {
      conectado = true;
      console.log('   ✅ Conectado ao DVR');

      const dadosEnviar = typeof teste.dados === 'string'
        ? Buffer.from(teste.dados, 'utf8')
        : teste.dados;

      console.log(`   📤 Enviando: ${typeof teste.dados === 'string' ? teste.dados.replace(/\n/g, '\\n').replace(/\r/g, '\\r') : '(binário)'}`);
      console.log(`   📏 Tamanho: ${dadosEnviar.length} bytes`);

      client.write(dadosEnviar, (error) => {
        if (error) {
          console.error(`   ❌ Erro ao enviar: ${error.message}`);
          client.destroy();
          reject(error);
        } else {
          console.log('   ✅ Dados enviados!');
          console.log('   👀 OLHE A TELA DO DVR AGORA!');
          console.log('   ⏳ Aguardando 3 segundos para próximo teste...');

          setTimeout(() => {
            client.destroy();
            resolve(true);
          }, 1000);
        }
      });
    });

    client.on('error', (error) => {
      console.error(`   ❌ Erro: ${error.message}`);
      reject(error);
    });

    client.on('timeout', () => {
      console.error('   ⏱️  Timeout');
      client.destroy();
      reject(new Error('Timeout'));
    });

    client.on('close', () => {
      if (conectado) {
        console.log('   🔌 Conexão fechada');
      }
    });

    client.connect(DVR_CONFIG.port, DVR_CONFIG.ip);
  });
}

async function executarBateria() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║        BATERIA DE TESTES - DVR INTELBRAS POS/PDV                 ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  console.log(`\n📡 DVR: ${DVR_CONFIG.ip}:${DVR_CONFIG.port}`);
  console.log(`🧪 Total de testes: ${TESTES.length}\n`);
  console.log('💡 INSTRUÇÕES:');
  console.log('   - Fique de olho na tela do DVR (Canal 2)');
  console.log('   - Anote qual teste funcionou');
  console.log('   - Cada teste espera 3 segundos antes do próximo\n');

  await sleep(2000);

  for (let i = 0; i < TESTES.length; i++) {
    try {
      await enviarTeste(TESTES[i], i + 1, TESTES.length);
      await sleep(3000); // 3 segundos entre testes
    } catch (error) {
      console.error(`\n❌ Teste ${i + 1} falhou:`, error.message);
      await sleep(3000);
    }
  }

  console.log('\n\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                     BATERIA CONCLUÍDA!                            ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');
  console.log('📊 RESULTADO:');
  console.log('   ✅ Todos os 10 testes foram enviados');
  console.log('   👀 Qual teste apareceu na tela do DVR?');
  console.log('\n💬 Me diga qual número de teste funcionou!\n');
}

executarBateria().catch(error => {
  console.error('\n❌ Bateria falhou:', error.message);
  process.exit(1);
});
