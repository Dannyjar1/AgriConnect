import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tutorial } from '../../../core/services/tutorial';
import type { UserRole, TutorialContext } from '../../../core/models/tutorial.model';

/**
 * Tutorial Trigger Component - Componente para activar tutoriales
 * 
 * Componente reutilizable que permite activar tutoriales desde cualquier parte de la aplicación.
 * Sigue las convenciones de Angular 20 y proporciona una interfaz simple para iniciar tours.
 * 
 * @example
 * ```html
 * <app-tutorial-trigger 
 *   userRole="producer" 
 *   context="dashboard"
 *   [showButton]="true"
 *   (tutorialStarted)="onTutorialStarted()"
 *   (tutorialCompleted)="onTutorialCompleted()">
 * </app-tutorial-trigger>
 * ```
 * 
 * @version 1.0.0
 * @author AgriConnect Team
 */
@Component({
  selector: 'app-tutorial-trigger',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (showButton) {
      <div class="tutorial-trigger-container">
        <button
          type="button"
          class="tutorial-trigger-button"
          [class.tutorial-active]="tutorialService.isActive()"
          [disabled]="isLoading() || tutorialService.isActive()"
          (click)="startTutorial()"
          [attr.aria-label]="buttonLabel"
        >
          @if (isLoading()) {
            <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="ml-2">Cargando...</span>
          } @else {
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="ml-2">{{ buttonText }}</span>
          }
        </button>
        
        @if (showProgress && tutorialService.isActive()) {
          <div class="tutorial-progress-indicator">
            <div class="progress-bar-wrapper">
              <div 
                class="progress-bar-fill" 
                [style.width.%]="tutorialService.progress()"
              ></div>
            </div>
            <span class="progress-text">
              {{ tutorialService.currentStep() }} de {{ tutorialService.totalSteps() }}
            </span>
          </div>
        }
      </div>
    }

    @if (showAutoPrompt && shouldShowPrompt()) {
      <div class="tutorial-auto-prompt" [class.fade-in]="!hasPromptBeenShown()">
        <div class="prompt-content">
          <div class="prompt-icon">
            <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="prompt-text">
            <h3 class="prompt-title">¿Primera vez en {{ getContextLabel() }}?</h3>
            <p class="prompt-description">
              Te ofrecemos un tutorial rápido para conocer las funcionalidades principales.
            </p>
          </div>
          <div class="prompt-actions">
            <button
              type="button"
              class="btn-secondary prompt-dismiss"
              (click)="dismissPrompt()"
            >
              No, gracias
            </button>
            <button
              type="button"
              class="btn-primary prompt-start"
              (click)="startTutorialFromPrompt()"
              [disabled]="isLoading()"
            >
              @if (isLoading()) {
                Iniciando...
              } @else {
                Comenzar tutorial
              }
            </button>
          </div>
        </div>
        
        <button
          type="button"
          class="prompt-close"
          (click)="dismissPrompt()"
          aria-label="Cerrar"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    }
  `,
  styles: [`
    .tutorial-trigger-container {
      position: relative;
    }

    .tutorial-trigger-button {
      @apply flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200;
      
      &.tutorial-active {
        @apply bg-blue-50 text-blue-700 border-blue-300;
      }
      
      &:disabled {
        @apply opacity-50 cursor-not-allowed;
      }
    }

    .tutorial-progress-indicator {
      @apply mt-3 space-y-2;
      
      .progress-bar-wrapper {
        @apply w-full bg-gray-200 rounded-full h-2;
        
        .progress-bar-fill {
          @apply bg-blue-500 h-2 rounded-full transition-all duration-300;
        }
      }
      
      .progress-text {
        @apply text-xs text-gray-600 text-center block;
      }
    }

    .tutorial-auto-prompt {
      @apply fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50;
      animation: slideInUp 0.3s ease-out;
      
      .prompt-content {
        @apply flex items-start space-x-3;
        
        .prompt-icon {
          @apply flex-shrink-0;
        }
        
        .prompt-text {
          @apply flex-1;
          
          .prompt-title {
            @apply text-sm font-semibold text-gray-900 mb-1;
          }
          
          .prompt-description {
            @apply text-xs text-gray-600 mb-3;
          }
        }
      }
      
      .prompt-actions {
        @apply flex space-x-2 ml-11;
        
        .prompt-dismiss,
        .prompt-start {
          @apply text-xs px-3 py-1.5;
        }
      }
      
      .prompt-close {
        @apply absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1;
      }
      
      &.fade-in {
        animation: fadeIn 0.5s ease-out;
      }
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @media (max-width: 640px) {
      .tutorial-auto-prompt {
        @apply bottom-2 right-2 left-2 max-w-none;
      }
    }
  `]
})
export class TutorialTrigger {
  
  // Injected services
  protected readonly tutorialService = inject(Tutorial);
  
  // Input properties
  @Input() userRole: UserRole = 'buyer';
  @Input() context: TutorialContext = 'dashboard';
  @Input() showButton: boolean = true;
  @Input() showProgress: boolean = true;
  @Input() showAutoPrompt: boolean = false;
  @Input() buttonText: string = 'Iniciar tutorial';
  @Input() autoStartDelay: number = 2000; // milliseconds
  
  // Output events
  @Output() tutorialStarted = new EventEmitter<void>();
  @Output() tutorialCompleted = new EventEmitter<void>();
  @Output() tutorialCancelled = new EventEmitter<void>();
  
  // Internal state
  protected readonly isLoading = signal<boolean>(false);
  private readonly hasPromptBeenShown = signal<boolean>(false);
  private autoPromptTimeout?: number;
  
  // Computed properties
  protected readonly buttonLabel = `Iniciar tutorial de ${this.getContextLabel()}`;
  
  constructor() {
    // Auto-start prompt if enabled
    if (this.showAutoPrompt) {
      this.scheduleAutoPrompt();
    }
    
    // Listen to tutorial events
    this.setupEventListeners();
  }

  /**
   * Iniciar tutorial manualmente
   */
  async startTutorial(): Promise<void> {
    if (this.isLoading() || this.tutorialService.isActive()) {
      return;
    }

    this.isLoading.set(true);
    
    try {
      await this.tutorialService.startWelcomeTour(this.userRole, this.context);
      this.tutorialStarted.emit();
    } catch (error) {
      console.error('Error starting tutorial:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Iniciar tutorial desde el prompt automático
   */
  async startTutorialFromPrompt(): Promise<void> {
    this.dismissPrompt();
    await this.startTutorial();
  }

  /**
   * Descartar el prompt automático
   */
  dismissPrompt(): void {
    this.hasPromptBeenShown.set(false);
    if (this.autoPromptTimeout) {
      clearTimeout(this.autoPromptTimeout);
    }
    
    // Recordar que el usuario no quiere ver el prompt
    localStorage.setItem(`tutorial_prompt_dismissed_${this.context}`, 'true');
  }

  /**
   * Verificar si se debe mostrar el prompt automático
   */
  protected shouldShowPrompt(): boolean {
    if (!this.showAutoPrompt) return false;
    if (this.tutorialService.isTutorialCompleted()) return false;
    if (this.tutorialService.isActive()) return false;
    
    const dismissed = localStorage.getItem(`tutorial_prompt_dismissed_${this.context}`);
    if (dismissed === 'true') return false;
    
    return this.hasPromptBeenShown();
  }

  /**
   * Obtener etiqueta legible del contexto
   */
  protected getContextLabel(): string {
    const labels: Record<TutorialContext, string> = {
      'dashboard': 'Panel de Control',
      'marketplace': 'Marketplace',
      'product-create': 'Creación de Productos',
      'product-edit': 'Edición de Productos',
      'profile': 'Perfil',
      'orders': 'Pedidos',
      'cart': 'Carrito'
    };
    
    return labels[this.context] || 'la aplicación';
  }

  /**
   * Programar aparición automática del prompt
   */
  private scheduleAutoPrompt(): void {
    if (!this.showAutoPrompt) return;
    
    this.autoPromptTimeout = window.setTimeout(() => {
      if (!this.tutorialService.isTutorialCompleted() && !this.tutorialService.isActive()) {
        this.hasPromptBeenShown.set(true);
      }
    }, this.autoStartDelay);
  }

  /**
   * Configurar event listeners para el tutorial
   */
  private setupEventListeners(): void {
    // En un escenario real, estos eventos vendrían del servicio de tutorial
    // Por ahora, simulamos la escucha de eventos
    
    const checkTutorialStatus = () => {
      if (!this.tutorialService.isActive() && this.isLoading()) {
        this.isLoading.set(false);
        
        // Determinar si se completó o se canceló
        if (this.tutorialService.isTutorialCompleted()) {
          this.tutorialCompleted.emit();
        } else {
          this.tutorialCancelled.emit();
        }
      }
    };

    // Verificar estado cada segundo (esto podría ser mejorado con eventos reales)
    setInterval(checkTutorialStatus, 1000);
  }

  /**
   * Limpiar timeouts al destruir el componente
   */
  ngOnDestroy(): void {
    if (this.autoPromptTimeout) {
      clearTimeout(this.autoPromptTimeout);
    }
  }
}