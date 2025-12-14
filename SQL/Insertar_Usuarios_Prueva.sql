-- Script de Inserción de Datos para BO_System
-- Datos de prueba: Empresa, Célula, Permisos, Usuarios (Supervisores, Vendedores, Back Office)

USE `BO_System`;

-- =====================================================
-- 1. INSERTAR EMPRESA
-- =====================================================
INSERT INTO `empresa` (`nombre`, `cuit`, `entidad`) VALUES
('TelecomPlus S.A.', '30-71234567-8', 1);

SET @empresa_id = LAST_INSERT_ID();

-- =====================================================
-- 2. INSERTAR CÉLULAS
-- =====================================================
INSERT INTO `celula` (`id_celula`, `empresa`, `nombre`, `tipo_cuanta`) VALUES
(1, @empresa_id, 'Célula Centro', 'POSPAGO'),
(2, @empresa_id, 'Célula Norte', 'POSPAGO'),
(3, @empresa_id, 'Célula Sur', 'PREPAGO'),
(4, @empresa_id, 'Célula Administrativa', 'MIXTO');

-- =====================================================
-- 3. INSERTAR PERMISOS
-- =====================================================
INSERT INTO `permisos` (`nombre`) VALUES
('ADMIN'),
('SUPERADMIN'),
('SUPERVISOR'),
('VENDEDOR');

-- =====================================================
-- 4. INSERTAR PERSONAS Y USUARIOS - BACK OFFICE (4)
-- =====================================================

-- Back Office 1: Santiago Sanchez (SUPERADMIN)
INSERT INTO `persona` (`persona_id`, `nombre`, `apellido`, `fecha_nacimiento`, `documento`, `email`, `creado_en`, `telefono`, `tipo_documento`, `nacionalidad`, `genero`) VALUES
(UUID(), 'Santiago', 'Sanchez', '1988-03-15', '32456789', 'santiago.sanchez@telecomplus.com', CURDATE(), '1145678901', 'DNI', 'Argentina', 'Masculino');

SET @santiago_id = (SELECT `persona_id` FROM `persona` WHERE `documento` = '32456789');

INSERT INTO `usuario` (`legajo`, `exa`, `password_hash`, `persona_id`, `estado`, `celula`, `rol`) VALUES
('BO001', 'EXA00001', '$2y$10$abcdefghijklmnopqrstuvwxyz123456789ABCDEFGHIJKLMNOP', @santiago_id, 'ACTIVO', 4, 'BACK_OFFICE');

INSERT INTO `back_office` (`usuario`) VALUES (@santiago_id);

INSERT INTO `permisos_has_usuario` (`permisos_id`, `persona_id`) VALUES
(2, @santiago_id); -- SUPERADMIN

-- Back Office 2: María González
INSERT INTO `persona` (`persona_id`, `nombre`, `apellido`, `fecha_nacimiento`, `documento`, `email`, `creado_en`, `telefono`, `tipo_documento`, `nacionalidad`, `genero`) VALUES
(UUID(), 'María', 'González', '1990-07-22', '35123456', 'maria.gonzalez@telecomplus.com', CURDATE(), '1145678902', 'DNI', 'Argentina', 'Femenino');

SET @maria_id = (SELECT `persona_id` FROM `persona` WHERE `documento` = '35123456');

INSERT INTO `usuario` (`legajo`, `exa`, `password_hash`, `persona_id`, `estado`, `celula`, `rol`) VALUES
('BO002', 'EXA00002', '$2y$10$abcdefghijklmnopqrstuvwxyz123456789ABCDEFGHIJKLMNOP', @maria_id, 'ACTIVO', 4, 'BACK_OFFICE');

INSERT INTO `back_office` (`usuario`) VALUES (@maria_id);

INSERT INTO `permisos_has_usuario` (`permisos_id`, `persona_id`) VALUES
(1, @maria_id); -- ADMIN

-- Back Office 3: Carlos Pérez
INSERT INTO `persona` (`persona_id`, `nombre`, `apellido`, `fecha_nacimiento`, `documento`, `email`, `creado_en`, `telefono`, `tipo_documento`, `nacionalidad`, `genero`) VALUES
(UUID(), 'Carlos', 'Pérez', '1985-11-30', '30987654', 'carlos.perez@telecomplus.com', CURDATE(), '1145678903', 'DNI', 'Argentina', 'Masculino');

SET @carlos_id = (SELECT `persona_id` FROM `persona` WHERE `documento` = '30987654');

