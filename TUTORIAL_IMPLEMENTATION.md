# Angular Shepherd Tutorial Implementation - AgriConnect

Esta implementación proporciona un sistema completo de tutoriales interactivos para guiar a nuevos usuarios a través de la plataforma AgriConnect usando Angular Shepherd en Angular 20.

## 📚 Tabla de Contenidos

- [Instalación](#instalación)
- [Configuración](#configuración)
- [Arquitectura](#arquitectura)
- [Uso Básico](#uso-básico)
- [Componentes Incluidos](#componentes-incluidos)
- [Estilos y Temas](#estilos-y-temas)
- [Ejemplos de Implementación](#ejemplos-de-implementación)
- [Mejores Prácticas](#mejores-prácticas)
- [Troubleshooting](#troubleshooting)

## 🚀 Instalación

El paquete ya está instalado en el proyecto. Si necesitas instalarlo en otro proyecto:

```bash
npm install angular-shepherd --save
```

## ⚙️ Configuración

### 1. Configuración en app.config.ts

El servicio ya está configurado en `src/app/app.config.ts`:

```typescript
import { ShepherdService } from 'angular-shepherd';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... otros providers
    ShepherdService, // Angular Shepherd service
  ],
};
```

### 2. Estilos CSS

Los estilos personalizados están incluidos en `src/styles/tutorial.scss` e importados en `src/styles.scss`.

## 🏗️ Arquitectura

### Estructura de Archivos

```
src/app/
├── core/
│   ├── services/
│   │   └── tutorial.ts                    # Servicio principal de tutoriales
│   └── models/
│       └── tutorial.model.ts              # Interfaces y tipos
├── shared/
│   └── components/
│       └── tutorial-trigger/
│           └── tutorial-trigger.ts        # Componente trigger
└── styles/
    └── tutorial.scss                      # Estilos personalizados
```

### Servicios y Modelos

- **Tutorial Service** (`tutorial.ts`): Maneja la lógica de tutoriales, configuración de pasos, y estado
- **Tutorial Models** (`tutorial.model.ts`): Define interfaces TypeScript para type safety
- **Tutorial Trigger Component** (`tutorial-trigger.ts`): Componente reutilizable para activar tutoriales

## 🎯 Uso Básico

### 1. Importar el Servicio Tutorial

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { Tutorial } from './core/services/tutorial';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="dashboard-overview" data-tour="dashboard-overview">
      <h1>Panel de Control</h1>
      <!-- Contenido del dashboard -->
    </div>
  `
})
export class Dashboard implements OnInit {
  private readonly tutorialService = inject(Tutorial);

  async ngOnInit() {
    // Iniciar tutorial automático para nuevos usuarios
    if (!this.tutorialService.isTutorialCompleted()) {
      await this.tutorialService.startWelcomeTour('producer', 'dashboard');
    }
  }
}
```

### 2. Usar el Componente Tutorial Trigger

```typescript
import { Component } from '@angular/core';
import { TutorialTrigger } from './shared/components/tutorial-trigger/tutorial-trigger';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [TutorialTrigger],
  template: `
    <header>
      <nav>
        <!-- Contenido del header -->
        
        <!-- Botón para iniciar tutorial -->
        <app-tutorial-trigger 
          userRole="producer"
          context="dashboard"
          [showButton]="true"
          [showAutoPrompt]="true"
          (tutorialStarted)="onTutorialStarted()"
          (tutorialCompleted)="onTutorialCompleted()">
        </app-tutorial-trigger>
      </nav>
    </header>
  `
})
export class Header {
  onTutorialStarted() {
    console.log('Tutorial iniciado');
  }

  onTutorialCompleted() {
    console.log('Tutorial completado');
  }
}
```

## 🧩 Componentes Incluidos

### Tutorial Service

Métodos principales:

- `startWelcomeTour(userRole, context)`: Inicia tutorial de bienvenida
- `startCustomTour(tourId, steps)`: Inicia tutorial personalizado
- `stopTour()`: Detiene el tutorial actual
- `resetTutorial()`: Reinicia el estado del tutorial
- `isTutorialCompleted(tourId?)`: Verifica si un tutorial fue completado

### Tutorial Trigger Component

Props disponibles:

```typescript
@Input() userRole: UserRole = 'buyer';
@Input() context: TutorialContext = 'dashboard';
@Input() showButton: boolean = true;
@Input() showProgress: boolean = true;
@Input() showAutoPrompt: boolean = false;
@Input() buttonText: string = 'Iniciar tutorial';
@Input() autoStartDelay: number = 2000;
```

Eventos emitidos:

```typescript
@Output() tutorialStarted = new EventEmitter<void>();
@Output() tutorialCompleted = new EventEmitter<void>();
@Output() tutorialCancelled = new EventEmitter<void>();
```

## 🎨 Estilos y Temas

### Personalización de Colores

Los estilos utilizan variables CSS que coinciden con el tema de AgriConnect:

```css
:root {
  --tutorial-primary: theme('colors.green.600');
  --tutorial-secondary: theme('colors.gray.600');
  --tutorial-success: theme('colors.green.700');
  --tutorial-background: theme('colors.white');
  --tutorial-text: theme('colors.gray.800');
}
```

### Clases CSS Disponibles

- `.shepherd-theme-custom`: Tema personalizado para AgriConnect
- `.tour-welcome`: Estilo especial para tours de bienvenida
- `.tour-feature`: Estilo para tours de funcionalidades
- `.tour-warning`: Estilo para tours de advertencia

## 💡 Ejemplos de Implementación

### 1. Tutorial de Bienvenida para Productores

```typescript
// En un componente de dashboard
export class ProducerDashboard implements OnInit {
  private readonly tutorialService = inject(Tutorial);
  private readonly authService = inject(AuthService); // Tu servicio de auth

  async ngOnInit() {
    // Verificar si es un nuevo usuario
    const user = await this.authService.getCurrentUser();
    const isFirstLogin = user?.metadata?.creationTime === user?.metadata?.lastSignInTime;
    
    if (isFirstLogin && !this.tutorialService.isTutorialCompleted()) {
      // Esperar a que la UI se renderice
      setTimeout(() => {
        this.tutorialService.startWelcomeTour('producer', 'dashboard');
      }, 1000);
    }
  }
}
```

### 2. Tutorial Personalizado para Crear Producto

```typescript
export class ProductCreate implements OnInit {
  private readonly tutorialService = inject(Tutorial);

  async ngOnInit() {
    // Tutorial específico para crear primer producto
    if (!this.tutorialService.isTutorialCompleted('first-product')) {
      const customSteps = this.tutorialService.getCreateProductTourSteps();
      await this.tutorialService.startCustomTour('first-product', customSteps);
    }
  }
}
```

### 3. Tutorial Contextual con Trigger Manual

```html
<!-- En tu template -->
<div class="marketplace-header">
  <h1>Marketplace AgriConnect</h1>
  
  <app-tutorial-trigger 
    userRole="buyer"
    context="marketplace"
    [showButton]="true"
    [showAutoPrompt]="true"
    buttonText="¿Cómo buscar productos?"
    [autoStartDelay]="5000"
    (tutorialStarted)="onTutorialStart()"
    (tutorialCompleted)="onTutorialComplete()">
  </app-tutorial-trigger>
</div>

<div class="products-grid" data-tour="products-grid">
  <!-- Grid de productos -->
</div>

<div class="filter-sidebar" data-tour="filter-sidebar">
  <!-- Filtros -->
</div>

<div class="cart-icon" data-tour="cart-icon">
  <!-- Icono del carrito -->
</div>
```

### 4. Tutorial Progresivo por Pasos

```typescript
export class MultiStepTutorial {
  private readonly tutorialService = inject(Tutorial);
  private readonly router = inject(Router);

  async startProgressiveTour() {
    // Paso 1: Dashboard overview
    await this.tutorialService.startWelcomeTour('producer', 'dashboard');
    
    // Navegar a productos después de completar dashboard
    if (this.tutorialService.isTutorialCompleted()) {
      await this.router.navigate(['/products']);
      
      // Paso 2: Gestión de productos
      setTimeout(async () => {
        const productSteps = this.tutorialService.getCreateProductTourSteps();
        await this.tutorialService.startCustomTour('products-tour', productSteps);
      }, 1000);
    }
  }
}
```

### 5. Integración con Estados de Usuario

```typescript
export class TutorialManager {
  private readonly tutorialService = inject(Tutorial);
  private readonly userService = inject(UserService); // Tu servicio de usuario

  async checkAndStartTutorials() {
    const user = await this.userService.getCurrentUser();
    
    // Tutorial basado en rol y experiencia
    switch (user.role) {
      case 'producer':
        if (user.productsCount === 0) {
          await this.tutorialService.startWelcomeTour('producer', 'dashboard');
        }
        break;
        
      case 'buyer':
        if (user.ordersCount === 0) {
          await this.tutorialService.startWelcomeTour('buyer', 'marketplace');
        }
        break;
    }
  }
}
```

## ✨ Mejores Prácticas

### 1. Selectores Data Attributes

Usa atributos `data-tour` para elementos del tutorial:

```html
<button data-tour="add-product-btn">Agregar Producto</button>
<div class="dashboard-overview" data-tour="dashboard-overview">...</div>
```

### 2. Timing y Esperas

```typescript
// Esperar a que los elementos se rendericen
setTimeout(() => {
  this.tutorialService.startWelcomeTour('producer', 'dashboard');
}, 500);

// O usar OnAfterViewInit para componentes
ngAfterViewInit() {
  this.tutorialService.startWelcomeTour('producer', 'dashboard');
}
```

### 3. Gestión de Estado

```typescript
// Verificar estado antes de iniciar
if (!this.tutorialService.isActive() && !this.tutorialService.isTutorialCompleted()) {
  await this.tutorialService.startWelcomeTour(userRole, context);
}
```

### 4. Personalización por Contexto

```typescript
// Diferentes tours para diferentes páginas
const context = this.router.url.includes('/products') ? 'product-create' : 'dashboard';
await this.tutorialService.startWelcomeTour(userRole, context);
```

### 5. Accesibilidad

```typescript
// Los estilos incluyen soporte para:
// - Navegación por teclado
// - Alto contraste
// - Lectores de pantalla
// - Reducción de movimiento
```

## 🔧 Troubleshooting

### Problema: Tutorial no aparece

**Solución:**
1. Verificar que los elementos tengan los selectores correctos
2. Asegurarse de que los elementos estén visibles en el DOM
3. Comprobar que no haya errores en la consola

```typescript
// Debug: verificar elemento existe
const element = document.querySelector('[data-tour="dashboard-overview"]');
if (!element) {
  console.error('Elemento del tutorial no encontrado');
}
```

### Problema: Estilos no se aplican

**Solución:**
1. Verificar que `tutorial.scss` esté importado en `styles.scss`
2. Comprobar que no haya conflictos con otros estilos
3. Inspeccionar elementos para ver si las clases se aplican

### Problema: Tutorial se inicia múltiples veces

**Solución:**
```typescript
// Verificar estado antes de iniciar
if (this.tutorialService.isActive()) {
  return;
}
```

### Problema: Elementos no son interactivos durante el tutorial

**Solución:**
Los elementos destacados tienen `z-index` alto automáticamente. Si hay problemas:

```css
.shepherd-target-highlighted {
  z-index: 9999 !important;
}
```

## 🚀 Próximos Pasos

1. **Métricas y Analytics**: Implementar seguimiento de completación de tutoriales
2. **A/B Testing**: Probar diferentes versiones de tutoriales
3. **Personalización Avanzada**: Tours adaptativos basados en comportamiento del usuario
4. **Integración con Onboarding**: Conectar con flujo de registro de nuevos usuarios
5. **Tours Contextuales**: Tutoriales que aparecen basados en acciones del usuario

## 📞 Soporte

Para problemas específicos de implementación:
1. Revisar la consola del navegador para errores
2. Verificar que todos los elementos referenciados existen
3. Comprobar que los selectores CSS son correctos
4. Asegurarse de que angular-shepherd esté correctamente configurado

---

**Nota:** Esta implementación sigue las mejores prácticas de Angular 20 y está optimizada para el proyecto AgriConnect. Los tutoriales son completamente personalizables y se pueden adaptar a cualquier flujo de usuario específico.