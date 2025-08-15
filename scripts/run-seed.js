const { execSync } = require('child_process');

console.log('🚀 AgriConnect Database Seed');
console.log('============================\n');

try {
  // Verificar que Firebase esté instalado
  try {
    require.resolve('firebase');
  } catch (e) {
    console.error('❌ Firebase no está instalado. Ejecuta: npm install firebase');
    process.exit(1);
  }

  // Ejecutar el script de seed
  console.log('📝 Ejecutando seed script...\n');
  execSync('npx ts-node scripts/seed.ts', { stdio: 'inherit' });

} catch (error) {
  console.error('\n❌ Error ejecutando el seed:', error.message);
  console.error('\n🔧 Asegúrate de que:');
  console.error('1. Firebase esté configurado correctamente');
  console.error('2. Tengas permisos de escritura en Firestore');
  console.error('3. La conexión a internet esté funcionando');
  process.exit(1);
}