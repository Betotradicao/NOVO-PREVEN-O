/**
 * Script para encontrar qual POS está no canal de vídeo 2
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

function createDigestAuth(wwwAuthenticate, uri) {
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
    .update(`GET:${uri}`)
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

async function getPosConfig() {
  const path = '/cgi-bin/configManager.cgi?action=getConfig&name=PosConfig';
  let response = await httpRequest(path);

  if (response.status === 401 && response.headers['www-authenticate']) {
    const authHeader = createDigestAuth(response.headers['www-authenticate'], path);
    if (authHeader) {
      response = await httpRequest(path, authHeader);
    }
  }

  if (response.status !== 200) {
    throw new Error(`Falha: ${response.status}`);
  }

  return response.body;
}

async function getChannelTitles() {
  const path = '/cgi-bin/configManager.cgi?action=getConfig&name=ChannelTitle';
  let response = await httpRequest(path);

  if (response.status === 401 && response.headers['www-authenticate']) {
    const authHeader = createDigestAuth(response.headers['www-authenticate'], path);
    if (authHeader) {
      response = await httpRequest(path, authHeader);
    }
  }

  return response.body;
}

function parseConfig(text) {
  const lines = text.split('\n');
  const configs = {};

  for (const line of lines) {
    const match = line.match(/table\.PosConfig\[(\d+)\]\.(.+?)=(.+)/);
    if (match) {
      const idx = match[1];
      const key = match[2];
      const value = match[3];

      if (!configs[idx]) configs[idx] = {};

      if (key === 'Name') configs[idx].name = value;
      else if (key === 'Enable') configs[idx].enable = value;
      else if (key === 'LinkChannel[0]') configs[idx].linkChannel = value;
      else if (key === 'CommChannel') configs[idx].commChannel = value;
      else if (key === 'NetAtt.DstPort') configs[idx].port = value;
      else if (key === 'NetAtt.SrcIP') configs[idx].srcIP = value;
      else if (key === 'Custom.LineDelimiter') configs[idx].delimiter = value;
    }
  }

  return configs;
}

function parseChannelTitles(text) {
  const lines = text.split('\n');
  const titles = {};

  for (const line of lines) {
    const match = line.match(/table\.ChannelTitle\[(\d+)\]\.Name=(.+)/);
    if (match) {
      titles[match[1]] = match[2];
    }
  }

  return titles;
}

async function main() {
  console.log('='.repeat(70));
  console.log('🔍 MAPEAMENTO DE CANAIS E POS');
  console.log('='.repeat(70));

  try {
    const [posConfigText, channelTitlesText] = await Promise.all([
      getPosConfig(),
      getChannelTitles()
    ]);

    const posConfigs = parseConfig(posConfigText);
    const channelTitles = parseChannelTitles(channelTitlesText);

    console.log('\n📺 CANAIS DE VÍDEO:\n');
    for (let i = 0; i < 16; i++) {
      if (channelTitles[i]) {
        console.log(`   Canal ${i}: ${channelTitles[i]}`);
      }
    }

    console.log('\n\n📍 DISPOSITIVOS POS:\n');

    for (const idx of Object.keys(posConfigs)) {
      const cfg = posConfigs[idx];
      if (cfg.enable === 'true') {
        const linkCh = cfg.linkChannel || 'N/A';
        const videoName = channelTitles[linkCh] || 'Desconhecido';

        console.log(`   POS: ${cfg.name}`);
        console.log(`   ├─ Status: ✅ ATIVO`);
        console.log(`   ├─ Canal de Vídeo: ${linkCh} (${videoName})`);
        console.log(`   ├─ CommChannel: ${cfg.commChannel}`);
        console.log(`   ├─ Porta: ${cfg.port}`);
        console.log(`   ├─ IP Origem: ${cfg.srcIP}`);
        console.log(`   └─ Delimitador: ${cfg.delimiter || 'Vazio'}\n`);
      }
    }

    console.log('='.repeat(70));
    console.log('❓ QUAL É O SEU PDV2?');
    console.log('='.repeat(70));

    // Encontrar todos PDV2
    const pdv2List = [];
    for (const idx of Object.keys(posConfigs)) {
      const cfg = posConfigs[idx];
      if (cfg.name === 'PDV2' && cfg.enable === 'true') {
        pdv2List.push({
          idx: idx,
          linkChannel: cfg.linkChannel,
          videoName: channelTitles[cfg.linkChannel],
          srcIP: cfg.srcIP,
          port: cfg.port,
          delimiter: cfg.delimiter
        });
      }
    }

    if (pdv2List.length > 0) {
      console.log(`\n✅ Encontrei ${pdv2List.length} dispositivo(s) chamado "PDV2":\n`);

      pdv2List.forEach((pdv, i) => {
        console.log(`   ${i + 1}. PDV2 no canal ${pdv.linkChannel} (${pdv.videoName})`);
        console.log(`      IP: ${pdv.srcIP}`);
        console.log(`      Porta: ${pdv.port}`);
        console.log(`      Delimitador: ${pdv.delimiter || 'Vazio'}\n`);
      });

      // Procurar especificamente canal 2
      const channel2 = pdv2List.find(p => p.linkChannel === '2');
      if (channel2) {
        console.log('═'.repeat(70));
        console.log('🎯 PDV2 NO CANAL 2:');
        console.log('═'.repeat(70));
        console.log(`\n   Nome do vídeo: ${channel2.videoName}`);
        console.log(`   IP configurado: ${channel2.srcIP}`);
        console.log(`   Porta DVR: ${channel2.port}`);
        console.log(`   Delimitador: ${channel2.delimiter ? '| (pipe)' : 'Vazio'}\n`);

        if (channel2.srcIP !== '10.6.1.171') {
          console.log('⚠️  ATENÇÃO: O IP configurado não é 10.6.1.171!');
          console.log(`   Você precisa alterar de "${channel2.srcIP}" para "10.6.1.171"\n`);
        } else {
          console.log('✅ IP está correto! (10.6.1.171)\n');
        }
      } else {
        console.log('❌ Não encontrei nenhum PDV2 configurado para o canal 2.\n');
        console.log('💡 O PDV2 que você está vendo pode estar em outro canal.\n');
      }
    } else {
      console.log('\n❌ Não encontrei nenhum PDV2 ativo.\n');
    }

    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
  }
}

main();
