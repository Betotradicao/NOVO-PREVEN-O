-- Atualizar URLs das imagens de bipagens (produtos)
UPDATE bips
SET image_url = REPLACE(image_url, ':9000/', ':9010/')
WHERE image_url LIKE '%:9000/%';

-- Atualizar URLs dos vídeos de bipagens
UPDATE bips
SET video_url = REPLACE(video_url, ':9000/', ':9010/')
WHERE video_url LIKE '%:9000/%';

-- Atualizar avatares dos colaboradores
UPDATE employees
SET avatar = REPLACE(avatar, ':9000/', ':9010/')
WHERE avatar LIKE '%:9000/%';

-- Mostrar quantos foram atualizados
SELECT 'Bipagens (imagens)' as tipo, COUNT(*) as atualizados FROM bips WHERE image_url LIKE '%:9010/%'
UNION ALL
SELECT 'Bipagens (videos)', COUNT(*) FROM bips WHERE video_url LIKE '%:9010/%'
UNION ALL
SELECT 'Colaboradores (avatares)', COUNT(*) FROM employees WHERE avatar LIKE '%:9010/%';
