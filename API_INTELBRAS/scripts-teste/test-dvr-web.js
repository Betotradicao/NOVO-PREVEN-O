/**
 * Script para acessar DVR via interface Web (CGI)
 * DVR Intelbras: 10.6.1.123
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
console.log('🌐 TESTE DVR VIA WEB (CGI) - INTELBRAS');
console.log('='.repeat(60));
console.log(`\n📡 DVR: http://${DVR_CONFIG.ip}`);
console.log(`   Usuário: ${DVR_CONFIG.username}\n`);

// Função para fazer requisição HTTP com Digest Auth
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

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Criar Digest Auth response
function createDigestAuth(wwwAuthenticate, uri, method = 'GET') {
  // Parsear WWW-Authenticate header
  const realm = /realm="([^"]+)"/.exec(wwwAuthenticate)?.[1];
  const nonce = /nonce="([^"]+)"/.exec(wwwAuthenticate)?.[1];
  const qop = /qop="([^"]+)"/.exec(wwwAuthenticate)?.[1];
  const opaque = /opaque="([^"]+)"/.exec(wwwAuthenticate)?.[1];

  if (!realm || !nonce) {
    return null;
  }

  const nc = '00000001';
  const cnonce = crypto.randomBytes(8).toString('hex');

  // Calculate HA1 = MD5(username:realm:password)
  const ha1 = crypto.createHash('md5')
    .update(`${DVR_CONFIG.username}:${realm}:${DVR_CONFIG.password}`)
    .digest('hex');

  // Calculate HA2 = MD5(method:uri)
  const ha2 = crypto.createHash('md5')
    .update(`${method}:${uri}`)
    .digest('hex');

  // Calculate response = MD5(HA1:nonce:nc:cnonce:qop:HA2)
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

  // Montar header
  let authHeader = `Digest username="${DVR_CONFIG.username}", realm="${realm}", nonce="${nonce}", uri="${uri}", response="${response}"`;

  if (qop) {
    authHeader += `, qop=${qop}, nc=${nc}, cnonce="${cnonce}"`;
  }

  if (opaque) {
    authHeader += `, opaque="${opaque}"`;
  }

  return authHeader;
}

async function testEndpoint(path, description) {
  try {
    console.log(`\n📍 Testando: ${description}`);
    console.log(`   Path: ${path}`);

    // Primeira tentativa (sem auth)
    let response = await httpRequest(path);

    console.log(`   Status: ${response.status}`);

    // Se 401, tentar com Digest Auth
    if (response.status === 401 && response.headers['www-authenticate']) {
      console.log(`   🔐 Tentando autenticação Digest...`);

      const wwwAuth = response.headers['www-authenticate'];
      const authHeader = createDigestAuth(wwwAuth, path);

      if (authHeader) {
        response = await httpRequest(path, authHeader);
        console.log(`   Status após auth: ${response.status}`);
      } else {
        console.log(`   ❌ Falha ao criar Digest Auth`);
        return;
      }
    }

    if (response.status === 200) {
      console.log(`   ✅ Sucesso!`);

      // Tentar parsear resposta
      const preview = response.body.substring(0, 500);
      console.log(`   Resposta (${response.body.length} bytes):`);
      console.log(`   ${preview}${response.body.length > 500 ? '...' : ''}`);

      return response.body;
    } else {
      console.log(`   ℹ️  Status ${response.status}`);
    }

  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
  }
}

async function main() {
  console.log('1️⃣  Testando acesso básico...\n');

  // Testar página principal
  await testEndpoint('/', 'Página principal');

  console.log('\n\n2️⃣  Testando endpoints CGI de configuração...\n');

  // Lista de endpoints para testar
  const endpoints = [
    { path: '/cgi-bin/magicBox.cgi?action=getSystemInfo', desc: 'Informações do sistema' },
    { path: '/cgi-bin/magicBox.cgi?action=getProductDefinition', desc: 'Definição do produto' },
    { path: '/cgi-bin/configManager.cgi?action=getConfig&name=General', desc: 'Configurações gerais' },
    { path: '/cgi-bin/configManager.cgi?action=getConfig&name=ChannelTitle', desc: 'Títulos dos canais' },
    { path: '/cgi-bin/configManager.cgi?action=getConfig&name=POS', desc: 'Configuração POS' },
    { path: '/cgi-bin/configManager.cgi?action=getConfig&name=POSDevice', desc: 'Dispositivos POS' },
    { path: '/cgi-bin/devConfig.cgi?action=getConfig&name=POS', desc: 'Config POS (devConfig)' }
  ];

  for (const endpoint of endpoints) {
    await testEndpoint(endpoint.path, endpoint.desc);
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('✅ TESTES CONCLUÍDOS');
  console.log('='.repeat(60));
  console.log('\n💡 PRÓXIMOS PASSOS:\n');
  console.log('1. Se encontrou configurações POS, verificar qual PDV está configurado');
  console.log('2. Acessar web: http://10.6.1.123');
  console.log('3. Login: admin / beto3107@');
  console.log('4. Menu: Configurações > POS > Verificar PDV2/PDV3');
  console.log('5. Verificar canal vinculado e protocolo (TCP/Serial)');
  console.log('\n='.repeat(60));
  console.log('\n');
}

main().catch(console.error);
