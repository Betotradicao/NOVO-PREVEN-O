/**
 * TESTE INDIVIDUAL - Cada PDV
 * Envia cupom de teste para cada PDV e aguarda você confirmar
 */

const net = require('net');
const readline = require('readline');

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function pergunta(texto) {
  return new Promise((resolve) => {
    rl.question(texto, (resposta) => {
      resolve(resposta);
    });
  });
}

function enviarCupom(pdv) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.setTimeout(DVR_CONFIG.timeout);

    // Cupom de teste formatado
    const cupom = [
      `===== TESTE ${pdv.name} =====`,
      `Canal: ${pdv.channel}`,
      `Cor: ${pdv.color}`,
      `Data: ${new Date().toLocaleString('pt-BR')}`,
      `========================`,
      ``,
      `Item: PRODUTO TESTE`,
      `Qtd: 1 x R$ 10,00`,
      `Total: R$ 10,00`,
      ``,
      `CUPOM DE TESTE`,
      `SE APARECEU = FUNCIONOU!`
    ].join('|');

    client.on('connect', () => {
      console.log('   ✅ Conectado ao DVR');

      client.write(cupom, 'utf8', (error) => {
        if (error) {
          console.error(`   ❌ Erro ao enviar: ${error.message}`);
          client.destroy();
          reject(error);
        } else {
          console.log('   ✅ Cupom enviado!');
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
      console.log('   🔌 Conexão fechada');
    });

    client.connect(DVR_CONFIG.port, DVR_CONFIG.ip);
  });
}

async function testarPDV(pdv, numero, total) {
  console.log('\n' + '═'.repeat(70));
  console.log(`📺 TESTE ${numero}/${total}: ${pdv.name} → Canal ${pdv.channel} (${pdv.color})`);
  console.log('═'.repeat(70));

  console.log(`\n👀 OLHE PARA O CANAL ${pdv.channel} NA TELA DO DVR!`);
  console.log(`   (Câmera que filma o ${pdv.name})\n`);

  try {
    console.log('📤 Enviando cupom de teste...\n');
    await enviarCupom(pdv);

    console.log('\n' + '─'.repeat(70));
    console.log('❓ PERGUNTA:');
    console.log('─'.repeat(70));

    const resposta = await pergunta(`\nApareceu o texto no Canal ${pdv.channel}? (s/n): `);

    if (resposta.toLowerCase() === 's' || resposta.toLowerCase() === 'sim') {
      console.log(`\n🎉 ✅ ${pdv.name} FUNCIONANDO!`);
      return { pdv: pdv.name, funcionou: true };
    } else {
      console.log(`\n⚠️  ❌ ${pdv.name} NÃO FUNCIONOU`);
      return { pdv: pdv.name, funcionou: false };
    }

  } catch (error) {
    console.error(`\n❌ Erro ao testar ${pdv.name}:`, error.message);
    return { pdv: pdv.name, funcionou: false, erro: error.message };
  }
}

async function main() {
  console.clear();
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║          TESTE INDIVIDUAL - TODOS OS PDVs                        ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  console.log(`\n📡 DVR: ${DVR_CONFIG.ip}:${DVR_CONFIG.port}`);
  console.log(`🎯 Testando ${PDVS.length} PDVs\n`);

  console.log('💡 INSTRUÇÕES:');
  console.log('   1. Fique de olho na tela do DVR');
  console.log('   2. Vou enviar um cupom de teste para cada PDV');
  console.log('   3. Você me diz se apareceu (s/n)');
  console.log('   4. No final, mostro o resumo\n');

  const resposta = await pergunta('Pronto para começar? (pressione ENTER)');

  const resultados = [];

  for (let i = 0; i < PDVS.length; i++) {
    const resultado = await testarPDV(PDVS[i], i + 1, PDVS.length);
    resultados.push(resultado);

    if (i < PDVS.length - 1) {
      console.log('\n⏳ Aguarde 2 segundos para o próximo teste...\n');
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Resumo final
  console.log('\n\n' + '╔' + '═'.repeat(68) + '╗');
  console.log('║' + ' '.repeat(20) + '📊 RESUMO DOS TESTES' + ' '.repeat(28) + '║');
  console.log('╚' + '═'.repeat(68) + '╝\n');

  const funcionando = resultados.filter(r => r.funcionou);
  const comProblema = resultados.filter(r => !r.funcionou);

  console.log(`✅ Funcionando: ${funcionando.length}/${PDVS.length}`);
  for (const r of funcionando) {
    console.log(`   ✅ ${r.pdv}`);
  }

  if (comProblema.length > 0) {
    console.log(`\n❌ Com problema: ${comProblema.length}/${PDVS.length}`);
    for (const r of comProblema) {
      console.log(`   ❌ ${r.pdv}${r.erro ? ` - ${r.erro}` : ''}`);
    }
  }

  if (funcionando.length === PDVS.length) {
    console.log('\n' + '═'.repeat(70));
    console.log('🎉🎉🎉 PARABÉNS! TODOS OS PDVs FUNCIONANDO! 🎉🎉🎉');
    console.log('═'.repeat(70));
    console.log('\n✅ Integração DVR + POS concluída com sucesso!');
    console.log('\n💡 Próximos passos:');
    console.log('   - Integrar com o sistema Zanthus');
    console.log('   - Enviar cupons fiscais reais');
    console.log('   - Configurar automação');
  } else {
    console.log('\n' + '═'.repeat(70));
    console.log('⚠️  Alguns PDVs não funcionaram');
    console.log('═'.repeat(70));
    console.log('\n💡 Vamos investigar o que aconteceu...');
  }

  console.log('\n');
  rl.close();
}

main().catch(error => {
  console.error('\n❌ Erro geral:', error.message);
  rl.close();
  process.exit(1);
});
