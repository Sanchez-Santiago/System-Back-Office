-- =====================================================
-- MIGRACIÓN COMPLETA DE MYSQL A POSTGRESQL CON SUPABASE
-- System-Back-Office
-- =====================================================
-- Este script crea todas las tablas en PostgreSQL con la
-- sintaxis correcta y constraints de CHECK para reemplazar ENUMs
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA PERSONA
-- =====================================================
CREATE TABLE IF NOT EXISTS public.persona (
  persona_id UUID NOT NULL DEFAULT uuid_generate_v4(),
  nombre VARCHAR NOT NULL,
  apellido VARCHAR NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  documento VARCHAR NOT NULL,
  tipo_documento VARCHAR NOT NULL,
  nacionalidad VARCHAR NOT NULL,
  genero VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  telefono VARCHAR,
  creado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  CONSTRAINT persona_pkey PRIMARY KEY (persona_id),
  CONSTRAINT persona_email_unique UNIQUE (email),
  CONSTRAINT persona_documento_unique UNIQUE (documento)
);

-- =====================================================
-- TABLA EMPRESA
-- =====================================================
CREATE TABLE IF NOT EXISTS public.empresa (
  id_empresa INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,
  nombre VARCHAR NOT NULL,
  cuit VARCHAR NOT NULL,
  entidad INTEGER NOT NULL,
  CONSTRAINT empresa_pkey PRIMARY KEY (id_empresa),
  CONSTRAINT empresa_cuit_unique UNIQUE (cuit)
);

-- =====================================================
-- TABLA CELULA
-- =====================================================
CREATE TABLE IF NOT EXISTS public.celula (
  id_celula INTEGER NOT NULL,
  empresa INTEGER NOT NULL,
  nombre VARCHAR NOT NULL DEFAULT 'default',
  tipo_cuenta VARCHAR NOT NULL,
  CONSTRAINT celula_pkey PRIMARY KEY (id_celula),
  CONSTRAINT fk_celula_empresa FOREIGN KEY (empresa) REFERENCES public.empresa(id_empresa)
);

-- =====================================================
-- TABLA PERMISOS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.permisos (
  permisos_id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,
  nombre VARCHAR NOT NULL UNIQUE,
  CONSTRAINT permisos_pkey PRIMARY KEY (permisos_id)
);

-- =====================================================
-- TABLA USUARIO
-- =====================================================
CREATE TABLE IF NOT EXISTS public.usuario (
  persona_id UUID NOT NULL,
  legajo VARCHAR NOT NULL,
  exa VARCHAR NOT NULL,
  estado VARCHAR NOT NULL DEFAULT 'ACTIVO',
  celula INTEGER NOT NULL,
  rol VARCHAR NOT NULL CHECK (rol IN ('VENDEDOR', 'SUPERVISOR', 'BACK_OFFICE')),
  CONSTRAINT usuario_pkey PRIMARY KEY (persona_id),
  CONSTRAINT fk_usuario_persona FOREIGN KEY (persona_id) REFERENCES public.persona(persona_id) ON DELETE CASCADE,
  CONSTRAINT fk_usuario_celula FOREIGN KEY (celula) REFERENCES public.celula(id_celula),
  CONSTRAINT usuario_legajo_unique UNIQUE (legajo),
  CONSTRAINT usuario_exa_unique UNIQUE (exa)
);

