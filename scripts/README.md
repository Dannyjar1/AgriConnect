# AgriConnect Database Seed

Este directorio contiene scripts para llenar la base de datos de AgriConnect con datos de ejemplo.

## ¿Qué incluye?

### 📊 Datos de Productores (6 ejemplos)
- **Finca La Esperanza**: Productor de frutas orgánicas (bananos, maracuyá)
- **Cooperativa San Miguel**: Especializada en quinua premium
- **Don Carlos Pérez**: Productor individual de hortalizas hidropónicas
- **Lácteos Andinos**: Empresa de productos lácteos artesanales
- **Granja Avícola El Roble**: Crianza de pollos de campo
- **Hierbas del Ecuador**: Asociación de plantas medicinales y especias

### 🥕 Datos de Productos (10 ejemplos)
- Banano Orgánico Premium
- Maracuyá Premium
- Quinua Real Premium
- Lechuga Hidropónica
- Tomate Riñón
- Queso Fresco Artesanal
- Yogurt Natural
- Pollo de Campo
- Manzanilla Deshidratada
- Orégano Seco

Cada producto incluye:
- Información completa (nombre, descripción, categoría)
- Precios y disponibilidad
- Certificaciones
- Datos de trazabilidad
- Coordenadas geográficas
- Información del lote

## 🚀 Cómo ejecutar el script

### Opción 1: Script directo con npm
```bash
npm run seed
```

### Opción 2: Script con validaciones
```bash
npm run seed:run
```

### Opción 3: Ejecutar directamente
```bash
npx ts-node scripts/seed.ts
```

## ⚠️ Consideraciones importantes

1. **Base de datos**: El script usa la misma configuración de Firebase que el proyecto principal
2. **Datos existentes**: El script detecta si ya hay datos pero continuará de todas formas
3. **Permisos**: Necesitas permisos de escritura en Firestore
4. **Conexión**: Se requiere conexión a internet para conectar con Firebase

## 📁 Estructura de archivos

```
scripts/
├── seed.ts              # Script principal de seed
├── run-seed.js          # Script ejecutable con validaciones
└── README.md            # Esta documentación
```

## 🔧 Resolución de problemas

### Error: "Firebase no está instalado"
```bash
npm install firebase
```

### Error: "ts-node no encontrado"
```bash
npm install -g ts-node
# o usar npx:
npx ts-node scripts/seed.ts
```

### Error de permisos en Firestore
1. Ve a la consola de Firebase
2. Asegúrate de que las reglas de Firestore permitan escritura
3. Verifica que tu proyecto tenga las colecciones `producers` y `products` configuradas

### Error de conexión
- Verifica tu conexión a internet
- Confirma que la configuración de Firebase sea correcta

## 📊 Resultado esperado

Después de ejecutar el script exitosamente, verás:

```
🚀 Iniciando seed de AgriConnect...
🌱 Insertando productores...
✅ Productor insertado: Finca La Esperanza (ID: abc123)
✅ Productor insertado: Cooperativa San Miguel (ID: def456)
...

🥕 Insertando productos...
✅ Producto insertado: Banano Orgánico Premium (ID: xyz789)
✅ Producto insertado: Maracuyá Premium (ID: uvw101)
...

🎉 Seed completado exitosamente!
📊 Resumen:
   - Productores: 6
   - Productos: 10

✨ Datos listos para usar en AgriConnect!
```

Los datos estarán disponibles inmediatamente en tu aplicación Angular.