#!/usr/bin/env node
/**
 * TESTE SIMPLES - DVR INTELBRAS POS
 *
 * Este script testa a conexão TCP com o DVR e envia um cupom de teste.
 *
 * COMO USAR:
 * 1. Edite DVR_IP e DVR_PORT abaixo
 * 2. Execute: node test-dvr-simples.js
 * 3. Verifique se o texto aparece na câmera do DVR
 */

const net = require('net');

// ==========================================
// CONFIGURAÇÕES - EDITE AQUI!
// ==========================================
const DVR_IP = '10.6.1.123';  // IP do seu DVR
const DVR_PORT = 38800;         // Porta POS padrão Intelbras
const TIMEOUT = 10000;          // 10 segundos

// ==========================================
// CUPOM DE TESTE
// ==========================================
const cupomTeste = [
  '===== TESTE DE CONEXAO =====',
  'Sistema: Prevencao no Radar',
  'Data: ' + new Date().toLocaleDateString('pt-BR'),
  'Hora: ' + new Date().toLocaleTimeString('pt-BR'),
  '',
  'Se voce esta vendo isso,',
  'a conexao esta FUNCIONANDO!',
  '================================'
].join('|'); // Usa | como separador

console.log('╔════════════════════════════════════════════╗');
console.log('║   TESTE DVR INTELBRAS POS - VERSÃO SIMPLES ║');
console.log('╚════════════════════════════════════════════╝\n');

console.log(`📡 Conectando ao DVR...`);
console.log(`   IP: ${DVR_IP}`);
console.log(`   Porta: ${DVR_PORT}\n`);

// Criar socket TCP
const client = new net.Socket();
client.setTimeout(TIMEOUT);

// Quando conectar
client.on('connect', () => {
  console.log('✅ CONECTADO com sucesso!\n');
  console.log('📤 Enviando cupom de teste...\n');
  console.log('═══ CUPOM ═══');
  console.log(cupomTeste.replace(/\|/g, '\n'));
  console.log('═════════════\n');

  // Enviar dados
  client.write(cupomTeste, 'utf8', (err) => {
    if (err) {
      console.error('❌ Erro ao enviar:', err.message);
      client.destroy();
      process.exit(1);
    } else {
      console.log('✅ Dados enviados com sucesso!');
      console.log('\n⏰ Aguardando 5 segundos...');
      console.log('👀 OLHE PARA A TELA DO DVR AGORA!\n');

      // Aguardar 5 segundos antes de fechar
      setTimeout(() => {
        console.log('🔌 Fechando conexão...');
        client.destroy();

        console.log('\n╔════════════════════════════════════════════╗');
        console.log('║              TESTE CONCLUÍDO!              ║');
        console.log('╚════════════════════════════════════════════╝\n');
        console.log('📋 PRÓXIMOS PASSOS:');
        console.log('   ✅ Se o texto APARECEU: Tudo certo!');
        console.log('   ❌ Se NÃO apareceu:');
        console.log('      1. Verifique configurações POS no DVR');
        console.log('      2. Confirme que limitador é 7C (pipe)');
        console.log('      3. Confirme que câmera está selecionada');
        console.log('      4. Tente: node test-dvr-diagnostico.js\n');

        process.exit(0);
      }, 5000);
    }
  });
});

// Timeout
client.on('timeout', () => {
  console.error('\n❌ TIMEOUT: DVR não respondeu em 10 segundos');
  console.error('\n🔧 POSSÍVEIS CAUSAS:');
  console.error('   • IP incorreto');
  console.error('   • DVR desligado');
  console.error('   • Firewall bloqueando');
  console.error('\n💡 SOLUÇÃO:');
  console.error('   1. Teste ping: ping ' + DVR_IP);
  console.error('   2. Verifique se DVR está ligado');
  console.error('   3. Confirme o IP está correto\n');
  client.destroy();
  process.exit(1);
});

// Erros
client.on('error', (err) => {
  console.error('\n❌ ERRO DE CONEXÃO:', err.code || err.message);

  if (err.code === 'ECONNREFUSED') {
    console.error('\n🔧 CONEXÃO RECUSADA!');
    console.error('   • Porta 38800 está fechada');
    console.error('   • POS não está habilitado no DVR');
    console.error('\n💡 SOLUÇÃO:');
    console.error('   1. Acesse interface web do DVR');
    console.error('   2. Menu → POS → Habilitar');
    console.error('   3. Configurar porta: 38800');
  } else if (err.code === 'ETIMEDOUT') {
    console.error('\n🔧 TIMEOUT!');
    console.error('   • DVR não acessível');
    console.error('\n💡 SOLUÇÃO:');
    console.error('   1. Verifique cabo de rede');
    console.error('   2. Teste: ping ' + DVR_IP);
  } else if (err.code === 'ENETUNREACH' || err.code === 'EHOSTUNREACH') {
    console.error('\n🔧 REDE INALCANÇÁVEL!');
    console.error('   • IP não está na mesma rede');
    console.error('\n💡 SOLUÇÃO:');
    console.error('   1. Confirme IP do DVR');
    console.error('   2. Verifique se está na mesma rede');
  }

  console.error('');
  process.exit(1);
});

// Fechar
client.on('close', () => {
  // Já tratado no callback do write
});

// Conectar
client.connect(DVR_PORT, DVR_IP);
