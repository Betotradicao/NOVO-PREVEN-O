/**
 * SERVIDOR POS PARA MODO TCP_CLIENT
 *
 * No modo TCP_CLIENT, o DVR age como CLIENTE e conecta no nosso servidor.
 * Este servidor escuta na porta 60020 e quando o DVR conectar, envia os dados POS.
 */

const net = require('net');

const SERVER_CONFIG = {
  host: '0.0.0.0',  // Escuta em todas as interfaces
  port: 60020       // Porta que o DVR vai conectar (conforme configuração PDV2)
};

// Cupom fiscal de teste
const cupomTeste = [
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
  '✓ SE VOCE VE ISSO',
  '✓ ESTA NO CANAL 6',
  '✓ ENTAO FUNCIONOU!',
  '============================='
].join('|');

// Criar servidor TCP
const server = net.createServer((socket) => {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║              DVR CONECTOU AO SERVIDOR!                           ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  console.log(`📡 Conexão recebida de: ${socket.remoteAddress}:${socket.remotePort}`);
  console.log(`👀 OLHE PARA O CANAL 6 NA TELA DO DVR AGORA!\n`);

  // Aguardar 1 segundo antes de enviar
  setTimeout(() => {
    console.log('📤 Enviando cupom de teste...\n');
    console.log('═'.repeat(70));
    console.log(cupomTeste.replace(/\|/g, '\n'));
    console.log('═'.repeat(70));
    console.log('\n');

    // Enviar dados POS
    socket.write(cupomTeste, 'utf8', (error) => {
      if (error) {
        console.error('❌ Erro ao enviar:', error.message);
      } else {
        console.log('✅ Cupom enviado com sucesso!');
        console.log('\n💡 O texto deve aparecer no Canal 6 por ~120 segundos');
        console.log('   (conforme configurado no DVR)\n');
      }
    });

    // Manter conexão aberta por 5 segundos
    setTimeout(() => {
      console.log('🔌 Fechando conexão...\n');
      socket.end();
    }, 5000);

  }, 1000);

  socket.on('data', (data) => {
    console.log(`📥 Dados recebidos do DVR: ${data.toString('utf8')}`);
  });

  socket.on('error', (error) => {
    console.error(`❌ Erro na conexão: ${error.message}`);
  });

  socket.on('close', () => {
    console.log('🔌 DVR desconectou\n');
    console.log('═'.repeat(70));
    console.log('✅ TESTE CONCLUÍDO!');
    console.log('═'.repeat(70));
    console.log('\n💡 O DVR pode reconectar a qualquer momento.');
    console.log('   Servidor continua escutando...\n');
  });
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ ERRO: Porta ${SERVER_CONFIG.port} já está em uso!`);
    console.error('   Feche o processo que está usando essa porta e tente novamente.\n');
  } else {
    console.error(`\n❌ Erro no servidor: ${error.message}\n`);
  }
  process.exit(1);
});

server.on('listening', () => {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║       SERVIDOR POS INICIADO - AGUARDANDO DVR CONECTAR           ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');
  console.log(`📡 Escutando em: ${SERVER_CONFIG.host}:${SERVER_CONFIG.port}`);
  console.log(`🎯 Aguardando conexão do DVR (10.6.1.123)...\n`);
  console.log('💡 INSTRUÇÕES:\n');
  console.log('   1. O DVR está em modo TCP_CLIENT');
  console.log('   2. Ele vai CONECTAR neste servidor automaticamente');
  console.log('   3. Quando conectar, enviaremos o cupom de teste');
  console.log('   4. O texto deve aparecer no CANAL 6 da tela do DVR\n');
  console.log('═'.repeat(70));
  console.log('⏳ Aguardando DVR conectar...\n');
  console.log('📋 Pressione Ctrl+C para parar o servidor\n');
});

// Iniciar servidor
server.listen(SERVER_CONFIG.port, SERVER_CONFIG.host);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Parando servidor...');
  server.close(() => {
    console.log('✅ Servidor parado\n');
    process.exit(0);
  });
});
