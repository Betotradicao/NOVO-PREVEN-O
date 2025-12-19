/**
 * 🧪 TESTE AVANÇADO - SISTEMA POS
 *
 * Este script envia cupons fiscais completos e realistas para o DVR
 * Demonstra formatação profissional com produtos, valores, etc.
 */

const net = require('net');

const DVR_CONFIG = {
  ip: '10.6.1.123',
  porta: 9999,
  timeout: 5000
};

// Banco de dados de produtos para gerar cupons realistas
const PRODUTOS_DISPONIVEIS = [
  { nome: 'CERVEJA SKOL 350ML', preco: 3.99, unidade: 'UN' },
  { nome: 'REFRIG COCA 2L', preco: 7.99, unidade: 'UN' },
  { nome: 'PÃO FRANCÊS', preco: 8.90, unidade: 'KG' },
  { nome: 'QUEIJO MINAS', preco: 35.90, unidade: 'KG' },
  { nome: 'PRESUNTO FATIADO', preco: 42.00, unidade: 'KG' },
  { nome: 'ÁGUA MINERAL 500ML', preco: 1.99, unidade: 'UN' },
  { nome: 'CAFÉ PILÃO 500G', preco: 18.90, unidade: 'UN' },
  { nome: 'ARROZ TUDO BOM 5KG', preco: 24.90, unidade: 'UN' },
  { nome: 'FEIJÃO PRETO 1KG', preco: 8.50, unidade: 'UN' },
  { nome: 'AÇÚCAR CRISTAL 1KG', preco: 4.99, unidade: 'UN' },
  { nome: 'ÓLEO DE SOJA 900ML', preco: 6.99, unidade: 'UN' },
  { nome: 'LEITE INTEGRAL 1L', preco: 5.49, unidade: 'UN' },
  { nome: 'IOGURTE NATURAL', preco: 3.50, unidade: 'UN' },
  { nome: 'MANTEIGA 200G', preco: 12.90, unidade: 'UN' },
  { nome: 'BANANA PRATA', preco: 5.90, unidade: 'KG' }
];

const OPERADORES = ['MARIA.SILVA', 'JOAO.SANTOS', 'ANA.COSTA', 'PEDRO.LIMA'];

/**
 * Gera um cupom fiscal completo e realista
 */
