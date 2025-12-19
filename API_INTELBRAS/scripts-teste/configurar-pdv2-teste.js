/**
 * CONFIGURAR APENAS PDV2 COMO TESTE
 * Canal 6 na tela
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

async function configurarPDV2() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║         CONFIGURAR APENAS PDV2 COMO TESTE - CANAL 6              ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  const idx = 5; // Índice interno do PDV2

  // Configurações para o PDV2
  const settings = [
    { key: 'Enable', value: 'true', desc: 'Habilitar PDV2' },
    { key: 'Title', value: 'PDV2', desc: 'Nome: PDV2' },
    { key: 'LinkChannel', value: '5', desc: 'Canal 6 (interno 5)' },
    { key: 'Protocol', value: 'TCP', desc: 'Protocolo TCP' },
    { key: 'NetAtt.SrcIP', value: '10.6.1.171', desc: 'IP Origem' },
    { key: 'NetAtt.SrcPort', value: '37777', desc: 'Porta Origem 37777' },
    { key: 'NetAtt.DstIP', value: '10.6.1.123', desc: 'IP Destino (DVR)' },
    { key: 'NetAtt.DstPort', value: '38800', desc: 'Porta Destino 38800' },
    { key: 'Custom.LineDelimiter', value: '7C', desc: 'Limitador 7C (|)' },
    { key: 'OverlayEnable', value: 'true', desc: 'Overlay Ativo' },
    { key: 'Custom.PosEnable', value: 'true', desc: 'POS Info Ativo' }
  ];

  console.log('📋 Configurações a serem aplicadas:\n');
  for (const setting of settings) {
    console.log(`   ✓ ${setting.desc}`);
  }

  console.log('\n═'.repeat(70));
  console.log('⏳ Aplicando configurações...');
  console.log('═'.repeat(70) + '\n');

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
        console.log(`   ⚠️  ${setting.desc} - Resposta: ${response.body.substring(0, 50)}`);
      }

      await new Promise(r => setTimeout(r, 200));

    } catch (error) {
      console.log(`   ❌ Erro em ${setting.desc}: ${error.message}`);
    }
  }

  console.log('\n\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                    ✅ PDV2 CONFIGURADO!                           ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  console.log('📊 RESUMO DA CONFIGURAÇÃO:\n');
  console.log('   📺 Nome: PDV2');
  console.log('   📡 Canal: 6 (o que você vê na tela)');
  console.log('   🔌 IP Origem: 10.6.1.171');
  console.log('   🔌 Porta Origem: 37777');
  console.log('   🎯 IP Destino: 10.6.1.123 (DVR)');
  console.log('   🎯 Porta Destino: 38800');
  console.log('   ➗ Limitador: 7C (|)');
  console.log('   ✅ Overlay: ATIVO');
  console.log('   ✅ POS Info: ATIVO\n');

  console.log('═'.repeat(70));
  console.log('💡 PRÓXIMO PASSO:');
  console.log('═'.repeat(70));
  console.log('\nVou enviar um cupom de teste para o PDV2.');
  console.log('👀 OLHE PARA O CANAL 6 NA TELA DO DVR!\n');
  console.log('═'.repeat(70));
  console.log('\n');
}

async function main() {
  try {
    await configurarPDV2();
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
  }
}

main();
