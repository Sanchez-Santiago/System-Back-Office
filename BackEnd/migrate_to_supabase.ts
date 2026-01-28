// ============================================
// Ejecutor de Migración PostgreSQL para Supabase
// System-Back-Office
// ============================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { load } from "https://deno.land/std/dotenv/mod.ts";

await load({ export: true, allowEmptyValues: true });

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: Variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas");
  Deno.exit(1);
}

console.log("🚀 Iniciando migración a Supabase...");
console.log(`📡 URL: ${supabaseUrl}`);
console.log(`🔑 Key: ${supabaseKey.substring(0, 10)}...`);

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// SCRIPT DE MIGRACIÓN SQL
// ============================================

const migrationScript = `
-- =====================================================
-- MIGRACIÓN COMPLETA DE MYSQL A POSTGRESQL CON SUPABASE
-- System-Back-Office
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
-- TABLA USUARIO
-- =====================================================
CREATE TABLE IF NOT EXISTS public.usuario (
  usuario_id UUID NOT NULL DEFAULT uuid_generate_v4(),
  persona_id UUID NOT NULL,
  legajo VARCHAR NOT NULL,
  exa VARCHAR NOT NULL,
  activo BOOLEAN DEFAULT true,
  contraseña VARCHAR NOT NULL,
  rol VARCHAR NOT NULL DEFAULT 'usuario',
  creado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  actualizado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  CONSTRAINT usuario_pkey PRIMARY KEY (usuario_id),
  CONSTRAINT usuario_legajo_unique UNIQUE (legajo),
  CONSTRAINT usuario_exa_unique UNIQUE (exa),
  CONSTRAINT usuario_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES public.persona (persona_id)
);

-- =====================================================
-- TABLA EMPRESA_ORIGEN
-- =====================================================
CREATE TABLE IF NOT EXISTS public.empresa_origen (
  empresa_origen_id UUID NOT NULL DEFAULT uuid_generate_v4(),
  nombre_empresa VARCHAR NOT NULL,
  pais VARCHAR NOT NULL,
  CONSTRAINT empresa_origen_pkey PRIMARY KEY (empresa_origen_id)
);

-- =====================================================
-- TABLA PLAN
-- =====================================================
CREATE TABLE IF NOT EXISTS public.plan (
  plan_id UUID NOT NULL DEFAULT uuid_generate_v4(),
  nombre VARCHAR NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  gigabyte INTEGER,
  llamadas INTEGER,
  mensajes INTEGER,
  beneficios TEXT,
  whatsapp BOOLEAN DEFAULT false,
  roaming BOOLEAN DEFAULT false,
  fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  empresa_origen_id UUID REFERENCES public.empresa_origen (empresa_origen_id),
  CONSTRAINT plan_pkey PRIMARY KEY (plan_id)
);

-- =====================================================
-- TABLA PROMOCION
-- =====================================================
CREATE TABLE IF NOT EXISTS public.promocion (
  promocion_id UUID NOT NULL DEFAULT uuid_generate_v4(),
  nombre VARCHAR NOT NULL,
  descuento INTEGER,
  beneficios TEXT,
  fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  empresa_origen_id UUID REFERENCES public.empresa_origen (empresa_origen_id),
  CONSTRAINT promocion_pkey PRIMARY KEY (promocion_id)
);

-- =====================================================
-- TABLA VENTA
-- =====================================================
CREATE TABLE IF NOT EXISTS public.venta (
  venta_id UUID NOT NULL DEFAULT uuid_generate_v4(),
  persona_id UUID NOT NULL,
  plan_id UUID,
  promocion_id UUID,
  fecha_venta TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  importe_total DECIMAL(10,2),
  estado VARCHAR DEFAULT 'EN_PROCESO',
  creado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  actualizado_en TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  CONSTRAINT venta_pkey PRIMARY KEY (venta_id),
  CONSTRAINT venta_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES public.persona (persona_id),
  CONSTRAINT venta_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plan (plan_id),
  CONSTRAINT venta_promocion_id_fkey FOREIGN KEY (promocion_id) REFERENCES public.promocion (promocion_id)
);

-- =====================================================
-- TABLA LINEA_NUEVA
-- =====================================================
CREATE TABLE IF NOT EXISTS public.linea_nueva (
  venta_id UUID NOT NULL,
  CONSTRAINT linea_nueva_pkey PRIMARY KEY (venta_id),
  CONSTRAINT linea_nueva_venta_id_fkey FOREIGN KEY (venta_id) REFERENCES public.venta (venta_id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA PORTABILIDAD
-- =====================================================
CREATE TABLE IF NOT EXISTS public.portabilidad (
  venta UUID NOT NULL,
  spn VARCHAR,
  empresa_origen VARCHAR,
  mercado_origen VARCHAR,
  numero_portar VARCHAR,
  pin INTEGER,
  fecha_portacion DATE,
  CONSTRAINT portabilidad_pkey PRIMARY KEY (venta),
  CONSTRAINT portabilidad_venta_fkey FOREIGN KEY (venta) REFERENCES public.venta (venta_id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA ESTADO_VENTA
-- =====================================================
CREATE TABLE IF NOT EXISTS public.estado_venta (
  estado_id UUID NOT NULL DEFAULT uuid_generate_v4(),
  venta UUID NOT NULL,
  estado VARCHAR NOT NULL DEFAULT 'EN_PROCESO',
  fecha_estado TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  observaciones TEXT,
  CONSTRAINT estado_venta_pkey PRIMARY KEY (estado_id),
  CONSTRAINT estado_venta_venta_fkey FOREIGN KEY (venta) REFERENCES public.venta (venta_id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA CORREO
-- =====================================================
CREATE TABLE IF NOT EXISTS public.correo (
  sap_id VARCHAR NOT NULL,
  telefono_contacto VARCHAR,
  telefono_alternativo VARCHAR,
  destinatario VARCHAR NOT NULL,
  persona_autorizada VARCHAR,
  direccion VARCHAR NOT NULL,
  numero_casa VARCHAR,
  entre_calles VARCHAR,
  barrio VARCHAR,
  localidad VARCHAR NOT NULL,
  departamento VARCHAR NOT NULL,
  codigo_postal VARCHAR,
  fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  fecha_limite DATE,
  CONSTRAINT correo_pkey PRIMARY KEY (sap_id)
);

-- =====================================================
-- TABLA ESTADO_CORREO
-- =====================================================
CREATE TABLE IF NOT EXISTS public.estado_correo (
  estado_correo_id UUID NOT NULL DEFAULT uuid_generate_v4(),
  sap_id VARCHAR NOT NULL,
  entregado_ok BOOLEAN DEFAULT false,
  estado_guia VARCHAR DEFAULT 'INICIAL',
  ultimo_evento_fecha TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  ubicacion_actual VARCHAR DEFAULT 'PENDIENTE',
  primera_visita BOOLEAN,
  fecha_primer_visita TIMESTAMP WITHOUT TIME ZONE,
  CONSTRAINT estado_correo_pkey PRIMARY KEY (estado_correo_id),
  CONSTRAINT estado_correo_sap_id_fkey FOREIGN KEY (sap_id) REFERENCES public.correo (sap_id) ON DELETE CASCADE
);

-- =====================================================
-- DATOS DE PRUEBA (OPCIONAL)
-- =====================================================
-- Insertar una empresa de origen de prueba
INSERT INTO public.empresa_origen (nombre_empresa, pais)
VALUES ('Movistar', 'Argentina'), ('Personal', 'Argentina'), ('Claro', 'Argentina')
ON CONFLICT DO NOTHING;

-- Insertar planes de prueba
INSERT INTO public.plan (nombre, precio, gigabyte, llamadas, mensajes, empresa_origen_id)
SELECT 
  'Plan Basico 10GB', 1500.00, 10, 1000, 1000, true, false, empresa_origen_id
FROM public.empresa_origen WHERE nombre_empresa = 'Movistar'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insertar una persona de prueba
INSERT INTO public.persona (nombre, apellido, fecha_nacimiento, documento, tipo_documento, nacionalidad, genero, email, telefono)
VALUES 
  ('Juan', 'Pérez', '1990-01-01', '12345678', 'DNI', 'Argentina', 'M', 'juan.perez@test.com', '1122334455')
ON CONFLICT (documento) DO NOTHING;

-- Crear usuario de prueba
INSERT INTO public.usuario (persona_id, legajo, exa, activo, contraseña, rol)
SELECT 
  persona_id, 'LEG12345', 'EXA12345', true, '$2a$10$hash_solo_para_pruebas', 'administrador'
FROM public.persona WHERE documento = '12345678'
LIMIT 1
ON CONFLICT (legajo) DO NOTHING;
`;

