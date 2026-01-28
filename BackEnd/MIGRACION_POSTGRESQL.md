# 🐘 Migración MySQL → PostgreSQL con Supabase

## 📋 Resumen

Este documento describe el proceso completo de migración del backend de **System-Back-Office** desde MySQL a PostgreSQL con Supabase.

## 🎯 Objetivos

- ✅ Migrar la base de datos de MySQL a PostgreSQL
- ✅ Integrar con Supabase para mejor gestión
- ✅ Mantener compatibilidad con el código existente
- ✅ Proporcionar fallback a MySQL si es necesario
- ✅ Mejorar performance y escalabilidad

## 📁 Archivos Creados/Modificados

### Configuración de Conexión
- ✅ `src/database/PostgreSQL.ts` - Nueva conexión PostgreSQL con soporte Supabase
- ✅ `src/database/PostgreSQLTest.ts` - Pruebas de conexión para PostgreSQL
- ✅ `src/database/healthCheck.ts` - Health checks actualizados para PostgreSQL
- ✅ `deno.json` - Dependencias actualizadas

### Modelos de Datos Migrados
- ✅ `src/model/usuarioPostgreSQL.ts` - Usuario con GROUP_CONCAT → STRING_AGG
- ✅ `src/model/ventaPostgreSQL.ts` - Ventas con DATE_FORMAT → TO_CHAR

### Scripts y Configuración
- ✅ `SQL/PostgreSQL/migration_to_supabase.sql` - Script completo de migración
- ✅ `.env.postgresql.example` - Variables de entorno ejemplo
- ✅ `src/main.ts` - Actualizado con imports dinámicos

## 🚀 Inicio Rápido

### 1. Configurar Supabase

```bash
# Copiar archivo de entorno
cp .env.postgresql.example .env

# Editar variables de Supabase
# Obtener desde: https://app.supabase.com/project/your-project/settings/api
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Ejecutar Script de Migración

```bash
# Usar Supabase CLI o ejecutar SQL en dashboard
supabase db push SQL/PostgreSQL/migration_to_supabase.sql
```

### 3. Instalar Dependencias

```bash
# Las dependencias ya están en deno.json
# Deno las descargará automáticamente al ejecutar
```

### 4. Iniciar Aplicación

```bash
# Con variables de entorno PostgreSQL/Supabase
deno task dev

# O con la configuración existente de MySQL
# (se usará automáticamente si no hay configuración PostgreSQL)
```

## 🔧 Configuración Detallada

### Variables de Entorno

#### Supabase (Recomendado)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### PostgreSQL Directo (Fallback)
```bash
POSTGRES_HOST=aws-0-region.pooler.supabase.com
POSTGRES_PORT=6543
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
```

#### Variables Adicionales
```bash
# Para activar conexión PostgreSQL
USE_POSTGRESQL=true

# Para pruebas de conexión
DB_CONNECTION_TEST_ENABLED=true
DB_CONNECTION_TIMEOUT=10000
DB_CONNECTION_RETRIES=3

# Configuración general
JWT_SECRET=your-secret-key
PORT=8000
MODO=development
```

## 🔄 Cambios Principales en Código

### Conversiones de SQL

| MySQL | PostgreSQL | Ejemplo |
|-------|------------|---------|
| `GROUP_CONCAT()` | `STRING_AGG()` | `STRING_AGG(pe.nombre, ', ')` |
| `DATE_FORMAT()` | `TO_CHAR()` | `TO_CHAR(fecha, 'YYYY-MM')` |
| `CURDATE()` | `CURRENT_DATE` | `CURRENT_DATE + INTERVAL '3 days'` |
| `AUTO_INCREMENT` | `SERIAL` | `id SERIAL PRIMARY KEY` |
| `ENUM('A','B')` | `VARCHAR CHECK()` | `rol VARCHAR CHECK (rol IN ('A','B'))` |
| `TINYINT(1)` | `BOOLEAN` | `activo BOOLEAN DEFAULT true` |

### Sintaxis de Parámetros

```typescript
// MySQL (positional ?)
await client.query('SELECT * FROM tabla WHERE campo = ?', [valor]);

// PostgreSQL (positional $1, $2...)
await client.query('SELECT * FROM tabla WHERE campo = $1', [valor]);
```

## 📊 Estructura de Base de Datos

### Tablas Principales

```sql
-- Usuarios y autenticación
persona (UUID como PK)
usuario (UUID heredado de persona)
password (historial de contraseñas)
permisos
permisos_has_usuario

-- Datos del negocio
venta (venta_id SERIAL)
cliente
correo
plan
promocion
empresa_origen

-- Roles específicos
vendedor
supervisor
back_office
```

### Características PostgreSQL

- **UUIDs** para identificadores únicos
- **SERIAL** para auto-incremento
- **CHECK constraints** para reemplazar ENUMs
- **ROW LEVEL SECURITY** (opcional)
- **Índices optimizados** para performance

## 🧪 Testing

### Pruebas de Conexión

```bash
# Probar conexión PostgreSQL
curl http://localhost:8000/health/db

# Probar salud completa
curl http://localhost:8000/health/full

# Verificar estado del sistema
curl http://localhost:8000/health/system
```

### Tests Unitarios

```bash
# Ejecutar tests de conexión
deno test --allow-env --allow-net src/database/PostgreSQLTest.ts

