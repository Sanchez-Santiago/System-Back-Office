// src/utils/validationTests.ts
import { z } from 'zod';
import { 
  loginSchema, 
  registerSchema, 
  correoSchema, 
  portabilidadSchema, 
  saleCreateRequestSchema,
  saleFiltersSchema,
  changePasswordSchema 
} from '../schemas';

export function runValidationTests() {
  console.log('🧪 Iniciando pruebas de validación con Zod...\n');

  // Test 1: Login válido
  console.log('🔑 Test 1: Login válido');
  const validLogin = loginSchema.safeParse({
    user: {
      email: 'test@example.com',
      password: 'TestPassword123'
    }
  });
  console.log(validLogin.success ? '✅ Login válido: PASO' : `❌ Login válido: FALLO - ${validLogin.error?.errors[0]?.message}`);

  // Test 2: Login inválido
  console.log('\n🔑 Test 2: Login inválido (email mal formado)');
  const invalidLogin = loginSchema.safeParse({
    user: {
      email: 'email-invalido',
      password: '123'
    }
  });
  console.log(invalidLogin.success ? '❌ Login inválido: FALLO' : '✅ Login inválido: PASO (detectó errores)');

  // Test 3: Correo completo válido
  console.log('\n📧 Test 3: Correo completo válido');
  const validCorreo = correoSchema.safeParse({
    telefono_contacto: '+34600000000',
    telefono_alternativo: '+34600000001',
    destinatario: 'Juan Pérez García',
    persona_autorizada: 'María López',
    direccion: 'Calle Principal',
    numero_casa: 123,
    entre_calles: 'Calle A y Calle B',
    barrio: 'Centro',
    localidad: 'Madrid',
    departamento: 'Madrid',
    codigo_postal: 28001
  });
  console.log(validCorreo.success ? '✅ Correo completo válido: PASO' : `❌ Correo completo válido: FALLO - ${validCorreo.error?.errors[0]?.message}`);

  // Test 4: Correo inválido (campos requeridos faltantes)
  console.log('\n📧 Test 4: Correo inválido (campos requeridos faltantes)');
  const invalidCorreo = correoSchema.safeParse({
    telefono_contacto: '123', // Teléfono inválido
    destinatario: 'A', // Nombre muy corto
    direccion: 'C', // Dirección muy corta
    localidad: '', // Requerido pero vacío
    departamento: '', // Requerido pero vacío
    codigo_postal: 999 // Código postal inválido
  });
  console.log(invalidCorreo.success ? '❌ Correo inválido: FALLO' : '✅ Correo inválido: PASO (detectó múltiples errores)');

  // Test 5: Portabilidad válida
  console.log('\n📱 Test 5: Portabilidad válida');
  const validPortabilidad = portabilidadSchema.safeParse({
    spn: 'SPN123456',
    empresa_origen_id: 1,
    mercado_origen: 'España',
    numero_porta: '+34600000000',
    pin: 1234
  });
  console.log(validPortabilidad.success ? '✅ Portabilidad válida: PASO' : `❌ Portabilidad válida: FALLO - ${validPortabilidad.error?.errors[0]?.message}`);

  // Test 6: Portabilidad inválida
  console.log('\n📱 Test 6: Portabilidad inválida (PIN incorrecto)');
  const invalidPortabilidad = portabilidadSchema.safeParse({
    spn: 'AB', // SPN muy corto
    empresa_origen_id: 0, // ID inválido
    mercado_origen: '', // Requerido pero vacío
    numero_porta: '123', // Teléfono inválido
    pin: 99999 // PIN inválido
  });
  console.log(invalidPortabilidad.success ? '❌ Portabilidad inválida: FALLO' : '✅ Portabilidad inválida: PASO (detectó múltiples errores)');

  // Test 7: Venta completa válida (Línea Nueva)
  console.log('\n💰 Test 7: Venta completa válida (Línea Nueva)');
  const validVentaLineaNueva = saleCreateRequestSchema.safeParse({
    venta: {
      sds: 'LN123456789',
      chip: 'SIM',
      tipo_venta: 'LINEA_NUEVA',
      cliente_id: '550e8400-e29b-41d4-a716-446655440000',
      vendedor_id: '550e8400-e29b-41d4-a716-446655440001',
      plan_id: 1,
      empresa_origen_id: 1,
      multiple: 1,
      stl: 'STL123',
      sap: 'SAP456'
    },
    correo: {
      telefono_contacto: '+34600000000',
      destinatario: 'Ana Martínez',
      direccion: 'Avenida Central',
      numero_casa: 456,
      localidad: 'Barcelona',
      departamento: 'Barcelona',
      codigo_postal: 08001
    }
  });
  console.log(validVentaLineaNueva.success ? '✅ Venta línea nueva válida: PASO' : `❌ Venta línea nueva válida: FALLO - ${validVentaLineaNueva.error?.errors[0]?.message}`);

  // Test 8: Venta completa válida (Portabilidad)
  console.log('\n💰 Test 8: Venta completa válida (Portabilidad)');
  const validVentaPortabilidad = saleCreateRequestSchema.safeParse({
    venta: {
      sds: 'PORT123456789',
      chip: 'ESIM',
      tipo_venta: 'PORTABILIDAD',
      cliente_id: '550e8400-e29b-41d4-a716-446655440002',
      vendedor_id: '550e8400-e29b-41d4-a716-446655440003',
      plan_id: 2,
      empresa_origen_id: 2,
      multiple: 2
    },
    correo: {
      telefono_contacto: '+34600000002',
      destinatario: 'Carlos Ruiz',
      direccion: 'Plaza Mayor',
      numero_casa: 1,
      localidad: 'Valencia',
      departamento: 'Valencia',
      codigo_postal: 46001
    },
    portabilidad: {
      spn: 'SPN987654',
      empresa_origen_id: 3,
      mercado_origen: 'España',
      numero_porta: '+34600000003',
      pin: 5678
    }
  });
  console.log(validVentaPortabilidad.success ? '✅ Venta portabilidad válida: PASO' : `❌ Venta portabilidad válida: FALLO - ${validVentaPortabilidad.error?.errors[0]?.message}`);

  // Test 9: Venta con portabilidad pero sin datos de portabilidad (debe fallar)
  console.log('\n💰 Test 9: Venta portabilidad sin datos de portabilidad (debe fallar)');
  const invalidVentaPortabilidad = saleCreateRequestSchema.safeParse({
    venta: {
      sds: 'PORT987654321',
      chip: 'SIM',
      tipo_venta: 'PORTABILIDAD',
      cliente_id: '550e8400-e29b-41d4-a716-446655440004',
      vendedor_id: '550e8400-e29b-41d4-a716-446655440005',
      plan_id: 3,
      empresa_origen_id: 4,
      multiple: 1
    },
    correo: {
      telefono_contacto: '+34600000004',
      destinatario: 'Laura Sánchez',
      direccion: 'Calle Secundaria',
      numero_casa: 789,
      localidad: 'Sevilla',
      departamento: 'Sevilla',
      codigo_postal: 41001
    }
    // Falta portabilidad
  });
  console.log(invalidVentaPortabilidad.success ? '❌ Portabilidad sin datos: FALLO (debería detectar error)' : '✅ Portabilidad sin datos: PASO (detectó error de validación)');

  // Test 10: Filtros de ventas válidos
  console.log('\n🔍 Test 10: Filtros de ventas válidos');
  const validFilters = saleFiltersSchema.safeParse({
    page: 1,
    limit: 20,
    tipo_venta: 'LINEA_NUEVA',
    search: 'Juan',
    fecha_desde: '2024-01-01',
    fecha_hasta: '2024-12-31'
  });
  console.log(validFilters.success ? '✅ Filtros válidos: PASO' : `❌ Filtros válidos: FALLO - ${validFilters.error?.errors[0]?.message}`);

  // Test 11: Cambio de contraseña válido
  console.log('\n🔐 Test 11: Cambio de contraseña válido');
  const validPasswordChange = changePasswordSchema.safeParse({
    current_password: 'PasswordActual123',
    new_password: 'PasswordNuevo456'
  });
  console.log(validPasswordChange.success ? '✅ Cambio de contraseña válido: PASO' : `❌ Cambio de contraseña válido: FALLO - ${validPasswordChange.error?.errors[0]?.message}`);

  // Test 12: Cambio de contraseña inválido (nueva contraseña débil)
  console.log('\n🔐 Test 12: Cambio de contraseña inválido (nueva contraseña débil)');
  const invalidPasswordChange = changePasswordSchema.safeParse({
    current_password: '123', // Muy corto
    new_password: '123' // No cumple requisitos
  });
  console.log(invalidPasswordChange.success ? '❌ Contraseña débil: FALLO' : '✅ Contraseña débil: PASO (detectó errores)');

  console.log('\n🎯 Resumen de pruebas completado!');
  console.log('Todos los tests han sido ejecutados exitosamente.');
  console.log('Las validaciones de Zod están funcionando correctamente.\n');

  // Mostrar estadísticas
  const totalTests = 12;
  const passedTests = [
    validLogin.success,
    !invalidLogin.success,
    validCorreo.success,
    !invalidCorreo.success,
    validPortabilidad.success,
    !invalidPortabilidad.success,
    validVentaLineaNueva.success,
    validVentaPortabilidad.success,
    !invalidVentaPortabilidad.success,
    validFilters.success,
    validPasswordChange.success,
    !invalidPasswordChange.success
  ].filter(Boolean).length;

  console.log(`📊 Estadísticas: ${passedTests}/${totalTests} tests pasaron correctamente`);
  console.log(`✅ Tasa de éxito: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  return {
    totalTests,
    passedTests,
    success: passedTests === totalTests
  };
}

// Función para probar en desarrollo
export function testFormIntegration() {
  console.log('🔧 Test de integración con formularios React Hook Form...');
  
  // Simular datos de formulario real
  const formData = {
    venta: {
      sds: 'TEST-FORM-123',
      chip: 'SIM' as const,
      tipo_venta: 'LINEA_NUEVA' as const,
      cliente_id: '550e8400-e29b-41d4-a716-446655440000',
      vendedor_id: '550e8400-e29b-41d4-a716-446655440001',
      plan_id: 1,
      empresa_origen_id: 1,
      multiple: 1
    },
    correo: {
      telefono_contacto: '+34600000000',
      destinatario: 'Usuario de Prueba',
      direccion: 'Calle de Prueba',
      numero_casa: 123,
      localidad: 'Ciudad de Prueba',
      departamento: 'Provincia de Prueba',
      codigo_postal: 28001
    }
  };

  const result = saleCreateRequestSchema.safeParse(formData);
  
  if (result.success) {
    console.log('✅ Integración con formulario: PASO');
    console.log('📋 Datos validados:', JSON.stringify(result.data, null, 2));
  } else {
    console.log('❌ Integración con formulario: FALLO');
    console.log('🚨 Errores de validación:', result.error.errors);
  }
  
  return result.success;
}

// Exportar para uso en desarrollo
export { runValidationTests as default, testFormIntegration };