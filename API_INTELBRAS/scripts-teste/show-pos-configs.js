/**
 * Script para exibir configurações de POS de forma clara
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

function parseConfigLine(line) {
  const match = line.match(/table\.PosConfig\[(\d+)\]\.(.+)=(.+)/);
  if (!match) return null;

  return {
    index: parseInt(match[1]),
    key: match[2],
    value: match[3]
  };
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
    throw new Error(`Falha ao obter configurações: ${response.status}`);
  }

  return response.body;
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

      // Organizar chaves aninhadas
      const keys = parsed.key.split('.');
      let current = configs[parsed.index];

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i].replace(/\[\d+\]/, ''); // Remove índices de array
        if (!current[key]) current[key] = {};
        current = current[key];
      }

      const finalKey = keys[keys.length - 1].replace(/\[\d+\]/, '');
      current[finalKey] = parsed.value;
    }
  }

  return configs;
}

function displayPosConfig(index, config) {
  console.log('═'.repeat(70));
  console.log(`📍 POS #${index}: ${config.Name || 'Sem nome'}`);
  console.log('═'.repeat(70));

  console.log(`\n🔧 CONFIGURAÇÃO BÁSICA:`);
  console.log(`   Status: ${config.Enable === 'true' ? '✅ ATIVO' : '❌ DESABILITADO'}`);
  console.log(`   Nome: ${config.Name}`);
  console.log(`   ID: ${config.PosID}`);
  console.log(`   Tipo de Conexão: ${config.ConnectType}`);
  console.log(`   Protocolo: ${config.Protocol}`);

  console.log(`\n📺 CANAL VINCULADO:`);
  console.log(`   Canal: ${config.LinkChannel || 'Não configurado'}`);
  console.log(`   CommChannel: ${config.CommChannel}`);

  console.log(`\n🌐 CONFIGURAÇÃO DE REDE (TCP):`);
  if (config.NetAtt) {
    console.log(`   IP de Origem (SrcIP): ${config.NetAtt.SrcIP || 'N/A'}`);
    console.log(`   Porta de Origem (SrcPort): ${config.NetAtt.SrcPort || 'N/A'}`);
    console.log(`   IP de Destino (DstIP): ${config.NetAtt.DstIP || 'N/A'}`);
    console.log(`   Porta de Destino (DstPort): ${config.NetAtt.DstPort || 'N/A'}`);
  }

  console.log(`\n🎨 OVERLAY (TEXTO NO VÍDEO):`);
  console.log(`   Overlay Ativo: ${config.OverlayEnable === 'true' ? '✅ SIM' : '❌ NÃO'}`);
  console.log(`   Tipo de Overlay: ${config.OverlayType}`);
  console.log(`   Tamanho da Fonte: ${config.FontSize}`);
  if (config.FrontColor) {
    console.log(`   Cor (RGBA): (${config.FrontColor[0]}, ${config.FrontColor[1]}, ${config.FrontColor[2]}, ${config.FrontColor[3]})`);
  }
  console.log(`   Tempo de Exibição: ${config.DisplayTime} segundos`);

  console.log(`\n📏 DELIMITADOR:`);
  console.log(`   Line Delimiter: ${config.Custom?.LineDelimiter || 'Vazio'} ${config.Custom?.LineDelimiter ? `(0x${config.Custom.LineDelimiter})` : ''}`);
  console.log(`   Encoding: ${config.Convert}`);

  console.log(`\n⚙️  OUTROS:`);
  console.log(`   Timeout: ${config.TimeOut} ms`);
  console.log(`   Multi TCP: ${config.MutiTCP === 'true' ? 'Sim' : 'Não'}`);

  if (config.EventHandler) {
    console.log(`\n🎬 EVENT HANDLER:`);
    console.log(`   Gravação: ${config.EventHandler.RecordEnable === 'true' ? '✅' : '❌'}`);
    console.log(`   Snapshot: ${config.EventHandler.SnapshotEnable === 'true' ? '✅' : '❌'}`);
    console.log(`   Mensagem: ${config.EventHandler.MessageEnable === 'true' ? '✅' : '❌'}`);
  }

  console.log('');
}

async function main() {
  console.log('='.repeat(70));
  console.log('🔍 CONFIGURAÇÕES DE POS - DVR INTELBRAS');
  console.log('='.repeat(70));
  console.log(`\n📡 DVR: ${DVR_CONFIG.ip}`);
  console.log(`   Usuário: ${DVR_CONFIG.username}\n`);

  try {
    console.log('⏳ Buscando configurações...\n');

    const configText = await getPosConfig();
    const configs = organizeConfig(configText);

    console.log(`✅ Encontrados ${Object.keys(configs).length} dispositivos POS configurados\n`);

    // Exibir apenas os ativos ou PDV2/PDV3
    const relevantIndexes = Object.keys(configs).filter(idx => {
      const cfg = configs[idx];
      return cfg.Enable === 'true' ||
             cfg.Name === 'PDV2' ||
             cfg.Name === 'PDV3' ||
             cfg.Name === 'PDV 2' ||
             cfg.Name === 'PDV 3';
    });

    if (relevantIndexes.length === 0) {
      console.log('⚠️  Nenhum POS ativo ou PDV2/PDV3 encontrado.');
      console.log('\nMostrando TODOS os dispositivos:\n');

      for (const idx of Object.keys(configs)) {
        displayPosConfig(idx, configs[idx]);
      }
    } else {
      for (const idx of relevantIndexes) {
        displayPosConfig(idx, configs[idx]);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('💡 INTERPRETAÇÃO:');
    console.log('='.repeat(70));
    console.log('\n📌 Configuração de Rede:');
    console.log('   - SrcIP/SrcPort: De onde o DVR RECEBE dados');
    console.log('   - DstIP/DstPort: Para onde o DVR ENVIA dados\n');
    console.log('🔄 Modos possíveis:');
    console.log('   1. Servidor: DVR escuta em SrcPort e recebe de qualquer IP');
    console.log('   2. Cliente: DVR conecta em DstIP:DstPort\n');
    console.log('='.repeat(70));
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
  }
}

main();
