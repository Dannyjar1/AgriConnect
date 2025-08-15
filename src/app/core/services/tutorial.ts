import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ShepherdService } from 'angular-shepherd';
import type { StepOptions, UserRole } from '../models/tutorial.model';

/**
 * Enhanced Tutorial Service - Premium guided tutorials for AgriConnect
 * 
 * Modern tutorial system with glassmorphism effects, premium animations,
 * and comprehensive user experience optimization.
 * 
 * Features:
 * - Signal-based reactive state management
 * - Modern AgriConnect theme integration
 * - Progressive tour enhancement
 * - Analytics and metrics tracking
 * - Accessibility-first approach
 * - Mobile-optimized responsive design
 * - Multi-context tutorial support
 * - Smart persistence with user preferences
 * 
 * @version 2.0.0
 * @author AgriConnect Team
 */
@Injectable({
  providedIn: 'root'
})
export class Tutorial {
  
  private readonly shepherdService = inject(ShepherdService);
  private readonly router = inject(Router);
  
  // Enhanced reactive state with signals
  readonly isActive = signal<boolean>(false);
  readonly currentStep = signal<number>(0);
  readonly totalSteps = signal<number>(0);
  readonly currentTourId = signal<string>('');
  readonly tourStartTime = signal<Date | null>(null);
  readonly isLoading = signal<boolean>(false);
  
  // Computed properties for better UX
  readonly progress = computed(() => 
    this.totalSteps() > 0 ? Math.round((this.currentStep() / this.totalSteps()) * 100) : 0
  );
  readonly isFirstStep = computed(() => this.currentStep() <= 1);
  readonly isLastStep = computed(() => this.currentStep() >= this.totalSteps());
  readonly hasNextStep = computed(() => this.currentStep() < this.totalSteps());
  readonly hasPreviousStep = computed(() => this.currentStep() > 1);
  readonly remainingSteps = computed(() => Math.max(0, this.totalSteps() - this.currentStep()));
  readonly estimatedTimeRemaining = computed(() => {
    const avgStepTime = 30; // seconds per step
    return this.remainingSteps() * avgStepTime;
  });

  // Enhanced AgriConnect theme configuration
  private readonly shepherdConfig = {
    useModalOverlay: true,
    exitOnEsc: true,
    keyboardNavigation: true,
    classPrefix: 'shepherd',
    defaultStepOptions: {
      classes: 'shepherd-theme-agriconnect',
      scrollTo: { 
        behavior: 'smooth' as ScrollBehavior, 
        block: 'center' as ScrollLogicalPosition,
        inline: 'nearest' as ScrollLogicalPosition
      },
      cancelIcon: {
        enabled: true,
        label: 'Cerrar tutorial'
      },
      modalOverlayOpeningPadding: 8,
      modalOverlayOpeningRadius: 12,
      when: {
        show: () => this.onStepShow(),
        hide: () => this.onStepHide(),
        complete: () => this.onTourComplete(),
        cancel: () => this.onTourCancel()
      }
    }
  };

  constructor() {
    this.initializeShepherd();
    this.setupGlobalEventListeners();
  }

  /**
   * Initialize enhanced Shepherd configuration
   */
  private initializeShepherd(): void {
    // Apply enhanced configuration
    Object.assign(this.shepherdService, this.shepherdConfig);
    
    // Set up global tour events
    this.shepherdService.tourObject?.on('complete', () => this.onTourComplete());
    this.shepherdService.tourObject?.on('cancel', () => this.onTourCancel());
    this.shepherdService.tourObject?.on('start', () => this.onTourStart());
    
    // Enhanced error handling
    this.shepherdService.tourObject?.on('error', (error: any) => {
      console.error('Shepherd tutorial error:', error);
      this.handleTutorialError(error);
    });
  }

