-- ================================================
-- MIGRATION: Sistema de Recuperação de Senha
-- Data: 2025-12-12
-- Descrição: Adiciona suporte para setup inicial,
--            recuperação de senha e configurações SMTP
-- ================================================

-- ================================================
-- 1. TABELA DE CONFIGURAÇÃO DO SISTEMA
-- ================================================
CREATE TABLE IF NOT EXISTS system_config (
  id SERIAL PRIMARY KEY,
  is_setup_completed BOOLEAN DEFAULT FALSE,

  -- Configurações SMTP
  smtp_host VARCHAR(255),
  smtp_port INTEGER DEFAULT 587,
  smtp_user VARCHAR(255),
  smtp_password TEXT, -- Será encriptado na aplicação
  smtp_secure BOOLEAN DEFAULT TRUE,
  smtp_from_email VARCHAR(255),
  smtp_from_name VARCHAR(255) DEFAULT 'Sistema Prevenção no Radar',

  -- Metadados
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir configuração inicial (não configurado)
INSERT INTO system_config (is_setup_completed)
VALUES (FALSE)
ON CONFLICT DO NOTHING;

-- ================================================
-- 2. ADICIONAR CAMPOS NA TABELA USERS
-- ================================================

-- Email de recuperação (pode ser diferente do email de login)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS recovery_email VARCHAR(255);

-- Data da última alteração de senha
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP DEFAULT NOW();

-- Flag se é o primeiro login
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN DEFAULT TRUE;

-- Contador de tentativas de login falhas
ALTER TABLE users
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;

-- Timestamp do bloqueio temporário
ALTER TABLE users
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;

-- ================================================
-- 3. TABELA DE TOKENS DE RECUPERAÇÃO DE SENHA
-- ================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,

  -- Informações de segurança
  request_ip VARCHAR(50),
  request_user_agent TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- ================================================
-- 4. TABELA DE LOG DE ALTERAÇÕES DE SENHA
-- ================================================
CREATE TABLE IF NOT EXISTS password_change_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Tipo de alteração
  change_type VARCHAR(50) NOT NULL, -- 'manual', 'recovery', 'forced'

  -- Informações de contexto
  changed_by_user_id INTEGER REFERENCES users(id),
  change_ip VARCHAR(50),
  change_user_agent TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para auditoria
CREATE INDEX IF NOT EXISTS idx_password_change_logs_user_id ON password_change_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_password_change_logs_created_at ON password_change_logs(created_at);

-- ================================================
-- 5. TABELA DE TENTATIVAS DE LOGIN
-- ================================================
CREATE TABLE IF NOT EXISTS login_attempts (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  success BOOLEAN NOT NULL,

  -- Informações de contexto
  attempt_ip VARCHAR(50),
  attempt_user_agent TEXT,
  failure_reason VARCHAR(255), -- 'invalid_password', 'user_not_found', 'account_locked'

  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para segurança
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON login_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(attempt_ip);

-- ================================================
-- 6. FUNÇÃO PARA LIMPAR TOKENS EXPIRADOS
-- ================================================
CREATE OR REPLACE FUNCTION clean_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_tokens
  WHERE expires_at < NOW() AND used = FALSE;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 7. FUNÇÃO PARA ATUALIZAR updated_at
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para system_config
DROP TRIGGER IF EXISTS update_system_config_updated_at ON system_config;
CREATE TRIGGER update_system_config_updated_at
BEFORE UPDATE ON system_config
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- 8. COMENTÁRIOS NAS TABELAS
-- ================================================
COMMENT ON TABLE system_config IS 'Configurações globais do sistema incluindo SMTP';
COMMENT ON TABLE password_reset_tokens IS 'Tokens para recuperação de senha com expiração';
COMMENT ON TABLE password_change_logs IS 'Log de auditoria de alterações de senha';
COMMENT ON TABLE login_attempts IS 'Registro de tentativas de login para segurança';

-- ================================================
-- FIM DA MIGRATION
-- ================================================
