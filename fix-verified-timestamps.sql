-- Script para corrigir horários dos registros VERIFICADOS
-- Remove 6 horas apenas dos registros com status 'verified'

BEGIN;

-- Primeiro, vamos ver quantos registros serão afetados
SELECT
    COUNT(*) as total_verificados,
    MIN(event_date) as primeiro_evento,
    MAX(event_date) as ultimo_evento
FROM bips
WHERE status = 'verified';

-- Atualiza apenas os registros VERIFICADOS, subtraindo 6 horas
UPDATE bips
SET event_date = event_date - INTERVAL '6 hours'
WHERE status = 'verified';

-- Confirma quantos foram atualizados
SELECT
    COUNT(*) as total_atualizados,
    MIN(event_date) as primeiro_evento_corrigido,
    MAX(event_date) as ultimo_evento_corrigido
FROM bips
WHERE status = 'verified';

-- Se tudo estiver OK, descomente a linha abaixo para confirmar
-- COMMIT;

-- Se algo estiver errado, descomente a linha abaixo para cancelar
ROLLBACK;
