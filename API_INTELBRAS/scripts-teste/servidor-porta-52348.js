/**
 * SERVIDOR POS NA PORTA 52348
 * Porta que o DVR configurou automaticamente
 */

const net = require('net');

const SERVER_CONFIG = {
  host: '0.0.0.0',
  port: 52348
};

const cupomSimples = 'TESTE SEM OVERLAY';

const server = net.createServer((socket) => {
  console.log('\n✅ DVR CONECTOU!\n');
  console.log(`📡 De: ${socket.remoteAddress}:${socket.remotePort}\n`);

  setTimeout(() => {
    console.log('📤 Enviando: "' + cupomSimples + '"\n');

    socket.write(cupomSimples, 'utf8', (error) => {
      if (error) {
        console.error('❌ Erro:', error.message);
      } else {
        console.log('✅ Enviado!\n');
        console.log('❓ O DVR TRAVOU?\n');
      }
    });

    setTimeout(() => socket.end(), 2000);
  }, 1000);

  socket.on('error', (error) => console.error('❌ Erro:', error.message));
  socket.on('close', () => console.log('🔌 DVR desconectou\n'));
});

server.listen(SERVER_CONFIG.port, SERVER_CONFIG.host, () => {
  console.log('\n📡 Servidor na porta ' + SERVER_CONFIG.port);
  console.log('⏳ Aguardando DVR...\n');
});