function gerarCupomCompleto() {
  const agora = new Date();

  // Gerar cupom número sequencial
  const numeroCupom = String(Math.floor(Math.random() * 999999)).padStart(6, '0');

  // Selecionar operador aleatório
  const operador = OPERADORES[Math.floor(Math.random() * OPERADORES.length)];

  // Gerar de 3 a 8 produtos aleatórios
  const qtdProdutos = 3 + Math.floor(Math.random() * 6);
  const produtosComprados = [];

  for (let i = 0; i < qtdProdutos; i++) {
    const produto = PRODUTOS_DISPONIVEIS[Math.floor(Math.random() * PRODUTOS_DISPONIVEIS.length)];

    // Quantidade: 1 a 5 para unidades, 0.1 a 2.0 para kg
    let qtd;
    if (produto.unidade === 'KG') {
      qtd = (Math.random() * 1.9 + 0.1).toFixed(3);
    } else {
      qtd = 1 + Math.floor(Math.random() * 5);
    }

    produtosComprados.push({
      nome: produto.nome,
      qtd: parseFloat(qtd),
      preco: produto.preco,
      unidade: produto.unidade
    });
  }

  // Calcular totais
  let subtotal = 0;
  const linhasProdutos = produtosComprados.map((p, index) => {
    const total = p.qtd * p.preco;
    subtotal += total;

    // Formatar linha do produto
    const num = String(index + 1).padStart(2, '0');
    const nome = p.nome.substring(0, 20).padEnd(20);
    const qtd = String(p.qtd).padStart(6);
    const preco = p.preco.toFixed(2).padStart(7);
    const valor = total.toFixed(2).padStart(8);

    return `${num} ${nome} ${qtd} ${preco} ${valor}`;
  });

  // Aplicar desconto aleatório (0%, 5%, 10% ou 15%)
  const descontoPercent = [0, 0.05, 0.10, 0.15][Math.floor(Math.random() * 4)];
  const desconto = subtotal * descontoPercent;
  const total = subtotal - desconto;

  // Simular pagamento com troco
  const valorPago = Math.ceil(total / 10) * 10; // Arredondar para cima (10, 20, 30, etc)
  const troco = valorPago - total;

  // Construir cupom
  const linhas = [
    '═'.repeat(50),
    '           SUPERMERCADO ABC LTDA',
    '         CNPJ: 12.345.678/0001-90',
    '      Rua das Flores, 123 - Centro',
    '         São José dos Campos - SP',
    '═'.repeat(50),
    `Data: ${agora.toLocaleDateString('pt-BR')}    Hora: ${agora.toLocaleTimeString('pt-BR')}`,
    `Operador: ${operador}`,
    `Cupom Fiscal: ${numeroCupom}`,
    '─'.repeat(50),
    '## PRODUTO              QTD   PREÇO    TOTAL',
    '─'.repeat(50),
    ...linhasProdutos,
    '─'.repeat(50),
    `SUBTOTAL:                        R$ ${subtotal.toFixed(2).padStart(8)}`
  ];

  if (desconto > 0) {
    linhas.push(`DESCONTO (${(descontoPercent * 100).toFixed(0)}%):                  R$ ${desconto.toFixed(2).padStart(8)}`);
  }

  linhas.push(
    '═'.repeat(50),
    `TOTAL:                           R$ ${total.toFixed(2).padStart(8)}`,
    '═'.repeat(50),
    'FORMA DE PAGAMENTO: DINHEIRO',
    `RECEBIDO:                        R$ ${valorPago.toFixed(2).padStart(8)}`,
    `TROCO:                           R$ ${troco.toFixed(2).padStart(8)}`,
    '═'.repeat(50),
    '        OBRIGADO PELA PREFERÊNCIA!',
    '      Volte sempre! :)',
    '═'.repeat(50)
  );

  return {
    cupom: linhas.join('|'),
    dados: {
      numero: numeroCupom,
      operador,
      produtos: produtosComprados.length,
      subtotal,
      desconto,
      total,
      valorPago,
      troco
    }
  };
}

/**
 * Envia cupom para o DVR
 */
function enviarCupom(cupomTexto) {
  return new Promise((resolve, reject) => {
    const cliente = new net.Socket();
    cliente.setTimeout(DVR_CONFIG.timeout);

    cliente.connect(DVR_CONFIG.porta, DVR_CONFIG.ip, () => {
      console.log(`   ✅ Conectado ao DVR ${DVR_CONFIG.ip}:${DVR_CONFIG.porta}`);

      cliente.write(cupomTexto, 'utf8', (error) => {
        if (error) {
          reject(error);
        } else {
          console.log('   ✅ Cupom enviado com sucesso!');
          resolve();
        }

        // Fechar conexão após 500ms
        setTimeout(() => {
          cliente.end();
        }, 500);
      });
    });

    cliente.on('error', (error) => {
      reject(error);
    });

    cliente.on('timeout', () => {
      cliente.destroy();
      reject(new Error('Timeout na conexão'));
    });
  });
}

/**
 * Exibe cupom no console
 */
function exibirCupom(cupomTexto) {
  console.log('\n' + '═'.repeat(70));
  console.log(cupomTexto.replace(/\|/g, '\n'));
  console.log('═'.repeat(70) + '\n');
}

/**
 * Menu interativo
 */
async function menu() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║          TESTE AVANÇADO - SISTEMA POS DVR INTELBRAS              ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  console.log(`📡 DVR: ${DVR_CONFIG.ip}:${DVR_CONFIG.porta}\n`);

  console.log('Opções:\n');
  console.log('  1. Enviar 1 cupom');
  console.log('  2. Enviar 5 cupons (simulação de movimento)');
  console.log('  3. Enviar cupons continuamente (Ctrl+C para parar)');
  console.log('  4. Apenas gerar e exibir cupom (não enviar)');
  console.log('  5. Sair\n');

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('Escolha uma opção: ', async (opcao) => {
    readline.close();

    switch(opcao.trim()) {
      case '1':
        await enviarUmCupom();
        break;
      case '2':
        await enviarVariosCupons(5);
        break;
      case '3':
        await enviarContinuamente();
        break;
      case '4':
        await apenasExibir();
        break;
      case '5':
        console.log('\n👋 Até logo!\n');
        process.exit(0);
        break;
      default:
        console.log('\n❌ Opção inválida!\n');
        await menu();
    }
  });
}

