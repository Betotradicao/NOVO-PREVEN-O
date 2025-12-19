/**
 * Teste de PORTAS - DVR Intelbras
 * Testa diferentes portas comuns para POS
 */

const net = require('net');

const DVR_IP = '10.6.1.123';

// Portas comuns para POS em DVRs Intelbras
const PORTAS = [
  { porta: 38800, nome: 'Porta POS padrão 1' },
  { porta: 5000, nome: 'Porta POS alternativa 1' },
  { porta: 5001, nome: 'Porta POS alternativa 2' },
  { porta: 3000, nome: 'Porta POS alternativa 3' },
  { porta: 9000, nome: 'Porta POS alternativa 4' },
  { porta: 37777, nome: 'Porta TCP principal DVR' },
  { porta: 8000, nome: 'Porta HTTP DVR' }
];

function testarPorta(config) {
  return new Promise((resolve) => {
    const client = new net.Socket();
    client.setTimeout(2000);

    let status = { ...config, status: 'fechada', erro: null };

    client.on('connect', () => {
      status.status = 'aberta';

      // Tentar enviar dados de teste
      const testData = 'TESTE POS|CUPOM 123|PRODUTO TESTE';
      client.write(testData, 'utf8', (error) => {
        if (!error) {
          status.status = 'aberta e aceita dados';
        }
        client.destroy();
        resolve(status);
      });
    });

    client.on('error', (error) => {
      status.erro = error.code;
      client.destroy();
      resolve(status);
    });

    client.on('timeout', () => {
      status.erro = 'TIMEOUT';
      client.destroy();
      resolve(status);
    });

    client.connect(config.porta, DVR_IP);
  });
}

async function testarTodasPortas() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         TESTE DE PORTAS - DVR INTELBRAS                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`📡 DVR IP: ${DVR_IP}\n`);
  console.log('🔍 Testando portas...\n');

  const resultados = [];

  for (const config of PORTAS) {
    process.stdout.write(`  Testando porta ${config.porta.toString().padEnd(6)} (${config.nome})... `);
    const resultado = await testarPorta(config);
    resultados.push(resultado);

    if (resultado.status.includes('aberta')) {
      console.log(`✅ ${resultado.status.toUpperCase()}`);
    } else {
      console.log(`❌ ${resultado.status} (${resultado.erro || 'N/A'})`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('RESUMO:');
  console.log('═'.repeat(60) + '\n');

  const portasAbertas = resultados.filter(r => r.status.includes('aberta'));

  if (portasAbertas.length > 0) {
    console.log('✅ Portas abertas encontradas:\n');
    portasAbertas.forEach(p => {
      console.log(`   Porta ${p.porta}: ${p.nome}`);
      console.log(`   Status: ${p.status}\n`);
    });

    console.log('\n💡 Sugestão:');
    console.log(`   Use a porta ${portasAbertas[0].porta} para POS`);
    console.log(`   Configure no DVR e no código do backend\n`);
  } else {
    console.log('❌ Nenhuma porta aberta encontrada!\n');
    console.log('💡 Possíveis causas:');
    console.log('   1. DVR não está acessível na rede');
    console.log('   2. Firewall bloqueando as portas');
    console.log('   3. Configuração de rede do DVR incorreta\n');
  }

  process.exit(0);
}

testarTodasPortas().catch(error => {
  console.error('Erro:', error);
  process.exit(1);
});
