# Requerimientos del Sistema
## Marketplace Agrícola con Distribución Equitativa

### 1. Información General del Proyecto

**Nombre del Proyecto:** Marketplace Agrícola con Distribución Equitativa  
**Stack Tecnológico:**
- Frontend: Angular 20
- Estilos: Tailwind CSS 4.1
- Backend/Base de Datos: Firebase
- Autenticación: Firebase Auth
- Almacenamiento: Firebase Storage

**Objetivo:** Diseñar e implementar una plataforma digital tipo Marketplace para conectar a pequeños productores agropecuarios con consumidores y compradores institucionales, garantizando una asignación equitativa de oportunidades comerciales.

---

### 2. Requerimientos Funcionales

#### RF-01: Sistema de Asignación Automática y Equitativa
**Prioridad:** Alta  
**Descripción:** El sistema debe implementar un algoritmo que asigne automáticamente los pedidos a productores de forma rotativa y equitativa, priorizando aquellos con menor nivel de ventas acumuladas.

**Criterios de Aceptación:**
- El algoritmo debe considerar el historial de ventas de cada productor
- Debe rotar automáticamente entre productores disponibles
- Debe priorizar productores con menores ventas acumuladas
- Debe registrar cada asignación para auditoría

#### RF-02: Catálogo Anónimo con Búsqueda por Necesidad
**Prioridad:** Alta  
**Descripción:** Los compradores deben poder ingresar sus necesidades mediante un formulario sin elegir directamente al productor.

**Criterios de Aceptación:**
- Formulario de búsqueda por tipo de producto, cantidad y características
- No mostrar información del productor hasta después de la asignación
- Filtros por categoría, certificaciones y ubicación geográfica
- Búsqueda predictiva y sugerencias

#### RF-03: Panel Analítico para Productores
**Prioridad:** Alta  
**Descripción:** Cada productor debe tener acceso a un dashboard personalizado con métricas y análisis de su actividad comercial.

**Criterios de Aceptación:**
- Métricas de ventas mensuales y acumuladas
- Productos más solicitados
- Comparativa con productores cercanos
- Feedback de compradores (opcional)
- Sugerencias de mejora de precios y presentación

#### RF-04: Sistema de Trazabilidad Completa
**Prioridad:** Media  
**Descripción:** El sistema debe registrar y mostrar información completa de trazabilidad desde la parcela hasta la entrega.

**Criterios de Aceptación:**
- Registro de lote de producción
- Información de certificaciones
- Tracking de transporte
- Destino final del producto
- Historial completo visible para compradores

#### RF-05: Gestión de Productos por Productor
**Prioridad:** Media  
**Descripción:** Los productores deben poder gestionar completamente su catálogo de productos.

**Criterios de Aceptación:**
- Crear, editar y eliminar productos
- Cargar imágenes y descripciones
- Establecer precios y disponibilidad
- Gestionar stock en tiempo real
- Configurar certificaciones digitales

#### RF-06: Sistema de Notificaciones
**Prioridad:** Media  
**Descripción:** El sistema debe enviar notificaciones automáticas a productores cuando se les asigne un pedido.

**Criterios de Aceptación:**
- Notificaciones push y por email
- Información detallada del pedido asignado
- Tiempo límite para confirmar disponibilidad
- Notificaciones de estado del pedido

#### RF-07: Sistema de Calificación y Feedback
**Prioridad:** Baja  
**Descripción:** Los compradores deben poder calificar pedidos recibidos para mejorar la calidad del servicio.

**Criterios de Aceptación:**
- Calificación de 1 a 5 estrellas
- Comentarios opcionales
- Evaluación separada de producto y servicio
- Feedback visible solo para el productor (opcional)

#### RF-08: Historial de Transacciones
**Prioridad:** Baja  
**Descripción:** El sistema debe mantener un historial completo de pedidos para productores y compradores.

**Criterios de Aceptación:**
- Historial completo de pedidos realizados
- Filtros por fecha, estado y monto
- Exportación de reportes
- Estadísticas de rendimiento

#### RF-09: Sistema de Favoritos Inteligente
**Prioridad:** Baja  
**Descripción:** Los compradores pueden marcar productos como favoritos sin alterar el algoritmo de asignación equitativa.

**Criterios de Aceptación:**
- Lista de productos favoritos
- Repetición fácil de compras anteriores
- Mantenimiento de la equidad en asignaciones
- Sugerencias basadas en historial

---

### 3. Requerimientos No Funcionales