/**
 * Enviar um cupom
 */
async function enviarUmCupom() {
  console.log('\n📤 Gerando e enviando cupom...\n');

  const { cupom, dados } = gerarCupomCompleto();

  exibirCupom(cupom);

  try {
    await enviarCupom(cupom);

    console.log('\n📊 Resumo da Transação:');
    console.log(`   Cupom: ${dados.numero}`);
    console.log(`   Operador: ${dados.operador}`);
    console.log(`   Produtos: ${dados.produtos} itens`);
    console.log(`   Total: R$ ${dados.total.toFixed(2)}`);

    console.log('\n👀 Verifique a tela do DVR agora!');
    console.log('   O cupom deve estar sobreposto no vídeo.\n');

  } catch (error) {
    console.error(`\n❌ ERRO: ${error.message}\n`);

    if (error.code === 'ECONNREFUSED') {
      console.log('💡 DICA: Verifique se:');
      console.log('   1. O DVR está ligado e acessível');
      console.log('   2. A porta 9999 está configurada no POS');
      console.log('   3. O POS está habilitado no DVR');
      console.log('   4. O firewall não está bloqueando\n');
    }
  }

  setTimeout(() => menu(), 1000);
}

/**
 * Enviar vários cupons
 */
async function enviarVariosCupons(quantidade) {
  console.log(`\n📤 Enviando ${quantidade} cupons (intervalo de 3 segundos)...\n`);

  for (let i = 0; i < quantidade; i++) {
    console.log(`\n[${i + 1}/${quantidade}] Enviando cupom...`);

    const { cupom, dados } = gerarCupomCompleto();

    console.log(`   Cupom: ${dados.numero} | Total: R$ ${dados.total.toFixed(2)}`);

    try {
      await enviarCupom(cupom);
    } catch (error) {
      console.error(`   ❌ Erro: ${error.message}`);
    }

    if (i < quantidade - 1) {
      console.log('   ⏳ Aguardando 3 segundos...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log('\n✅ Todos os cupons foram enviados!\n');
  setTimeout(() => menu(), 1000);
}

/**
 * Enviar cupons continuamente
 */
async function enviarContinuamente() {
  console.log('\n📤 Modo contínuo ativado (intervalo de 5 segundos)');
  console.log('   Pressione Ctrl+C para parar\n');

  let contador = 0;

  const intervalo = setInterval(async () => {
    contador++;
    console.log(`\n[${contador}] Enviando cupom...`);

    const { cupom, dados } = gerarCupomCompleto();

    console.log(`   Cupom: ${dados.numero} | Total: R$ ${dados.total.toFixed(2)}`);

    try {
      await enviarCupom(cupom);
    } catch (error) {
      console.error(`   ❌ Erro: ${error.message}`);
    }
  }, 5000);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Parando envio contínuo...');
    clearInterval(intervalo);
    console.log(`✅ Total de cupons enviados: ${contador}\n`);
    setTimeout(() => menu(), 500);
  });
}

/**
 * Apenas exibir cupom
 */
async function apenasExibir() {
  console.log('\n📝 Gerando cupom (apenas visualização)...\n');

  const { cupom, dados } = gerarCupomCompleto();

  exibirCupom(cupom);

  console.log('📊 Resumo da Transação:');
  console.log(`   Cupom: ${dados.numero}`);
  console.log(`   Operador: ${dados.operador}`);
  console.log(`   Produtos: ${dados.produtos} itens`);
  console.log(`   Subtotal: R$ ${dados.subtotal.toFixed(2)}`);
  if (dados.desconto > 0) {
    console.log(`   Desconto: R$ ${dados.desconto.toFixed(2)}`);
  }
  console.log(`   Total: R$ ${dados.total.toFixed(2)}`);
  console.log(`   Troco: R$ ${dados.troco.toFixed(2)}\n`);

  setTimeout(() => menu(), 1000);
}

// Iniciar menu
menu();
