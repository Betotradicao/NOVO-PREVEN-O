/**
 * Script para buscar configuração POS no DVR
 */

const http = require('http');
const crypto = require('crypto');

const DVR_CONFIG = {
  ip: '10.6.1.123',
  port: 80,
  username: 'admin',
  password: 'beto3107@'
};

console.log('='.repeat(60));
console.log('🔍 BUSCA DE CONFIGURAÇÃO POS - DVR INTELBRAS');
console.log('='.repeat(60));

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

async function testEndpoint(path, description) {
  try {
    console.log(`\n📍 ${description}`);
    console.log(`   ${path}`);

    let response = await httpRequest(path);

    if (response.status === 401 && response.headers['www-authenticate']) {
      const authHeader = createDigestAuth(response.headers['www-authenticate'], path);
      if (authHeader) {
        response = await httpRequest(path, authHeader);
      }
    }

    console.log(`   Status: ${response.status}`);

    if (response.status === 200 && response.body.length > 0) {
      console.log(`   ✅ ENCONTRADO! (${response.body.length} bytes)`);
      console.log('\n' + '='.repeat(60));
      console.log(response.body);
      console.log('='.repeat(60));
      return response.body;
    } else if (response.status === 200) {
      console.log(`   ℹ️  Vazio`);
    } else if (response.status === 400) {
      console.log(`   ℹ️  Parâmetro não existe ou não suportado`);
    } else if (response.status === 501) {
      console.log(`   ℹ️  Não implementado`);
    }

  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }
}

async function main() {
  console.log('\n🔎 Procurando configurações POS em vários formatos...\n');

  const configNames = [
    // Variações de POS
    'POS', 'Pos', 'pos',
    'POSDevice', 'PosDevice', 'posDevice',
    'POSInfo', 'PosInfo', 'posInfo',
    'POSConfig', 'PosConfig', 'posConfig',

    // Variações com prefixos
    'All.POS',
    'table.POS',

    // OSD (On-Screen Display) - pode incluir POS
    'VideoWidget', 'VideoWidgetConfig',
    'OSDInfo', 'VideoOSD',

    // Overlay
    'Overlay', 'OverlayInfo',
    'ChannelOverlay',

    // Encoder
    'Encode', 'EncodeInfo',

    // Serial / COM
    'COM', 'RS232', 'RS485',
    'Serial', 'SerialPort',

    // Outros possíveis
    'TextOverlay', 'TextOSD',
    'ExtraStream',
    'ChannelInfo'
  ];

  for (const name of configNames) {
    await testEndpoint(
      `/cgi-bin/configManager.cgi?action=getConfig&name=${name}`,
      name
    );
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('✅ BUSCA CONCLUÍDA');
  console.log('='.repeat(60));
  console.log('\n💡 ANÁLISE:\n');
  console.log('Canal 1: PDV 3');
  console.log('Canal 5: PDV 2');
  console.log('\nO DVR pode não ter POS configurado via software,');
  console.log('ou o texto "PDV 3" pode ser apenas o nome do canal,');
  console.log('não necessariamente um dispositivo POS ativo.\n');
  console.log('Para enviar texto ao vídeo, você pode:');
  console.log('1. Usar a API de VideoWidget/Overlay');
  console.log('2. Configurar POS via interface web primeiro');
  console.log('3. Usar NetSDK com CLIENT_RGBAToVideoOverlay');
  console.log('\n' + '='.repeat(60));
}

main().catch(console.error);
