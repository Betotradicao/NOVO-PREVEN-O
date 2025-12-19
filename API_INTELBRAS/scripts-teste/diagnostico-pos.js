/**
 * Diagnóstico completo do POS
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

function parsePDV2Configs(text) {
  const lines = text.split('\n');
  const pdv2s = [];

  for (const line of lines) {
    const match = line.match(/table\.PosConfig\[(\d+)\]\.(.+?)=(.+)/);
    if (!match) continue;

    const idx = match[1];
    const key = match[2];
    const value = match[3].trim();

    let pdv = pdv2s.find(p => p.index === idx);
    if (!pdv) {
      pdv = { index: idx, config: {} };
      pdv2s.push(pdv);
    }

    pdv.config[key] = value;
  }

  return pdv2s.filter(p => p.config.Name === 'PDV2');
}

async function main() {
  console.log('='.repeat(70));
  console.log('🔍 DIAGNÓSTICO POS - POR QUE O TEXTO NÃO APARECE?');
  console.log('='.repeat(70));

  try {
    console.log('\n⏳ Buscando configurações atuais...\n');

    const configText = await getPosConfig();
    const pdv2s = parsePDV2Configs(configText);

    console.log('═'.repeat(70));
    console.log('📊 RESULTADO DO DIAGNÓSTICO:');
    console.log('═'.repeat(70));

    let foundIssues = false;

    pdv2s.forEach((pdv, idx) => {
      const cfg = pdv.config;
      const num = idx + 1;

      console.log(`\n📍 PDV2 #${num} (Índice ${pdv.index}):`);
      console.log(`   Canal de vídeo: ${cfg['LinkChannel[0]']}`);

      // Verificar Enable
      if (cfg.Enable !== 'true') {
        console.log(`   ❌ PROBLEMA: PDV está DESABILITADO!`);
        foundIssues = true;
      } else {
        console.log(`   ✅ Status: Ativo`);
      }

      // Verificar IP
      const srcIP = cfg['NetAtt.SrcIP'];
      if (srcIP === '10.6.1.171') {
        console.log(`   ✅ IP: ${srcIP} (correto!)`);
      } else {
        console.log(`   ❌ PROBLEMA: IP está ${srcIP} (deve ser 10.6.1.171)`);
        foundIssues = true;
      }

      // Verificar Overlay
      if (cfg.OverlayEnable !== 'true') {
        console.log(`   ❌ PROBLEMA: Overlay DESABILITADO!`);
        foundIssues = true;
      } else {
        console.log(`   ✅ Overlay: Ativo`);
      }

      // Verificar Porta
      console.log(`   ℹ️  Porta DVR: ${cfg['NetAtt.DstPort']}`);

      // Verificar Delimitador
      const delim = cfg['Custom.LineDelimiter'];
      if (delim) {
        console.log(`   ℹ️  Delimitador: | (pipe)`);
      } else {
        console.log(`   ℹ️  Delimitador: Quebra de linha`);
      }
    });

    console.log('\n' + '═'.repeat(70));
    console.log('💡 POSSÍVEIS CAUSAS:');
    console.log('═'.repeat(70));

    console.log('\n1️⃣  O DVR pode precisar REINICIAR o serviço POS');
    console.log('   Solução: Desabilitar e Habilitar o POS no DVR');
    console.log('   Ou: Reiniciar o DVR completamente\n');

    console.log('2️⃣  Você pode ter alterado o IP no PDV errado');
    console.log('   Qual canal você quer ver o texto?');
    console.log(`   - Canal 1 (PDV 3)? Altere PDV2 índice 1`);
    console.log(`   - Canal 5 (PDV 2)? Altere PDV2 índice 5\n`);

    console.log('3️⃣  O Overlay pode estar desabilitado');
    console.log('   Solução: No DVR, habilitar "Overlay" ou "Exibir texto"\n');

    console.log('4️⃣  O formato dos dados pode estar incorreto');
    console.log('   Solução: Verificar delimitador e protocolo\n');

    console.log('5️⃣  A porta 38800 pode não estar escutando');
    console.log('   Solução: Reiniciar serviço POS no DVR\n');

    console.log('═'.repeat(70));
    console.log('🔧 AÇÕES RECOMENDADAS (EM ORDEM):');
    console.log('═'.repeat(70));

    console.log('\n📋 PASSO A PASSO:\n');
    console.log('1. No DVR, vá em: Configurações > POS > PDV2');
    console.log('2. Verifique se "Habilitar" está MARCADO ✅');
    console.log('3. Verifique se "Overlay" ou "Exibir" está MARCADO ✅');
    console.log('4. DESMARQUE "Habilitar" e SALVE');
    console.log('5. Aguarde 5 segundos');
    console.log('6. MARQUE "Habilitar" novamente e SALVE');
    console.log('7. Volte aqui e me avise!\n');

    console.log('═'.repeat(70));
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
  }
}

main();
