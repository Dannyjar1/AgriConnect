# Mejores Prácticas TypeScript para AgriConnect

## 🛡️ Prevención de Errores de Tipado

### 1. **Definición Completa de Interfaces**

```typescript
// ✅ CORRECTO - Interface completa con propiedades opcionales
export interface Product {
    id: string;
    producerId?: string;
    name: string;
    category: string;
    description: string;
    images: string[];
    price: {
        perUnit: number;
        unit: string; // Obligatorio para mostrar en template
        minOrder?: number;
        maxOrder?: number;
    };
    availability: number; // Número, no string
    province?: string; // Necesario para templates
    certifications: string[];
    traceability?: { // Opcional con propiedades anidadas opcionales
        batch?: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
        harvestMethod?: string;
    };
    createdAt?: any;
    updatedAt?: any;
}
```

### 2. **Validación de Propiedades en Templates**

```html
<!-- ✅ CORRECTO - Uso de optional chaining -->
<p>{{ product.traceability?.coordinates?.latitude }}, {{ product.traceability?.coordinates?.longitude }}</p>
<span>{{ product.price.unit }}</span> <!-- Propiedad requerida -->
<span>{{ product.province }}</span> <!-- Propiedad opcional pero definida -->

<!-- ❌ INCORRECTO - Sin optional chaining -->
<p>{{ product.traceability.coordinates.latitude }}</p>
```

### 3. **Consistencia en Tipos de Datos**

```typescript
// ✅ CORRECTO - Tipos consistentes
const products: Product[] = [
    {
        id: 'fruit-01',
        availability: 250, // Número
        price: {
            perUnit: 2.5,
            unit: 'unidad' // String obligatorio
        }
    }
];

// ❌ INCORRECTO - Tipos inconsistentes
const products = [
    {
        availability: '250', // String cuando se esperaba number
        price: {
            perUnit: 2.5
            // Falta 'unit'
        }
    }
];
```

## 🔧 Herramientas de Validación

### 1. **Configuración Estricta de TypeScript**

```json
// tsconfig.json
{
    "compilerOptions": {
        "strict": true,
        "noImplicitAny": true,
        "strictNullChecks": true,
        "strictPropertyInitialization": true,
        "noImplicitReturns": true,
        "noFallthroughCasesInSwitch": true
    }
}
```

### 2. **Validación en Tiempo de Desarrollo**

```typescript
// Uso de type guards para validaciones
function isValidProduct(obj: any): obj is Product {
    return obj && 
           typeof obj.id === 'string' &&
           typeof obj.name === 'string' &&
           typeof obj.availability === 'number' &&
           obj.price && 
           typeof obj.price.perUnit === 'number' &&
           typeof obj.price.unit === 'string';
}

// Función helper para crear productos
function createProduct(data: Partial<Product>): Product {
    if (!data.id || !data.name || !data.price?.unit) {
        throw new Error('Propiedades obligatorias faltantes');
    }
    
    return {
        id: data.id,
        name: data.name,
        category: data.category || '',
        description: data.description || '',
        images: data.images || [],
        price: {
            perUnit: data.price.perUnit || 0,
            unit: data.price.unit
        },
        availability: data.availability || 0,
        certifications: data.certifications || [],
        ...data
    } as Product;
}
```

### 3. **Validación con Zod (Recomendado)**

```typescript
import { z } from 'zod';

const ProductSchema = z.object({
    id: z.string(),
    producerId: z.string().optional(),
    name: z.string(),
    category: z.string(),
    description: z.string(),
    images: z.array(z.string()),
    price: z.object({
        perUnit: z.number(),
        unit: z.string(),
        minOrder: z.number().optional(),
        maxOrder: z.number().optional()
    }),
    availability: z.number(),
    province: z.string().optional(),
    certifications: z.array(z.string()),
    traceability: z.object({
        batch: z.string().optional(),
        coordinates: z.object({
            latitude: z.number(),
            longitude: z.number()
        }).optional(),
        harvestMethod: z.string().optional()
    }).optional()
});

type Product = z.infer<typeof ProductSchema>;

// Validación automática
function validateProduct(data: unknown): Product {
    return ProductSchema.parse(data);
}
```

## 🎯 Flujo de Trabajo Recomendado

### 1. **Desarrollo Incremental**
- Definir interface completa primero
- Implementar propiedades básicas
- Agregar propiedades opcionales gradualmente
- Validar compilación frecuentemente

### 2. **Testing de Tipos**
```typescript
// Tests de tipos para interfaces
describe('Product Interface', () => {
    it('should accept valid product data', () => {
        const validProduct: Product = {
            id: 'test-01',
            name: 'Test Product',
            category: 'Test',
            description: 'Test description',
            images: ['test.jpg'],
            price: {
                perUnit: 1.0,
                unit: 'unidad'
            },
            availability: 100,
            certifications: []
        };
        
        expect(validProduct).toBeDefined();
    });
});
```

### 3. **Documentación de Cambios**
```typescript
export interface Product {
    // v2.0 - Agregado para mostrar provincia en templates
    province?: string;
    
    price: {
        perUnit: number;
        // v2.0 - Agregado unit para compatibilidad con templates
        unit: string;
        minOrder?: number;
        maxOrder?: number;
    };
    
    // v2.0 - Cambiado de string a number para cálculos
    availability: number;
}
```

## 🚨 Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|--------|----------|
| `Property 'unit' is missing` | Falta propiedad en interface | Agregar propiedad requerida |
| `Object is possibly 'undefined'` | Falta optional chaining | Usar `?.` en templates |
| `Type 'string' is not assignable to type 'number'` | Tipo incorrecto en datos | Convertir string a number |
| `Property 'province' does not exist` | Propiedad no definida | Agregar a interface como opcional |

## ⚡ Comandos Útiles

```bash
# Verificar errores de TypeScript
npx tsc --noEmit

# Build con verificación estricta
npm run build

# Linting con TypeScript
npx eslint src/ --ext .ts

# Verificar tipos en tiempo real
npx tsc --watch --noEmit
```

## 📋 Checklist Pre-commit

- [ ] Todas las propiedades usadas en templates están en la interface
- [ ] Tipos de datos son consistentes (number vs string)
- [ ] Optional chaining usado para propiedades opcionales
- [ ] Compilación exitosa sin errores de TypeScript
- [ ] Tests de tipos pasan
- [ ] Documentación actualizada si hay cambios en interfaces

Siguiendo estas prácticas, evitarás errores de compilación y mantendrás un código TypeScript robusto y mantenible en AgriConnect.