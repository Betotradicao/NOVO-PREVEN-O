import crypto from 'crypto';
import { pool } from '../config/database';

export class TokenService {
  /**
   * Gera um token único e seguro
   */
  generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Cria um token de recuperação de senha
   */
  async createPasswordResetToken(
    userId: number,
    requestIp: string,
    userAgent: string
  ): Promise<string> {
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at, request_ip, request_user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, token, expiresAt, requestIp, userAgent]
    );

    return token;
  }

  /**
   * Valida e consome um token de recuperação
   */
  async validateAndConsumeToken(token: string): Promise<number | null> {
    const result = await pool.query(
      `SELECT id, user_id, expires_at, used
       FROM password_reset_tokens
       WHERE token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return null; // Token não existe
    }

    const tokenData = result.rows[0];

    // Verificar se já foi usado
    if (tokenData.used) {
      return null;
    }

    // Verificar se expirou
    if (new Date(tokenData.expires_at) < new Date()) {
      return null;
    }

    // Marcar como usado
    await pool.query(
      `UPDATE password_reset_tokens
       SET used = TRUE, used_at = NOW()
       WHERE id = $1`,
      [tokenData.id]
    );

    return tokenData.user_id;
  }

  /**
   * Limpa tokens expirados (pode ser chamado por um cron job)
   */
  async cleanExpiredTokens(): Promise<number> {
    const result = await pool.query(
      `DELETE FROM password_reset_tokens
       WHERE expires_at < NOW() AND used = FALSE
       RETURNING id`
    );

    return result.rowCount || 0;
  }

  /**
   * Invalida todos os tokens de um usuário
   */
  async invalidateAllUserTokens(userId: number): Promise<void> {
    await pool.query(
      `UPDATE password_reset_tokens
       SET used = TRUE, used_at = NOW()
       WHERE user_id = $1 AND used = FALSE`,
      [userId]
    );
  }
}

export default new TokenService();
