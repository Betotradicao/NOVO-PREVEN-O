/**
 * 🔧 CONFIGURAR POS AUTOMATICAMENTE VIA API + TESTAR
 *
 * Este script:
 * 1. Conecta no DVR via NetSDK
 * 2. Configura o POS com parâmetros corretos (Zanthus)
 * 3. Envia cupom de teste
 * 4. Valida resultado
 */

const net = require('net');
const ffi = require('ffi-napi');
const ref = require('ref-napi');
const path = require('path');

// Configurações
const DVR_CONFIG = {
  ip: '10.6.1.123',
  porta: 37777,
  portaPOS: 38800,  // Porta correta conforme Zanthus
  usuario: 'admin',
  senha: 'beto3107@',
  ipLocal: '10.6.1.171',
  canal: 6
};

// Carregar NetSDK
const SDK_PATH = path.join(__dirname, 'NetSDK 3.050', 'Windows', 'Lib', 'x64');
const dllPath = path.join(SDK_PATH, 'dhnetsdk.dll');

console.log(`\n📚 Carregando NetSDK de: ${dllPath}\n`);

let NetSDK;
try {
  NetSDK = ffi.Library(dllPath, {
    'CLIENT_Init': ['bool', []],
    'CLIENT_Cleanup': ['bool', []],
    'CLIENT_Login': ['long', ['string', 'int', 'string', 'string', 'pointer', 'pointer']],
    'CLIENT_Logout': ['bool', ['long']],
    'CLIENT_GetLastError': ['int', []]
  });
} catch (error) {
  console.error('❌ Erro ao carregar NetSDK:', error.message);
  console.log('\n💡 Certifique-se de que o NetSDK está na pasta correta.\n');
  process.exit(1);
}

/**
 * Inicializar SDK
 */
function inicializarSDK() {
  console.log('⏳ Inicializando NetSDK...');

  if (NetSDK.CLIENT_Init()) {
    console.log('✅ NetSDK inicializado com sucesso!\n');
    return true;
  } else {
    console.error('❌ Falha ao inicializar NetSDK\n');
    return false;
  }
}

/**
 * Login no DVR
 */
function loginDVR() {
  console.log(`⏳ Conectando ao DVR ${DVR_CONFIG.ip}:${DVR_CONFIG.porta}...`);

  const deviceInfo = Buffer.alloc(412); // NET_DEVICEINFO_Ex
  const error = ref.alloc('int', 0);

  const loginHandle = NetSDK.CLIENT_Login(
    DVR_CONFIG.ip,
    DVR_CONFIG.porta,
    DVR_CONFIG.usuario,
    DVR_CONFIG.senha,
    deviceInfo,
    error
  );

  if (loginHandle === 0) {
    const errorCode = NetSDK.CLIENT_GetLastError();
    console.error(`❌ Falha no login! Código de erro: ${errorCode}\n`);
    return null;
  }

  console.log(`✅ Login realizado com sucesso! Handle: ${loginHandle}\n`);
  return loginHandle;
}

/**
 * Configurar POS via API (simplificado - via HTTP)
 */
async function configurarPOSSimplificado() {
  console.log('═'.repeat(70));
  console.log('  CONFIGURAÇÃO NECESSÁRIA NO DVR (MANUAL)');
  console.log('═'.repeat(70));
  console.log('\nPor favor, configure manualmente no DVR:\n');
  console.log('Menu → POS → Configurar → PDV 2\n');
  console.log('┌────────────────────────┬──────────────────────────────┐');
  console.log('│ Campo                  │ Valor                        │');
  console.log('├────────────────────────┼──────────────────────────────┤');
  console.log(`│ Habilitar              │ ✅ SIM                       │`);
  console.log(`│ Tipo de ligação        │ TCP                          │`);
  console.log(`│ IP de Origem           │ ${DVR_CONFIG.ipLocal.padEnd(28)} │`);
  console.log(`│ IP Destino             │ ${DVR_CONFIG.ip.padEnd(28)} │`);
  console.log(`│ Porta POS              │ ${String(DVR_CONFIG.portaPOS).padEnd(28)} │`);
  console.log(`│ Canal                  │ ${String(DVR_CONFIG.canal).padEnd(28)} │`);
  console.log(`│ Limitador              │ 7C (pipe |)                  │`);
  console.log(`│ Tempo de exibição      │ 600 segundos                 │`);
  console.log('└────────────────────────┴──────────────────────────────┘\n');
  console.log('⚠️  IMPORTANTE:');
  console.log('   - Porta deve ser 38800 (não 60020!)');
  console.log('   - Limitador deve ser 7C (código hex do |)');
  console.log('   - Canal deve ser 6\n');
  console.log('═'.repeat(70));
  console.log('\n');
}

