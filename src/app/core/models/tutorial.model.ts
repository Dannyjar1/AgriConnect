import type { Step } from 'shepherd.js';

/**
 * Interfaces y tipos para el sistema de tutoriales de AgriConnect
 * 
 * Define las estructuras de datos utilizadas en el servicio de tutoriales
 * para garantizar type safety y mejor IntelliSense.
 * 
 * @version 1.0.0
 * @author AgriConnect Team
 */

// Roles de usuario disponibles
export type UserRole = 'producer' | 'buyer' | 'admin';

// Contextos donde pueden ejecutarse los tutoriales
export type TutorialContext = 
  | 'dashboard' 
  | 'marketplace' 
  | 'product-create' 
  | 'product-edit'
  | 'profile'
  | 'orders'
  | 'cart';

// Estado del tutorial
export interface TutorialState {
  readonly isActive: boolean;
  readonly currentStep: number;
  readonly totalSteps: number;
  readonly currentTourId: string;
  readonly progress: number;
}

// Configuración de un tutorial
export interface TutorialConfig {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly targetRole: UserRole | UserRole[];
  readonly context: TutorialContext;
  readonly steps: Step.StepOptions[];
  readonly autoStart?: boolean;
  readonly allowSkip?: boolean;
  readonly showProgress?: boolean;
}

// Progreso del tutorial
export interface TutorialProgress {
  readonly current: number;
  readonly total: number;
  readonly percentage: number;
}

// Opciones para inicializar un tutorial
export interface TutorialStartOptions {
  readonly userRole: UserRole;
  readonly context: TutorialContext;
  readonly forceStart?: boolean; // Forzar inicio aunque ya se haya completado
  readonly customSteps?: Step.StepOptions[]; // Pasos personalizados
}

// Configuración de un paso del tutorial
export interface CustomStepOptions extends Step.StepOptions {
  readonly contextualHelp?: string; // Ayuda adicional específica del contexto
  readonly prerequisites?: string[]; // Elementos que deben existir en el DOM
  readonly validation?: () => boolean; // Función para validar si se puede mostrar el paso
}

// Configuración global de Shepherd
export interface ShepherdConfig {
  readonly useModalOverlay: boolean;
  readonly exitOnEsc: boolean;
  readonly keyboardNavigation: boolean;
  readonly defaultStepOptions: {
    readonly classes: string;
    readonly scrollTo: ScrollIntoViewOptions;
    readonly cancelIcon: {
      readonly enabled: boolean;
    };
  };
}

// Evento del tutorial
export interface TutorialEvent {
  readonly type: 'start' | 'complete' | 'cancel' | 'step-show' | 'step-hide';
  readonly tourId: string;
  readonly stepId?: string;
  readonly stepNumber?: number;
  readonly timestamp: Date;
}

// Configuraciones predefinidas de tutoriales por rol y contexto
export interface TutorialDefinition {
  readonly producer: {
    readonly dashboard: TutorialConfig;
    readonly productCreate: TutorialConfig;
    readonly productEdit: TutorialConfig;
    readonly profile: TutorialConfig;
  };
  readonly buyer: {
    readonly marketplace: TutorialConfig;
    readonly cart: TutorialConfig;
    readonly orders: TutorialConfig;
    readonly profile: TutorialConfig;
  };
}

// Métricas del tutorial para analytics
export interface TutorialMetrics {
  readonly tourId: string;
  readonly userRole: UserRole;
  readonly startTime: Date;
  readonly endTime?: Date;
  readonly completed: boolean;
  readonly stepsCompleted: number;
  readonly totalSteps: number;
  readonly completionRate: number;
  readonly exitStep?: number; // En qué paso salió el usuario
}

// Configuración de persistencia
export interface TutorialPersistence {
  readonly key: string;
  readonly storage: 'localStorage' | 'sessionStorage';
  readonly expiration?: number; // En días
}

// Configuración de tema personalizado
export interface TutorialTheme {
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly backgroundColor: string;
  readonly textColor: string;
  readonly borderRadius: string;
  readonly fontFamily: string;
  readonly fontSize: string;
  readonly buttonStyle: {
    readonly primary: string;
    readonly secondary: string;
    readonly success: string;
    readonly danger: string;
  };
}

// Utilidades de tipo
export type TutorialStepId = `step-${string}`;
export type TutorialButtonAction = 'next' | 'back' | 'complete' | 'cancel' | 'skip';

// Constantes de tutoriales
export const TUTORIAL_STORAGE_KEYS = {
  COMPLETED: 'agriconnect_tutorial_completed',
  COMPLETED_DATE: 'agriconnect_tutorial_completed_date',
  CURRENT_TOUR: 'agriconnect_current_tour',
  METRICS: 'agriconnect_tutorial_metrics'
} as const;

export const TUTORIAL_EVENTS = {
  START: 'tutorial:start',
  COMPLETE: 'tutorial:complete',
  CANCEL: 'tutorial:cancel',
  STEP_SHOW: 'tutorial:step-show',
  STEP_HIDE: 'tutorial:step-hide'
} as const;

export const TUTORIAL_SELECTORS = {
  DASHBOARD_OVERVIEW: '.dashboard-overview',
  PRODUCTS_MENU: '[data-tour="products-menu"]',
  PROFILE_MENU: '[data-tour="profile-menu"]',
  CART_ICON: '[data-tour="cart-icon"]',
  PRODUCTS_GRID: '.products-grid',
  FILTER_SIDEBAR: '.filter-sidebar',
  PRODUCT_BASIC_INFO: '.product-basic-info',
  PRODUCT_PRICING: '.product-pricing',
  PRODUCT_IMAGES: '.product-images'
} as const;