  /**
   * Start enhanced welcome tour with premium UX
   */
  async startWelcomeTour(
    userRole: UserRole, 
    context: string = 'dashboard'
  ): Promise<void> {
    if (this.isActive() || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    const tourId = `welcome-${userRole}-${context}`;
    
    try {
      // Check if tour should be shown
      if (!this.shouldShowTutorial(tourId)) {
        this.isLoading.set(false);
        return;
      }

      // Get enhanced tour steps
      const steps = await this.getEnhancedWelcomeTourSteps(userRole, context);
      
      if (steps.length === 0) {
        console.warn(`No tutorial steps found for role: ${userRole}, context: ${context}`);
        this.isLoading.set(false);
        return;
      }

      // Initialize tour state
      this.currentTourId.set(tourId);
      this.totalSteps.set(steps.length);
      this.currentStep.set(0);
      this.tourStartTime.set(new Date());
      this.isActive.set(true);

      // Add enhanced steps with progression
      const enhancedSteps = this.enhanceStepsWithProgression(steps);
      this.shepherdService.addSteps(enhancedSteps);
      
      // Start the tour
      this.shepherdService.start();
      
      // Track analytics
      this.trackTutorialMetrics('start', {
        tourId,
        userRole,
        context,
        totalSteps: steps.length
      });

    } catch (error) {
      console.error('Error starting welcome tour:', error);
      this.handleTutorialError(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Start custom tour with enhanced features
   */
  async startCustomTour(
    tourId: string, 
    steps: StepOptions[],
    options: {
      forceStart?: boolean;
      trackAnalytics?: boolean;
      showCelebration?: boolean;
    } = {}
  ): Promise<void> {
    if (this.isActive() && !options.forceStart) {
      return;
    }

    this.isLoading.set(true);

    try {
      // Enhance steps with modern styling
      const enhancedSteps = this.enhanceStepsWithProgression(steps);
      
      // Initialize state
      this.currentTourId.set(tourId);
      this.totalSteps.set(enhancedSteps.length);
      this.currentStep.set(0);
      this.tourStartTime.set(new Date());
      this.isActive.set(true);

      // Start tour
      this.shepherdService.addSteps(enhancedSteps);
      this.shepherdService.start();

      // Track analytics if enabled
      if (options.trackAnalytics !== false) {
        this.trackTutorialMetrics('custom_start', {
          tourId,
          totalSteps: enhancedSteps.length,
          customOptions: options
        });
      }

    } catch (error) {
      console.error('Error starting custom tour:', error);
      this.handleTutorialError(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Enhanced step progression with better UX
   */
  nextStep(): void {
    if (this.shepherdService.tourObject?.getCurrentStep()) {
      this.shepherdService.next();
      this.trackStepTransition('next');
    }
  }

  /**
   * Enhanced step regression
   */
  previousStep(): void {
    if (this.shepherdService.tourObject?.getCurrentStep()) {
      this.shepherdService.back();
      this.trackStepTransition('previous');
    }
  }

  /**
   * Complete tour with celebration
   */
  completeTour(showCelebration: boolean = true): void {
    if (this.isActive()) {
      if (showCelebration) {
        this.showCompletionCelebration();
      }
      this.shepherdService.complete();
    }
  }

  /**
   * Cancel tour with confirmation
   */
  cancelTour(skipConfirmation: boolean = false): void {
    if (this.isActive()) {
      if (!skipConfirmation && this.currentStep() > 1) {
        const confirmed = confirm(
          '¿Estás seguro de que deseas cancelar el tutorial? Tu progreso se perderá.'
        );
        if (!confirmed) return;
      }
      
      this.shepherdService.cancel();
    }
  }

  /**
   * Enhanced step creation with modern styling
   */
  private enhanceStepsWithProgression(steps: StepOptions[]): StepOptions[] {
    return steps.map((step, index) => ({
      ...step,
      id: step.id || `step-${index + 1}`,
      
      // Enhanced styling and classes
      classes: `${step.classes || ''} shepherd-theme-agriconnect step-${index + 1}`,
      
      // Add progress indicator to each step
      title: this.enhanceStepTitle(step.title || '', index + 1, steps.length),
      
      // Enhanced buttons with better UX
      buttons: this.enhanceStepButtons(step.buttons || [], index, steps.length),
      
      // Enhanced when callbacks
      when: {
        ...step.when,
        show: () => {
          this.onStepShow();
          if (step.when?.show) {
            step.when.show.call(this);
          }
        },
        hide: () => {
          this.onStepHide();
          if (step.when?.hide) {
            step.when.hide.call(this);
          }
        }
      },

      // Enhanced accessibility
      'aria-label': `Paso ${index + 1} de ${steps.length}: ${step.title || 'Tutorial step'}`,
      
      // Enhanced positioning with better responsive behavior
      attachTo: {
        ...step.attachTo,
        on: step.attachTo?.on || 'bottom'
      }
    }));
  }

  /**
   * Enhance step title with progress indicator
   */
  private enhanceStepTitle(originalTitle: string, currentStep: number, totalSteps: number): string {
    const progressHTML = `
      <div class="tutorial-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${(currentStep / totalSteps) * 100}%"></div>
        </div>
        <div class="progress-text">${currentStep} de ${totalSteps}</div>
      </div>
    `;
    
    return `
      <div class="step-title-wrapper">
        <h2 class="step-title">${originalTitle}</h2>
        ${progressHTML}
      </div>
    `;
  }

  /**
   * Enhance step buttons with modern AgriConnect styling
   */
  private enhanceStepButtons(
    originalButtons: any[], 
    stepIndex: number, 
    totalSteps: number
  ): any[] {
    const isFirstStep = stepIndex === 0;
    const isLastStep = stepIndex === totalSteps - 1;

    // Default button configuration
    const defaultButtons = [];

    // Skip/Cancel button (only on first step)
    if (isFirstStep) {
      defaultButtons.push({
        text: 'Saltar tutorial',
        action: () => this.cancelTour(true),
        classes: 'btn-secondary shepherd-button-secondary',
        'aria-label': 'Saltar tutorial completo'
      });
    }

    // Back button (not on first step)
    if (!isFirstStep) {
      defaultButtons.push({
        text: 'Anterior',
        action: () => this.previousStep(),
        classes: 'btn-secondary shepherd-button-secondary',
        'aria-label': 'Ir al paso anterior'
      });
    }

    // Next/Complete button
    if (isLastStep) {
      defaultButtons.push({
        text: '¡Completar! 🎉',
        action: () => this.completeTour(),
        classes: 'btn-success shepherd-button-primary',
        'aria-label': 'Completar tutorial'
      });
    } else {
      defaultButtons.push({
        text: 'Siguiente',
        action: () => this.nextStep(),
        classes: 'btn-primary shepherd-button-primary',
        'aria-label': `Continuar al paso ${stepIndex + 2}`
      });
    }

    // Merge with original buttons if provided
    return originalButtons.length > 0 ? originalButtons : defaultButtons;
  }

  /**
   * Get enhanced welcome tour steps
   */
  private async getEnhancedWelcomeTourSteps(
    userRole: UserRole, 
    context: string
  ): Promise<StepOptions[]> {
    if (userRole === 'producer') {
      return this.getEnhancedProducerSteps(context);
    } else {
      return this.getEnhancedBuyerSteps(context);
    }
  }

  /**
   * Enhanced producer tutorial steps
   */
  private getEnhancedProducerSteps(context: string): StepOptions[] {
    const baseSteps: StepOptions[] = [
      {
        title: '¡Bienvenido a AgriConnect! 🌱',
        text: `
          <div class="welcome-content">
            <p>¡Hola! Somos el equipo de AgriConnect y estamos emocionados de tenerte aquí.</p>
            <p>Como <strong>productor agrícola</strong>, tendrás acceso a herramientas potentes para:</p>
            <ul>
              <li>🌾 Gestionar tu inventario de productos</li>
              <li>📈 Analizar tus ventas y rendimiento</li>
              <li>🛒 Conectar directamente con compradores</li>
              <li>💰 Maximizar tus ingresos</li>
            </ul>
            <p>Este tutorial te llevará aproximadamente <strong>3 minutos</strong> y te mostrará todo lo esencial.</p>
          </div>
        `,
        attachTo: {
          element: 'body',
          on: 'center'
        },
        modalOverlayOpeningPadding: 0
      }
    ];

    // Add context-specific steps
    if (context === 'dashboard') {
      baseSteps.push(...this.getProducerDashboardSteps());
    } else if (context === 'product-create') {
      baseSteps.push(...this.getProductCreationSteps());
    }

    return baseSteps;
  }

  /**
   * Enhanced buyer tutorial steps
   */
  private getEnhancedBuyerSteps(context: string): StepOptions[] {
    const baseSteps: StepOptions[] = [
      {
        title: '¡Bienvenido a AgriConnect! 🛒',
        text: `
          <div class="welcome-content">
            <p>¡Perfecto! Has llegado al marketplace agrícola más completo.</p>
            <p>Como <strong>comprador</strong>, podrás:</p>
            <ul>
              <li>🌽 Explorar productos frescos directos del productor</li>
              <li>🔍 Filtrar y comparar opciones fácilmente</li>
              <li>📦 Gestionar tus pedidos y entregas</li>
              <li>⭐ Calificar y revisar tus compras</li>
            </ul>
            <p>Te guiaremos en <strong>2-3 minutos</strong> para que aproveches todas las funcionalidades.</p>
          </div>
        `,
        attachTo: {
          element: 'body',
          on: 'center'
        },
        modalOverlayOpeningPadding: 0
      }
    ];

    // Add context-specific steps
    if (context === 'marketplace') {
      baseSteps.push(...this.getBuyerMarketplaceSteps());
    }

    return baseSteps;
  }

  /**
   * Enhanced producer dashboard steps
   */
  private getProducerDashboardSteps(): StepOptions[] {
    return [
      {
        title: 'Tu Panel de Control 📊',
        text: `
          <p>Este es tu <strong>centro de comando</strong>. Aquí puedes ver:</p>
          <ul>
            <li>📈 Estadísticas de ventas en tiempo real</li>
            <li>📦 Estado de tus productos y pedidos</li>
            <li>💰 Ingresos y tendencias</li>
            <li>🎯 Objetivos y metas</li>
          </ul>
          <p><em>Consejo:</em> Visita tu dashboard regularmente para mantener un control óptimo de tu negocio.</p>
        `,
        attachTo: {
          element: '.dashboard-overview',
          on: 'bottom'
        }
      },
      {
        title: 'Gestión de Productos 🌾',
        text: `
          <p>Desde aquí administras todo tu <strong>inventario agrícola</strong>:</p>
          <ul>
            <li>➕ Crear nuevos productos</li>
            <li>✏️ Editar información y precios</li>
            <li>📸 Subir fotos atractivas</li>
            <li>📊 Ver estadísticas de cada producto</li>
          </ul>
          <p><strong>Tip pro:</strong> Productos con buenas fotos venden 3x más.</p>
        `,
        attachTo: {
          element: '[data-tour="products-menu"]',
          on: 'right'
        }
      },
      {
        title: 'Tu Perfil Profesional 👨‍🌾',
        text: `
          <p>Un perfil completo genera <strong>más confianza</strong> en los compradores:</p>
          <ul>
            <li>📝 Información de contacto actualizada</li>
            <li>🏆 Certificaciones y reconocimientos</li>
            <li>📍 Ubicación y métodos de entrega</li>
            <li>⭐ Reseñas y calificaciones</li>
          </ul>
          <p><strong>¡Listo!</strong> Ya conoces lo básico. ¡Empieza a vender tus productos! 🚀</p>
        `,
        attachTo: {
          element: '[data-tour="profile-menu"]',
          on: 'left'
        }
      }
    ];
  }

  /**
   * Enhanced buyer marketplace steps
   */
  private getBuyerMarketplaceSteps(): StepOptions[] {
    return [
      {
        title: 'Explora Productos Frescos 🌽',
        text: `
          <p>¡Bienvenido al marketplace! Aquí encontrarás:</p>
          <ul>
            <li>🌱 Productos frescos directo del campo</li>
            <li>🔍 Sistema de búsqueda inteligente</li>
            <li>📱 Información detallada de cada producto</li>
            <li>⭐ Calificaciones de otros compradores</li>
          </ul>
          <p><em>Navega fácilmente</em> y descubre la calidad que buscas.</p>
        `,
        attachTo: {
          element: '.products-grid',
          on: 'top'
        }
      },
      {
        title: 'Tu Carrito de Compras 🛒',
        text: `
          <p>Administra tus compras de forma <strong>inteligente</strong>:</p>
          <ul>
            <li>➕ Agrega productos que te interesen</li>
            <li>📊 Ve el resumen de tu pedido</li>
            <li>💰 Calcula costos de envío</li>
            <li>✅ Procede al checkout cuando estés listo</li>
          </ul>
          <p><strong>Tip:</strong> Revisa las opciones de entrega disponibles.</p>
        `,
        attachTo: {
          element: '[data-tour="cart-icon"]',
          on: 'bottom-left'
        }
      },
      {
        title: 'Filtros Inteligentes 🎯',
        text: `
          <p>Encuentra <strong>exactamente</strong> lo que necesitas:</p>
          <ul>
            <li>📍 Por ubicación y distancia</li>
            <li>💰 Rango de precios</li>
            <li>🏷️ Categorías específicas</li>
            <li>⭐ Calificaciones mínimas</li>
            <li>🚚 Opciones de entrega</li>
          </ul>
          <p><strong>¡Perfecto!</strong> Ya estás listo para comprar productos increíbles. ¡Disfruta tu experiencia! 🎉</p>
        `,
        attachTo: {
          element: '.filter-sidebar',
          on: 'right'
        }
      }
    ];
  }

  /**
   * Enhanced product creation steps
   */
  private getProductCreationSteps(): StepOptions[] {
    return [
      {
        title: 'Crear tu Primer Producto 🌱',
        text: `
          <div class="product-creation-intro">
            <p>¡Excelente! Vamos a crear tu primer producto paso a paso.</p>
            <p>Un producto bien configurado puede aumentar tus ventas hasta un <strong>300%</strong>.</p>
            <div class="tips-box">
              <h4>🎯 Tips para el éxito:</h4>
              <ul>
                <li>Usa fotos de alta calidad</li>
                <li>Describe beneficios, no solo características</li>
                <li>Establece precios competitivos</li>
                <li>Mantén el stock actualizado</li>
              </ul>
            </div>
          </div>
        `,
        attachTo: {
          element: 'body',
          on: 'center'
        }
      },
      {
        title: 'Información Básica 📝',
        text: `
          <p>Completa estos campos con <strong>información clara y atractiva</strong>:</p>
          <ul>
            <li><strong>Nombre:</strong> Específico y descriptivo</li>
            <li><strong>Descripción:</strong> Beneficios y características únicas</li>
            <li><strong>Categoría:</strong> Para que los compradores te encuentren</li>
          </ul>
          <p><em>Ejemplo bueno:</em> "Tomates Cherry Orgánicos - Dulces y Jugosos"</p>
          <p><em>Evita:</em> "Tomates"</p>
        `,
        attachTo: {
          element: '.product-basic-info',
          on: 'right'
        }
      },
      {
        title: 'Precios y Disponibilidad 💰',
        text: `
          <p><strong>Pricing inteligente</strong> para maximizar ventas:</p>
          <ul>
            <li>💵 <strong>Precio por unidad:</strong> Competitivo pero rentable</li>
            <li>📦 <strong>Cantidad disponible:</strong> Stock real actualizado</li>
            <li>🏷️ <strong>Unidad de medida:</strong> Clara para el comprador</li>
          </ul>
          <div class="pricing-tip">
            <p><strong>💡 Consejo:</strong> Revisa precios de competidores y ofrece 5-10% menos para empezar.</p>
          </div>
        `,
        attachTo: {
          element: '.product-pricing',
          on: 'left'
        }
      },
      {
        title: 'Imágenes que Venden 📸',
        text: `
          <p>Las fotos son <strong>cruciales</strong> para el éxito:</p>
          <ul>
            <li>📱 Usa buena iluminación natural</li>
            <li>🎯 Muestra el producto desde varios ángulos</li>
            <li>✨ Destaca la frescura y calidad</li>
            <li>📏 Incluye referencias de tamaño</li>
          </ul>
          <div class="success-message">
            <h4>🎉 ¡Felicitaciones!</h4>
            <p>Ya tienes todo lo necesario para crear productos exitosos. ¡Tu primer producto está listo!</p>
          </div>
        `,
        attachTo: {
          element: '.product-images',
          on: 'top'
        }
      }
    ];
  }

  /**
   * Show completion celebration with confetti
   */
  private showCompletionCelebration(): void {
    // Create celebration modal
    const celebrationHTML = `
      <div class="tutorial-celebration" role="dialog" aria-labelledby="celebration-title">
        <div class="celebration-content">
          <div class="celebration-icon">🎉</div>
          <h2 id="celebration-title" class="celebration-title">¡Tutorial Completado!</h2>
          <p class="celebration-message">
            ¡Excelente! Has completado el tutorial de AgriConnect. 
            Ahora estás listo para aprovechar todas las funcionalidades de la plataforma.
          </p>
          <button class="celebration-button" onclick="this.parentElement.parentElement.remove()">
            ¡Empezar a usar AgriConnect!
          </button>
        </div>
      </div>
    `;
    
    // Add to DOM temporarily
    const celebrationElement = document.createElement('div');
    celebrationElement.innerHTML = celebrationHTML;
    document.body.appendChild(celebrationElement);
    
    // Remove after animation
    setTimeout(() => {
      celebrationElement.remove();
    }, 5000);
  }

  /**
   * Enhanced event handlers
   */
  private onTourStart(): void {
    this.tourStartTime.set(new Date());
    console.log('🚀 Tutorial started');
  }

  private onStepShow(): void {
    const currentStepIndex = this.getCurrentStepIndex();
    this.currentStep.set(currentStepIndex + 1);
    
    // Add step-specific animations
    this.addStepAnimations();
  }

  private onStepHide(): void {
    // Clean up step-specific animations
    this.cleanupStepAnimations();
  }

  private onTourComplete(): void {
    const tourDuration = this.tourStartTime() ? 
      Date.now() - this.tourStartTime()!.getTime() : 0;
    
    this.isActive.set(false);
    this.currentStep.set(0);
    this.markTutorialAsCompleted();
    
    // Track completion metrics
    this.trackTutorialMetrics('complete', {
      tourId: this.currentTourId(),
      duration: tourDuration,
      stepsCompleted: this.totalSteps()
    });
    
    console.log('✅ Tutorial completed successfully');
  }

  private onTourCancel(): void {
    const tourDuration = this.tourStartTime() ? 
      Date.now() - this.tourStartTime()!.getTime() : 0;
    
    this.isActive.set(false);
    this.currentStep.set(0);
    
    // Track cancellation metrics
    this.trackTutorialMetrics('cancel', {
      tourId: this.currentTourId(),
      duration: tourDuration,
      exitStep: this.currentStep(),
      stepsCompleted: this.currentStep() - 1
    });
    
    console.log('❌ Tutorial cancelled by user');
  }

  /**
   * Check if tutorial should be shown
   */
  private shouldShowTutorial(tourId?: string): boolean {
    const key = tourId ? `agriconnect_tutorial_${tourId}_completed` : 'agriconnect_tutorial_completed';
    return localStorage.getItem(key) !== 'true';
  }

  /**
   * Mark tutorial as completed with enhanced tracking
   */
  private markTutorialAsCompleted(): void {
    const tourId = this.currentTourId();
    const completionData = {
      completed: true,
      completedAt: new Date().toISOString(),
      tourId: tourId,
      version: '2.0',
      stepsCompleted: this.totalSteps(),
      duration: this.tourStartTime() ? Date.now() - this.tourStartTime()!.getTime() : 0
    };
    
    localStorage.setItem('agriconnect_tutorial_completed', 'true');
    localStorage.setItem('agriconnect_tutorial_completed_date', completionData.completedAt);
    localStorage.setItem(`agriconnect_tutorial_${tourId}_completed`, 'true');
    localStorage.setItem(`agriconnect_tutorial_${tourId}_data`, JSON.stringify(completionData));
  }

  /**
   * Enhanced error handling
   */
  private handleTutorialError(error: any): void {
    this.isActive.set(false);
    this.isLoading.set(false);
    this.currentStep.set(0);
    
    // Log error with context
    console.error('Tutorial Error:', {
      error,
      tourId: this.currentTourId(),
      currentStep: this.currentStep(),
      timestamp: new Date().toISOString()
    });
    
    // Show user-friendly message
    this.showErrorMessage();
  }

  /**
   * Show user-friendly error message
   */
  private showErrorMessage(): void {
    const errorHTML = `
      <div class="tutorial-error-message" style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #fee2e2, #fecaca);
        border: 1px solid #f87171;
        border-radius: 12px;
        padding: 1rem;
        max-width: 300px;
        z-index: 10000;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      ">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
          <span style="font-size: 1.2rem;">⚠️</span>
          <strong>Error en el tutorial</strong>
        </div>
        <p style="margin: 0; font-size: 0.9rem; color: #7f1d1d;">
          Ocurrió un problema técnico. Por favor, recarga la página e inténtalo de nuevo.
        </p>
      </div>
    `;
    
    const errorElement = document.createElement('div');
    errorElement.innerHTML = errorHTML;
    document.body.appendChild(errorElement);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      errorElement.remove();
    }, 5000);
  }

  /**
   * Enhanced analytics and metrics tracking
   */
  private trackTutorialMetrics(event: string, data: any): void {
    // Track with Google Analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, {
        event_category: 'Tutorial',
        event_label: data.tourId || 'unknown',
        value: data.duration || 0,
        custom_map: {
          custom_parameter_1: 'tour_id',
          custom_parameter_2: 'user_role',
          custom_parameter_3: 'context'
        }
      });
    }
    
    // Store metrics locally for later analysis
    const metricsKey = 'agriconnect_tutorial_metrics';
    const existingMetrics = JSON.parse(localStorage.getItem(metricsKey) || '[]');
    
    existingMetrics.push({
      event,
      data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    
    // Keep only last 100 metrics
    const recentMetrics = existingMetrics.slice(-100);
    localStorage.setItem(metricsKey, JSON.stringify(recentMetrics));
  }

  /**
   * Track step transitions for analytics
   */
  private trackStepTransition(direction: 'next' | 'previous'): void {
    this.trackTutorialMetrics('step_transition', {
      direction,
      fromStep: this.currentStep(),
      tourId: this.currentTourId(),
      timestamp: Date.now()
    });
  }

  /**
   * Add step-specific animations
   */
  private addStepAnimations(): void {
    // Add highlight animations to target elements
    const targetElement = document.querySelector('.shepherd-target-highlighted');
    if (targetElement) {
      targetElement.classList.add('animate-pulse-subtle');
    }
  }

  /**
   * Clean up step animations
   */
  private cleanupStepAnimations(): void {
    document.querySelectorAll('.animate-pulse-subtle').forEach(el => {
      el.classList.remove('animate-pulse-subtle');
    });
  }

  /**
   * Get current step index - Fixed to work with Angular Shepherd
   */
  private getCurrentStepIndex(): number {
    const currentStep = this.shepherdService.tourObject?.getCurrentStep();
    if (!currentStep) return 0;
    
    // Use steps property instead of getSteps() method which doesn't exist
    const steps = this.shepherdService.tourObject?.steps || [];
    return steps.findIndex(step => step === currentStep);
  }

  /**
   * Setup global event listeners
   */
  private setupGlobalEventListeners(): void {
    // Listen for escape key to cancel tutorial
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isActive()) {
        this.cancelTour();
      }
    });
    
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.isActive()) {
        // Pause tutorial metrics when tab is not visible
        this.trackTutorialMetrics('pause', {
          tourId: this.currentTourId(),
          step: this.currentStep()
        });
      }
    });
  }

  /**
   * Public API methods for external use
   */

  /**
   * Reset tutorial completion status
   */
  resetTutorial(tourId?: string): void {
    if (tourId) {
      localStorage.removeItem(`agriconnect_tutorial_${tourId}_completed`);
      localStorage.removeItem(`agriconnect_tutorial_${tourId}_data`);
    } else {
      localStorage.removeItem('agriconnect_tutorial_completed');
      localStorage.removeItem('agriconnect_tutorial_completed_date');
    }
  }

  /**
   * Check if specific tutorial was completed
   */
  isTutorialCompleted(tourId?: string): boolean {
    if (tourId) {
      return localStorage.getItem(`agriconnect_tutorial_${tourId}_completed`) === 'true';
    }
    return localStorage.getItem('agriconnect_tutorial_completed') === 'true';
  }

  /**
   * Get tutorial progress information
   */
  getTutorialProgress(): {
    current: number;
    total: number;
    percentage: number;
    remaining: number;
    estimatedTimeRemaining: number;
  } {
    return {
      current: this.currentStep(),
      total: this.totalSteps(),
      percentage: this.progress(),
      remaining: this.remainingSteps(),
      estimatedTimeRemaining: this.estimatedTimeRemaining()
    };
  }

  /**
   * Get tutorial metrics for analytics
   */
  getTutorialMetrics(): any[] {
    const metricsKey = 'agriconnect_tutorial_metrics';
    return JSON.parse(localStorage.getItem(metricsKey) || '[]');
  }

  /**
   * Clear all tutorial data
   */
  clearAllTutorialData(): void {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith('agriconnect_tutorial_')
    );
    
    keys.forEach(key => localStorage.removeItem(key));
    console.log('🧹 All tutorial data cleared');
  }
}