INSERT INTO `usuario` (`legajo`, `exa`, `password_hash`, `persona_id`, `estado`, `celula`, `rol`) VALUES
('BO003', 'EXA00003', '$2y$10$abcdefghijklmnopqrstuvwxyz123456789ABCDEFGHIJKLMNOP', @carlos_id, 'ACTIVO', 4, 'BACK_OFFICE');

INSERT INTO `back_office` (`usuario`) VALUES (@carlos_id);

INSERT INTO `permisos_has_usuario` (`permisos_id`, `persona_id`) VALUES
(1, @carlos_id); -- ADMIN

-- Back Office 4: Laura Martínez
INSERT INTO `persona` (`persona_id`, `nombre`, `apellido`, `fecha_nacimiento`, `documento`, `email`, `creado_en`, `telefono`, `tipo_documento`, `nacionalidad`, `genero`) VALUES
(UUID(), 'Laura', 'Martínez', '1992-05-18', '37456123', 'laura.martinez@telecomplus.com', CURDATE(), '1145678904', 'DNI', 'Argentina', 'Femenino');

SET @laura_id = (SELECT `persona_id` FROM `persona` WHERE `documento` = '37456123');

INSERT INTO `usuario` (`legajo`, `exa`, `password_hash`, `persona_id`, `estado`, `celula`, `rol`) VALUES
('BO004', 'EXA00004', '$2y$10$abcdefghijklmnopqrstuvwxyz123456789ABCDEFGHIJKLMNOP', @laura_id, 'ACTIVO', 4, 'BACK_OFFICE');

INSERT INTO `back_office` (`usuario`) VALUES (@laura_id);

INSERT INTO `permisos_has_usuario` (`permisos_id`, `persona_id`) VALUES
(1, @laura_id); -- ADMIN

-- =====================================================
-- 5. INSERTAR SUPERVISORES (3)
-- =====================================================

-- Supervisor 1: Jorge López
INSERT INTO `persona` (`persona_id`, `nombre`, `apellido`, `fecha_nacimiento`, `documento`, `email`, `creado_en`, `telefono`, `tipo_documento`, `nacionalidad`, `genero`) VALUES
(UUID(), 'Jorge', 'López', '1987-09-10', '33789456', 'jorge.lopez@telecomplus.com', CURDATE(), '1145678905', 'DNI', 'Argentina', 'Masculino');

SET @jorge_id = (SELECT `persona_id` FROM `persona` WHERE `documento` = '33789456');

INSERT INTO `usuario` (`legajo`, `exa`, `password_hash`, `persona_id`, `estado`, `celula`, `rol`) VALUES
('SUP01', 'EXA00101', '$2y$10$abcdefghijklmnopqrstuvwxyz123456789ABCDEFGHIJKLMNOP', @jorge_id, 'ACTIVO', 1, 'SUPERVISOR');

INSERT INTO `supervisor` (`usuario_id`) VALUES (@jorge_id);

INSERT INTO `permisos_has_usuario` (`permisos_id`, `persona_id`) VALUES
(3, @jorge_id); -- SUPERVISOR

-- Supervisor 2: Claudia Fernández
INSERT INTO `persona` (`persona_id`, `nombre`, `apellido`, `fecha_nacimiento`, `documento`, `email`, `creado_en`, `telefono`, `tipo_documento`, `nacionalidad`, `genero`) VALUES
(UUID(), 'Claudia', 'Fernández', '1989-12-05', '34567890', 'claudia.fernandez@telecomplus.com', CURDATE(), '1145678906', 'DNI', 'Argentina', 'Femenino');

SET @claudia_id = (SELECT `persona_id` FROM `persona` WHERE `documento` = '34567890');

INSERT INTO `usuario` (`legajo`, `exa`, `password_hash`, `persona_id`, `estado`, `celula`, `rol`) VALUES
('SUP02', 'EXA00102', '$2y$10$abcdefghijklmnopqrstuvwxyz123456789ABCDEFGHIJKLMNOP', @claudia_id, 'ACTIVO', 2, 'SUPERVISOR');

INSERT INTO `supervisor` (`usuario_id`) VALUES (@claudia_id);

INSERT INTO `permisos_has_usuario` (`permisos_id`, `persona_id`) VALUES
(3, @claudia_id); -- SUPERVISOR

-- Supervisor 3: Roberto Díaz
INSERT INTO `persona` (`persona_id`, `nombre`, `apellido`, `fecha_nacimiento`, `documento`, `email`, `creado_en`, `telefono`, `tipo_documento`, `nacionalidad`, `genero`) VALUES
(UUID(), 'Roberto', 'Díaz', '1986-04-20', '32678901', 'roberto.diaz@telecomplus.com', CURDATE(), '1145678907', 'DNI', 'Argentina', 'Masculino');

