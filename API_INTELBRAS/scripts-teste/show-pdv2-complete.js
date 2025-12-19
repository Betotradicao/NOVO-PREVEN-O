/**
 * Mostra TODAS as configurações do PDV2 de forma completa
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

  return response.body;
}

function extractPDV2Configs(text) {
  const lines = text.split('\n');
  const pdv2Configs = [];

  let currentIndex = null;
  let currentConfig = {};

  for (const line of lines) {
    const match = line.match(/table\.PosConfig\[(\d+)\]\.(.+?)=(.+)/);
    if (match) {
      const idx = match[1];
      const key = match[2];
      const value = match[3].trim();

      // Inicializar nova config
      if (currentIndex !== idx) {
        if (currentIndex !== null && currentConfig.Name === 'PDV2') {
          pdv2Configs.push({ index: currentIndex, config: currentConfig });
        }
        currentIndex = idx;
        currentConfig = {};
      }

      currentConfig[key] = value;
    }
  }

  // Adicionar último
  if (currentIndex !== null && currentConfig.Name === 'PDV2') {
    pdv2Configs.push({ index: currentIndex, config: currentConfig });
  }

  return pdv2Configs;
}

function displayConfig(pdv, number) {
  const cfg = pdv.config;

  console.log('\n' + '═'.repeat(70));
  console.log(`📍 PDV2 #${number} (Índice ${pdv.index} no DVR)`);
  console.log('═'.repeat(70));

  console.log('\n🔧 BÁSICO:');
  console.log(`   Nome: ${cfg.Name || 'N/A'}`);
  console.log(`   Status: ${cfg.Enable === 'true' ? '✅ ATIVO' : '❌ DESABILITADO'}`);
  console.log(`   ID POS: ${cfg.PosID || 'N/A'}`);
  console.log(`   CommChannel: ${cfg.CommChannel || 'N/A'}`);

  console.log('\n📺 CANAL DE VÍDEO:');
  console.log(`   Canal vinculado: ${cfg['LinkChannel[0]'] || 'N/A'}`);

  console.log('\n🌐 REDE:');
  console.log(`   Tipo de Conexão: ${cfg.ConnectType || 'N/A'}`);
  console.log(`   Protocolo: ${cfg.Protocol || 'N/A'}`);
  console.log(`   IP de Origem (SrcIP): ${cfg['NetAtt.SrcIP'] || 'N/A'}`);
  console.log(`   Porta de Origem (SrcPort): ${cfg['NetAtt.SrcPort'] || 'N/A'}`);
  console.log(`   IP de Destino (DstIP): ${cfg['NetAtt.DstIP'] || 'N/A'}`);
  console.log(`   Porta de Destino (DstPort): ${cfg['NetAtt.DstPort'] || 'N/A'}`);
  console.log(`   Multi TCP: ${cfg.MutiTCP === 'true' ? 'Sim' : 'Não'}`);
  console.log(`   Timeout: ${cfg.TimeOut || 'N/A'} ms`);

  console.log('\n🎨 OVERLAY (TEXTO NO VÍDEO):');
  console.log(`   Overlay Ativo: ${cfg.OverlayEnable === 'true' ? '✅ SIM' : '❌ NÃO'}`);
  console.log(`   Tipo: ${cfg.OverlayType || 'N/A'}`);
  console.log(`   Tamanho da Fonte: ${cfg.FontSize || 'N/A'}`);

  const r = cfg['FrontColor[0]'];
  const g = cfg['FrontColor[1]'];
  const b = cfg['FrontColor[2]'];
  const a = cfg['FrontColor[3]'];

  if (r && g && b) {
    console.log(`   Cor (RGBA): (${r}, ${g}, ${b}, ${a || '?'})`);

    // Interpretar cor
    if (r > 200 && g < 100 && b < 100) console.log(`   🔴 Cor: VERMELHO`);
    else if (r < 100 && g > 200 && b < 100) console.log(`   🟢 Cor: VERDE`);
    else if (r < 100 && g < 100 && b > 200) console.log(`   🔵 Cor: AZUL`);
    else if (r > 200 && g > 150 && b < 100) console.log(`   🟠 Cor: LARANJA`);
    else if (r > 200 && g > 200 && b > 200) console.log(`   ⚪ Cor: BRANCO`);
    else if (r < 50 && g < 50 && b < 50) console.log(`   ⚫ Cor: PRETO`);
    else console.log(`   🎨 Cor: Personalizada`);
  }

  console.log(`   Tempo de Exibição: ${cfg.DisplayTime || 'N/A'} segundos`);

  console.log('\n📏 FORMATO:');
  console.log(`   Encoding: ${cfg.Convert || 'N/A'}`);
  const delim = cfg['Custom.LineDelimiter'];
  if (delim) {
    console.log(`   Delimitador: 0x${delim} (${String.fromCharCode(parseInt(delim, 16))})`);
  } else {
    console.log(`   Delimitador: Vazio (nova linha)`);
  }
  console.log(`   Case Sensitive: ${cfg['Custom.CaseSensitive'] || 'N/A'}`);

  console.log('\n🎬 EVENTOS:');
  console.log(`   Gravação: ${cfg['EventHandler.RecordEnable'] === 'true' ? '✅' : '❌'}`);
  if (cfg['EventHandler.RecordEnable'] === 'true') {
    console.log(`   Canal de Gravação: ${cfg['EventHandler.RecordChannels[0]'] || 'N/A'}`);
    console.log(`   Tempo de Gravação: ${cfg['EventHandler.RecordLatch'] || 'N/A'} segundos`);
  }
  console.log(`   Snapshot: ${cfg['EventHandler.SnapshotEnable'] === 'true' ? '✅' : '❌'}`);
  console.log(`   Mensagem: ${cfg['EventHandler.MessageEnable'] === 'true' ? '✅' : '❌'}`);
  console.log(`   Alarme: ${cfg['EventHandler.AlarmOutEnable'] === 'true' ? '✅' : '❌'}`);
  console.log(`   Email: ${cfg['EventHandler.MailEnable'] === 'true' ? '✅' : '❌'}`);

  console.log('\n📍 POSIÇÃO DO TEXTO:');
  console.log(`   Left: ${cfg['Rect.Left'] || 'N/A'}`);
  console.log(`   Top: ${cfg['Rect.Top'] || 'N/A'}`);
  console.log(`   Right: ${cfg['Rect.Right'] || 'N/A'}`);
  console.log(`   Bottom: ${cfg['Rect.Bottom'] || 'N/A'}`);
}

async function main() {
  console.log('='.repeat(70));
  console.log('🔍 CONFIGURAÇÕES COMPLETAS DO PDV2');
  console.log('='.repeat(70));
  console.log(`\n📡 DVR: ${DVR_CONFIG.ip}`);

  try {
    console.log('\n⏳ Buscando configurações...\n');

    const configText = await getPosConfig();
    const pdv2s = extractPDV2Configs(configText);

    if (pdv2s.length === 0) {
      console.log('❌ Nenhum PDV2 encontrado!\n');
      return;
    }

    console.log(`✅ Encontrados ${pdv2s.length} dispositivo(s) PDV2\n`);

    pdv2s.forEach((pdv, idx) => {
      displayConfig(pdv, idx + 1);
    });

    console.log('\n' + '='.repeat(70));
    console.log('💡 RESUMO:');
    console.log('='.repeat(70));

    pdv2s.forEach((pdv, idx) => {
      const cfg = pdv.config;
      console.log(`\nPDV2 #${idx + 1}:`);
      console.log(`  Canal de vídeo: ${cfg['LinkChannel[0]']}`);
      console.log(`  IP esperado: ${cfg['NetAtt.SrcIP']}`);
      console.log(`  Porta DVR: ${cfg['NetAtt.DstPort']}`);
      console.log(`  Overlay: ${cfg.OverlayEnable === 'true' ? '✅' : '❌'}`);
      console.log(`  Delimitador: ${cfg['Custom.LineDelimiter'] ? '| (pipe)' : 'Vazio'}`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
  }
}

main();