#### RNF-01: Disponibilidad
**Métrica:** 99.5% de disponibilidad mensual  
**Implementación:** Uso de Firebase con alta disponibilidad, monitoreo automático

#### RNF-02: Performance
**Métrica:** Respuesta < 2 segundos para acciones comunes  
**Implementación:** Optimización de consultas, cache inteligente, lazy loading

#### RNF-03: Escalabilidad
**Métrica:** Soporte para 10,000 usuarios concurrentes  
**Implementación:** Arquitectura de microservicios, auto-scaling de Firebase

#### RNF-04: Seguridad
**Métrica:** Cifrado completo en tránsito y reposo  
**Implementación:** HTTPS, Firebase Security Rules, encriptación de datos sensibles

#### RNF-05: Accesibilidad Mobile
**Métrica:** Funcional en dispositivos de gama media-baja  
**Implementación:** Diseño responsive, optimización de recursos, Progressive Web App

---

### 4. Estructura de Base de Datos (Firebase Firestore)

#### 4.1 Colección: `users`
**Propósito:** Almacenar información básica de todos los usuarios del sistema
**Campos necesarios:**
- ID único del usuario (Firebase Auth UID)
- Email y nombre de usuario
- Tipo de usuario (productor, comprador, institucional)
- Información de perfil (teléfono, dirección, verificación)
- Preferencias del usuario (notificaciones, idioma, moneda)
- Timestamps de creación y último acceso

#### 4.2 Colección: `producers`
**Propósito:** Información específica de productores agrícolas
**Campos necesarios:**
- Referencia al usuario base
- Información del negocio (nombre de finca, tamaño, ubicación GPS)
- Certificaciones disponibles
- Métricas de rendimiento (ventas totales, pedidos completados, calificación promedio)
- Información bancaria para pagos
- Score de rotación para el algoritmo de equidad
- Estado activo/inactivo

#### 4.3 Colección: `products`
**Propósito:** Catálogo de productos disponibles
**Campos necesarios:**
- Referencia al productor
- Información básica del producto (nombre, categoría, descripción)
- Imágenes del producto
- Información de precios (precio por unidad, mínimo/máximo de pedido)
- Disponibilidad y stock actual
- Certificaciones específicas del producto
- Información de trazabilidad (lote, coordenadas, método de cosecha)
- Timestamps de creación y actualización

#### 4.4 Colección: `orders`
**Propósito:** Gestión completa de pedidos y transacciones
**Campos necesarios:**
- Número único de orden
- Referencias a comprador, productor y producto
- Detalles del pedido (cantidad, precio, requisitos especiales)
- Información de asignación automática
- Estados del pedido (pendiente, confirmado, preparando, enviado, entregado)
- Timestamps de cada estado
- Información de entrega (dirección, fecha preferida, método)
- Información de pago (método, estado, ID de transacción)

#### 4.5 Colección: `reviews`
**Propósito:** Sistema de calificaciones y comentarios
**Campos necesarios:**
- Referencias a orden, comprador, productor y producto
- Calificaciones numéricas (calidad del producto, tiempo de entrega, empaque)
- Comentarios textuales opcionales
- Configuración de visibilidad pública/privada
- Timestamp de creación

#### 4.6 Colección: `rotationSystem`
**Propósito:** Control del algoritmo de distribución equitativa
**Campos necesarios:**
- Identificador de región o categoría
- Lista de productores con sus métricas de rotación
- Parámetros del algoritmo de asignación
- Historial de asignaciones por productor
- Versión y última actualización del algoritmo

#### 4.7 Colección: `notifications`
**Propósito:** Sistema de notificaciones push y en app
**Campos necesarios:**
- Referencia al usuario destinatario
- Tipo de notificación (pedido asignado, completado, pago, sistema)
- Título y mensaje de la notificación
- Datos adicionales específicos del tipo
- Estado de lectura
- Timestamps de creación y expiración

#### 4.8 Colección: `systemMetrics`
**Propósito:** Métricas y análisis del sistema
**Campos necesarios:**
- Fecha de las métricas
- Estadísticas de uso (pedidos totales, usuarios activos, ingresos)
- Métricas de rendimiento (tiempo de respuesta, disponibilidad, errores)
- Distribución de asignaciones por región
- Análisis de actividad por categorías

#### 4.9 Colección: `categories`
**Propósito:** Catálogo de categorías y subcategorías de productos
**Campos necesarios:**
- Nombre de la categoría
- Subcategorías disponibles
- Unidades de medida típicas
- Certificaciones aplicables
- Temporadas de cosecha