SET @roberto_id = (SELECT `persona_id` FROM `persona` WHERE `documento` = '32678901');

INSERT INTO `usuario` (`legajo`, `exa`, `password_hash`, `persona_id`, `estado`, `celula`, `rol`) VALUES
('SUP03', 'EXA00103', '$2y$10$abcdefghijklmnopqrstuvwxyz123456789ABCDEFGHIJKLMNOP', @roberto_id, 'ACTIVO', 3, 'SUPERVISOR');

INSERT INTO `supervisor` (`usuario_id`) VALUES (@roberto_id);

INSERT INTO `permisos_has_usuario` (`permisos_id`, `persona_id`) VALUES
(3, @roberto_id); -- SUPERVISOR

-- =====================================================
-- 6. INSERTAR VENDEDORES (30)
-- =====================================================

-- Vendedores Célula Centro (10)
INSERT INTO `persona` (`persona_id`, `nombre`, `apellido`, `fecha_nacimiento`, `documento`, `email`, `creado_en`, `telefono`, `tipo_documento`, `nacionalidad`, `genero`) VALUES
(UUID(), 'Juan', 'Rodríguez', '1995-01-15', '40123456', 'juan.rodriguez@telecomplus.com', CURDATE(), '1145678910', 'DNI', 'Argentina', 'Masculino'),
(UUID(), 'Ana', 'Silva', '1996-02-20', '40234567', 'ana.silva@telecomplus.com', CURDATE(), '1145678911', 'DNI', 'Argentina', 'Femenino'),
(UUID(), 'Pedro', 'Gómez', '1994-03-25', '39345678', 'pedro.gomez@telecomplus.com', CURDATE(), '1145678912', 'DNI', 'Argentina', 'Masculino'),
(UUID(), 'Lucía', 'Torres', '1997-04-30', '41456789', 'lucia.torres@telecomplus.com', CURDATE(), '1145678913', 'DNI', 'Argentina', 'Femenino'),
(UUID(), 'Martín', 'Ramírez', '1995-05-10', '40567890', 'martin.ramirez@telecomplus.com', CURDATE(), '1145678914', 'DNI', 'Argentina', 'Masculino'),
(UUID(), 'Sofía', 'Castro', '1996-06-15', '40678901', 'sofia.castro@telecomplus.com', CURDATE(), '1145678915', 'DNI', 'Argentina', 'Femenino'),
(UUID(), 'Diego', 'Morales', '1994-07-20', '39789012', 'diego.morales@telecomplus.com', CURDATE(), '1145678916', 'DNI', 'Argentina', 'Masculino'),
(UUID(), 'Valentina', 'Herrera', '1997-08-25', '41890123', 'valentina.herrera@telecomplus.com', CURDATE(), '1145678917', 'DNI', 'Argentina', 'Femenino'),
(UUID(), 'Facundo', 'Méndez', '1995-09-30', '40901234', 'facundo.mendez@telecomplus.com', CURDATE(), '1145678918', 'DNI', 'Argentina', 'Masculino'),
(UUID(), 'Camila', 'Vargas', '1996-10-05', '41012345', 'camila.vargas@telecomplus.com', CURDATE(), '1145678919', 'DNI', 'Argentina', 'Femenino');

-- Vendedores Célula Norte (10)
INSERT INTO `persona` (`persona_id`, `nombre`, `apellido`, `fecha_nacimiento`, `documento`, `email`, `creado_en`, `telefono`, `tipo_documento`, `nacionalidad`, `genero`) VALUES
(UUID(), 'Mateo', 'Ortiz', '1995-11-10', '40234560', 'mateo.ortiz@telecomplus.com', CURDATE(), '1145678920', 'DNI', 'Argentina', 'Masculino'),
(UUID(), 'Emma', 'Navarro', '1996-12-15', '40345671', 'emma.navarro@telecomplus.com', CURDATE(), '1145678921', 'DNI', 'Argentina', 'Femenino'),
(UUID(), 'Lucas', 'Ruiz', '1994-01-20', '39456782', 'lucas.ruiz@telecomplus.com', CURDATE(), '1145678922', 'DNI', 'Argentina', 'Masculino'),
(UUID(), 'Mía', 'Flores', '1997-02-25', '41567893', 'mia.flores@telecomplus.com', CURDATE(), '1145678923', 'DNI', 'Argentina', 'Femenino'),
(UUID(), 'Benjamín', 'Sosa', '1995-03-30', '40678904', 'benjamin.sosa@telecomplus.com', CURDATE(), '1145678924', 'DNI', 'Argentina', 'Masculino'),
(UUID(), 'Isabella', 'Acosta', '1996-04-05', '40789015', 'isabella.acosta@telecomplus.com', CURDATE(), '1145678925', 'DNI', 'Argentina', 'Femenino'),
(UUID(), 'Santiago', 'Medina', '1994-05-10', '39890126', 'santiago.medina@telecomplus.com', CURDATE(), '1145678926', 'DNI', 'Argentina', 'Masculino'),
(UUID(), 'Olivia', 'Rojas', '1997-06-15', '41901237', 'olivia.rojas@telecomplus.com', CURDATE(), '1145678927', 'DNI', 'Argentina', 'Femenino'),
(UUID(), 'Thiago', 'Paz', '1995-07-20', '40012348', 'thiago.paz@telecomplus.com', CURDATE(), '1145678928', 'DNI', 'Argentina', 'Masculino'),
(UUID(), 'Catalina', 'Luna', '1996-08-25', '40123459', 'catalina.luna@telecomplus.com', CURDATE(), '1145678929', 'DNI', 'Argentina', 'Femenino');

