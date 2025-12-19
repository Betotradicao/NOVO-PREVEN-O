-- ============================================================================
-- CONFIGURAÇÕES DO DVR NETSDK INTELBRAS
-- ============================================================================

-- Adicionar ou atualizar configurações do DVR NetSDK

-- 1. Habilitar NetSDK (desabilitado por padrão para segurança)
INSERT INTO configurations (key, value, description, category, created_at, updated_at)
VALUES ('dvr_netsdk_enabled', 'false', 'Habilita integração NetSDK', 'DVR', NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- 2. IP do DVR
INSERT INTO configurations (key, value, description, category, created_at, updated_at)
VALUES ('dvr_ip', '10.6.1.123', 'IP do DVR Intelbras', 'DVR', NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- 3. Porta do DVR
INSERT INTO configurations (key, value, description, category, created_at, updated_at)
VALUES ('dvr_port', '37777', 'Porta do DVR (padrão 37777)', 'DVR', NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- 4. Usuário do DVR
INSERT INTO configurations (key, value, description, category, created_at, updated_at)
VALUES ('dvr_username', 'admin', 'Usuário do DVR', 'DVR', NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- 5. Senha do DVR
INSERT INTO configurations (key, value, description, category, created_at, updated_at)
VALUES ('dvr_password', 'beto3107@', 'Senha do DVR', 'DVR', NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- 6. Número de canais
INSERT INTO configurations (key, value, description, category, created_at, updated_at)
VALUES ('dvr_channel_count', '16', 'Número de canais do DVR', 'DVR', NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- 7. Caminho para snapshots
INSERT INTO configurations (key, value, description, category, created_at, updated_at)
VALUES ('dvr_snapshot_path', './uploads/dvr-snapshots', 'Diretório para snapshots do DVR', 'DVR', NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Listar todas as configurações do DVR
SELECT
    key,
    value,
    description,
    category,
    created_at,
    updated_at
FROM configurations
WHERE category = 'DVR'
ORDER BY key;

-- ============================================================================
-- PARA HABILITAR O NETSDK (EXECUTE APÓS INSTALAR DEPENDÊNCIAS)
-- ============================================================================

-- UPDATE configurations SET value='true' WHERE key='dvr_netsdk_enabled';

-- ============================================================================
-- NOTAS
-- ============================================================================

-- 1. O NetSDK está DESABILITADO por padrão para segurança
-- 2. Habilite apenas após instalar as dependências FFI (ffi-napi, ref-napi)
-- 3. Para habilitar, execute:
--    UPDATE configurations SET value='true' WHERE key='dvr_netsdk_enabled';
-- 4. Verifique se as credenciais estão corretas antes de habilitar
-- 5. O diretório de snapshots será criado automaticamente se não existir
