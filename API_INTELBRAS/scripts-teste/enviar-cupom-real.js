/**
 * CUPOM FISCAL REALISTA
 * Simula uma venda real de supermercado com 6 itens
 */

const net = require('net');

const DVR_CONFIG = {
  ip: '10.6.1.123',
  port: 38800,
  timeout: 5000
};

// Cupom fiscal realista
const cupomFiscal = [
  '========================================',
  '        SUPERMERCADO BOM PRECO         ',
  '========================================',
  'CNPJ: 12.345.678/0001-99',
  'Rua das Flores, 123 - Centro',
  'Tel: (11) 1234-5678',
  '========================================',
  '',
  `Data: ${new Date().toLocaleDateString('pt-BR')}`,
  `Hora: ${new Date().toLocaleTimeString('pt-BR')}`,
  `Cupom: ${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`,
  `Caixa: PDV 02`,
  `Operador: MARIA SILVA`,
  '',
  '========================================',
  '              PRODUTOS                 ',
  '========================================',
  '',
  '001 MACA GALA KG',
  '    1.500 x R$ 4.99',
  '                            R$ 7.48',
  '',
  '002 COCA COLA 2L ZERO',
  '    2.000 x R$ 10.99',
  '                           R$ 21.98',
  '',
  '003 ARROZ TIPO 1 5KG',
  '    1.000 x R$ 24.90',
  '                           R$ 24.90',
  '',
  '004 FEIJAO PRETO 1KG',
  '    2.000 x R$ 8.50',
  '                           R$ 17.00',
  '',
  '005 CAFE PILAO 500G',
  '    1.000 x R$ 18.99',
  '                           R$ 18.99',
  '',
  '006 LEITE INTEGRAL 1L',
  '    3.000 x R$ 4.50',
  '                           R$ 13.50',
  '',
  '========================================',
  '',
  'SUBTOTAL                   R$ 103.85',
  'DESCONTO                    R$ 1.99',
  '',
  '========================================',
  '        TOTAL A PAGAR       R$ 101.86',
  '========================================',
  '',
  'FORMA DE PAGAMENTO:',
  'DINHEIRO                   R$ 101.86',
  '',
  'TROCO                       R$ 0.00',
  '',
  '========================================',
  '   OBRIGADO PELA PREFERENCIA!',
  '   VOLTE SEMPRE!',
  '========================================',
  '',
  'Autorizacao: 987654321',
  'Emitido via PDV v2.5.1',
  ''
].join('|');

function enviarCupom() {
  return new Promise((resolve, reject) => {
    console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║           ENVIANDO CUPOM FISCAL REALISTA                         ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

    const client = new net.Socket();
    client.setTimeout(DVR_CONFIG.timeout);

    let conectado = false;

    client.on('connect', () => {
      conectado = true;
      console.log('✅ Conectado ao DVR!\n');
      console.log('📋 CUPOM FISCAL:');
      console.log('═'.repeat(70));
      console.log(cupomFiscal.replace(/\|/g, '\n'));
      console.log('═'.repeat(70));
      console.log('\n📤 Enviando para o DVR...\n');

      client.write(cupomFiscal, 'utf8', (error) => {
        if (error) {
          console.error('❌ Erro ao enviar:', error.message);
          client.destroy();
          reject(error);
        } else {
          console.log('✅ Cupom enviado com sucesso!');
          console.log('\n👀 OLHE A TELA DO DVR AGORA!');
          console.log('   O cupom deve aparecer em todos os canais configurados\n');

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
        console.log('✅ TESTE CONCLUÍDO!');
        console.log('═'.repeat(70));
        console.log('\n💡 O cupom deve ter aparecido na tela por ~120 segundos');
        console.log('   (tempo configurado no DVR)\n');
        console.log('📊 RESUMO DO CUPOM:');
        console.log('   - 6 produtos');
        console.log('   - Subtotal: R$ 103,85');
        console.log('   - Desconto: R$ 1,99');
        console.log('   - Total: R$ 101,86');
        console.log('   - Operador: MARIA SILVA');
        console.log('   - Caixa: PDV 02\n');
        console.log('═'.repeat(70));
        console.log('\n');
      }
    });

    console.log('🔌 Conectando ao DVR...');
    client.connect(DVR_CONFIG.port, DVR_CONFIG.ip);
  });
}

// Executar
enviarCupom().catch(error => {
  console.error('\n❌ Falha:', error.message);
  process.exit(1);
});
