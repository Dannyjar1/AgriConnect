import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ShepherdService } from 'angular-shepherd';
import type { Step } from 'shepherd.js';

/**
 * Tutorial Service - Servicio de tutoriales guiados para nuevos usuarios de AgriConnect
 * 
 * Implementa sistema de tutoriales interactivos usando Shepherd.js para guiar a los usuarios
 * nuevos a través de la interfaz del marketplace cuando inician sesión por primera vez.
 * 
 * Features:
 * - Tutoriales contextuales para diferentes roles (productor/comprador)
 * - Estado reactivo con signals
 * - Configuración predefinida de pasos
 * - Integración con localStorage para persistencia
 * - Soporte para múltiples tours
 * 
 * @version 1.0.0
 * @author AgriConnect Team
 */
@Injectable({
  providedIn: 'root'
})
export class Tutorial {
  
  private readonly shepherdService = inject(ShepherdService);
  private readonly router = inject(Router);
  
  // Estado reactivo del tutorial
  readonly isActive = signal<boolean>(false);
  readonly currentStep = signal<number>(0);
  readonly totalSteps = signal<number>(0);
  readonly currentTourId = signal<string>('');
  
  // Computed properties
  readonly progress = computed(() => 
    this.totalSteps() > 0 ? (this.currentStep() / this.totalSteps()) * 100 : 0
  );
  readonly isFirstStep = computed(() => this.currentStep() <= 1);
  readonly isLastStep = computed(() => this.currentStep() >= this.totalSteps());