-- =====================================================
-- TABLA PASSWORD (HISTORIAL DE CONTRASEÑAS)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.password (
  password_id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,
  password_hash VARCHAR NOT NULL,
  usuario_persona_id UUID NOT NULL,
  fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  activa BOOLEAN DEFAULT true,
  intentos_fallidos INTEGER DEFAULT 0,
  CONSTRAINT password_pkey PRIMARY KEY (password_id),
  CONSTRAINT fk_password_usuario FOREIGN KEY (usuario_persona_id) REFERENCES public.usuario(persona_id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA PERMISOS_HAS_USUARIO
-- =====================================================
CREATE TABLE IF NOT EXISTS public.permisos_has_usuario (
  permisos_id INTEGER NOT NULL,
  persona_id UUID NOT NULL,
  CONSTRAINT permisos_has_usuario_pkey PRIMARY KEY (permisos_id, persona_id),
  CONSTRAINT fk_permiso FOREIGN KEY (permisos_id) REFERENCES public.permisos(permisos_id) ON DELETE CASCADE,
  CONSTRAINT fk_permiso_usuario FOREIGN KEY (persona_id) REFERENCES public.usuario(persona_id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA CLIENTE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cliente (
  persona_id UUID NOT NULL,
  CONSTRAINT cliente_pkey PRIMARY KEY (persona_id),
  CONSTRAINT fk_cliente_persona FOREIGN KEY (persona_id) REFERENCES public.persona(persona_id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA EMPRESA_ORIGEN
-- =====================================================
CREATE TABLE IF NOT EXISTS public.empresa_origen (
  empresa_origen_id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,
  nombre_empresa VARCHAR NOT NULL,
  pais VARCHAR NOT NULL,
  CONSTRAINT empresa_origen_pkey PRIMARY KEY (empresa_origen_id)
);

-- =====================================================
-- TABLA PLAN
-- =====================================================
CREATE TABLE IF NOT EXISTS public.plan (
  plan_id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,
  nombre VARCHAR NOT NULL UNIQUE,
  gigabyte NUMERIC NOT NULL,
  llamadas VARCHAR NOT NULL,
  mensajes VARCHAR NOT NULL,
  whatsapp VARCHAR NOT NULL,
  roaming VARCHAR NOT NULL,
  beneficios VARCHAR,
  precio INTEGER NOT NULL,
  fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  empresa_origen_id INTEGER NOT NULL,
  CONSTRAINT plan_pkey PRIMARY KEY (plan_id),
  CONSTRAINT fk_plan_empresa_origen FOREIGN KEY (empresa_origen_id) REFERENCES public.empresa_origen(empresa_origen_id)
);

-- =====================================================
-- TABLA PROMOCION
-- =====================================================
CREATE TABLE IF NOT EXISTS public.promocion (
  promocion_id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,
  nombre VARCHAR NOT NULL UNIQUE,
  descuento VARCHAR,
  beneficios VARCHAR,
  fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  empresa_origen_id INTEGER NOT NULL,
  CONSTRAINT promocion_pkey PRIMARY KEY (promocion_id),
  CONSTRAINT fk_promocion_empresa_origen FOREIGN KEY (empresa_origen_id) REFERENCES public.empresa_origen(empresa_origen_id)
);

-- =====================================================
-- TABLA VENTA
-- =====================================================
CREATE TABLE IF NOT EXISTS public.venta (
  venta_id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,
  sds VARCHAR NOT NULL,
  chip VARCHAR DEFAULT 'SIM' CHECK (chip IN ('SIM', 'ESIM')),
  stl VARCHAR,
  tipo_venta VARCHAR NOT NULL CHECK (tipo_venta IN ('PORTABILIDAD', 'LINEA_NUEVA')),
  sap VARCHAR,
  cliente_id UUID NOT NULL,
  vendedor_id UUID NOT NULL,
  multiple INTEGER DEFAULT 0,
  plan_id INTEGER NOT NULL,
  promocion_id INTEGER NOT NULL,
  fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  empresa_origen_id INTEGER NOT NULL,
  CONSTRAINT venta_pkey PRIMARY KEY (venta_id),
  CONSTRAINT fk_venta_sap FOREIGN KEY (sap) REFERENCES public.correo(sap_id),
  CONSTRAINT fk_venta_cliente FOREIGN KEY (cliente_id) REFERENCES public.cliente(persona_id),
  CONSTRAINT fk_venta_vendedor FOREIGN KEY (vendedor_id) REFERENCES public.usuario(persona_id),
  CONSTRAINT fk_venta_plan FOREIGN KEY (plan_id) REFERENCES public.plan(plan_id),
  CONSTRAINT fk_venta_promocion FOREIGN KEY (promocion_id) REFERENCES public.promocion(promocion_id),
  CONSTRAINT fk_venta_empresa_origen FOREIGN KEY (empresa_origen_id) REFERENCES public.empresa_origen(empresa_origen_id),
  CONSTRAINT venta_sds_unique UNIQUE (sds)
);

-- =====================================================
-- TABLA PORTABILIDAD
-- =====================================================
CREATE TABLE IF NOT EXISTS public.portabilidad (
  venta_id INTEGER NOT NULL,
  spn VARCHAR NOT NULL,
  empresa_origen VARCHAR NOT NULL,
  mercado_origen VARCHAR NOT NULL CHECK (mercado_origen IN ('PREPAGO', 'POSPAGO')),
  numero_portar VARCHAR NOT NULL,
  pin VARCHAR,
  fecha_portacion TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT portabilidad_pkey PRIMARY KEY (venta_id),
  CONSTRAINT fk_portabilidad_venta FOREIGN KEY (venta_id) REFERENCES public.venta(venta_id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA LINEA_NUEVA
-- =====================================================
CREATE TABLE IF NOT EXISTS public.linea_nueva (
  venta_id INTEGER NOT NULL,
  CONSTRAINT linea_nueva_pkey PRIMARY KEY (venta_id),
  CONSTRAINT fk_linea_nueva_venta FOREIGN KEY (venta_id) REFERENCES public.venta(venta_id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA ESTADO (ESTADO DE VENTA)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.estado (
  estado_id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,
  venta_id INTEGER NOT NULL,
  estado VARCHAR NOT NULL,
  descripcion VARCHAR NOT NULL,
  fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  usuario_id UUID NOT NULL,
  CONSTRAINT estado_pkey PRIMARY KEY (estado_id),
  CONSTRAINT fk_estado_venta FOREIGN KEY (venta_id) REFERENCES public.venta(venta_id),
  CONSTRAINT fk_estado_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuario(persona_id)
);

-- =====================================================
-- TABLA CORREO
-- =====================================================
CREATE TABLE IF NOT EXISTS public.correo (
  sap_id VARCHAR NOT NULL,
  telefono_contacto VARCHAR NOT NULL,
  telefono_alternativo VARCHAR,
  destinatario VARCHAR NOT NULL,
  persona_autorizada VARCHAR,
  direccion VARCHAR NOT NULL,
  numero_casa INTEGER NOT NULL,
  entre_calles VARCHAR,
  barrio VARCHAR,
  localidad VARCHAR NOT NULL,
  departamento VARCHAR NOT NULL,
  codigo_postal INTEGER NOT NULL,
  fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  fecha_limite DATE NOT NULL,
  piso VARCHAR,
  departamento_numero VARCHAR,
  geolocalizacion VARCHAR,
  comentario_cartero VARCHAR,
  CONSTRAINT correo_pkey PRIMARY KEY (sap_id)
);

-- =====================================================
-- TABLA ESTADO_CORREO
-- =====================================================
CREATE TABLE IF NOT EXISTS public.estado_correo (
  estado_correo_id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,
  sap_id VARCHAR NOT NULL,
  estado VARCHAR NOT NULL,
  descripcion VARCHAR,
  fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  usuario_id UUID NOT NULL,
  CONSTRAINT estado_correo_pkey PRIMARY KEY (estado_correo_id),
  CONSTRAINT fk_estado_correo_correo FOREIGN KEY (sap_id) REFERENCES public.correo(sap_id) ON DELETE CASCADE,
  CONSTRAINT fk_estado_correo_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuario(persona_id)
);

-- =====================================================
-- TABLAS DE ROLES ESPECÍFICOS
-- =====================================================

-- VENDEDOR
CREATE TABLE IF NOT EXISTS public.vendedor (
  vendedor_id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,
  usuario_id UUID NOT NULL UNIQUE,
  CONSTRAINT vendedor_pkey PRIMARY KEY (vendedor_id),
  CONSTRAINT fk_vendedor_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuario(persona_id) ON DELETE CASCADE
);

-- SUPERVISOR
CREATE TABLE IF NOT EXISTS public.supervisor (
  supervisor_id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,
  usuario_id UUID NOT NULL UNIQUE,
  CONSTRAINT supervisor_pkey PRIMARY KEY (supervisor_id),
  CONSTRAINT fk_supervisor_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuario(persona_id) ON DELETE CASCADE
);

-- BACK_OFFICE
CREATE TABLE IF NOT EXISTS public.back_office (
  back_office_id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY,
  usuario UUID NOT NULL UNIQUE,
  CONSTRAINT back_office_pkey PRIMARY KEY (back_office_id),
  CONSTRAINT fk_backoffice_usuario FOREIGN KEY (usuario) REFERENCES public.usuario(persona_id) ON DELETE CASCADE
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices de búsqueda
CREATE INDEX IF NOT EXISTS idx_persona_email ON public.persona(email);
CREATE INDEX IF NOT EXISTS idx_persona_documento ON public.persona(documento);
CREATE INDEX IF NOT EXISTS idx_usuario_legajo ON public.usuario(legajo);
CREATE INDEX IF NOT EXISTS idx_usuario_exa ON public.usuario(exa);
CREATE INDEX IF NOT EXISTS idx_venta_sds ON public.venta(sds);
CREATE INDEX IF NOT EXISTS idx_venta_cliente_id ON public.venta(cliente_id);
CREATE INDEX IF NOT EXISTS idx_venta_vendedor_id ON public.venta(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_venta_fecha_creacion ON public.venta(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_correo_sap_id ON public.correo(sap_id);
CREATE INDEX IF NOT EXISTS idx_correo_fecha_limite ON public.correo(fecha_limite);

-- =====================================================
-- DATOS INICIALES (PERMISOS)
-- =====================================================

INSERT INTO public.permisos (nombre) VALUES 
('LECTURA_CLIENTES'),
('ESCRITURA_CLIENTES'),
('LECTURA_VENTAS'),
('ESCRITURA_VENTAS'),
('LECTURA_USUARIOS'),
('ESCRITURA_USUARIOS'),
('LECTURA_REPORTES'),
('ADMINISTRACION'),
('SUPERVISION')
ON CONFLICT (nombre) DO NOTHING;

-- =====================================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE public.persona IS 'Tabla principal de personas del sistema';
COMMENT ON TABLE public.usuario IS 'Usuarios del sistema con roles específicos';
COMMENT ON TABLE public.password IS 'Historial de contraseñas con soporte para versiones anteriores';
COMMENT ON TABLE public.venta IS 'Registro principal de ventas del sistema';
COMMENT ON COLUMN public.venta.tipo_venta IS 'Tipo de venta: PORTABILIDAD o LINEA_NUEVA';
COMMENT ON COLUMN public.venta.chip IS 'Tipo de chip: SIM o ESIM';
COMMENT ON COLUMN public.usuario.rol IS 'Rol del usuario: VENDEDOR, SUPERVISOR o BACK_OFFICE';

-- =====================================================
-- TRIGGERS (OPCIONAL - PARA AUDITORÍA)
-- =====================================================

-- Ejemplo de trigger para auditar cambios en ventas
-- CREATE OR REPLACE FUNCTION audit_venta_changes()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO venta_audit (venta_id, accion, fecha_cambio, usuario_cambio)
--   VALUES (NEW.venta_id, TG_OP, now(), current_user);
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER trigger_venta_audit
-- AFTER INSERT OR UPDATE ON public.venta
-- FOR EACH ROW EXECUTE FUNCTION audit_venta_changes();

-- =====================================================
-- POLÍTICAS DE SEGURIDAD (RLS - ROW LEVEL SECURITY)
-- =====================================================

-- Ejemplo de RLS para tabla ventas (descomentar si se necesita)
-- ALTER TABLE public.venta ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Solo vendedores pueden ver sus ventas"
-- ON public.venta FOR SELECT
-- USING (vendedor_id = current_setting('app.current_user_id')::uuid);
-- 
-- CREATE POLICY "Supervisores pueden ver ventas de su equipo"
-- ON public.venta FOR SELECT
-- USING (
--   vendedor_id IN (
--     SELECT persona_id FROM usuario WHERE celula = current_setting('app.celula_id')::integer
--   )
-- );

-- =====================================================
-- FIN DEL SCRIPT DE MIGRACIÓN
-- =====================================================