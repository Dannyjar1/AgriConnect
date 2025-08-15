#!/usr/bin/env node

// Script ejecutable para hacer seed de la base de datos
// Requiere Node.js y las dependencias de Firebase instaladas

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 AgriConnect Database Seed Script');
console.log('=====================================');

// Verificar que las dependencias estén instaladas
try {
  require('firebase/app');
  require('firebase/firestore');
} catch (error) {
  console.error('❌ Error: Firebase dependencies not found.');
  console.error('Please install Firebase dependencies:');
  console.error('npm install firebase');
  process.exit(1);
}

// Compilar y ejecutar el script TypeScript
try {
  console.log('📝 Compilando script TypeScript...');
  
  // Usar ts-node si está disponible, sino usar tsc
  try {
    execSync('npx ts-node src/scripts/seed-database.ts', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '../..')
    });
  } catch (tsNodeError) {
    console.log('⚠️  ts-node no disponible, compilando con tsc...');
    
    // Compilar con tsc
    execSync('npx tsc src/scripts/seed-database.ts --outDir dist/scripts --target es2020 --module commonjs --esModuleInterop --skipLibCheck', {
      cwd: path.join(__dirname, '../..')
    });
    
    // Ejecutar el archivo compilado
    execSync('node dist/scripts/seed-database.js', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '../..')
    });
  }
  
} catch (error) {
  console.error('❌ Error ejecutando el seed:', error.message);
  console.error('\n🔧 Posibles soluciones:');
  console.error('1. Verifica que Firebase esté configurado correctamente en firebase-config.ts');
  console.error('2. Asegúrate de tener permisos de escritura en la base de datos');
  console.error('3. Verifica tu conexión a internet');
  process.exit(1);
}