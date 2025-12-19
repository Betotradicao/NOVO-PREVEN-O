/**
 * Script para mostrar informações dos canais do DVR
 */

const http = require('http');
const crypto = require('crypto');

const DVR_CONFIG = {
  ip: '10.6.1.123',
  port: 80,
  username: 'admin',
  password: 'beto3107@'
};

function httpRequest(path, authHeader = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: DVR_CONFIG.ip,
      port: DVR_CONFIG.port,
      path: path,
      method: 'GET',
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
    req.setTimeout(5000, () => { req.destroy(); reject(new Error('Timeout')); });
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

async function getChannelInfo() {
  const path = '/cgi-bin/configManager.cgi?action=getConfig&name=ChannelTitle';

  let response = await httpRequest(path);

  if (response.status === 401 && response.headers['www-authenticate']) {
    const authHeader = createDigestAuth(response.headers['www-authenticate'], path);
    if (authHeader) {
      response = await httpRequest(path, authHeader);
    }
  }

  if (response.status !== 200) {
    throw new Error(`Falha ao obter canais: ${response.status}`);
  }

  return response.body;
}

function parseChannels(configText) {
  const lines = configText.split('\n');
  const channels = {};

  for (const line of lines) {
    const match = line.match(/table\.ChannelTitle\[(\d+)\]\.Name=(.+)/);
    if (match) {
      const channelNum = parseInt(match[1]);
      const channelName = match[2].trim();
      channels[channelNum] = channelName;
    }
  }

  return channels;
}

async function main() {
  console.log('═'.repeat(70));
  console.log('📺 CANAIS DO DVR INTELBRAS');
  console.log('═'.repeat(70));
  console.log(`\n📡 DVR: ${DVR_CONFIG.ip}\n`);

  try {
    console.log('⏳ Buscando informações dos canais...\n');

    const configText = await getChannelInfo();
    const channels = parseChannels(configText);

    console.log('✅ Canais encontrados:\n');

    for (let i = 0; i < 16; i++) {
      const name = channels[i] || '(Sem nome)';
      const status = channels[i] ? '📹' : '⚫';
      console.log(`   ${status} Canal ${String(i + 1).padStart(2, '0')}: ${name}`);
    }

    console.log('\n' + '═'.repeat(70));
    console.log('💡 LEGENDA:');
    console.log('═'.repeat(70));
    console.log('\n📹 = Canal com câmera configurada');
    console.log('⚫ = Canal sem câmera ou desabilitado\n');
    console.log('═'.repeat(70));
    console.log('\n💡 DICA:');
    console.log('   Para vincular um POS/PDV a um canal, você precisa saber');
    console.log('   qual câmera está filmando qual caixa/PDV.\n');
    console.log('   Exemplo:');
    console.log('   - Se o Canal 2 filma o Caixa 2');
    console.log('   - Configure o PDV2 para usar Canal 2');
    console.log('   - Assim o cupom aparece no vídeo correto!\n');
    console.log('═'.repeat(70));
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
  }
}

main();
