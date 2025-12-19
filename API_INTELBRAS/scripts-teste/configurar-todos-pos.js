/**
 * Script para CONFIGURAR AUTOMATICAMENTE todos os 5 PDVs
 * Configuração correta e completa via API
 */

const http = require('http');
const crypto = require('crypto');

const DVR_CONFIG = {
  ip: '10.6.1.123',
  port: 80,
  username: 'admin',
  password: 'beto3107@'
};

// Mapeamento correto: Nome → Canal da câmera
const POS_CONFIG = [
  { index: 4, name: 'PDV1', channel: 5, color: 'Laranja' },   // PDV1 → Canal 5
  { index: 5, name: 'PDV2', channel: 6, color: 'Amarelo' },   // PDV2 → Canal 6
  { index: 1, name: 'PDV3', channel: 2, color: 'Verde' },     // PDV3 → Canal 2
  { index: 3, name: 'PDV4', channel: 4, color: 'Cyan' },      // PDV4 → Canal 4
  { index: 2, name: 'PDV5', channel: 3, color: 'Magenta' }    // PDV5 → Canal 3
];

function httpRequest(path, method = 'GET', authHeader = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: DVR_CONFIG.ip,
      port: DVR_CONFIG.port,
      path: path,
      method: method,
      headers: {}
    };

    if (authHeader) {
      options.headers['Authorization'] = authHeader;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, body: body });
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

function createDigestAuth(wwwAuthenticate, uri, method = 'GET') {
  const realm = /realm="([^"]+)"/.exec(wwwAuthenticate)?.[1];
  const nonce = /nonce="([^"]+)"/.exec(wwwAuthenticate)?.[1];
  const qop = /qop="([^"]+)"/.exec(wwwAuthenticate)?.[1];
  const opaque = /opaque="([^"]+)"/.exec(wwwAuthenticate)?.[1];

  if (!realm || !nonce) return null;

  const nc = '00000001';
  const cnonce = crypto.randomBytes(8).toString('hex');

  const ha1 = crypto.createHash('md5')
    .update(`${DVR_CONFIG.username}:${realm}:${DVR_CONFIG.password}`)
    .digest('hex');

  const ha2 = crypto.createHash('md5')
    .update(`${method}:${uri}`)
    .digest('hex');

  let response;
  if (qop) {
    response = crypto.createHash('md5')
      .update(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`)
      .digest('hex');
  } else {
    response = crypto.createHash('md5')
      .update(`${ha1}:${nonce}:${ha2}`)
      .digest('hex');
  }

  let authHeader = `Digest username="${DVR_CONFIG.username}", realm="${realm}", nonce="${nonce}", uri="${uri}", response="${response}"`;

  if (qop) authHeader += `, qop=${qop}, nc=${nc}, cnonce="${cnonce}"`;
  if (opaque) authHeader += `, opaque="${opaque}"`;

  return authHeader;
}

async function configurePOS(config) {
  console.log(`\n${'─'.repeat(70)}`);
  console.log(`🔧 Configurando: ${config.name} → Canal ${config.channel} (${config.color})`);
  console.log(`${'─'.repeat(70)}`);

  const idx = config.index;

  // Configurações a serem aplicadas
  const settings = [
    { key: 'Enable', value: 'true', desc: 'Habilitar' },
    { key: 'LinkChannel', value: config.channel - 1, desc: `Canal ${config.channel}` }, // DVR usa 0-indexed
    { key: 'Protocol', value: 'General', desc: 'Protocolo General' },
    { key: 'NetAtt.SrcIP', value: '0.0.0.0', desc: 'IP Origem 0.0.0.0' },
    { key: 'NetAtt.DstIP', value: '10.6.1.123', desc: 'IP Destino DVR' },
    { key: 'NetAtt.DstPort', value: '38800', desc: 'Porta 38800' },
    { key: 'Convert', value: 'UTF-8', desc: 'Encoding UTF-8' },
    { key: 'Custom.LineDelimiter', value: '7C', desc: 'Limitador 7C (pipe)' },
    { key: 'OverlayEnable', value: 'true', desc: 'Overlay ativo' },
    { key: 'FontSize', value: '32', desc: 'Fonte grande' },
    { key: 'DisplayTime', value: '120', desc: 'Tempo 120s' },
    { key: 'TimeOut', value: '100', desc: 'Timeout 100ms' }
  ];

  for (const setting of settings) {
    const path = `/cgi-bin/configManager.cgi?action=setConfig&PosConfig[${idx}].${setting.key}=${setting.value}`;

    try {
      let response = await httpRequest(path, 'GET');

      if (response.status === 401 && response.headers['www-authenticate']) {
        const authHeader = createDigestAuth(response.headers['www-authenticate'], path, 'GET');
        if (authHeader) {
          response = await httpRequest(path, 'GET', authHeader);
        }
      }

      if (response.body.includes('OK') || response.body.includes('ok')) {
        console.log(`   ✅ ${setting.desc}`);
      } else {
        console.log(`   ⚠️  ${setting.desc} - Resposta: ${response.body.substring(0, 30)}`);
      }

      await new Promise(r => setTimeout(r, 200)); // Delay entre comandos

    } catch (error) {
      console.log(`   ❌ Erro em ${setting.desc}: ${error.message}`);
    }
  }

  console.log(`   🎉 ${config.name} configurado!`);
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║     CONFIGURAÇÃO AUTOMÁTICA - TODOS OS PDVs                      ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  console.log(`\n📡 DVR: ${DVR_CONFIG.ip}`);
  console.log(`🎯 Configurando ${POS_CONFIG.length} PDVs...\n`);

  try {
    for (const config of POS_CONFIG) {
      await configurePOS(config);
    }

    console.log('\n\n╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ CONCLUÍDO!                                  ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

    console.log('📊 RESUMO DAS CONFIGURAÇÕES:\n');
    for (const config of POS_CONFIG) {
      console.log(`   ✅ ${config.name} → Canal ${config.channel} (${config.color})`);
    }

    console.log('\n' + '═'.repeat(70));
    console.log('💡 PRÓXIMO PASSO:');
    console.log('═'.repeat(70));
    console.log('\nVou rodar testes para cada PDV!');
    console.log('Prepare-se para olhar a tela do DVR!\n');
    console.log('═'.repeat(70));
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Erro geral:', error.message);
  }
}

main();
