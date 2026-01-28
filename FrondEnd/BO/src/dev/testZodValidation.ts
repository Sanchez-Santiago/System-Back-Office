// src/dev/testZodValidation.ts
import { default as runValidationTests, testFormIntegration } from '../utils/validationTests';

// Ejecutar pruebas cuando este archivo se importe en desarrollo
console.log('🚀 Iniciando validación Zod completa del sistema...\n');

// Ejecutar pruebas de esquemas
const testResults = runValidationTests();

// Ejecutar pruebas de integración
console.log('\n' + '='.repeat(60));
console.log('🔧 TEST DE INTEGRACIÓN CON FORMULARIOS');
console.log('='.repeat(60));
const integrationResults = testFormIntegration();

console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN COMPLETO DE VALIDACIÓN');
console.log('='.repeat(60));

if (testResults.success && integrationResults) {
  console.log('🎉 ¡TODAS LAS VALIDACIONES HAN PASADO!');
  console.log('✅ Esquemas Zod funcionando correctamente');
  console.log('✅ Integración con React Hook Form funcionando');
  console.log('✅ Sistema listo para producción');
  console.log('\n🚀 El frontend con Zod está completamente funcional');
} else {
  console.log('⚠️  Algunas validaciones fallaron - revisar los logs anteriores');
  console.log('❌ Revisar los errores de validación antes de continuar');
}

console.log('\n📝 Próximos pasos recomendados:');
console.log('1. Probar manualmente el formulario de login');
console.log('2. Probar manualmente el formulario de ventas');
console.log('3. Verificar mensajes de error en español');
console.log('4. Confirmar que los toast notifications funcionan');
console.log('5. Probar con el backend real');

export { testResults, integrationResults };