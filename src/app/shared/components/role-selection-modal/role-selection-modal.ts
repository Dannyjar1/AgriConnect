import { Component, signal, inject, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, fromEvent } from 'rxjs';

/**
 * RoleSelectionModal Component - Modal for user role selection after Google authentication
 * 
 * Standalone Angular 20 component for handling user role selection during first-time Google sign-in.
 * Features include:
 * - Role selection between Buyer and Producer
 * - Professional design with TailwindCSS v4
 * - Accessibility compliance (WCAG 2.1 AA)
 * - Focus trap and keyboard navigation
 * - Responsive design with mobile-first approach
 * - Clear role descriptions and visual distinctions
 * 
 * @author AgriConnect Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-role-selection-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Modal Backdrop -->
    @if (isOpen()) {
      <div 
        class="fixed inset-0 z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-selection-title"
        (keydown.escape)="closeModal()"
        #modalContainer>
        
        <!-- Semi-transparent backdrop -->
        <div 
          class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300"
          aria-hidden="true">
        </div>
        
        <!-- Modal Panel -->
        <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all w-full max-w-2xl animate-fade-in-scale">
            
            <!-- Header -->
            <header class="bg-gradient-to-r from-agri-green-50 to-emerald-50 px-8 py-6 border-b border-agri-green-100">
              <div class="text-center">
                <!-- Welcome Icon -->
                <div class="mx-auto w-16 h-16 bg-gradient-to-br from-agri-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                  </svg>
                </div>
                
                <h1 id="role-selection-title" class="text-2xl font-bold text-gray-900 font-epilogue mb-2">
                  ¡Bienvenido a AgriConnect!
                </h1>
                <p class="text-gray-600 font-noto-sans text-base">
                  Para personalizar tu experiencia, selecciona tu tipo de cuenta
                </p>
              </div>
            </header>
            
            <!-- Main Content -->
            <main class="px-8 py-8">
              
              <!-- Role Selection Cards -->
              <section class="grid md:grid-cols-2 gap-6">
                
                <!-- Buyer Role Card -->
                <div class="group">
                  <button
                    type="button"
                    (click)="selectRole('buyer')"
                    [class]="'w-full p-6 rounded-xl border-2 transition-all duration-300 text-left hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200 ' + 
                             (selectedRole() === 'buyer' ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' : 'border-gray-200 bg-white hover:border-blue-300')"
                    aria-pressed="false"
                    #buyerButton>
                    
                    <!-- Buyer Icon -->
                    <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mb-4 group-hover:shadow-md transition-shadow duration-300">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                      </svg>
                    </div>
                    
                    <!-- Buyer Content -->
                    <div class="space-y-3">
                      <h3 class="text-lg font-bold text-gray-900 font-epilogue flex items-center">
                        Comprador
                        @if (selectedRole() === 'buyer') {
                          <svg class="w-5 h-5 text-blue-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                          </svg>
                        }
                      </h3>
                      
                      <p class="text-sm text-gray-600 font-noto-sans leading-relaxed">
                        Encuentra productos agrícolas frescos y de calidad directamente de los productores
                      </p>
                      
                      <ul class="text-xs text-gray-500 space-y-1 font-noto-sans">
                        <li class="flex items-center">
                          <svg class="w-3 h-3 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                          </svg>
                          Acceso al marketplace completo
                        </li>
                        <li class="flex items-center">
                          <svg class="w-3 h-3 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                          </svg>
                          Carrito de compras y favoritos
                        </li>
                        <li class="flex items-center">
                          <svg class="w-3 h-3 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                          </svg>
                          Historial de pedidos y seguimiento
                        </li>
                        <li class="flex items-center">
                          <svg class="w-3 h-3 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                          </svg>
                          Sistema de reseñas y calificaciones
                        </li>
                      </ul>
                    </div>
                  </button>
                </div>
                
                <!-- SuperAdmin Role Card -->
                <div class="group">
                  <button
                    type="button"
                    (click)="selectRole('superadmin')"
                    [class]="'w-full p-6 rounded-xl border-2 transition-all duration-300 text-left hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-200 ' + 
                             (selectedRole() === 'superadmin' ? 'border-purple-500 bg-purple-50 shadow-lg scale-105' : 'border-gray-200 bg-white hover:border-purple-300')"
                    aria-pressed="false"
                    #superadminButton>
                    
                    <!-- SuperAdmin Icon -->
                    <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mb-4 group-hover:shadow-md transition-shadow duration-300">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                      </svg>
                    </div>
                    
                    <!-- SuperAdmin Content -->
                    <div class="space-y-3">
                      <h3 class="text-lg font-bold text-gray-900 font-epilogue flex items-center">
                        Administrador (Bodegero)
                        @if (selectedRole() === 'superadmin') {
                          <svg class="w-5 h-5 text-purple-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                          </svg>
                        }
                      </h3>
                      
                      <p class="text-sm text-gray-600 font-noto-sans leading-relaxed">
                        Gestiona el inventario, registra productores y supervisa todas las operaciones de la bodega
                      </p>
                      
                      <ul class="text-xs text-gray-500 space-y-1 font-noto-sans">
                        <li class="flex items-center">
                          <svg class="w-3 h-3 text-purple-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                          </svg>
                          Registro y gestión de productores
                        </li>
                        <li class="flex items-center">
                          <svg class="w-3 h-3 text-purple-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                          </svg>
                          Control completo del inventario
                        </li>
                        <li class="flex items-center">
                          <svg class="w-3 h-3 text-purple-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                          </svg>
                          Registro de entregas de productos
                        </li>
                        <li class="flex items-center">
                          <svg class="w-3 h-3 text-purple-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                          </svg>
                          Panel administrativo completo
                        </li>
                      </ul>
                    </div>
                  </button>
                </div>
              </section>
              
              <!-- Information Notice -->
              <div class="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                <div class="flex items-start space-x-3">
                  <svg class="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <div class="text-sm text-gray-700">
                    <p class="font-medium mb-1">Información importante</p>
                    <p class="text-gray-600">Podrás cambiar tu tipo de cuenta más tarde desde la configuración de tu perfil si es necesario.</p>
                  </div>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div class="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  (click)="confirmRole()"
                  [disabled]="!selectedRole() || isProcessing()"
                  class="flex-1 bg-gradient-to-r from-agri-green-600 to-emerald-600 hover:from-agri-green-700 hover:to-emerald-700 
                         disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
                         text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 
                         flex items-center justify-center space-x-2 hover:shadow-lg transform hover:scale-[1.02]
                         disabled:transform-none disabled:shadow-none shadow-md focus:outline-none focus:ring-4 focus:ring-agri-green-200"
                  #confirmButton>
                  @if (isProcessing()) {
                    <svg class="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Configurando perfil...</span>
                  } @else {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span>Continuar</span>
                  }
                </button>
                
                <button
                  type="button"
                  (click)="closeModal()"
                  [disabled]="isProcessing()"
                  class="sm:flex-none px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl 
                         hover:bg-gray-50 hover:border-gray-400 transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-gray-200">
                  Cancelar
                </button>
              </div>
            </main>
          </div>
        </div>
      </div>
    }
    
    <!-- Success Notification -->
    @if (showSuccess()) {
      <div class="fixed top-4 right-4 z-60 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg animate-slide-down">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <span class="text-sm font-medium text-green-800">{{ successMessage() }}</span>
        </div>
      </div>
    }
    
    <!-- Error Notification -->
    @if (showError()) {
      <div class="fixed top-4 right-4 z-60 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg animate-slide-down">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-sm font-medium text-red-800">{{ errorMessage() }}</span>
        </div>
      </div>
    }
  `,
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoleSelectionModal implements OnInit, OnDestroy {
  
  // Services injection
  private readonly elementRef = inject(ElementRef);

  // ViewChild references for focus management
  @ViewChild('closeButton') closeButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('modalContainer') modalContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('confirmButton') confirmButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('buyerButton') buyerButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('superadminButton') superadminButton!: ElementRef<HTMLButtonElement>;

  // Component state signals
  readonly isOpen = signal<boolean>(false);
  readonly isProcessing = signal<boolean>(false);
  readonly showSuccess = signal<boolean>(false);
  readonly showError = signal<boolean>(false);
  readonly successMessage = signal<string>('');
  readonly errorMessage = signal<string>('');
  readonly selectedRole = signal<'buyer' | 'superadmin' | null>(null);

  // User information
  readonly userInfo = signal<{
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
  } | null>(null);

  // Keyboard subscription
  private keyboardSubscription?: Subscription;

  // Output events
  readonly roleSelected = output<{
    role: 'buyer' | 'superadmin';
    userInfo: {
      uid: string;
      email: string;
      displayName: string;
      photoURL: string;
    };
  }>();

  readonly modalClosed = output<void>();

  ngOnInit(): void {
    this.setupKeyboardListeners();
  }

  ngOnDestroy(): void {
    if (this.keyboardSubscription) {
      this.keyboardSubscription.unsubscribe();
    }
  }

  /**
   * Setup keyboard event listeners for accessibility
   */
  private setupKeyboardListeners(): void {
    this.keyboardSubscription = fromEvent<KeyboardEvent>(document, 'keydown').subscribe(event => {
      if (this.isOpen()) {
        if (event.key === 'Tab') {
          this.handleTabKeyPress(event);
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          this.handleArrowKeyPress(event);
        } else if (event.key === 'Enter' || event.key === ' ') {
          this.handleEnterOrSpaceKeyPress(event);
        }
      }
    });
  }

  /**
   * Handle tab key press for focus trap
   */
  private handleTabKeyPress(event: KeyboardEvent): void {
    const focusableElements = this.modalContainer?.nativeElement?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (!focusableElements || focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  }

  /**
   * Handle arrow key navigation between role cards
   */
  private handleArrowKeyPress(event: KeyboardEvent): void {
    const currentElement = document.activeElement;
    
    if (event.key === 'ArrowLeft') {
      if (currentElement === this.superadminButton?.nativeElement) {
        this.buyerButton?.nativeElement?.focus();
        event.preventDefault();
      }
    } else if (event.key === 'ArrowRight') {
      if (currentElement === this.buyerButton?.nativeElement) {
        this.superadminButton?.nativeElement?.focus();
        event.preventDefault();
      }
    }
  }

  /**
   * Handle Enter or Space key press for role selection
   */
  private handleEnterOrSpaceKeyPress(event: KeyboardEvent): void {
    const currentElement = document.activeElement;
    
    if (currentElement === this.buyerButton?.nativeElement) {
      this.selectRole('buyer');
      event.preventDefault();
    } else if (currentElement === this.superadminButton?.nativeElement) {
      this.selectRole('superadmin');
      event.preventDefault();
    }
  }

  /**
   * Open role selection modal
   */
  openModal(userInfo: { uid: string; email: string; displayName: string; photoURL: string }): void {
    this.userInfo.set(userInfo);
    this.selectedRole.set(null);
    this.isOpen.set(true);
    
    // Focus management - focus on first role button after animation
    setTimeout(() => {
      this.buyerButton?.nativeElement?.focus();
    }, 100);
  }

  /**
   * Close role selection modal
   */
  closeModal(): void {
    this.isOpen.set(false);
    this.selectedRole.set(null);
    this.hideNotifications();
    this.modalClosed.emit();
  }

  /**
   * Select a user role
   */
  selectRole(role: 'buyer' | 'superadmin'): void {
    this.selectedRole.set(role);
    
    // Update aria-pressed attributes
    if (this.buyerButton?.nativeElement) {
      this.buyerButton.nativeElement.setAttribute('aria-pressed', role === 'buyer' ? 'true' : 'false');
    }
    if (this.superadminButton?.nativeElement) {
      this.superadminButton.nativeElement.setAttribute('aria-pressed', role === 'superadmin' ? 'true' : 'false');
    }
  }

  /**
   * Confirm role selection and emit event
   */
  confirmRole(): void {
    const role = this.selectedRole();
    const user = this.userInfo();
    
    if (!role || !user) {
      this.showErrorMessage('Por favor selecciona un tipo de cuenta');
      return;
    }

    this.isProcessing.set(true);

    // Simulate processing delay
    setTimeout(() => {
      // Emit role selection event
      this.roleSelected.emit({
        role,
        userInfo: user
      });
      
      this.isProcessing.set(false);
      this.showSuccessMessage(`Perfil de ${role === 'buyer' ? 'Comprador' : 'Administrador'} configurado correctamente`);
      
      // Close modal after success
      setTimeout(() => {
        this.closeModal();
      }, 1500);
    }, 1000);
  }

  /**
   * Show success notification
   */
  private showSuccessMessage(message: string): void {
    this.successMessage.set(message);
    this.showSuccess.set(true);
    setTimeout(() => {
      this.showSuccess.set(false);
    }, 3000);
  }

  /**
   * Show error notification
   */
  private showErrorMessage(message: string): void {
    this.errorMessage.set(message);
    this.showError.set(true);
    setTimeout(() => {
      this.showError.set(false);
    }, 3000);
  }

  /**
   * Hide all notifications
   */
  private hideNotifications(): void {
    this.showSuccess.set(false);
    this.showError.set(false);
  }
}