-- Vendedores Célula Sur (10)
INSERT INTO `persona` (`persona_id`, `nombre`, `apellido`, `fecha_nacimiento`, `documento`, `email`, `creado_en`, `telefono`, `tipo_documento`, `nacionalidad`, `genero`) VALUES
(UUID(), 'Nicolás', 'Romero', '1995-09-30', '40234561', 'nicolas.romero@telecomplus.com', CURDATE(), '1145678930', 'DNI', 'Argentina', 'Masculino'),
(UUID(), 'Martina', 'Molina', '1996-10-05', '40345672', 'martina.molina@telecomplus.com', CURDATE(), '1145678931', 'DNI', 'Argentina', 'Femenino'),
(UUID(), 'Joaquín', 'Peralta', '1994-11-10', '39456783', 'joaquin.peralta@telecomplus.com', CURDATE(), '1145678932', 'DNI', 'Argentina', 'Masculino'),
(UUID(), 'Renata', 'Ríos', '1997-12-15', '41567894', 'renata.rios@telecomplus.com', CURDATE(), '1145678933', 'DNI', 'Argentina', 'Femenino'),
(UUID(), 'Agustín', 'Vega', '1995-01-20', '40678905', 'agustin.vega@telecomplus.com', CURDATE(), '1145678934', 'DNI', 'Argentina', 'Masculino'),
(UUID(), 'Julieta', 'Cruz', '1996-02-25', '40789016', 'julieta.cruz@telecomplus.com', CURDATE(), '1145678935', 'DNI', 'Argentina', 'Femenino'),
(UUID(), 'Tomás', 'Benítez', '1994-03-30', '39890127', 'tomas.benitez@telecomplus.com', CURDATE(), '1145678936', 'DNI', 'Argentina', 'Masculino'),
(UUID(), 'Emilia', 'Ponce', '1997-04-05', '41901238', 'emilia.ponce@telecomplus.com', CURDATE(), '1145678937', 'DNI', 'Argentina', 'Femenino'),
(UUID(), 'Felipe', 'Cabrera', '1995-05-10', '40012349', 'felipe.cabrera@telecomplus.com', CURDATE(), '1145678938', 'DNI', 'Argentina', 'Masculino'),
(UUID(), 'Victoria', 'Campos', '1996-06-15', '40123450', 'victoria.campos@telecomplus.com', CURDATE(), '1145678939', 'DNI', 'Argentina', 'Femenino');

-- Insertar usuarios y vendedores para todos los 30 vendedores
-- Célula Centro (Vendedores 1-10)
INSERT INTO `usuario` (`legajo`, `exa`, `password_hash`, `persona_id`, `estado`, `celula`, `rol`)
SELECT 
    CONCAT('VEN', LPAD(ROW_NUMBER() OVER (ORDER BY documento), 2, '0')),
    CONCAT('EXA002', LPAD(ROW_NUMBER() OVER (ORDER BY documento), 2, '0')),
    '$2y$10$abcdefghijklmnopqrstuvwxyz123456789ABCDEFGHIJKLMNOP',
    persona_id,
    'ACTIVO',
    1,
    'VENDEDOR'
FROM `persona`
WHERE documento IN ('40123456', '40234567', '39345678', '41456789', '40567890', '40678901', '39789012', '41890123', '40901234', '41012345');

INSERT INTO `vendedor` (`usuario_id`)
SELECT persona_id FROM `persona`
WHERE documento IN ('40123456', '40234567', '39345678', '41456789', '40567890', '40678901', '39789012', '41890123', '40901234', '41012345');

