-- Zerar equipamentos e sessions
DELETE FROM equipment_sessions;
DELETE FROM equipments;
ALTER SEQUENCE equipments_id_seq RESTART WITH 1;
SELECT COUNT(*) as total_equipamentos FROM equipments;
