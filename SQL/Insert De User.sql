-- =======================
-- Personas
-- =======================
INSERT INTO persona (id_persona, nombre, apellido, fecha_nacimiento, documento, email, creado_en, telefono, tipo_documento, nacionalidad, genero)
VALUES
('11111111-1111-1111-1111-111111111111','Santiago Javier','Sanchez','2002-03-12','44077000','santigos@gamil.com',CURDATE(),'35716789','DNI','Argentina','Masculino'),
('22222222-2222-2222-2222-222222222222','Clark','Kent','1985-06-18','44077001','clark.kent@dailyplanet.com',CURDATE(),'35716790','DNI','Krypton','Masculino'),
('33333333-3333-3333-3333-333333333333','Bruce','Wayne','1978-02-19','44077002','bruce.wayne@wayneenterprises.com',CURDATE(),'35716791','DNI','USA','Masculino'),
('44444444-4444-4444-4444-444444444444','Tony','Stark','1980-05-29','44077003','tony.stark@starkindustries.com',CURDATE(),'35716792','DNI','USA','Masculino'),
('55555555-5555-5555-5555-555555555555','Diana','Prince','1984-03-25','44077004','diana.prince@themyscira.com',CURDATE(),'35716793','DNI','Themyscira','Femenino'),
('66666666-6666-6666-6666-666666666666','Natasha','Romanoff','1987-11-22','44077005','natasha.romanoff@shield.com',CURDATE(),'35716794','DNI','USA','Femenino'),
('77777777-7777-7777-7777-777777777777','Nick','Fury','1972-12-10','44077006','nick.fury@shield.com',CURDATE(),'35716795','DNI','USA','Masculino');

-- Vendedores (solo muestro los primeros 5, replicá para los 30 cambiando UUID y documento)
INSERT INTO persona (id_persona, nombre, apellido, fecha_nacimiento, documento, email, creado_en, telefono, tipo_documento, nacionalidad, genero)
VALUES
('88888888-8888-8888-8888-888888888888','Peter','Parker','1990-01-01','44077007','peter.parker@heroes.com',CURDATE(),'35716796','DNI','USA','Masculino'),
('99999999-9999-9999-9999-999999999999','Wade','Wilson','1990-01-01','44077008','wade.wilson@heroes.com',CURDATE(),'35716797','DNI','USA','Masculino'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Barry','Allen','1990-01-01','44077009','barry.allen@heroes.com',CURDATE(),'35716798','DNI','USA','Masculino'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','Steve','Rogers','1990-01-01','44077010','steve.rogers@heroes.com',CURDATE(),'35716799','DNI','USA','Masculino'),
('cccccccc-cccc-cccc-cccc-cccccccccccc','Scott','Lang','1990-01-01','44077011','scott.lang@heroes.com',CURDATE(),'35716800','DNI','USA','Masculino');

-- =======================
-- Usuarios
-- =======================
INSERT INTO usuario (legajo, rol, exa, password_hash, persona_id, empresa_id_empresa, estado)
VALUES
('00000','SUPERADMINISTRADOR','exa0000','123456','11111111-1111-1111-1111-111111111111',1,'ACTIVO'),
('00001','ADMINISTRADOR','exa0001','123456','22222222-2222-2222-2222-222222222222',1,'ACTIVO'),
('00002','SUPERVISOR','exa0002','123456','33333333-3333-3333-3333-333333333333',1,'ACTIVO'),
('00003','SUPERVISOR','exa0003','123456','44444444-4444-4444-4444-444444444444',1,'ACTIVO'),
('00004','SUPERVISOR','exa0004','123456','55555555-5555-5555-5555-555555555555',1,'ACTIVO'),
('00005','BACK_OFFICE','exa0005','123456','66666666-6666-6666-6666-666666666666',1,'ACTIVO'),
('00006','BACK_OFFICE','exa0006','123456','77777777-7777-7777-7777-777777777777',1,'ACTIVO');

-- Vendedores (repetir según UUID y persona_id)
INSERT INTO usuario (legajo, rol, exa, password_hash, persona_id, empresa_id_empresa, estado)
VALUES
('00007','VENDEDOR','exa0007','123456','88888888-8888-8888-8888-888888888888',1,'ACTIVO'),
('00008','VENDEDOR','exa0008','123456','99999999-9999-9999-9999-999999999999',1,'ACTIVO'),
('00009','VENDEDOR','exa0009','123456','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',1,'ACTIVO'),
('00010','VENDEDOR','exa0010','123456','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',1,'ACTIVO'),
('00011','VENDEDOR','exa0011','123456','cccccccc-cccc-cccc-cccc-cccccccccccc',1,'ACTIVO');

-- Supervisores
INSERT INTO supervisor(usuario) VALUES
('33333333-3333-3333-3333-333333333333'),
('44444444-4444-4444-4444-444444444444'),
('55555555-5555-5555-5555-555555555555');

-- Back Office (asignados a supervisores, ejemplo: Natasha -> Bruce, Nick -> Tony)
INSERT INTO back_office(usuario_id, supervisor) VALUES
('66666666-6666-6666-6666-666666666666','33333333-3333-3333-3333-333333333333'),
('77777777-7777-7777-7777-777777777777','44444444-4444-4444-4444-444444444444');

-- Vendedores (asignados a supervisores, ejemplo: Peter -> Bruce, Wade -> Tony, Barry -> Diana)
INSERT INTO vendedor(usuario, supervisor) VALUES
('88888888-8888-8888-8888-888888888888','33333333-3333-3333-3333-333333333333'),
('99999999-9999-9999-9999-999999999999','44444444-4444-4444-4444-444444444444'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','55555555-5555-5555-5555-555555555555'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','33333333-3333-3333-3333-333333333333'),
('cccccccc-cccc-cccc-cccc-cccccccccccc','44444444-4444-4444-4444-444444444444');
