/**
 * Script de TESTE para conexão com DVR Intelbras
 *
 * Este script NÃO afeta o sistema em produção!
 * Use para testar a conexão e envio de dados ao DVR
 *
 * Como usar:
 * 1. Configure o IP e porta do DVR abaixo
 * 2. Execute: node test-dvr-connection.js
 */

const net = require('net');

// ==========================================
// CONFIGURAÇÕES - EDITE AQUI
// ==========================================
const DVR_CONFIG = {
  ip: '10.6.1.123',        // IP do DVR Intelbras
  port: 38800,              // Porta POS do DVR
  timeout: 5000             // Timeout em milissegundos
};

// ==========================================
// DADOS DE TESTE
// ==========================================
const VENDA_TESTE = {
  numCupomFiscal: 999,
  dtaSaida: '20231218',
  dataHoraVenda: '2023-12-18 14:30:00',
  codCaixa: 1,
  desProduto: 'PRODUTO TESTE',
  qtdTotalProduto: 2,
  valVenda: 15.90,
  valTotalProduto: 31.80,
  descontoAplicado: 5.00
};

// ==========================================
// FUNÇÕES
// ==========================================

/**
 * Formata a venda para o padrão do DVR
 */
function formatarVendaParaDVR(venda) {
  const linhas = [];

  linhas.push(`===== CUPOM FISCAL ${venda.numCupomFiscal} =====`);
  linhas.push(`Data: ${formatarData(venda.dtaSaida)} ${formatarHora(venda.dataHoraVenda)}`);
  linhas.push(`Caixa: ${venda.codCaixa}`);
  linhas.push('');
  linhas.push(`Item: ${venda.desProduto}`);
  linhas.push(`Qtd: ${venda.qtdTotalProduto} x R$ ${venda.valVenda.toFixed(2)}`);

  if (venda.descontoAplicado > 0) {
    linhas.push(`Desconto: R$ ${venda.descontoAplicado.toFixed(2)}`);
  }

  linhas.push(`Total: R$ ${venda.valTotalProduto.toFixed(2)}`);
  linhas.push('================================');

  // Usar "|" como separador conforme protocolo DVR
  return linhas.join('|');
}

function formatarData(dateStr) {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  const ano = dateStr.substring(0, 4);
  const mes = dateStr.substring(4, 6);
  const dia = dateStr.substring(6, 8);
  return `${dia}/${mes}/${ano}`;
}

function formatarHora(dateTimeStr) {
  if (!dateTimeStr) return '';
  if (dateTimeStr.includes(' ')) {
    return dateTimeStr.split(' ')[1].substring(0, 5); // HH:MM
  }
  return '';
}

/**
 * Testa conexão com o DVR
 */
function testarConexaoDVR() {
  return new Promise((resolve, reject) => {
    console.log('\n🔄 Iniciando teste de conexão...');
    console.log(`📡 DVR: ${DVR_CONFIG.ip}:${DVR_CONFIG.port}`);
    console.log('⏱️  Timeout:', DVR_CONFIG.timeout, 'ms\n');

    const client = new net.Socket();
    let conectado = false;

    // Configurar timeout
    client.setTimeout(DVR_CONFIG.timeout);

    // Evento: Conectado
    client.on('connect', () => {
      conectado = true;
      console.log('✅ CONECTADO ao DVR!\n');

      // Formatar dados de teste
      const textoFormatado = formatarVendaParaDVR(VENDA_TESTE);

      console.log('📤 Enviando dados de teste:');
      console.log('─────────────────────────────────────');
      console.log(textoFormatado.replace(/\|/g, '\n'));
      console.log('─────────────────────────────────────\n');

      // Enviar dados
      client.write(textoFormatado, 'utf8', (error) => {
        if (error) {
          console.error('❌ Erro ao enviar dados:', error.message);
          client.destroy();
          reject(error);
        } else {
          console.log('✅ Dados enviados com sucesso!');
          console.log('ℹ️  Verifique na tela do DVR se apareceu o cupom\n');

          // Aguardar um pouco antes de fechar
          setTimeout(() => {
            client.destroy();
            resolve(true);
          }, 1000);
        }
      });
    });

    // Evento: Erro
    client.on('error', (error) => {
      console.error('❌ ERRO de conexão:', error.message);
      console.log('\n💡 Possíveis causas:');
      console.log('   1. IP do DVR incorreto');
      console.log('   2. Porta POS não configurada no DVR');
      console.log('   3. DVR não está acessível na rede');
      console.log('   4. Firewall bloqueando a porta\n');
      reject(error);
    });

    // Evento: Timeout
    client.on('timeout', () => {
      console.error('⏱️  TIMEOUT - DVR não respondeu');
      console.log('\n💡 Verifique:');
      console.log('   1. DVR está ligado?');
      console.log('   2. IP está correto?');
      console.log('   3. Cabo de rede conectado?\n');
      client.destroy();
      reject(new Error('Connection timeout'));
    });

    // Evento: Conexão fechada
    client.on('close', () => {
      if (conectado) {
        console.log('🔌 Conexão fechada\n');
        console.log('═══════════════════════════════════════');
        console.log('✅ TESTE CONCLUÍDO COM SUCESSO!');
        console.log('═══════════════════════════════════════\n');
      }
    });

    // Conectar ao DVR
    console.log('🔌 Conectando ao DVR...\n');
    client.connect(DVR_CONFIG.port, DVR_CONFIG.ip);
  });
}

/**
 * Teste simples de ping (verifica se porta está aberta)
 */
function testarPortaAberta() {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 Testando se a porta está aberta...');

    const client = new net.Socket();
    client.setTimeout(3000);

    client.on('connect', () => {
      console.log('✅ Porta está ABERTA e aceitando conexões\n');
      client.destroy();
      resolve(true);
    });

    client.on('error', (error) => {
      console.log('❌ Porta NÃO está acessível');
      console.log('   Erro:', error.message, '\n');
      reject(error);
    });

    client.on('timeout', () => {
      console.log('⏱️  Timeout - Porta não respondeu\n');
      client.destroy();
      reject(new Error('Timeout'));
    });

    client.connect(DVR_CONFIG.port, DVR_CONFIG.ip);
  });
}

// ==========================================
// EXECUÇÃO PRINCIPAL
// ==========================================

console.log('\n');
console.log('╔═══════════════════════════════════════╗');
console.log('║  TESTE DE CONEXÃO COM DVR INTELBRAS   ║');
console.log('╚═══════════════════════════════════════╝');

async function executarTestes() {
  try {
    // Teste 1: Verificar se porta está aberta
    await testarPortaAberta();

    // Teste 2: Conectar e enviar dados
    await testarConexaoDVR();

    console.log('🎉 Todos os testes passaram!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Teste falhou!\n');
    process.exit(1);
  }
}

executarTestes();