# Tests específicos de modelos
deno test src/model/usuarioPostgreSQL.test.ts
```

## 🔄 Migración de Datos

### Opción 1: Usar pgloader (Recomendado)

```bash
# Instalar pgloader
pgloader mysql://user:pass@host/database postgresql://user:pass@host/database

# pgloader automáticamente convierte:
# - Tipos de datos
# - Constraints
# - Índices
# - Datos
```

### Opción 2: Exportar/Importar Manual

```bash
# Exportar desde MySQL
mysqldump -u user -p database > mysql_data.sql

# Convertir usando script de migración
# (Script incluido en migration_to_supabase.sql)

# Importar a PostgreSQL
psql -U user -d database < postgresql_data.sql
```

### Opción 3: Usar Supabase CLI

```bash
# Inicializar proyecto Supabase
supabase init

# Ejecutar migración
supabase db push

# Verificar estado
supabase db remote changes
```

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. Error de Conexión
```bash
Error: Faltan variables de entorno de PostgreSQL/Supabase
```
**Solución**: Configurar `.env` con las variables correctas

#### 2. Error de Tipos de Datos
```bash
Error: column "campo" does not exist
```
**Solución**: Verificar que el script de migración se ejecutó correctamente

#### 3. Error de UUIDs
```bash
Error: invalid input syntax for type uuid
```
**Solución**: Asegurar que los UUIDs estén en formato válido

#### 4. Performance Lenta
```bash
Warning: Query execution time exceeded threshold
```
**Solución**: Verificar índices y optimizar consultas

### Comandos Útiles

```bash
# Verificar conexión a Supabase
curl -H "apikey: YOUR_ANON_KEY" \
     https://your-project.supabase.co/rest/v1/persona?select=count

# Probar conexión PostgreSQL directa
psql -h aws-0-region.pooler.supabase.co -p 6543 -U postgres -d postgres

# Verificar estado de las tablas
psql -c "\dt"  # Listar tablas
psql -c "\d persona"  # Describir tabla
```

## 📈 Performance

### Optimizaciones Implementadas

- **Connection Pooling**: Reutilización de conexiones
- **Query Parameterization**: Prevenir SQL injection
- **Índices Estratégicos**: En campos de búsqueda comunes
- **Lazy Loading**: Carga de modelos bajo demanda
- **Health Checks**: Monitoreo continuo

### Métricas a Monitorear

- Tiempo de conexión a base de datos
- Tiempo de respuesta de queries
- Uso de memoria y CPU
- Número de conexiones activas

## 🔒 Seguridad

### Mejoras de Seguridad

- **Row Level Security**: Control de acceso a nivel de fila (opcional)
- **Environment Variables**: Sin credenciales en código
- **Parameter Binding**: Prevención de SQL injection
- **Connection Encryption**: TLS automático con Supabase

### Variables Sensibles

```bash
# NUNCA exponer en commits
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
POSTGRES_PASSWORD=...
```

## 🚀 Despliegue

### Variables de Producción

```bash
# Production
MODO=production
USE_POSTGRESQL=true
SUPABASE_URL=https://prod-project.supabase.co

# Staging
MODO=staging  
USE_POSTGRESQL=true
SUPABASE_URL=https://staging-project.supabase.co
```

### Process de Deploy

1. **Backup** de base de datos actual
2. **Migrar** esquema con `supabase db push`
3. **Migrar** datos con pgloader
4. **Actualizar** variables de entorno
5. **Desplegar** nueva versión
6. **Verificar** con health checks
7. **Monitor** en producción

## 📚 Referencias

### Documentación Útil

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Deno PostgreSQL Driver](https://deno.land/x/postgres)
- [MySQL to PostgreSQL Migration](https://pgloader.readthedocs.io/)

### Herramientas

- **pgloader**: Herramienta de migración automática
- **DBeaver**: Visualización de esquemas
- **Postbird**: Cliente PostgreSQL ligero
- **Supabase CLI**: Gestión de proyectos Supabase

## 🤝 Contribución

### Flujo de Trabajo

1. Crear feature branch desde `main`
2. Implementar cambios
3. Ejecutar tests: `deno task test`
4. Verificar health checks: `deno task dev`
5. Crear Pull Request
6. Code review y merge

### Tests Requeridos

- ✅ Conexión a base de datos
- ✅ Operaciones CRUD básicas
- ✅ Transacciones complejas
- ✅ Health checks
- ✅ Performance bajo carga

## 📞 Soporte

### Canales de Contacto

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Documentación**: [Wiki del Proyecto](https://github.com/your-repo/wiki)

### Emergencias

1. **Rollback**: Cambiar `USE_POSTGRESQL=false` en `.env`
2. **Restore**: Usar backup más reciente
3. **Contactar**: Equipo de infraestructura inmediatamente

---

## 🎉 Conclusión

La migración a PostgreSQL con Supabase proporciona:

- **Mejor Performance**: Queries más rápidos y optimizados
- **Mayor Escalabilidad**: Gestión automática de infraestructura
- **Mayor Seguridad**: RLSEncripción automática
- **Mejor Desarrollo**: Herramientas modernas y debug fácil

¡Bienvenido al futuro de System-Back-Office con PostgreSQL! 🐘✨