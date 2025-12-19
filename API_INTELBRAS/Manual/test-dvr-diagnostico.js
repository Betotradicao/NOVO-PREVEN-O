const net = require('net');

console.log('═══════════════════════════════════════════════════════');
console.log('     DIAGNÓSTICO COMPLETO - DVR INTELBRAS POS');
console.log('═══════════════════════════════════════════════════════\n');

// ============================================
// CONFIGURAÇÕES - EDITE AQUI!
// ============================================
const DVR_IP = '192.168.1.100';  // ⚠️ TROCAR pelo IP do seu DVR
const DVR_PORT = 38800;
const TIMEOUT = 10000; // 10 segundos

// ============================================
// TESTES DE FORMATO
// ============================================
const TESTES = [
  {
    nome: 'Teste 1: Formato Básico com Pipe',
    dados: 'TESTE 1|Linha 1|Linha 2|Linha 3',
    descricao: 'Usa pipe (|) como separador de linha'
  },
  {
    nome: 'Teste 2: Formato com quebra \\n',
    dados: 'TESTE 2\nLinha 1\nLinha 2\nLinha 3',
    descricao: 'Usa \\n (newline) como separador'
  },
  {
    nome: 'Teste 3: Formato com \\r\\n (Windows)',
    dados: 'TESTE 3\r\nLinha 1\r\nLinha 2\r\nLinha 3',
    descricao: 'Usa \\r\\n (CRLF) como separador'
  },
  {
    nome: 'Teste 4: Formato Cupom Completo',
    dados: '===== CUPOM FISCAL 12345 =====|Data: 19/12/2025 10:30|Caixa: 01|Item: REFRIGERANTE 2L|Qtd: 2 x R$ 10.50|Total: R$ 21.00|================================',
    descricao: 'Simula um cupom fiscal real'
  },
  {
    nome: 'Teste 5: Texto Simples (sem separador)',
    dados: 'TESTE SIMPLES SEM SEPARADOR',
    descricao: 'Uma única linha sem quebras'
  },
  {
    nome: 'Teste 6: Com Acentuação',
    dados: 'TESTE 6|Açúcar Refinado|Preço: R$ 5,90|Quantidade: 3',
    descricao: 'Testa suporte a UTF-8/acentuação'
  }
];

// ============================================
// FUNÇÃO DE TESTE
// ============================================
function testarConexao(teste, callback) {
  console.log(`\n🧪 ${teste.nome}`);
  console.log(`   📝 ${teste.descricao}`);
  console.log(`   📡 IP: ${DVR_IP}:${DVR_PORT}`);
  console.log(`   📤 Enviando: "${teste.dados.substring(0, 50)}${teste.dados.length > 50 ? '...' : ''}"`);

  const client = new net.Socket();
  client.setTimeout(TIMEOUT);

  let conectado = false;
  let enviado = false;

  client.connect(DVR_PORT, DVR_IP, () => {
    conectado = true;
    console.log('   ✅ Conectado com sucesso!');

    // Tentar enviar os dados
    client.write(teste.dados, 'utf8', (err) => {
      if (err) {
        console.error(`   ❌ Erro ao enviar: ${err.message}`);
        client.destroy();
        callback(false);
      } else {
        enviado = true;
        console.log('   ✅ Dados enviados com sucesso!');
        console.log('   ⏳ Aguarde 3 segundos e verifique a tela do DVR...');

        // Aguardar 3 segundos antes de fechar
        setTimeout(() => {
          client.destroy();
          callback(true);
        }, 3000);
      }
    });
  });

  client.on('timeout', () => {
    console.error('   ❌ TIMEOUT: DVR não respondeu em 10 segundos');
    console.error('      ↳ Verifique se o IP está correto');
    console.error('      ↳ Verifique se o DVR está ligado');
    client.destroy();
    callback(false);
  });

  client.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') {
      console.error('   ❌ CONEXÃO RECUSADA');
      console.error('      ↳ A porta 38800 está fechada ou DVR não está escutando');
      console.error('      ↳ Verifique configurações de POS no DVR');
    } else if (err.code === 'ETIMEDOUT') {
      console.error('   ❌ TIMEOUT DE CONEXÃO');
      console.error('      ↳ DVR não acessível na rede');
    } else if (err.code === 'ENETUNREACH' || err.code === 'EHOSTUNREACH') {
      console.error('   ❌ REDE INALCANÇÁVEL');
      console.error('      ↳ Verifique se o IP está na mesma rede');
      console.error('      ↳ Teste: ping ' + DVR_IP);
    } else {
      console.error(`   ❌ ERRO: ${err.message} (Código: ${err.code})`);
    }
    callback(false);
  });

  client.on('close', () => {
    if (conectado && enviado) {
      console.log('   🔌 Conexão fechada normalmente');
    }
  });
}

// ============================================
// EXECUTAR TESTES
// ============================================
let testeAtual = 0;

function executarProximoTeste() {
  if (testeAtual >= TESTES.length) {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('     TODOS OS TESTES CONCLUÍDOS!');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📋 PRÓXIMOS PASSOS:');
    console.log('   1. Se NENHUM teste funcionou:');
    console.log('      → Verifique as configurações do DVR');
    console.log('      → Confirme que POS está habilitado');
    console.log('      → Confirme porta 38800 aberta');
    console.log('');
    console.log('   2. Se ALGUM teste apareceu na tela:');
    console.log('      → Anote qual formato funcionou');
    console.log('      → Use esse formato no código final');
    console.log('');
    console.log('   3. Se apareceu mas com problemas:');
    console.log('      → Texto cortado: Reduza tamanho das linhas');
    console.log('      → Sem acentos: Configure encoding no DVR');
    console.log('      → Muito rápido: Aumente tempo de exibição\n');
    return;
  }

  const teste = TESTES[testeAtual];
  testeAtual++;

  testarConexao(teste, (sucesso) => {
    // Aguardar 2 segundos antes do próximo teste
    setTimeout(executarProximoTeste, 2000);
  });
}

// ============================================
// INÍCIO
// ============================================
console.log('⚙️  Configurações:');
console.log(`   DVR IP: ${DVR_IP}`);
console.log(`   Porta: ${DVR_PORT}`);
console.log(`   Timeout: ${TIMEOUT}ms`);
console.log(`   Total de testes: ${TESTES.length}`);
console.log('\n⚠️  IMPORTANTE: Deixe a tela do DVR visível para verificar se o texto aparece!\n');

console.log('Iniciando testes em 3 segundos...\n');
setTimeout(executarProximoTeste, 3000);
