/**
 * CONFIGURAR PDV2 EM TCP_CLIENT SEM OVERLAY
 * Última tentativa: modo TCP_CLIENT mas SEM overlay para não travar
 */

const http = require('http');
const crypto = require('crypto');

const DVR_CONFIG = {
  ip: '10.6.1.123',
  port: 80,
  username: 'admin',
  password: 'beto3107@'
};

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

async function configurar() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║     CONFIGURAR PDV2: TCP_CLIENT + SEM OVERLAY                    ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  const idx = 5;

  // IMPORTANTE: Protocol precisa ser TCP_CLIENT via interface web
  // Via API só conseguimos configurar alguns campos
  const settings = [
    { key: 'Enable', value: 'true', desc: 'Habilitar PDV2' },
    { key: 'NetAtt.SrcIP', value: '10.6.1.171', desc: 'IP Origem' },
    { key: 'NetAtt.SrcPort', value: '60020', desc: 'Porta 60020' },
    { key: 'NetAtt.DstIP', value: '10.6.1.123', desc: 'IP Destino (DVR)' },
    { key: 'NetAtt.DstPort', value: '38800', desc: 'Porta Destino' },
    { key: 'OverlayEnable', value: 'false', desc: '❌ Overlay DESABILITADO' },
    { key: 'Custom.LineDelimiter', value: '', desc: 'Sem delimitador' }
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
        console.log(`   ⚠️  ${setting.desc} - ${response.body.substring(0, 30)}`);
      }

      await new Promise(r => setTimeout(r, 200));

    } catch (error) {
      console.log(`   ❌ ${setting.desc}: ${error.message}`);
    }
  }

  console.log('\n\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                    ✅ CONFIGURADO!                                ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  console.log('📋 PRÓXIMO PASSO:\n');
  console.log('   1. Vá na interface web do DVR');
  console.log('   2. Menu > POS > PDV2');
  console.log('   3. Mude "Tipo de Conexão" para TCP_CLIENT');
  console.log('   4. Salve');
  console.log('   5. Me avise para testar!\n');

  console.log('═'.repeat(70));
  console.log('\n');
}

async function main() {
  try {
    await configurar();
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
  }
}

main();
