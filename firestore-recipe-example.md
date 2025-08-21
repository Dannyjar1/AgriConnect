# Estructura de Datos para la Colección "recetas" en Firestore

## Ejemplo de documento en la colección `recetas`:

```json
{
  "nombre": "Paella Valenciana",
  "porciones_base": 4,
  "descripcion": "Auténtica paella valenciana con ingredientes tradicionales",
  "categoria": "Plato Principal",
  "dificultad": "Media",
  "tiempoPreparacion": 45,
  "imagen": "https://example.com/paella.jpg",
  "ingredientes": [
    {
      "nombre": "Arroz bomba",
      "cantidad": 320,
      "unidad": "g",
      "categoria": "Cereales"
    },
    {
      "nombre": "Pollo troceado",
      "cantidad": 800,
      "unidad": "g",
      "categoria": "Carnes"
    },
    {
      "nombre": "Judías verdes",
      "cantidad": 200,
      "unidad": "g",
      "categoria": "Verduras"
    },
    {
      "nombre": "Tomate rallado",
      "cantidad": 2,
      "unidad": "unidades",
      "categoria": "Verduras"
    },
    {
      "nombre": "Aceite de oliva",
      "cantidad": 60,
      "unidad": "ml",
      "categoria": "Aceites"
    },
    {
      "nombre": "Azafrán",
      "cantidad": 1,
      "unidad": "pizca",
      "categoria": "Especias"
    },
    {
      "nombre": "Caldo de pollo",
      "cantidad": 800,
      "unidad": "ml",
      "categoria": "Caldos"
    }
  ],
  "fechaCreacion": "2024-01-15T10:30:00Z",
  "fechaActualizacion": "2024-01-15T10:30:00Z"
}
```

## Otro ejemplo - Receta simple:

```json
{
  "nombre": "Ensalada Mediterránea",
  "porciones_base": 2,
  "descripcion": "Ensalada fresca con ingredientes mediterráneos",
  "categoria": "Ensaladas",
  "dificultad": "Fácil",
  "tiempoPreparacion": 15,
  "ingredientes": [
    {
      "nombre": "Lechuga mixta",
      "cantidad": 150,
      "unidad": "g",
      "categoria": "Verduras"
    },
    {
      "nombre": "Tomates cherry",
      "cantidad": 200,
      "unidad": "g",
      "categoria": "Verduras"
    },
    {
      "nombre": "Queso feta",
      "cantidad": 100,
      "unidad": "g",
      "categoria": "Lácteos"
    },
    {
      "nombre": "Aceitunas negras",
      "cantidad": 50,
      "unidad": "g",
      "categoria": "Conservas"
    },
    {
      "nombre": "Aceite de oliva extra virgen",
      "cantidad": 30,
      "unidad": "ml",
      "categoria": "Aceites"
    },
    {
      "nombre": "Vinagre balsámico",
      "cantidad": 15,
      "unidad": "ml",
      "categoria": "Condimentos"
    }
  ]
}
```

## Campos requeridos:
- `nombre`: string (obligatorio)
- `porciones_base`: number (obligatorio, > 0)
- `ingredientes`: array (obligatorio, al menos 1 elemento)
  - `nombre`: string (obligatorio)
  - `cantidad`: number (obligatorio, > 0)
  - `unidad`: string (obligatorio)
  - `categoria`: string (obligatorio)

## Campos opcionales:
- `descripcion`: string
- `categoria`: string
- `dificultad`: "Fácil" | "Media" | "Difícil"
- `tiempoPreparacion`: number (en minutos)
- `imagen`: string (URL)
- `fechaCreacion`: timestamp
- `fechaActualizacion`: timestamp

## Categorías de ingredientes sugeridas:
- Verduras
- Carnes
- Pescados
- Lácteos
- Cereales
- Legumbres
- Frutas
- Especias
- Aceites
- Condimentos
- Conservas
- Caldos
- Frutos Secos

## Ejemplo de uso en la aplicación:

Cuando un usuario selecciona 6 personas para la Paella Valenciana (que originalmente es para 4), las cantidades se escalan automáticamente:

- Arroz bomba: 320g × 6 ÷ 4 = 480g
- Pollo troceado: 800g × 6 ÷ 4 = 1200g
- Judías verdes: 200g × 6 ÷ 4 = 300g
- etc.

El objeto de salida que se envía al carrito será:
```json
{
  "receta": "Paella Valenciana",
  "porciones": 6,
  "ingredientes": [
    {
      "nombre": "Arroz bomba",
      "cantidad": 320,
      "cantidad_final": 480,
      "unidad": "g",
      "categoria": "Cereales"
    },
    // ... resto de ingredientes escalados
  ]
}
```