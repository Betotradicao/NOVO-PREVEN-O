/**
 * ARRUMAÇÃO FINAL - Habilita PDV2 e mostra o que precisa arrumar
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

async function habilitarPDV2() {
  console.log('\n🔧 Habilitando PDV2...\n');

  const path = `/cgi-bin/configManager.cgi?action=setConfig&PosConfig[5].Enable=true`;

  let response = await httpRequest(path, 'GET');

  if (response.status === 401 && response.headers['www-authenticate']) {
    const authHeader = createDigestAuth(response.headers['www-authenticate'], path, 'GET');
    if (authHeader) {
      response = await httpRequest(path, 'GET', authHeader);
    }
  }

  if (response.body.includes('OK') || response.body.includes('ok')) {
    console.log('   ✅ PDV2 HABILITADO!\n');
  } else {
    console.log(`   ⚠️  Resposta: ${response.body}\n`);
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                  ARRUMAÇÃO FINAL - DIAGNÓSTICO                    ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  try {
    await habilitarPDV2();

    console.log('═'.repeat(70));
    console.log('📋 O QUE VOCÊ PRECISA ARRUMAR NA INTERFACE:');
    console.log('═'.repeat(70));
    console.log('\n❗ CANAIS ESTÃO TODOS ERRADOS (0-indexed):\n');
    console.log('   PDV1 (índice 4): Canal atual: ? → Mude para: 4 (Canal 5 real)');
    console.log('   PDV2 (índice 5): Canal atual: 5 → Mude para: 5 (Canal 6 real)');
    console.log('   PDV3 (índice 1): Canal atual: 1 → Mude para: 1 (Canal 2 real)');
    console.log('   PDV4 (índice 3): Canal atual: 3 → Mude para: 3 (Canal 4 real)');
    console.log('   PDV5 (índice 2): Canal atual: 2 → Mude para: 2 (Canal 3 real)');
    console.log('\n💡 NOTA: O DVR usa 0-indexed! Canal 0 = Canal 1 real!\n');

    console.log('═'.repeat(70));
    console.log('⚠️  OUTRO PROBLEMA:');
    console.log('═'.repeat(70));
    console.log('\n   PDV3 está como TCP_CLIENT com IP 10.6.1.172');
    console.log('   Isso NÃO VAI FUNCIONAR porque esse IP não existe!\n');
    console.log('   SOLUÇÃO: Mude PDV3 para TCP (normal) com IP 10.6.1.171\n');

    console.log('═'.repeat(70));
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
  }
}

main();
