-- sistema_musical_seed_minimo.sql
-- Tipos de operación mínimos que el código necesita (ids fijos usados por los controladores):
-- 1 INSERT · 2 UPDATE · 3 DELETE · 4 LOGIN
-- Si dispones de la base local completa, es preferible exportar sus datos reales:
--   mysqldump --no-create-info sistema_musical tipo_operacion > seed_tipo_operacion.sql
INSERT INTO tipo_operacion (id_tipo, nombre, descripcion) VALUES
  (1, 'INSERT', 'Creación de registro'),
  (2, 'UPDATE', 'Actualización de registro'),
  (3, 'DELETE', 'Eliminación de registro'),
  (4, 'LOGIN',  'Inicio de sesión')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);
