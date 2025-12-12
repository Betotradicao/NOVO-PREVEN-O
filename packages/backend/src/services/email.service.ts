import nodemailer from 'nodemailer';
import { pool } from '../config/database';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  companyName: string;
  loginUrl: string;
}

interface PasswordResetEmailData {
  userName: string;
  resetLink: string;
  requestDate: string;
  requestIp: string;
  userAgent: string;
}

interface PasswordChangedEmailData {
  userName: string;
  changeDate: string;
  changeIp: string;
  userAgent: string;
  location: string;
  loginUrl: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  /**
   * Inicializa o transporter com as configurações SMTP do banco
   */
  private async initializeTransporter(): Promise<void> {
    try {
      const result = await pool.query(
        'SELECT smtp_host, smtp_port, smtp_user, smtp_password, smtp_secure, smtp_from_email, smtp_from_name FROM system_config LIMIT 1'
      );

      if (result.rows.length === 0 || !result.rows[0].smtp_host) {
        throw new Error('Configurações SMTP não encontradas. Configure o SMTP em Configurações → Segurança.');
      }

      const config = result.rows[0];

      this.transporter = nodemailer.createTransport({
        host: config.smtp_host,
        port: config.smtp_port,
        secure: config.smtp_secure,
        auth: {
          user: config.smtp_user,
          pass: config.smtp_password
        }
      });

      // Verificar conexão
      await this.transporter.verify();
    } catch (error) {
      console.error('Erro ao inicializar transporter de email:', error);
      throw new Error('Falha ao conectar ao servidor de email. Verifique as configurações SMTP.');
    }
  }