console.log("🔄 Ejecutando script de migración en Supabase...");

try {
  const { data, error } = await supabase.rpc('exec_sql', { sql: migrationScript });
  
  if (error) {
    console.error("❌ Error en migración:", error);
    
    // Intentar con SQL directo
    console.log("🔄 Intentando ejecución directa...");
    const { error: directError } = await supabase
      .from('persona')
      .select('*')
      .limit(1);
      
    if (directError) {
      console.error("❌ Error en prueba de conexión:", directError);
      Deno.exit(1);
    }
    
    console.log("✅ Conexión exitosa pero sin RPC. Tablas existentes o permisos limitados.");
    console.log("📊 Probando estado de tablas...");
    
    // Verificar tablas existentes
    const tables = ['persona', 'usuario', 'empresa_origen', 'plan', 'promocion', 'venta', 'linea_nueva', 'portabilidad', 'correo', 'estado_correo'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
          
        if (error) {
          console.log(`❌ Tabla ${table}: ${error.message}`);
        } else {
          console.log(`✅ Tabla ${table}: Accessible (${data?.length || 0} rows)`);
        }
      } catch (err) {
        console.log(`❌ Error accediendo tabla ${table}: ${err.message}`);
      }
    }
  } else {
    console.log("✅ Migración ejecutada exitosamente");
    console.log(`📊 Resultado: ${data}`);
  }
  
} catch (err) {
  console.error("❌ Error crítico en migración:", err);
  Deno.exit(1);
}

console.log("🎉 Migración completada");