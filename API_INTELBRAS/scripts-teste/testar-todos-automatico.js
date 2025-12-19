/**
 * TESTE AUTOMÁTICO - Envia para todos os 5 PDVs
 * Você só observa a tela do DVR
 */

const net = require('net');

const DVR_CONFIG = {
  ip: '10.6.1.123',
  port: 38800,
  timeout: 5000
};

const PDVS = [
  { name: 'PDV1', channel: 5, color: 'Laranja' },
  { name: 'PDV2', channel: 6, color: 'Amarelo' },
  { name: 'PDV3', channel: 2, color: 'Verde' },
  { name: 'PDV4', channel: 4, color: 'Cyan' },
  { name: 'PDV5', channel: 3, color: 'Magenta' }
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function enviarCupom(pdv) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.setTimeout(DVR_CONFIG.timeout);

    // Cupom de teste formatado
    const cupom = [
      `=============================`,
      `  TESTE ${pdv.name}`,
      `=============================`,
      `Canal: ${pdv.channel}`,
      `Cor: ${pdv.color}`,
      `Hora: ${new Date().toLocaleTimeString('pt-BR')}`,
      ``,
      `Item: PRODUTO TESTE`,
      `Qtd: 1 x R$ 10,00`,
      `Total: R$ 10,00`,
      ``,
      `✓ SE VOCE ESTA VENDO`,
      `✓ ENTAO FUNCIONOU!`,
      `=============================`
    ].join('|');

    client.on('connect', () => {
      console.log('   ✅ Conectado ao DVR');

      client.write(cupom, 'utf8', (error) => {
        if (error) {
          console.error(`   ❌ Erro ao enviar: ${error.message}`);
          client.destroy();
          reject(error);
        } else {
          console.log('   ✅ Cupom enviado com sucesso!');
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
      console.log('   🔌 Conexão fechada\n');
    });

    client.connect(DVR_CONFIG.port, DVR_CONFIG.ip);
  });
}

async function testarPDV(pdv, numero, total) {
  console.log('═'.repeat(70));
  console.log(`📺 TESTE ${numero}/${total}: ${pdv.name} → Canal ${pdv.channel} (${pdv.color})`);
  console.log('═'.repeat(70));

  console.log(`\n👀 OLHE PARA O CANAL ${pdv.channel} NA TELA DO DVR AGORA!\n`);

  try {
    console.log('📤 Enviando cupom de teste...\n');
    await enviarCupom(pdv);
    console.log(`✅ Teste do ${pdv.name} concluído!`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao testar ${pdv.name}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║        TESTE AUTOMÁTICO - TODOS OS 5 PDVs                        ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');
  console.log(`📡 DVR: ${DVR_CONFIG.ip}:${DVR_CONFIG.port}`);
  console.log(`🎯 Testando ${PDVS.length} PDVs automaticamente\n`);

  console.log('💡 INSTRUÇÕES:');
  console.log('   - Fique de olho na tela do DVR');
  console.log('   - Vou enviar um cupom para cada PDV');
  console.log('   - Intervalo de 5 segundos entre cada teste');
  console.log('   - Observe qual canal aparece o texto\n');

  console.log('⏳ Iniciando em 3 segundos...\n');
  await sleep(3000);

  for (let i = 0; i < PDVS.length; i++) {
    await testarPDV(PDVS[i], i + 1, PDVS.length);

    if (i < PDVS.length - 1) {
      console.log('─'.repeat(70));
      console.log('⏳ Próximo teste em 5 segundos...');
      console.log('─'.repeat(70));
      console.log('\n');
      await sleep(5000);
    }
  }

  console.log('\n\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                    ✅ TESTES CONCLUÍDOS!                          ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  console.log('📊 RESUMO DOS TESTES:\n');
  for (const pdv of PDVS) {
    console.log(`   📺 ${pdv.name} → Canal ${pdv.channel} (${pdv.color})`);
  }

  console.log('\n' + '═'.repeat(70));
  console.log('❓ PERGUNTA:');
  console.log('═'.repeat(70));
  console.log('\nQual(is) PDV(s) apareceram na tela?');
  console.log('Me diga para eu saber quais funcionaram!\n');
  console.log('Exemplos de resposta:');
  console.log('   - "Todos funcionaram"');
  console.log('   - "Só PDV1 e PDV2"');
  console.log('   - "Nenhum funcionou"');
  console.log('   - "PDV3, PDV4 e PDV5"\n');
  console.log('═'.repeat(70));
  console.log('\n');
}

main().catch(error => {
  console.error('\n❌ Erro geral:', error.message);
  process.exit(1);
});
