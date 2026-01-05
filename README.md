# System-Back-Office

Backend API para gestión de operaciones de ventas en telecomunicaciones. Maneja autenticación de usuarios, administración de ventas, seguimiento de correos, datos de clientes y operaciones comerciales.

## Características Principales

- **Autenticación y Autorización**: JWT con roles (VENDEDOR, SUPERVISOR, BACK_OFFICE), historial de contraseñas, bloqueo de cuentas por intentos fallidos.
- **Gestión de Ventas**: Creación y seguimiento de ventas (líneas nuevas, portabilidades), validaciones de compatibilidad (empresas, roaming, whatsapp).
- **Administración de Usuarios**: CRUD completo con permisos, historial de contraseñas, estados de activación.
- **Seguimiento de Correos**: Gestión de correos con estados, ubicaciones, alertas de vencimiento.
- **Estados de Ventas**: Sistema de estados dinámicos (PENDIENTE_DE_CARGA, CREADO_SIN_DOCU, etc.).
- **Transformaciones de Datos**: Normalización automática de campos (mayúsculas/minúsculas) vía Zod schemas.
- **Seguridad**: Bloqueo de cuentas tras 15 intentos fallidos, rate limiting, validaciones robustas.

## Arquitectura

- **Framework**: Deno + Oak
- **Base de Datos**: MySQL con esquemas normalizados
- **Patrón**: MVC (Model-View-Controller) con servicios intermediarios
- **Validación**: Zod schemas para entrada/salida
- **Autenticación**: JWT con middleware personalizado

### Estructura de Carpetas

```
BackEnd/
├── src/
│   ├── Controller/     # Lógica de controladores
│   ├── services/       # Lógica de negocio
│   ├── model/          # Acceso a datos MySQL
│   ├── router/         # Definición de rutas API
│   ├── schemas/        # Validaciones Zod
│   ├── middleware/     # Middlewares (auth, CORS, etc.)
│   ├── interface/      # Interfaces TypeScript
│   ├── types/          # Tipos personalizados
│   └── Utils/          # Utilidades (errores, CSV, etc.)
SQL/                    # Scripts de base de datos
```

## Instalación y Configuración

### Prerrequisitos
- Deno 1.30+
- MySQL 8.0+
- Node.js (opcional para herramientas)

### Pasos de Instalación

1. **Clonar repositorio**:
   ```bash
   git clone <repository-url>
   cd System-Back-Office
   ```

2. **Instalar dependencias**:
   ```bash
   cd BackEnd
   deno install
   ```

3. **Configurar base de datos**:
   - Ejecutar `SQL/DataBase.sql` en MySQL
   - Actualizar variables de entorno en `.env`

4. **Variables de entorno** (`.env`):
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=BO_System
   DB_USER=your_user
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret
   PORT=8000
   ```

5. **Ejecutar aplicación**:
   ```bash
   deno run --allow-net --allow-env --allow-read main.ts
   ```

## API Endpoints

### Autenticación
- `POST /usuario/login` - Login de usuario
- `POST /usuario/register` - Registro de usuario
- `GET /usuario/verify` - Verificar token
- `POST /usuario/refresh` - Refrescar token
- `POST /usuario/logout` - Cerrar sesión
- `POST /usuario/change-password` - Cambiar contraseña
- `POST /usuario/unlock` - Desbloquear cuenta (solo admins)

### Usuarios
- `GET /usuarios` - Listar usuarios
- `GET /usuarios/:id` - Obtener usuario por ID
- `PUT /usuarios/:id` - Actualizar usuario
- `DELETE /usuarios/:id` - Eliminar usuario

### Ventas
- `POST /ventas` - Crear venta
- `GET /ventas` - Listar ventas
- `GET /ventas/:id` - Obtener venta por ID

### Correos
- `GET /correos` - Listar correos
- `POST /correos` - Crear correo
- `PUT /correos/:id` - Actualizar correo

### Estados de Ventas
- `GET /estados-venta` - Listar estados
- `POST /estados-venta` - Crear estado
- `PUT /estados-venta/:id` - Actualizar estado

## Seguridad

### Bloqueo de Cuentas
- Tras 15 intentos fallidos de login, cuenta se bloquea por 30 minutos
- Admins pueden desbloquear cuentas vía `POST /usuario/unlock`
- Mensajes informativos muestran intentos restantes/tiempo de bloqueo

### Otras Medidas
- JWT con expiración de 6 horas
- Passwords hasheadas con bcrypt
- Historial de contraseñas (últimas 5) para prevenir reutilización
- Validaciones de entrada con Zod
- CORS configurado para entornos específicos

## Desarrollo

### Scripts Disponibles
- `deno run main.ts` - Iniciar servidor
- `deno check src/` - Verificar tipos
- `deno test` - Ejecutar pruebas (cuando se implementen)

### Contribución
1. Crear rama feature desde `main`
2. Implementar cambios con commits descriptivos
3. Asegurar `deno check` pasa
4. Crear PR con descripción detallada

## Tecnologías

- **Backend**: Deno, Oak
- **Base de Datos**: MySQL
- **Validación**: Zod
- **Autenticación**: JWT, bcrypt
- **Testing**: Deno test (planeado)

## Estado del Proyecto

- ✅ Autenticación completa
- ✅ Gestión de usuarios
- ✅ Estados de ventas
- ✅ Validaciones de compatibilidad
- ✅ Transformaciones de datos
- ✅ Bloqueo de cuentas
- 🔄 Pruebas unitarias (en progreso)
- 🔄 Documentación API completa (en progreso)

## Licencia

Propietario - Todos los derechos reservados.

## Contacto

Para soporte o consultas, contactar al equipo de desarrollo.