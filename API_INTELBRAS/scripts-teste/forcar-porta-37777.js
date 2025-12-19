/**
 * Script para FORÇAR a porta 37777 em todos os PDVs via API
 */

const http = require('http');
const crypto = require('crypto');

const DVR_CONFIG = {
  ip: '10.6.1.123',
  port: 80,
  username: 'admin',
  password: 'beto3107@'
};

const POS_CONFIG = [
  { index: 4, name: 'PDV1' },
  { index: 5, name: 'PDV2' },
  { index: 1, name: 'PDV3' },
  { index: 3, name: 'PDV4' },
  { index: 2, name: 'PDV5' }
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

async function configurarPorta(config) {
  console.log(`\n${'─'.repeat(70)}`);
  console.log(`🔧 Configurando PORTA do ${config.name}...`);
  console.log(`${'─'.repeat(70)}`);

  const idx = config.index;

  // Configurações de rede
  const settings = [
    { key: 'NetAtt.SrcIP', value: '10.6.1.171', desc: 'IP Origem' },
    { key: 'NetAtt.SrcPort', value: '37777', desc: 'Porta Origem 37777' },
    { key: 'NetAtt.DstIP', value: '10.6.1.123', desc: 'IP Destino' },
    { key: 'NetAtt.DstPort', value: '38800', desc: 'Porta Destino' }
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
        console.log(`   ⚠️  ${setting.desc} - Resposta: ${response.body.substring(0, 50)}`);
      }

      await new Promise(r => setTimeout(r, 200));

    } catch (error) {
      console.log(`   ❌ Erro em ${setting.desc}: ${error.message}`);
    }
  }

  console.log(`   🎉 ${config.name} configurado!`);
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║         FORÇAR PORTA 37777 EM TODOS OS PDVs VIA API              ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  console.log(`📡 DVR: ${DVR_CONFIG.ip}`);
  console.log(`🎯 Configurando porta 37777 para ${POS_CONFIG.length} PDVs...\n`);

  try {
    for (const config of POS_CONFIG) {
      await configurarPorta(config);
    }

    console.log('\n\n╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ CONCLUÍDO!                                  ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

    console.log('📊 RESUMO:\n');
    console.log('   Todos os PDVs agora devem estar com:');
    console.log('   IP Origem: 10.6.1.171');
    console.log('   Porta Origem: 37777  ← FORÇADO!');
    console.log('   IP Destino: 10.6.1.123');
    console.log('   Porta Destino: 38800\n');

    console.log('═'.repeat(70));
    console.log('💡 PRÓXIMO PASSO:');
    console.log('═'.repeat(70));
    console.log('\nVerifique na interface se a porta mudou para 37777!');
    console.log('Se sim, podemos testar!\n');
    console.log('═'.repeat(70));
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Erro geral:', error.message);
  }
}

main();