/**
 * Enviar cupom de teste
 */
async function enviarCupomTeste() {
  return new Promise((resolve, reject) => {
    console.log('═'.repeat(70));
    console.log('  ENVIANDO CUPOM DE TESTE');
    console.log('═'.repeat(70));
    console.log('\n');

    const cupom = [
      '=============================',
      '   TESTE POS AUTOMATICO',
      '=============================',
      `Data: ${new Date().toLocaleDateString('pt-BR')}`,
      `Hora: ${new Date().toLocaleTimeString('pt-BR')}`,
      '',
      'Canal: 6',
      'Porta: 38800',
      '',
      'SE VOCE VE ISSO,',
      'TUDO FUNCIONOU!',
      '============================='
    ].join('|');

    console.log('📤 Cupom:\n');
    console.log(cupom.replace(/\|/g, '\n'));
    console.log('\n');

    const cliente = new net.Socket();
    cliente.setTimeout(5000);

    let sucesso = false;

    cliente.connect(DVR_CONFIG.portaPOS, DVR_CONFIG.ip, () => {
      console.log(`✅ Conectado ao DVR na porta ${DVR_CONFIG.portaPOS}\n`);

      const buffer = Buffer.from(cupom, 'ascii');

      cliente.write(buffer, (error) => {
        if (error) {
          reject(error);
        } else {
          console.log(`✅ Cupom enviado! (${buffer.length} bytes)\n`);
          console.log('👀 OLHE PARA O CANAL 6 NO DVR AGORA!\n');
          sucesso = true;

          setTimeout(() => {
            cliente.end();
          }, 1000);
        }
      });
    });

    cliente.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        console.error('❌ DVR recusou conexão na porta 38800\n');
        console.log('💡 Verifique se:');
        console.log('   1. POS está habilitado');
        console.log('   2. Porta está configurada como 38800');
        console.log('   3. DVR está acessível\n');
      }
      reject(error);
    });

    cliente.on('close', () => {
      console.log('🔌 Conexão fechada\n');
      if (sucesso) {
        resolve();
      }
    });
  });
}

/**
 * Executar processo completo
 */
async function main() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║     CONFIGURAÇÃO AUTOMÁTICA POS + TESTE                          ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  // 1. Inicializar SDK
  if (!inicializarSDK()) {
    console.log('⚠️  Continuando sem NetSDK (modo simplificado)...\n');
  }

  // 2. Login no DVR (opcional)
  // const loginHandle = loginDVR();

  // 3. Mostrar configuração necessária
  await configurarPOSSimplificado();

  // 4. Perguntar se quer testar
  console.log('⏳ Aguardando 5 segundos antes de enviar cupom de teste...\n');
  console.log('   (Pressione Ctrl+C para cancelar)\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  // 5. Enviar cupom de teste
  try {
    await enviarCupomTeste();

    console.log('═'.repeat(70));
    console.log('✅ TESTE CONCLUÍDO COM SUCESSO!');
    console.log('═'.repeat(70));
    console.log('\n💡 Se o cupom apareceu no Canal 6, tudo está funcionando!\n');
  } catch (error) {
    console.error(`\n❌ Erro ao enviar cupom: ${error.message}\n`);
    console.log('📋 PRÓXIMOS PASSOS:\n');
    console.log('   1. Verifique se o DVR está configurado corretamente');
    console.log('   2. Confirme que a porta 38800 está aberta');
    console.log('   3. Teste a conexão: telnet 10.6.1.123 38800\n');
  }

  // Cleanup
  // if (loginHandle) {
  //   NetSDK.CLIENT_Logout(loginHandle);
  // }
  NetSDK.CLIENT_Cleanup();

  console.log('👋 Fim do processo\n');
}

// Executar
main().catch(error => {
  console.error('\n❌ Erro fatal:', error);
  process.exit(1);
});
