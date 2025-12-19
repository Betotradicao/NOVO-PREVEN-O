/**
 * CONFIGURAR EMAIL DO DVR VIA API
 */

const http = require('http');
const crypto = require('crypto');

const DVR_CONFIG = {
  ip: '10.6.1.123',
  port: 80,
  username: 'admin',
  password: 'beto3107@'
};

// Configurações de email
const EMAIL_CONFIG = {
  Enable: true,
  SMTPServer: 'smtp.gmail.com',
  SMTPPort: 587,
  Anonymous: false,
  UserName: 'betotradica076@gmail.com',
  Password: '', // SERÁ PREENCHIDO
  SenderAddr: 'betotradica076@gmail.com',
  ReceiverAddr: ['betotradica076@gmail.com'],
  Title: 'ALERTA DVR',
  MailInterval: 10,
  SSLEnable: true,
  Authentication: 'NONE'
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

async function configurarEmail(senhaApp) {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║         CONFIGURAR EMAIL DO DVR VIA API                          ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  EMAIL_CONFIG.Password = senhaApp;

  const settings = [
    { key: 'Enable', value: 'true', desc: 'Habilitar Email' },
    { key: 'SMTPServer', value: EMAIL_CONFIG.SMTPServer, desc: 'Servidor SMTP' },
    { key: 'SMTPPort', value: EMAIL_CONFIG.SMTPPort, desc: 'Porta SMTP' },
    { key: 'Anonymous', value: 'false', desc: 'Autenticação Obrigatória' },
    { key: 'UserName', value: EMAIL_CONFIG.UserName, desc: 'Usuário' },
    { key: 'Password', value: EMAIL_CONFIG.Password, desc: 'Senha App' },
    { key: 'SenderAddr', value: EMAIL_CONFIG.SenderAddr, desc: 'Remetente' },
    { key: 'ReceiverAddr[0]', value: EMAIL_CONFIG.ReceiverAddr[0], desc: 'Destinatário' },
    { key: 'Title', value: EMAIL_CONFIG.Title, desc: 'Título' },
    { key: 'MailInterval', value: EMAIL_CONFIG.MailInterval, desc: 'Intervalo (min)' },
    { key: 'SSLEnable', value: 'true', desc: 'TLS Habilitado' }
  ];

  for (const setting of settings) {
    const path = `/cgi-bin/configManager.cgi?action=setConfig&MailServer.${setting.key}=${encodeURIComponent(setting.value)}`;

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
        console.log(`   ⚠️  ${setting.desc} - ${response.body.substring(0, 50)}`);
      }

      await new Promise(r => setTimeout(r, 200));

    } catch (error) {
      console.log(`   ❌ ${setting.desc}: ${error.message}`);
    }
  }

  console.log('\n\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                    ✅ EMAIL CONFIGURADO!                          ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  console.log('📧 Configurações:\n');
  console.log(`   Servidor: ${EMAIL_CONFIG.SMTPServer}:${EMAIL_CONFIG.SMTPPort}`);
  console.log(`   Usuário: ${EMAIL_CONFIG.UserName}`);
  console.log(`   Senha: ${'*'.repeat(EMAIL_CONFIG.Password.length)} (${EMAIL_CONFIG.Password.length} caracteres)`);
  console.log(`   TLS: Habilitado\n`);

  console.log('═'.repeat(70));
  console.log('\n');
}

// Verificar se senha foi passada como argumento
const senhaApp = process.argv[2];

if (!senhaApp) {
  console.log('\n❌ ERRO: Senha de app do Gmail não fornecida!\n');
  console.log('Uso: node configurar-email-dvr.js SENHA_APP_16_CARACTERES\n');
  process.exit(1);
}

if (senhaApp.length !== 16) {
  console.log(`\n⚠️  ATENÇÃO: Senha tem ${senhaApp.length} caracteres (esperado: 16)\n`);
}

configurarEmail(senhaApp).catch(error => {
  console.error('\n❌ Erro:', error.message);
  process.exit(1);
});