  // Configuración base de Shepherd
  private readonly defaultOptions = {
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'shepherd-theme-custom',
      scrollTo: { behavior: 'smooth', block: 'center' },
      cancelIcon: {
        enabled: true
      },
      when: {
        show: () => this.onStepShow(),
        hide: () => this.onStepHide()
      }
    }
  };

  constructor() {
    this.initializeShepherd();
  }

  /**
   * Inicializar configuración de Shepherd
   */
  private initializeShepherd(): void {
    this.shepherdService.defaultStepOptions = this.defaultOptions.defaultStepOptions;
    this.shepherdService.modal = this.defaultOptions.useModalOverlay;
    
    // Event listeners
    this.shepherdService.tourObject?.on('complete', () => this.onTourComplete());
    this.shepherdService.tourObject?.on('cancel', () => this.onTourCancel());
  }

  /**
   * Iniciar tutorial para usuarios nuevos
   * 
   * @param userRole - Rol del usuario ('producer' | 'buyer')
   * @param context - Contexto actual de la aplicación
   */
  async startWelcomeTour(userRole: 'producer' | 'buyer', context: string = 'dashboard'): Promise<void> {
    if (!this.shouldShowTutorial()) {
      return;
    }

    const tourId = `welcome-${userRole}-${context}`;
    this.currentTourId.set(tourId);
    
    const steps = this.getWelcomeTourSteps(userRole, context);
    
    if (steps.length === 0) {
      console.warn(`No tutorial steps found for role: ${userRole}, context: ${context}`);
      return;
    }

    this.totalSteps.set(steps.length);
    this.currentStep.set(0);
    this.isActive.set(true);

    try {
      this.shepherdService.addSteps(steps);
      this.shepherdService.start();
    } catch (error) {
      console.error('Error starting tutorial:', error);
      this.isActive.set(false);
    }
  }

  /**
   * Iniciar tutorial específico para una funcionalidad
   * 
   * @param tourId - ID único del tour
   * @param steps - Pasos del tutorial
   */
  async startCustomTour(tourId: string, steps: Step.StepOptions[]): Promise<void> {
    this.currentTourId.set(tourId);
    this.totalSteps.set(steps.length);
    this.currentStep.set(0);
    this.isActive.set(true);

    try {
      this.shepherdService.addSteps(steps);
      this.shepherdService.start();
    } catch (error) {
      console.error('Error starting custom tutorial:', error);
      this.isActive.set(false);
    }
  }

  /**
   * Detener tutorial actual
   */
  stopTour(): void {
    if (this.isActive()) {
      this.shepherdService.complete();
    }
  }

  /**
   * Cancelar tutorial actual
   */
  cancelTour(): void {
    if (this.isActive()) {
      this.shepherdService.cancel();
    }
  }

  /**
   * Verificar si se debe mostrar el tutorial
   * 
   * @returns true si el usuario no ha visto el tutorial
   */
  private shouldShowTutorial(): boolean {
    const hasSeenTutorial = localStorage.getItem('agriconnect_tutorial_completed');
    return !hasSeenTutorial;
  }

  /**
   * Marcar tutorial como completado
   */
  private markTutorialAsCompleted(): void {
    localStorage.setItem('agriconnect_tutorial_completed', 'true');
    localStorage.setItem('agriconnect_tutorial_completed_date', new Date().toISOString());
  }

  /**
   * Obtener pasos del tutorial de bienvenida según rol y contexto
   */
  private getWelcomeTourSteps(userRole: 'producer' | 'buyer', context: string): Step.StepOptions[] {
    if (userRole === 'producer') {
      return this.getProducerWelcomeSteps(context);
    } else {
      return this.getBuyerWelcomeSteps(context);
    }
  }

  /**
   * Pasos del tutorial para productores
   */
  private getProducerWelcomeSteps(context: string): Step.StepOptions[] {
    const baseSteps: Step.StepOptions[] = [
      {
        title: '¡Bienvenido a AgriConnect!',
        text: 'Te guiaremos a través de las funcionalidades principales de la plataforma para productores.',
        attachTo: {
          element: 'body',
          on: 'center'
        },
        buttons: [
          {
            text: 'Comenzar',
            action: () => this.shepherdService.next(),
            classes: 'btn-primary'
          },
          {
            text: 'Saltar tutorial',
            action: () => this.shepherdService.cancel(),
            classes: 'btn-secondary'
          }
        ]
      }
    ];

    // Agregar pasos específicos según el contexto
    if (context === 'dashboard') {
      baseSteps.push(...this.getProducerDashboardSteps());
    }

    return baseSteps;
  }

  /**
   * Pasos específicos del dashboard para productores
   */
  private getProducerDashboardSteps(): Step.StepOptions[] {
    return [
      {
        title: 'Panel de Control',
        text: 'Desde aquí puedes ver un resumen de tus productos, ventas y estadísticas.',
        attachTo: {
          element: '.dashboard-overview',
          on: 'bottom'
        },
        buttons: [
          {
            text: 'Anterior',
            action: () => this.shepherdService.back(),
            classes: 'btn-secondary'
          },
          {
            text: 'Siguiente',
            action: () => this.shepherdService.next(),
            classes: 'btn-primary'
          }
        ]
      },
      {
        title: 'Gestión de Productos',
        text: 'Aquí puedes crear, editar y gestionar todos tus productos agrícolas.',
        attachTo: {
          element: '[data-tour="products-menu"]',
          on: 'right'
        },
        buttons: [
          {
            text: 'Anterior',
            action: () => this.shepherdService.back(),
            classes: 'btn-secondary'
          },
          {
            text: 'Siguiente',
            action: () => this.shepherdService.next(),
            classes: 'btn-primary'
          }
        ]
      },
      {
        title: 'Perfil del Productor',
        text: 'Mantén actualizada tu información de contacto y certificaciones.',
        attachTo: {
          element: '[data-tour="profile-menu"]',
          on: 'left'
        },
        buttons: [
          {
            text: 'Anterior',
            action: () => this.shepherdService.back(),
            classes: 'btn-secondary'
          },
          {
            text: 'Finalizar',
            action: () => this.shepherdService.complete(),
            classes: 'btn-success'
          }
        ]
      }
    ];
  }

  /**
   * Pasos del tutorial para compradores
   */
  private getBuyerWelcomeSteps(context: string): Step.StepOptions[] {
    const baseSteps: Step.StepOptions[] = [
      {
        title: '¡Bienvenido a AgriConnect!',
        text: 'Te mostraremos cómo encontrar y comprar los mejores productos agrícolas.',
        attachTo: {
          element: 'body',
          on: 'center'
        },
        buttons: [
          {
            text: 'Comenzar',
            action: () => this.shepherdService.next(),
            classes: 'btn-primary'
          },
          {
            text: 'Saltar tutorial',
            action: () => this.shepherdService.cancel(),
            classes: 'btn-secondary'
          }
        ]
      }
    ];

    // Agregar pasos específicos según el contexto
    if (context === 'marketplace') {
      baseSteps.push(...this.getBuyerMarketplaceSteps());
    }

    return baseSteps;
  }

  /**
   * Pasos específicos del marketplace para compradores
   */
  private getBuyerMarketplaceSteps(): Step.StepOptions[] {
    return [
      {
        title: 'Explorar Productos',
        text: 'Navega por los productos disponibles y utiliza los filtros para encontrar lo que buscas.',
        attachTo: {
          element: '.products-grid',
          on: 'top'
        },
        buttons: [
          {
            text: 'Anterior',
            action: () => this.shepherdService.back(),
            classes: 'btn-secondary'
          },
          {
            text: 'Siguiente',
            action: () => this.shepherdService.next(),
            classes: 'btn-primary'
          }
        ]
      },
      {
        title: 'Carrito de Compras',
        text: 'Agrega productos a tu carrito y revisa tus selecciones antes de comprar.',
        attachTo: {
          element: '[data-tour="cart-icon"]',
          on: 'bottom-left'
        },
        buttons: [
          {
            text: 'Anterior',
            action: () => this.shepherdService.back(),
            classes: 'btn-secondary'
          },
          {
            text: 'Siguiente',
            action: () => this.shepherdService.next(),
            classes: 'btn-primary'
          }
        ]
      },
      {
        title: 'Filtros de Búsqueda',
        text: 'Usa estos filtros para encontrar productos por categoría, precio, ubicación y más.',
        attachTo: {
          element: '.filter-sidebar',
          on: 'right'
        },
        buttons: [
          {
            text: 'Anterior',
            action: () => this.shepherdService.back(),
            classes: 'btn-secondary'
          },
          {
            text: 'Finalizar',
            action: () => this.shepherdService.complete(),
            classes: 'btn-success'
          }
        ]
      }
    ];
  }

  /**
   * Tutorial para crear primer producto (productores)
   */
  getCreateProductTourSteps(): Step.StepOptions[] {
    return [
      {
        title: 'Crear tu Primer Producto',
        text: 'Te guiaremos paso a paso para crear tu primer producto en AgriConnect.',
        attachTo: {
          element: 'body',
          on: 'center'
        },
        buttons: [
          {
            text: 'Comenzar',
            action: () => this.shepherdService.next(),
            classes: 'btn-primary'
          }
        ]
      },
      {
        title: 'Información Básica',
        text: 'Completa el nombre, descripción y categoría de tu producto.',
        attachTo: {
          element: '.product-basic-info',
          on: 'right'
        },
        buttons: [
          {
            text: 'Siguiente',
            action: () => this.shepherdService.next(),
            classes: 'btn-primary'
          }
        ]
      },
      {
        title: 'Precios y Disponibilidad',
        text: 'Establece el precio por unidad y la cantidad disponible.',
        attachTo: {
          element: '.product-pricing',
          on: 'left'
        },
        buttons: [
          {
            text: 'Anterior',
            action: () => this.shepherdService.back(),
            classes: 'btn-secondary'
          },
          {
            text: 'Siguiente',
            action: () => this.shepherdService.next(),
            classes: 'btn-primary'
          }
        ]
      },
      {
        title: 'Imágenes del Producto',
        text: 'Sube fotos atractivas de tu producto para llamar la atención de los compradores.',
        attachTo: {
          element: '.product-images',
          on: 'top'
        },
        buttons: [
          {
            text: 'Anterior',
            action: () => this.shepherdService.back(),
            classes: 'btn-secondary'
          },
          {
            text: 'Finalizar',
            action: () => this.shepherdService.complete(),
            classes: 'btn-success'
          }
        ]
      }
    ];
  }

  /**
   * Callbacks de eventos
   */
  private onStepShow(): void {
    const currentStepIndex = this.shepherdService.tourObject?.getCurrentStep()?.options.id 
      ? parseInt(this.shepherdService.tourObject.getCurrentStep()!.options.id!) 
      : 0;
    this.currentStep.set(currentStepIndex + 1);
  }

  private onStepHide(): void {
    // Lógica adicional cuando se oculta un paso
  }

  private onTourComplete(): void {
    this.isActive.set(false);
    this.currentStep.set(0);
    this.markTutorialAsCompleted();
    console.log('Tutorial completed successfully');
  }

  private onTourCancel(): void {
    this.isActive.set(false);
    this.currentStep.set(0);
    console.log('Tutorial cancelled by user');
  }

  /**
   * Métodos públicos para gestión externa
   */

  /**
   * Reiniciar tutorial (borrar flag de completado)
   */
  resetTutorial(): void {
    localStorage.removeItem('agriconnect_tutorial_completed');
    localStorage.removeItem('agriconnect_tutorial_completed_date');
  }

  /**
   * Verificar si un tutorial específico fue completado
   */
  isTutorialCompleted(tourId?: string): boolean {
    if (tourId) {
      return localStorage.getItem(`agriconnect_tutorial_${tourId}_completed`) === 'true';
    }
    return localStorage.getItem('agriconnect_tutorial_completed') === 'true';
  }

  /**
   * Marcar tutorial específico como completado
   */
  markSpecificTutorialAsCompleted(tourId: string): void {
    localStorage.setItem(`agriconnect_tutorial_${tourId}_completed`, 'true');
  }

  /**
   * Obtener progreso del tutorial actual
   */
  getTutorialProgress(): { current: number; total: number; percentage: number } {
    return {
      current: this.currentStep(),
      total: this.totalSteps(),
      percentage: this.progress()
    };
  }
}