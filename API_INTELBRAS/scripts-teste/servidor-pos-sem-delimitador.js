/**
 * SERVIDOR POS SEM DELIMITADOR
 * Teste com texto simples, sem o delimitador 7C (pipe)
 */

const net = require('net');

const SERVER_CONFIG = {
  host: '0.0.0.0',
  port: 60020
};

// Cupom SIMPLES sem delimitador, usando quebra de linha normal
const cupomSimples = [
  '=============================',
  '  TESTE PDV2 - CANAL 6',
  '=============================',
  'Data: ' + new Date().toLocaleDateString('pt-BR'),
  'Hora: ' + new Date().toLocaleTimeString('pt-BR'),
  '',
  'Item: PRODUTO TESTE',
  'Qtd: 1 x R$ 10,00',
  'Total: R$ 10,00',
  '',
  'SE VOCE VE ISSO',
  'ESTA NO CANAL 6',
  'ENTAO FUNCIONOU!',
  '============================='
].join('\n');  // Usando \n ao invés de |

const server = net.createServer((socket) => {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║              DVR CONECTOU!                                       ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  console.log(`📡 Conexão de: ${socket.remoteAddress}:${socket.remotePort}`);
  console.log(`👀 OLHE PARA O CANAL 6 NA TELA DO DVR!\n`);

  setTimeout(() => {
    console.log('📤 Enviando cupom SEM delimitador 7C...\n');
    console.log('═'.repeat(70));
    console.log(cupomSimples);
    console.log('═'.repeat(70));
    console.log('\n💡 Texto enviado com quebras de linha normais (\\n)\n');

    socket.write(cupomSimples, 'utf8', (error) => {
      if (error) {
        console.error('❌ Erro:', error.message);
      } else {
        console.log('✅ Cupom enviado!');
        console.log('\n📺 Verifique se apareceu no Canal 6!\n');
      }
    });

    setTimeout(() => {
      socket.end();
    }, 3000);

  }, 1000);

  socket.on('error', (error) => {
    console.error(`❌ Erro: ${error.message}`);
  });

  socket.on('close', () => {
    console.log('🔌 DVR desconectou\n');
    console.log('═'.repeat(70));
    console.log('Aguardando próxima conexão...\n');
  });
});

server.on('listening', () => {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║       SERVIDOR POS SEM DELIMITADOR - AGUARDANDO DVR             ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');
  console.log(`📡 Escutando em: ${SERVER_CONFIG.host}:${SERVER_CONFIG.port}`);
  console.log(`🎯 Configuração: SEM delimitador 7C, usando \\n normal\n`);
  console.log('⏳ Aguardando DVR conectar...\n');
});

server.listen(SERVER_CONFIG.port, SERVER_CONFIG.host);

process.on('SIGINT', () => {
  console.log('\n\n🛑 Parando servidor...');
  server.close(() => {
    console.log('✅ Servidor parado\n');
    process.exit(0);
  });
});
