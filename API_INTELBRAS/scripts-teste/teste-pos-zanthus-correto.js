/**
 * 🎯 TESTE POS - CONFIGURAÇÃO CORRETA CONFORME ZANTHUS
 *
 * Baseado na documentação oficial:
 * - Porta DVR: 38800 (não 60020!)
 * - Delimitador: | (pipe - código ASCII 7C)
 * - Modo: TCP_SERVER (conectamos no DVR)
 * - Cupom: SIMPLES e PEQUENO
 *
 * Referência: zanthus.pdf página 11-14
 */

const net = require('net');

const CONFIG = {
  dvrIp: '10.6.1.123',
  dvrPorta: 38800,        // ← PORTA CORRETA!
  timeout: 5000
};

/**
 * Cupom SIMPLES - só 5 linhas
 * Delimitador: | (pipe)
 */
function gerarCupomSimples() {
  const agora = new Date();

  return [
    '=============================',
    '     TESTE POS CANAL 6',
    '=============================',
    `Data: ${agora.toLocaleDateString('pt-BR')}`,
    `Hora: ${agora.toLocaleTimeString('pt-BR')}`,
    '',
    'Produto: TESTE',
    'Valor: R$ 10,00',
    '',
    'SE VOCE VE ISSO',
    'ENTAO FUNCIONOU!',
    '============================='
  ].join('|');  // ← Delimitador PIPE conforme Zanthus
}

/**
 * Conecta no DVR e envia cupom
 */
function enviarParaDVR() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║     TESTE POS - CONFIGURAÇÃO CORRETA ZANTHUS                     ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  console.log(`📡 DVR: ${CONFIG.dvrIp}:${CONFIG.dvrPorta}`);
  console.log(`📋 Delimitador: | (pipe - código hex 7C)\n`);

  const cupom = gerarCupomSimples();

  console.log('📤 Cupom que será enviado:\n');
  console.log('═'.repeat(70));
  console.log(cupom.replace(/\|/g, '\n'));
  console.log('═'.repeat(70));
  console.log('\n');

  const cliente = new net.Socket();
  cliente.setTimeout(CONFIG.timeout);

  cliente.connect(CONFIG.dvrPorta, CONFIG.dvrIp, () => {
    console.log(`✅ Conectado ao DVR ${CONFIG.dvrIp}:${CONFIG.dvrPorta}\n`);

    // Enviar como buffer ASCII puro (sem UTF-8)
    const buffer = Buffer.from(cupom, 'ascii');

    cliente.write(buffer, (error) => {
      if (error) {
        console.error(`❌ Erro ao enviar: ${error.message}\n`);
      } else {
        console.log('✅ Cupom enviado com sucesso!');
        console.log(`📏 Tamanho: ${buffer.length} bytes\n`);
        console.log('👀 OLHE PARA O CANAL 6 NO DVR AGORA!\n');
        console.log('💡 O cupom deve aparecer sobreposto no vídeo\n');
        console.log('⏱️  Deve ficar visível por ~600 segundos (10 minutos)\n');
      }

      // Aguardar 2 segundos antes de fechar
      setTimeout(() => {
        cliente.end();
      }, 2000);
    });
  });

  cliente.on('data', (data) => {
    console.log(`📥 Resposta do DVR: ${data.toString('ascii')}\n`);
  });

  cliente.on('error', (error) => {
    console.error(`\n❌ ERRO: ${error.message}\n`);

    if (error.code === 'ECONNREFUSED') {
      console.log('💡 POSSÍVEIS CAUSAS:\n');
      console.log('   1. DVR não está configurado para porta 38800');
      console.log('   2. POS não está habilitado no DVR');
      console.log('   3. DVR está em modo TCP_CLIENT (deveria ser TCP_SERVER)');
      console.log('   4. Firewall bloqueando a porta\n');
      console.log('📋 COMO CONFIGURAR O DVR:\n');
      console.log('   Menu → POS → Configurar → PDV 2');
      console.log('   - Habilitar: SIM');
      console.log('   - Tipo: TCP');
      console.log('   - Porta POS: 38800');
      console.log('   - IP Origem: 10.6.1.171');
      console.log('   - IP Destino: 10.6.1.123');
      console.log('   - Canal: 6');
      console.log('   - Limitador: 7C\n');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('💡 DVR não respondeu em tempo hábil\n');
      console.log('   - Verifique se o DVR está acessível');
      console.log('   - Tente: ping 10.6.1.123\n');
    }
  });

  cliente.on('timeout', () => {
    console.log('\n⏱️  Timeout na conexão\n');
    cliente.destroy();
  });

  cliente.on('close', () => {
    console.log('🔌 Conexão encerrada\n');
    console.log('═'.repeat(70));
    console.log('✅ TESTE CONCLUÍDO');
    console.log('═'.repeat(70));
    console.log('\n');
  });
}

// Executar teste
console.log('\n⏳ Iniciando em 2 segundos...\n');
setTimeout(enviarParaDVR, 2000);