INSERT INTO `permisos_has_usuario` (`permisos_id`, `persona_id`)
SELECT 4, persona_id FROM `persona`
WHERE documento IN ('40123456', '40234567', '39345678', '41456789', '40567890', '40678901', '39789012', '41890123', '40901234', '41012345');

-- Célula Norte (Vendedores 11-20)
INSERT INTO `usuario` (`legajo`, `exa`, `password_hash`, `persona_id`, `estado`, `celula`, `rol`)
SELECT 
    CONCAT('VEN', LPAD(10 + ROW_NUMBER() OVER (ORDER BY documento), 2, '0')),
    CONCAT('EXA003', LPAD(ROW_NUMBER() OVER (ORDER BY documento), 2, '0')),
    '$2y$10$abcdefghijklmnopqrstuvwxyz123456789ABCDEFGHIJKLMNOP',
    persona_id,
    'ACTIVO',
    2,
    'VENDEDOR'
FROM `persona`
WHERE documento IN ('40234560', '40345671', '39456782', '41567893', '40678904', '40789015', '39890126', '41901237', '40012348', '40123459');

INSERT INTO `vendedor` (`usuario_id`)
SELECT persona_id FROM `persona`
WHERE documento IN ('40234560', '40345671', '39456782', '41567893', '40678904', '40789015', '39890126', '41901237', '40012348', '40123459');

INSERT INTO `permisos_has_usuario` (`permisos_id`, `persona_id`)
SELECT 4, persona_id FROM `persona`
WHERE documento IN ('40234560', '40345671', '39456782', '41567893', '40678904', '40789015', '39890126', '41901237', '40012348', '40123459');

-- Célula Sur (Vendedores 21-30)
INSERT INTO `usuario` (`legajo`, `exa`, `password_hash`, `persona_id`, `estado`, `celula`, `rol`)
SELECT 
    CONCAT('VEN', LPAD(20 + ROW_NUMBER() OVER (ORDER BY documento), 2, '0')),
    CONCAT('EXA004', LPAD(ROW_NUMBER() OVER (ORDER BY documento), 2, '0')),
    '$2y$10$abcdefghijklmnopqrstuvwxyz123456789ABCDEFGHIJKLMNOP',
    persona_id,
    'ACTIVO',
    3,
    'VENDEDOR'
FROM `persona`
WHERE documento IN ('40234561', '40345672', '39456783', '41567894', '40678905', '40789016', '39890127', '41901238', '40012349', '40123450');

INSERT INTO `vendedor` (`usuario_id`)
SELECT persona_id FROM `persona`
WHERE documento IN ('40234561', '40345672', '39456783', '41567894', '40678905', '40789016', '39890127', '41901238', '40012349', '40123450');

INSERT INTO `permisos_has_usuario` (`permisos_id`, `persona_id`)
SELECT 4, persona_id FROM `persona`
WHERE documento IN ('40234561', '40345672', '39456783', '41567894', '40678905', '40789016', '39890127', '41901238', '40012349', '40123450');

-- =====================================================
-- RESUMEN DE DATOS INSERTADOS
-- =====================================================
SELECT '=== RESUMEN DE INSERCIÓN ===' AS '';
SELECT CONCAT('Empresa: ', COUNT(*), ' registro(s)') AS 'Total' FROM `empresa`;
SELECT CONCAT('Células: ', COUNT(*), ' registro(s)') AS 'Total' FROM `celula`;
SELECT CONCAT('Permisos: ', COUNT(*), ' registro(s)') AS 'Total' FROM `permisos`;
SELECT CONCAT('Back Office: ', COUNT(*), ' usuario(s)') AS 'Total' FROM `back_office`;
SELECT CONCAT('Supervisores: ', COUNT(*), ' usuario(s)') AS 'Total' FROM `supervisor`;
SELECT CONCAT('Vendedores: ', COUNT(*), ' usuario(s)') AS 'Total' FROM `vendedor`;
SELECT CONCAT('Total Usuarios: ', COUNT(*), ' usuario(s)') AS 'Total' FROM `usuario`;

-- Verificar Santiago Sanchez (SUPERADMIN)
SELECT 
    p.nombre,
    p.apellido,
    u.legajo,
    u.rol,
    per.nombre AS permiso,
    c.nombre AS celula
FROM `persona` p
JOIN `usuario` u ON p.persona_id = u.persona_id
JOIN `permisos_has_usuario` pu ON p.persona_id = pu.persona_id
JOIN `permisos` per ON pu.permisos_id = per.permisos_id
JOIN `celula` c ON u.celula = c.id_celula
WHERE p.nombre = 'Santiago' AND p.apellido = 'Sanchez';