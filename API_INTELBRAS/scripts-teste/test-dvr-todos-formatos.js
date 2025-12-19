#!/usr/bin/env node
/**
 * TESTE DE TODOS OS FORMATOS - DVR INTELBRAS POS
 *
 * Testa diferentes separadores e encodings para descobrir qual funciona.
 */

const net = require('net');

// ==========================================
// CONFIGURAÇÕES
// ==========================================
const DVR_IP = '10.6.1.123';
const DVR_PORT = 38800;
const DELAY_ENTRE_TESTES = 8000; // 8 segundos entre cada teste

// ==========================================
// FORMATOS A TESTAR
// ==========================================
const TESTES = [
  {
    nome: 'TESTE 1: Pipe (|) - Padrão Intelbras',
    separador: '|',
    encoding: 'utf8',
    linhas: [
      '===== TESTE 1 =====',
      'Separador: PIPE (|)',
      'Encoding: UTF-8',
      'Data: ' + new Date().toLocaleString('pt-BR'),
      '==================='
    ]
  },
  {
    nome: 'TESTE 2: Line Feed (\\n)',
    separador: '\n',
    encoding: 'utf8',
    linhas: [
      '===== TESTE 2 =====',
      'Separador: LF (\\n)',
      'Encoding: UTF-8',
      'Data: ' + new Date().toLocaleString('pt-BR'),
      '==================='
    ]
  },
  {
    nome: 'TESTE 3: CRLF (\\r\\n) Windows',
    separador: '\r\n',
    encoding: 'utf8',
    linhas: [
      '===== TESTE 3 =====',
      'Separador: CRLF',
      'Encoding: UTF-8',
      'Data: ' + new Date().toLocaleString('pt-BR'),
      '==================='
    ]
  },
  {
    nome: 'TESTE 4: Pipe + ASCII (sem acentos)',
    separador: '|',
    encoding: 'ascii',
    linhas: [
      '===== TESTE 4 =====',
      'Separador: PIPE',
      'Encoding: ASCII',
      'Sem acentos especiais',
      '==================='
    ]
  },
  {
    nome: 'TESTE 5: Cupom Real Completo',
    separador: '|',
    encoding: 'utf8',
    linhas: [
      '===== CUPOM FISCAL 12345 =====',
      'Data: ' + new Date().toLocaleDateString('pt-BR'),
      'Hora: ' + new Date().toLocaleTimeString('pt-BR'),
      'Caixa: 01',
      '',
      'Item: REFRIGERANTE 2L',
      'Qtd: 2 x R$ 10,50',
      'Subtotal: R$ 21,00',
      '',
      'TOTAL: R$ 21,00',
      '================================'
    ]
  },
  {
    nome: 'TESTE 6: Texto curto simples',
    separador: '|',
    encoding: 'utf8',
    linhas: [
      'TESTE 6',
      'CONEXAO OK',
      'DVR FUNCIONANDO'
    ]
  }
];

// ==========================================
// VARIÁVEIS GLOBAIS
// ==========================================
let testeAtual = 0;
let testesQueFuncionaram = [];

// ==========================================
// FUNÇÃO PARA EXECUTAR UM TESTE
// ==========================================
function executarTeste(teste) {
  return new Promise((resolve) => {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log(`║  ${teste.nome.padEnd(42, ' ')} ║`);
    console.log('╚════════════════════════════════════════════╝');

    const texto = teste.linhas.join(teste.separador);

    console.log(`📡 Conectando ao ${DVR_IP}:${DVR_PORT}...`);
    console.log(`📝 Separador: ${JSON.stringify(teste.separador)}`);
    console.log(`💾 Encoding: ${teste.encoding}`);
    console.log(`📏 Tamanho: ${texto.length} bytes\n`);

    console.log('═══ VISUALIZAÇÃO ═══');
    console.log(teste.linhas.join('\n'));
    console.log('════════════════════\n');

    const client = new net.Socket();
    client.setTimeout(5000);

    let conectado = false;

    client.on('connect', () => {
      conectado = true;
      console.log('✅ Conectado!');

      client.write(texto, teste.encoding, (err) => {
        if (err) {
          console.error('❌ Erro ao enviar:', err.message);
          client.destroy();
          resolve(false);
        } else {
          console.log('✅ Enviado com sucesso!');
          console.log('\n👀 OLHE PARA A TELA DO DVR AGORA!');
          console.log(`⏰ Aguardando ${DELAY_ENTRE_TESTES / 1000} segundos...\n`);

          // Aguardar antes de fechar
          setTimeout(() => {
            client.destroy();
            resolve(true);
          }, DELAY_ENTRE_TESTES);
        }
      });
    });

    client.on('timeout', () => {
      console.error('❌ TIMEOUT');
      client.destroy();
      resolve(false);
    });

    client.on('error', (err) => {
      if (!conectado) {
        console.error('❌ ERRO:', err.code || err.message);
        resolve(false);
      }
    });

    client.connect(DVR_PORT, DVR_IP);
  });
}

// ==========================================
// EXECUTAR TODOS OS TESTES
// ==========================================
async function executarTodosOsTestes() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  TESTE DE FORMATOS DVR - MODO AUTOMÁTICO   ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`\n📊 Total de testes: ${TESTES.length}`);
  console.log(`⏱️  Tempo estimado: ~${(TESTES.length * DELAY_ENTRE_TESTES) / 1000} segundos`);
  console.log('\n⚠️  IMPORTANTE: Deixe a tela do DVR visível!');
  console.log('   Anote qual teste apareceu na tela!\n');

  console.log('Iniciando em 3 segundos...\n');
  await new Promise(r => setTimeout(r, 3000));

  for (let i = 0; i < TESTES.length; i++) {
    const teste = TESTES[i];
    const sucesso = await executarTeste(teste);

    if (sucesso) {
      testesQueFuncionaram.push(teste.nome);
    }
  }

  // Resultado final
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║           TESTES CONCLUÍDOS!               ║');
  console.log('╚════════════════════════════════════════════╝\n');

  console.log('📊 RESUMO:');
  console.log(`   Total de testes: ${TESTES.length}`);
  console.log(`   Conexões bem-sucedidas: ${testesQueFuncionaram.length}\n`);

  if (testesQueFuncionaram.length > 0) {
    console.log('✅ TESTES QUE CONECTARAM:');
    testesQueFuncionaram.forEach((nome, i) => {
      console.log(`   ${i + 1}. ${nome}`);
    });
    console.log('\n❓ ALGUM DELES APARECEU NA TELA?');
    console.log('   → Se SIM: Anote qual formato funcionou!');
    console.log('   → Se NÃO: Problema pode estar na configuração do DVR\n');
  } else {
    console.log('❌ NENHUM TESTE CONSEGUIU CONECTAR\n');
    console.log('🔧 VERIFICAR:');
    console.log('   • IP do DVR está correto? (' + DVR_IP + ')');
    console.log('   • DVR está ligado?');
    console.log('   • Porta 38800 está aberta?');
    console.log('\n💡 TESTE MANUAL:');
    console.log('   ping ' + DVR_IP);
    console.log('');
  }

  process.exit(0);
}

// Executar
executarTodosOsTestes().catch(err => {
  console.error('\n❌ ERRO FATAL:', err.message);
  process.exit(1);
});
