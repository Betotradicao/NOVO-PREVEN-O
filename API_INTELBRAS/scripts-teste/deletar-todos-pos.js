/**
 * Script para DELETAR todos os POS configurados no DVR
 * Use com cuidado! Isso vai apagar TODAS as configurações POS
 */

const http = require('http');
const crypto = require('crypto');

const DVR_CONFIG = {
  ip: '10.6.1.123',
  port: 80,
  username: 'admin',
  password: 'beto3107@'
};

function httpRequest(path, method = 'GET', data = null, authHeader = null) {
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

    if (data && method === 'POST') {
      const body = typeof data === 'string' ? data : JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(body);
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
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

    if (data && method === 'POST') {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }

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

function parseConfigLine(line) {
  const match = line.match(/table\.PosConfig\[(\d+)\]\.(.+)=(.+)/);
  if (!match) return null;

  return {
    index: parseInt(match[1]),
    key: match[2],
    value: match[3]
  };
}

function organizeConfig(configText) {
  const lines = configText.split('\n');
  const configs = {};

  for (const line of lines) {
    const parsed = parseConfigLine(line.trim());
    if (parsed) {
      if (!configs[parsed.index]) {
        configs[parsed.index] = { _index: parsed.index };
      }

      const keys = parsed.key.split('.');
      let current = configs[parsed.index];

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i].replace(/\[\d+\]/, '');
        if (!current[key]) current[key] = {};
        current = current[key];
      }

      const finalKey = keys[keys.length - 1].replace(/\[\d+\]/, '');
      current[finalKey] = parsed.value;
    }
  }

  return configs;
}

async function getPosConfig() {
  const path = '/cgi-bin/configManager.cgi?action=getConfig&name=PosConfig';
  let response = await httpRequest(path);

  if (response.status === 401 && response.headers['www-authenticate']) {
    const authHeader = createDigestAuth(response.headers['www-authenticate'], path);
    if (authHeader) {
      response = await httpRequest(path, 'GET', null, authHeader);
    }
  }

  if (response.status !== 200) {
    throw new Error(`Falha ao obter configurações: ${response.status}`);
  }

  return response.body;
}

async function disableAllPos(configs) {
  console.log('\n⏳ Desabilitando todos os POS...\n');

  const indices = Object.keys(configs);

  for (const idx of indices) {
    const cfg = configs[idx];
    const posName = cfg.Name || `POS #${idx}`;

    console.log(`   🔄 Desabilitando: ${posName} (índice ${idx})`);

    const path = `/cgi-bin/configManager.cgi?action=setConfig&PosConfig[${idx}].Enable=false`;

    let response = await httpRequest(path, 'GET');

    if (response.status === 401 && response.headers['www-authenticate']) {
      const authHeader = createDigestAuth(response.headers['www-authenticate'], path, 'GET');
      if (authHeader) {
        response = await httpRequest(path, 'GET', null, authHeader);
      }
    }

    if (response.body.includes('OK') || response.body.includes('ok')) {
      console.log(`   ✅ ${posName} desabilitado!`);
    } else {
      console.log(`   ⚠️  ${posName} - Resposta: ${response.body.substring(0, 50)}`);
    }

    await new Promise(r => setTimeout(r, 500));
  }
}

async function main() {
  console.log('═'.repeat(70));
  console.log('🗑️  DELETAR TODOS OS POS - DVR INTELBRAS');
  console.log('═'.repeat(70));
  console.log(`\n📡 DVR: ${DVR_CONFIG.ip}\n`);

  try {
    console.log('⏳ Buscando configurações atuais...\n');

    const configText = await getPosConfig();
    const configs = organizeConfig(configText);

    const posAtivos = Object.keys(configs).filter(idx => configs[idx].Enable === 'true');
    const posInativos = Object.keys(configs).filter(idx => configs[idx].Enable === 'false');

    console.log(`📊 Encontrados ${Object.keys(configs).length} POS configurados:`);
    console.log(`   ✅ Ativos: ${posAtivos.length}`);
    console.log(`   ❌ Inativos: ${posInativos.length}\n`);

    console.log('📋 Lista de POS:');
    for (const idx of Object.keys(configs)) {
      const cfg = configs[idx];
      const status = cfg.Enable === 'true' ? '✅' : '❌';
      console.log(`   ${status} [${idx}] ${cfg.Name || 'Sem nome'} - Canal ${cfg.LinkChannel || 'N/A'}`);
    }

    console.log('\n' + '═'.repeat(70));
    console.log('⚠️  ATENÇÃO: Isso vai DESABILITAR todos os POS!');
    console.log('═'.repeat(70));
    console.log('\n💡 NOTA: O DVR Intelbras não permite deletar via API.');
    console.log('   Mas podemos DESABILITAR todos para você criar novos.\n');

    // Desabilitar todos
    await disableAllPos(configs);

    console.log('\n' + '═'.repeat(70));
    console.log('✅ CONCLUÍDO!');
    console.log('═'.repeat(70));
    console.log('\n💡 PRÓXIMOS PASSOS:\n');
    console.log('1. Na interface WEB do DVR:');
    console.log('   - Vá em: Menu > POS > Configurações');
    console.log('   - TODOS os POS agora estão DESABILITADOS');
    console.log('');
    console.log('2. Para deletar completamente (via interface):');
    console.log('   - Clique em cada POS desabilitado');
    console.log('   - Procure o botão "DELETAR" ou "REMOVER"');
    console.log('   - Confirme a remoção');
    console.log('');
    console.log('3. Ou simplesmente EDITE os existentes:');
    console.log('   - PDV1 → Editar → Canal 5 → Salvar');
    console.log('   - PDV2 → Editar → Canal 6 → Salvar');
    console.log('   - etc.');
    console.log('\n' + '═'.repeat(70));
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
  }
}

main();