  /**
   * Envia um email
   */
  private async sendEmail(options: EmailOptions): Promise<void> {
    await this.initializeTransporter();

    if (!this.transporter) {
      throw new Error('Transporter de email não inicializado');
    }

    const config = await pool.query(
      'SELECT smtp_from_email, smtp_from_name FROM system_config LIMIT 1'
    );

    const fromEmail = config.rows[0]?.smtp_from_email || 'noreply@prevencao.com';
    const fromName = config.rows[0]?.smtp_from_name || 'Sistema Prevenção no Radar';

    await this.transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    });
  }

  /**
   * Email de boas-vindas ao primeiro usuário master
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: #f9fafb;
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: white;
      padding: 30px;
      border-radius: 0 0 10px 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .button {
      background: #3b82f6;
      color: white !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      display: inline-block;
      font-weight: bold;
      margin: 20px 0;
    }
    .info-box {
      background: #f0f9ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      color: #6b7280;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Parabéns!</h1>
      <p style="font-size: 18px; margin: 0;">Sua conta foi criada com sucesso</p>
    </div>

    <div class="content">
      <p>Olá, <strong>${data.userName}</strong>!</p>

      <p>Seja muito bem-vindo(a) ao <strong>Sistema Prevenção no Radar</strong>! 🚀</p>

      <p>Sua conta de <strong>Administrador Master</strong> foi criada e está pronta para uso. Você agora tem acesso completo a todas as funcionalidades do sistema.</p>

      <div class="info-box">
        <strong>📋 Suas informações de acesso:</strong><br>
        <strong>Email:</strong> ${data.userEmail}<br>
        <strong>Empresa:</strong> ${data.companyName}<br>
        <strong>Tipo de conta:</strong> Administrador Master
      </div>

      <p><strong>🎯 Próximos passos:</strong></p>
      <ol>
        <li>Acesse o sistema clicando no botão abaixo</li>
        <li>Configure as preferências da sua empresa</li>
        <li>Cadastre produtos e funcionários</li>
        <li>Comece a monitorar suas operações em tempo real</li>
      </ol>

      <center>
        <a href="${data.loginUrl}" class="button">🚀 Acessar Sistema Agora</a>
      </center>

      <div class="info-box" style="background: #fef3c7; border-left-color: #f59e0b;">
        <strong>🔐 Dica de Segurança:</strong><br>
        Este email é seu único meio de recuperação de senha. Guarde-o em local seguro e não compartilhe com ninguém.
      </div>

      <p><strong>💡 Precisa de ajuda?</strong></p>
      <p>Caso tenha alguma dúvida ou necessite de suporte, nossa equipe está à disposição.</p>

      <p>Estamos felizes em tê-lo(a) conosco!</p>

      <p>
        Atenciosamente,<br>
        <strong>Equipe Prevenção no Radar</strong>
      </p>

      <div class="footer">
        <p>
          Sistema Prevenção no Radar © 2025<br>
          Proteção inteligente para seu negócio
        </p>
        <p style="font-size: 11px; color: #9ca3af;">
          Este é um email automático. Por favor, não responda diretamente.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Olá, ${data.userName}!

Parabéns! Sua conta de Administrador Master foi criada com sucesso.

SUAS INFORMAÇÕES:
- Email: ${data.userEmail}
- Empresa: ${data.companyName}
- Tipo: Administrador Master

Acesse: ${data.loginUrl}

IMPORTANTE: Guarde este email com segurança. É seu único meio de recuperação de senha.

Bem-vindo(a) à família Prevenção no Radar!

Atenciosamente,
Equipe Prevenção no Radar
    `;

    await this.sendEmail({
      to: data.userEmail,
      subject: '🎉 Bem-vindo ao Sistema Prevenção no Radar!',
      html,
      text
    });
  }

  /**
   * Email de recuperação de senha
   */
  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: #f9fafb;
    }
    .header {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: white;
      padding: 30px;
      border-radius: 0 0 10px 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .button {
      background: #f59e0b;
      color: white !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      display: inline-block;
      font-weight: bold;
      margin: 20px 0;
    }
    .warning-box {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .code-box {
      background: #f3f4f6;
      border: 2px dashed #9ca3af;
      padding: 15px;
      font-size: 12px;
      word-break: break-all;
      margin: 20px 0;
      border-radius: 8px;
      color: #1f2937;
    }
    .footer {
      text-align: center;
      color: #6b7280;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Recuperação de Senha</h1>
      <p style="font-size: 18px; margin: 0;">Solicitação recebida</p>
    </div>

    <div class="content">
      <p>Olá, <strong>${data.userName}</strong>!</p>

      <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Sistema Prevenção no Radar</strong>.</p>

      <p><strong>📍 Detalhes da solicitação:</strong></p>
      <ul>
        <li><strong>Data/Hora:</strong> ${data.requestDate}</li>
        <li><strong>IP:</strong> ${data.requestIp}</li>
        <li><strong>Navegador:</strong> ${data.userAgent}</li>
      </ul>

      <p>Para criar uma nova senha, clique no botão abaixo:</p>

      <center>
        <a href="${data.resetLink}" class="button">🔓 Redefinir Minha Senha</a>
      </center>

      <p><small>Ou copie e cole este link no navegador:</small></p>
      <div class="code-box">
        ${data.resetLink}
      </div>

      <div class="warning-box">
        <strong>⚠️ Atenção - Informações Importantes:</strong><br><br>
        • Este link expira em <strong>1 hora</strong><br>
        • O link só pode ser usado <strong>uma única vez</strong><br>
        • Após redefinir a senha, você será desconectado de todos os dispositivos
      </div>

      <div class="warning-box" style="background: #fee2e2; border-left-color: #ef4444;">
        <strong>🚨 Você não solicitou esta recuperação?</strong><br><br>
        Se você não pediu para recuperar sua senha, <strong>IGNORE este email</strong> e sua conta permanecerá segura.<br><br>
        Recomendamos alterar sua senha imediatamente se você suspeitar de acesso não autorizado.
      </div>

      <p>
        Atenciosamente,<br>
        <strong>Equipe Prevenção no Radar</strong>
      </p>

      <div class="footer">
        <p>
          Sistema Prevenção no Radar © 2025<br>
          Proteção inteligente para seu negócio
        </p>
        <p style="font-size: 11px; color: #9ca3af;">
          Este é um email automático de segurança. Por favor, não responda.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Olá, ${data.userName}!

Recebemos uma solicitação para redefinir sua senha.

Link de recuperação: ${data.resetLink}

IMPORTANTE:
- Link expira em 1 hora
- Use apenas uma vez
- Você será desconectado de todos dispositivos

Não solicitou? Ignore este email.

Atenciosamente,
Equipe Prevenção no Radar
    `;

    await this.sendEmail({
      to: data.userName,
      subject: '🔐 Recuperação de Senha - Sistema Prevenção no Radar',
      html,
      text
    });
  }

  /**
   * Email de confirmação de alteração de senha
   */
  async sendPasswordChangedEmail(data: PasswordChangedEmailData): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: #f9fafb;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: white;
      padding: 30px;
      border-radius: 0 0 10px 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .success-box {
      background: #d1fae5;
      border-left: 4px solid #10b981;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warning-box {
      background: #fee2e2;
      border-left: 4px solid #ef4444;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .button {
      background: #10b981;
      color: white !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      display: inline-block;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      color: #6b7280;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Senha Alterada!</h1>
      <p style="font-size: 18px; margin: 0;">Sua conta está segura</p>
    </div>

    <div class="content">
      <p>Olá, <strong>${data.userName}</strong>!</p>

      <div class="success-box">
        <strong>✅ Alteração realizada com sucesso!</strong><br><br>
        A senha da sua conta no <strong>Sistema Prevenção no Radar</strong> foi alterada com sucesso.
      </div>

      <p><strong>📍 Detalhes da alteração:</strong></p>
      <ul>
        <li><strong>Data/Hora:</strong> ${data.changeDate}</li>
        <li><strong>IP:</strong> ${data.changeIp}</li>
        <li><strong>Dispositivo:</strong> ${data.userAgent}</li>
        <li><strong>Localização:</strong> ${data.location} (estimada)</li>
      </ul>

      <p><strong>🔐 Medidas de segurança aplicadas:</strong></p>
      <ul>
        <li>✅ Você foi desconectado de todos os dispositivos</li>
        <li>✅ Tokens de acesso antigos foram invalidados</li>
        <li>✅ Um novo histórico de sessão foi iniciado</li>
      </ul>

      <p>Você já pode acessar o sistema com sua nova senha:</p>

      <center>
        <a href="${data.loginUrl}" class="button">🔓 Fazer Login Agora</a>
      </center>

      <div class="warning-box">
        <strong>🚨 Você não fez esta alteração?</strong><br><br>
        Se você <strong>NÃO alterou sua senha</strong>, sua conta pode estar comprometida!<br><br>
        <strong>Ação imediata:</strong>
        <ol style="margin: 10px 0;">
          <li>Acesse o sistema imediatamente</li>
          <li>Altere sua senha novamente</li>
          <li>Revise os acessos recentes</li>
          <li>Entre em contato com o suporte</li>
        </ol>
      </div>

      <p>
        Atenciosamente,<br>
        <strong>Equipe Prevenção no Radar</strong>
      </p>

      <div class="footer">
        <p>
          Sistema Prevenção no Radar © 2025<br>
          Proteção inteligente para seu negócio
        </p>
        <p style="font-size: 11px; color: #9ca3af;">
          Este é um email automático de segurança. Por favor, não responda.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Olá, ${data.userName}!

Sua senha foi alterada com sucesso!

Data/Hora: ${data.changeDate}
IP: ${data.changeIp}

Acesse: ${data.loginUrl}

Não fez esta alteração? Acesse o sistema imediatamente e altere sua senha!

Atenciosamente,
Equipe Prevenção no Radar
    `;

    await this.sendEmail({
      to: data.userName,
      subject: '✅ Senha alterada com sucesso - Sistema Prevenção no Radar',
      html,
      text
    });
  }

  /**
   * Testa a configuração SMTP
   */
  async testSmtpConnection(): Promise<boolean> {
    try {
      await this.initializeTransporter();
      return true;
    } catch (error) {
      console.error('Erro ao testar SMTP:', error);
      return false;
    }
  }
}

export default new EmailService();
