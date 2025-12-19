/**
 * DIAGNÓSTICO COMPLETO
 * Verifica TUDO que pode estar errado
 */

const http = require('http');
const crypto = require('crypto');
const net = require('net');

const DVR_CONFIG = {
  ip: '10.6.1.123',
  port: 80,
  httpPort: 80,
  posPort: 38800,
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
        configs[parsed.index] = {};
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
      response = await httpRequest(path, 'GET', authHeader);
    }
  }

  if (response.status !== 200) {
    throw new Error(`Falha ao obter configurações: ${response.status}`);
  }

  return response.body;
}

async function testarPorta() {
  return new Promise((resolve) => {
    console.log(`\n🔌 Testando porta ${DVR_CONFIG.posPort}...`);

    const client = new net.Socket();
    client.setTimeout(3000);

    client.on('connect', () => {
      console.log(`   ✅ Porta ${DVR_CONFIG.posPort} está ABERTA e aceitando conexões`);
      client.destroy();
      resolve(true);
    });

    client.on('error', (error) => {
      console.log(`   ❌ Porta ${DVR_CONFIG.posPort} ERRO: ${error.message}`);
      resolve(false);
    });

    client.on('timeout', () => {
      console.log(`   ⏱️  Porta ${DVR_CONFIG.posPort} TIMEOUT (pode estar fechada)`);
      client.destroy();
      resolve(false);
    });

    client.connect(DVR_CONFIG.posPort, DVR_CONFIG.ip);
  });
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║              DIAGNÓSTICO COMPLETO - POR QUE NÃO APARECE?         ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  console.log(`📡 DVR: ${DVR_CONFIG.ip}\n`);

  try {
    // 1. Testar porta
    await testarPorta();

    // 2. Buscar configurações
    console.log('\n📋 Buscando configurações dos POS...');
    const configText = await getPosConfig();
    const configs = organizeConfig(configText);

    const posAtivos = Object.keys(configs).filter(idx => configs[idx].Enable === 'true');

    console.log(`\n✅ Encontrados ${posAtivos.length} POS ativos\n`);

    console.log('═'.repeat(70));
    console.log('CHECKLIST DE CADA POS:');
    console.log('═'.repeat(70));

    const pdvsParaTestar = [
      { index: 4, name: 'PDV1', canalEsperado: 4 },
      { index: 5, name: 'PDV2', canalEsperado: 5 },
      { index: 1, name: 'PDV3', canalEsperado: 1 },
      { index: 3, name: 'PDV4', canalEsperado: 3 },
      { index: 2, name: 'PDV5', canalEsperado: 2 }
    ];

    let problemas = [];

    for (const pdv of pdvsParaTestar) {
      const cfg = configs[pdv.index];

      if (!cfg) {
        console.log(`\n❌ ${pdv.name}: NÃO ENCONTRADO no DVR!`);
        problemas.push(`${pdv.name} não existe`);
        continue;
      }

      console.log(`\n📍 ${pdv.name} (índice ${pdv.index}):`);

      // Checar Enable
      if (cfg.Enable !== 'true') {
        console.log(`   ❌ DESABILITADO! (Enable=${cfg.Enable})`);
        problemas.push(`${pdv.name} está desabilitado`);
      } else {
        console.log(`   ✅ Habilitado`);
      }

      // Checar Canal
      const canalAtual = parseInt(cfg.LinkChannel);
      if (canalAtual === pdv.canalEsperado) {
        console.log(`   ✅ Canal: ${canalAtual + 1} (correto)`);
      } else {
        console.log(`   ⚠️  Canal: ${canalAtual + 1} (esperado: ${pdv.canalEsperado + 1})`);
        problemas.push(`${pdv.name} no canal errado`);
      }

      // Checar Limitador
      const limitador = cfg.Custom?.LineDelimiter || '';
      if (limitador === '7C' || limitador === '7c') {
        console.log(`   ✅ Limitador: ${limitador}`);
      } else if (limitador === '') {
        console.log(`   ❌ Limitador: VAZIO!`);
        problemas.push(`${pdv.name} sem limitador`);
      } else {
        console.log(`   ⚠️  Limitador: ${limitador} (esperado: 7C)`);
      }

      // Checar Overlay
      if (cfg.OverlayEnable === 'true') {
        console.log(`   ✅ Overlay Ativo`);
      } else {
        console.log(`   ❌ Overlay DESATIVADO!`);
        problemas.push(`${pdv.name} overlay desativado`);
      }

      // Checar Porta
      if (cfg.NetAtt?.DstPort === '38800') {
        console.log(`   ✅ Porta: 38800`);
      } else {
        console.log(`   ❌ Porta: ${cfg.NetAtt?.DstPort || 'N/A'} (esperado: 38800)`);
        problemas.push(`${pdv.name} porta errada`);
      }

      // Checar IP
      const srcIP = cfg.NetAtt?.SrcIP || '';
      if (srcIP === '0.0.0.0' || srcIP === '10.6.1.171') {
        console.log(`   ✅ IP Origem: ${srcIP}`);
      } else {
        console.log(`   ⚠️  IP Origem: ${srcIP}`);
      }
    }

    console.log('\n\n' + '═'.repeat(70));
    console.log('📊 RESUMO DO DIAGNÓSTICO:');
    console.log('═'.repeat(70));

    if (problemas.length === 0) {
      console.log('\n✅ TUDO PARECE ESTAR CORRETO!');
      console.log('\n💡 Possíveis causas do texto não aparecer:');
      console.log('   1. Você está olhando o canal errado no monitor');
      console.log('   2. O tempo de exibição passou muito rápido');
      console.log('   3. A fonte está muito pequena ou cor invisível');
      console.log('   4. O DVR precisa ser reiniciado para aplicar mudanças');
      console.log('\n🔧 TESTE: Vou enviar um cupom de teste agora...');
    } else {
      console.log(`\n❌ ENCONTRADOS ${problemas.length} PROBLEMAS:\n`);
      for (const p of problemas) {
        console.log(`   ❌ ${p}`);
      }
      console.log('\n🔧 CORREÇÃO: Você precisa ajustar essas configurações na interface do DVR');
    }

    console.log('\n' + '═'.repeat(70));
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
  }
}

main();