#### 4.10 Colección: `regions`
**Propósito:** Información geográfica para la asignación
**Campos necesarios:**
- Nombre de la región
- Coordenadas geográficas (polígono o centro)
- Productores activos en la región
- Costos de transporte estimados
- Tiempo de entrega promedio





### 5. Estructura del Proyecto Web Optimizada

#### 5.1 Estructura de Carpetas Angular 20 - Web Application

```
agriconnect-marketplace/
├── src/
│   ├── app/
│   │   ├── core/                           # Servicios esenciales
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── firebase.service.ts
│   │   │   │   ├── assignment.service.ts   # ⭐ Algoritmo de equidad
│   │   │   │   └── notification.service.ts
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   ├── models/
│   │   │   │   ├── user.model.ts
│   │   │   │   ├── product.model.ts
│   │   │   │   └── order.model.ts
│   │   │   └── constants/
│   │   │       └── firebase.config.ts
│   │   │
│   │   ├── shared/                         # Componentes reutilizables
│   │   │   ├── components/
│   │   │   │   ├── header/
│   │   │   │   ├── sidebar/
│   │   │   │   ├── loading/
│   │   │   │   ├── product-card/
│   │   │   │   └── modal/
│   │   │   └── pipes/
│   │   │       ├── currency.pipe.ts
│   │   │       └── date.pipe.ts
│   │   │
│   │   ├── pages/                          # Páginas principales
│   │   │   ├── auth/                       # Login/Register
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   │
│   │   │   ├── marketplace/                # Catálogo público
│   │   │   │   ├── marketplace.component.ts
│   │   │   │   ├── marketplace.component.html
│   │   │   │   └── components/
│   │   │       │   ├── product-search/     # Búsqueda anónima
│   │   │       │   ├── category-filter/
│   │   │       │   └── needs-form/         # ⭐ Formulario necesidades
│   │   │   │
│   │   │   ├── producer/                   # Dashboard productor
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── dashboard.component.ts
│   │   │   │   │   └── components/
│   │   │   │   │       ├── stats-cards/
│   │   │   │   │       ├── recent-orders/
│   │   │   │   │       └── analytics-chart/  # ⭐ Métricas personales
│   │   │   │   ├── products/
│   │   │   │   │   ├── product-list/
│   │   │   │   │   └── product-form/
│   │   │   │   └── orders/
│   │   │   │       ├── pending-orders/     # ⭐ Pedidos asignados
│   │   │   │       └── order-history/
│   │   │   │
│   │   │   ├── buyer/                      # Dashboard comprador
│   │   │   │   ├── dashboard/
│   │   │   │   ├── order-history/
│   │   │   │   └── favorites/
│   │   │   │
│   │   │   └── admin/                      # Panel administrativo
│   │   │       ├── dashboard/
│   │   │       ├── users/
│   │   │       ├── metrics/                # ⭐ Métricas del sistema
│   │   │       └── algorithm-config/       # ⭐ Config algoritmo equidad
│   │   │
│   │   ├── app.component.ts
│   │   ├── app.module.ts
│   │   └── app-routing.module.ts
│   │
│   ├── assets/                             # Recursos estáticos
│   │   ├── images/
│   │   ├── icons/
│   │   └── data/
│   │       ├── categories.json
│   │       └── regions.json
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   ├── styles/                            # Estilos Tailwind CSS
│   │   ├── components.scss
│   │   └── styles.scss
│   │
│   ├── index.html
│   └── main.ts
│
├── firebase/                              # Backend Firebase
│   ├── functions/
│   │   └── src/
│   │       ├── index.ts
│   │       ├── assignment-algorithm.ts     # ⭐ Cloud Function equidad
│   │       └── notifications.ts
│   │
│   ├── firestore.rules
│   └── firebase.json
│
├── angular.json
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

#### 5.2 Módulos Principales (Simplificados)

**AppModule (Principal):**
- CoreModule (singleton)
- SharedModule 
- Lazy loading para páginas principales

**Routing Simplificado:**
```
/ → Marketplace (público)
/auth → Login/Register
/producer → Dashboard Productor
/buyer → Dashboard Comprador  
/admin → Panel Administrativo
```

#### 5.3 Servicios Clave (Los Esenciales)

**AssignmentService:**
- Implementa algoritmo de rotación equitativa
- Asigna pedidos automáticamente
- Actualiza métricas de productores

**FirebaseService:**
- CRUD operaciones Firestore
- Autenticación Firebase Auth
- Subida de imágenes Storage

**NotificationService:**
- Notificaciones en tiempo real
- Alertas de pedidos asignados

#### 5.4 Funcionalidades Core por Página

**Marketplace (/)**
- Búsqueda anónima de productos
- Formulario de necesidades (sin elegir productor)
- Filtros por categoría y región
- Asignación automática al hacer pedido

**Producer Dashboard (/producer)**
- Panel con métricas personales
- Lista de productos (CRUD)
- Pedidos pendientes (asignados automáticamente)
- Analytics de rendimiento vs otros productores

**Buyer Dashboard (/buyer)**  
- Historial de pedidos
- Tracking de entregas
- Sistema de favoritos (sin afectar equidad)
- Formulario de calificaciones

**Admin Panel (/admin)**
- Métricas generales del sistema
- Configuración algoritmo de equidad
- Gestión de usuarios
- Reportes de distribución

#### 5.5 Componentes Shared Esenciales

- **ProductCard**: Mostrar productos en grid
- **StatsCard**: Tarjetas de métricas  
- **OrderCard**: Información de pedidos
- **Modal**: Confirmaciones y formularios
- **Loading**: Estados de carga
- **Header/Sidebar**: Navegación principal

#### 5.6 Firebase Structure (Solo lo necesario)

**Cloud Functions:**
- `assignmentAlgorithm`: Lógica de asignación equitativa
- `sendNotifications`: Notificar productores de pedidos
- `updateMetrics`: Actualizar estadísticas del sistema

**Firestore Collections (8 principales):**
- `users`, `producers`, `products`, `orders`
- `reviews`, `rotationSystem`, `notifications`, `systemMetrics`

---

### 6. Stack Tecnológico Final

**Frontend:**
- Angular 20 (standalone components donde sea posible)
- Tailwind CSS 4.1 (utility-first, responsive)
- TypeScript
- RxJS para manejo de estado

**Backend:**
- Firebase Auth (autenticación)
- Firestore (base de datos NoSQL)
- Firebase Storage (imágenes)
- Cloud Functions (lógica server-side)

**Deployment:**
- Firebase Hosting
- CI/CD con GitHub Actions

---

### 7. Casos de Uso Principales

#### 5.1 Flujo de Compra Equitativa
1. Comprador ingresa necesidad sin elegir productor
2. Sistema busca productos disponibles que coincidan
3. Algoritmo selecciona productor con menor rotación
4. Se asigna automáticamente el pedido
5. Productor recibe notificación y confirma disponibilidad
6. Se procesa el pago y se inicia la preparación
7. Seguimiento hasta entrega y calificación

#### 5.2 Gestión de Productos por Productor
1. Productor accede a su panel de control
2. Crea/edita productos con información completa
3. Sistema valida información y certificaciones
4. Producto queda disponible para asignación automática
5. Recibe métricas y análisis de desempeño

#### 5.3 Sistema de Rotación Inteligente
1. Sistema mantiene score de rotación por productor
2. Al recibir pedido, evalúa productores elegibles
3. Aplica algoritmo de equidad considerando historial
4. Asigna a productor con menor ventaja acumulada
5. Actualiza métricas de rotación automáticamente

---

### 6. Consideraciones Técnicas Especiales

#### 6.1 Algoritmo de Asignación Equitativa
- Implementar sistema de scoring dinámico
- Considerar factores: ubicación, disponibilidad, historial
- Logging completo para auditorías
- Capacidad de ajuste manual por administradores

#### 6.2 Optimización Mobile-First
- Progressive Web App (PWA)
- Offline capability para funciones básicas
- Compresión inteligente de imágenes
- Lazy loading y paginación eficiente

#### 6.3 Seguridad y Privacidad
- Firebase Security Rules granulares
- Anonimización de datos sensibles
- Compliance con regulaciones de datos
- Audit trail completo de transacciones

#### 6.4 Escalabilidad
- Cloud Functions para lógica compleja
- Firestore con estructura optimizada
- CDN para contenido estático
- Monitoreo y alertas automáticas

---

### 7. Métricas de Éxito

#### 7.1 Métricas de Equidad
- Distribución de pedidos entre productores
- Variación en ingresos por productor
- Tiempo promedio entre asignaciones

#### 7.2 Métricas de Adopción
- Número de productores activos
- Frecuencia de uso por comprador
- Retención de usuarios

#### 7.3 Métricas de Satisfacción
- Calificación promedio de productos
- Tiempo de entrega promedio
- Tasa de pedidos completados exitosamente

---

Este documento servirá como guía completa para el desarrollo del Marketplace Agrícola con Distribución Equitativa, asegurando que todos los requerimientos funcionales y no funcionales sean implementados correctamente con las tecnologías especificadas.