import { Component, signal, inject, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription, fromEvent } from 'rxjs';

/**
 * CreditCardModal Component - Modal for credit/debit card payment method
 * 
 * Standalone Angular 20 component for handling credit card payments.
 * Features include:
 * - Credit card form with real-time validation
 * - Luhn algorithm validation for card numbers
 * - Card type detection (Visa, MasterCard, etc.)
 * - Expiry date and CVV validation
 * - Accessibility compliance (WCAG 2.1 AA)
 * - Focus trap and keyboard navigation
 * - Responsive design with mobile-first approach
 * - SessionStorage persistence for form data (excluding sensitive info)
 * 
 * @author AgriConnect Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-credit-card-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Modal Backdrop -->
    @if (isOpen()) {
      <div 
        class="fixed inset-0 z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="credit-card-title"
        (keydown.escape)="closeModal()"
        #modalContainer>
        
        <!-- Semi-transparent backdrop -->
        <div 
          class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300"
          (click)="closeModal()"
          aria-hidden="true">
        </div>
        
        <!-- Modal Panel -->
        <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-xl bg-white shadow-xl transition-all w-full max-w-lg animate-fade-in-scale">
            
            <!-- Header -->
            <header class="bg-gradient-to-r from-agri-green-50 to-emerald-50 px-6 py-4 border-b border-agri-green-100">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-gradient-to-br from-agri-green-500 to-agri-green-600 rounded-lg flex items-center justify-center">
                    <span class="material-icons text-white text-sm">credit_card</span>
                  </div>
                  <h1 id="credit-card-title" class="text-lg font-bold text-gray-900 font-epilogue">
                    Tarjeta de Crédito/Débito
                  </h1>
                </div>
                <button
                  (click)="closeModal()"
                  class="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/80 rounded-full transition-all duration-200 hover:shadow-md"
                  aria-label="Cerrar modal"
                  #closeButton>
                  <span class="material-icons text-xl">close</span>
                </button>
              </div>
            </header>
            
            <!-- Main Content -->
            <main class="px-6 py-6">
              
              <!-- Security Notice -->
              <section class="mb-6">
                <div class="bg-gradient-to-br from-agri-green-50 to-emerald-50 rounded-xl p-4 border border-agri-green-100 shadow-sm">
                  <div class="flex items-start space-x-3">
                    <span class="material-icons text-agri-green-600 text-lg mt-0.5">security</span>
                    <div class="text-sm text-gray-800">
                      <p class="font-medium mb-1">Información Segura</p>
                      <p class="text-gray-700">Los datos de tu tarjeta se procesan de forma segura. No almacenamos información sensible de tarjetas de crédito.</p>
                    </div>
                  </div>
                </div>
              </section>
              
              <!-- Credit Card Form -->
              <section aria-labelledby="card-form-title">
                <h2 id="card-form-title" class="text-base font-semibold text-gray-900 font-epilogue mb-4 flex items-center">
                  <span class="material-icons text-agri-green-600 mr-2 text-sm">payment</span>
                  Datos de la Tarjeta
                </h2>
                
                <form [formGroup]="cardForm" (ngSubmit)="onSubmit()" novalidate>
                  <div class="bg-gradient-to-br from-agri-green-50 to-emerald-50 rounded-xl p-4 border border-agri-green-100 shadow-sm space-y-4">
                    
                    <!-- Card Holder Name -->
                    <div class="space-y-2">
                      <label for="cardHolder" class="block text-sm font-medium text-gray-900 relative after:content-['*'] after:text-red-500 after:ml-1">
                        Nombre del Titular
                      </label>
                      <input
                        id="cardHolder"
                        type="text"
                        formControlName="cardHolder"
                        [class]="'block w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ' + (isFieldInvalid('cardHolder') ? 'border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20 bg-red-50' : 'border-agri-green-100 bg-white/70 placeholder-gray-500 focus:border-agri-green-500 focus:ring-2 focus:ring-agri-green-500 focus:ring-opacity-20 text-gray-900')"
                        placeholder="Como aparece en la tarjeta"
                        aria-describedby="cardHolder-error"
                        autocomplete="cc-name"
                        #cardHolderInput>
                      @if (isFieldInvalid('cardHolder')) {
                        <div id="cardHolder-error" class="flex items-center space-x-1 text-sm text-red-600" role="alert">
                          <span class="material-icons text-sm">error</span>
                          El nombre del titular es requerido
                        </div>
                      }
                    </div>
                    
                    <!-- Card Number -->
                    <div class="space-y-2">
                      <label for="cardNumber" class="block text-sm font-medium text-gray-900 relative after:content-['*'] after:text-red-500 after:ml-1">
                        Número de Tarjeta
                      </label>
                      <div class="relative">
                        <input
                          id="cardNumber"
                          type="text"
                          formControlName="cardNumber"
                          [class]="'block w-full px-4 py-3 pr-12 text-sm border rounded-lg transition-all duration-200 ' + (isFieldInvalid('cardNumber') ? 'border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20 bg-red-50' : 'border-agri-green-100 bg-white/70 placeholder-gray-500 focus:border-agri-green-500 focus:ring-2 focus:ring-agri-green-500 focus:ring-opacity-20 text-gray-900')"
                          placeholder="1234 5678 9012 3456"
                          aria-describedby="cardNumber-error cardNumber-help"
                          autocomplete="cc-number"
                          maxlength="19"
                          (input)="onCardNumberInput($event)">
                        <!-- Card Type Icon -->
                        @if (cardType()) {
                          <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                            <span class="text-xs font-bold text-gray-600">{{ cardType() }}</span>
                          </div>
                        }
                      </div>
                      <div id="cardNumber-help" class="text-xs text-gray-600">
                        Ingresa los 16 dígitos de tu tarjeta
                      </div>
                      @if (isFieldInvalid('cardNumber')) {
                        <div id="cardNumber-error" class="flex items-center space-x-1 text-sm text-red-600" role="alert">
                          <span class="material-icons text-sm">error</span>
                          @if (cardForm.get('cardNumber')?.hasError('required')) {
                            El número de tarjeta es requerido
                          } @else if (cardForm.get('cardNumber')?.hasError('luhn')) {
                            Número de tarjeta inválido
                          } @else if (cardForm.get('cardNumber')?.hasError('minlength')) {
                            El número de tarjeta debe tener al menos 13 dígitos
                          }
                        </div>
                      }
                    </div>
                    
                    <!-- Expiry Date and CVV -->
                    <div class="grid grid-cols-2 gap-4">
                      <!-- Expiry Date -->
                      <div class="space-y-2">
                        <label for="expiryDate" class="block text-sm font-medium text-gray-900 relative after:content-['*'] after:text-red-500 after:ml-1">
                          Fecha de Vencimiento
                        </label>
                        <input
                          id="expiryDate"
                          type="text"
                          formControlName="expiryDate"
                          [class]="'block w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ' + (isFieldInvalid('expiryDate') ? 'border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20 bg-red-50' : 'border-agri-green-100 bg-white/70 placeholder-gray-500 focus:border-agri-green-500 focus:ring-2 focus:ring-agri-green-500 focus:ring-opacity-20 text-gray-900')"
                          placeholder="MM/YY"
                          aria-describedby="expiryDate-error"
                          autocomplete="cc-exp"
                          maxlength="5"
                          (input)="onExpiryInput($event)">
                        @if (isFieldInvalid('expiryDate')) {
                          <div id="expiryDate-error" class="flex items-center space-x-1 text-sm text-red-600" role="alert">
                            <span class="material-icons text-sm">error</span>
                            @if (cardForm.get('expiryDate')?.hasError('required')) {
                              La fecha es requerida
                            } @else if (cardForm.get('expiryDate')?.hasError('pattern')) {
                              Formato inválido (MM/YY)
                            } @else if (cardForm.get('expiryDate')?.hasError('expired')) {
                              Tarjeta vencida
                            }
                          </div>
                        }
                      </div>
                      
                      <!-- CVV -->
                      <div class="space-y-2">
                        <label for="cvv" class="block text-sm font-medium text-gray-900 relative after:content-['*'] after:text-red-500 after:ml-1">
                          CVV
                        </label>
                        <input
                          id="cvv"
                          type="text"
                          formControlName="cvv"
                          [class]="'block w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ' + (isFieldInvalid('cvv') ? 'border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20 bg-red-50' : 'border-agri-green-100 bg-white/70 placeholder-gray-500 focus:border-agri-green-500 focus:ring-2 focus:ring-agri-green-500 focus:ring-opacity-20 text-gray-900')"
                          placeholder="123"
                          aria-describedby="cvv-error cvv-help"
                          autocomplete="cc-csc"
                          maxlength="4"
                          (input)="onCvvInput($event)">
                        <div id="cvv-help" class="text-xs text-gray-600">
                          3-4 dígitos en el reverso
                        </div>
                        @if (isFieldInvalid('cvv')) {
                          <div id="cvv-error" class="flex items-center space-x-1 text-sm text-red-600" role="alert">
                            <span class="material-icons text-sm">error</span>
                            @if (cardForm.get('cvv')?.hasError('required')) {
                              El CVV es requerido
                            } @else if (cardForm.get('cvv')?.hasError('pattern')) {
                              CVV inválido (3-4 dígitos)
                            }
                          </div>
                        }
                      </div>
                    </div>
                    
                    <!-- Save Card Option -->
                    <div class="space-y-2">
                      <label class="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          formControlName="saveCard"
                          class="w-4 h-4 text-agri-green-600 border-agri-green-300 rounded focus:ring-agri-green-500 focus:ring-2">
                        <span class="text-sm text-gray-700">Guardar tarjeta para futuras compras (opcional)</span>
                      </label>
                      <p class="text-xs text-gray-500 ml-7">Solo se guardarán los últimos 4 dígitos y fecha de vencimiento</p>
                    </div>
                  </div>
                  
                  <!-- Submit Button -->
                  <div class="mt-6">
                    <button
                      type="submit"
                      [disabled]="cardForm.invalid || isProcessing()"
                      class="w-full bg-gradient-to-r from-agri-green-600 to-emerald-600 hover:from-agri-green-700 hover:to-emerald-700 
                             disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
                             text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 
                             flex items-center justify-center space-x-2 hover:shadow-lg transform hover:scale-[1.02]
                             disabled:transform-none disabled:shadow-none shadow-md"
                      [attr.aria-describedby]="cardForm.invalid ? 'form-errors' : null">
                      @if (isProcessing()) {
                        <span class="animate-spin material-icons text-lg">refresh</span>
                        <span>Procesando...</span>
                      } @else {
                        <span class="material-icons text-lg">lock</span>
                        <span>Confirmar Pago Seguro</span>
                      }
                    </button>
                    
                    @if (cardForm.invalid && cardForm.touched) {
                      <div id="form-errors" class="mt-3 text-sm text-red-600 text-center" role="alert">
                        <span class="material-icons text-sm">error</span>
                        Por favor corrige los errores antes de continuar
                      </div>
                    }
                  </div>
                </form>
              </section>
            </main>
          </div>
        </div>
      </div>
    }
    
    <!-- Success Notification -->
    @if (showSuccess()) {
      <div class="fixed top-4 right-4 z-60 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg animate-slide-down">
        <div class="flex items-center space-x-2">
          <span class="material-icons text-green-600">check_circle</span>
          <span class="text-sm font-medium text-green-800">{{ successMessage() }}</span>
        </div>
      </div>
    }
    
    <!-- Error Notification -->
    @if (showError()) {
      <div class="fixed top-4 right-4 z-60 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg animate-slide-down">
        <div class="flex items-center space-x-2">
          <span class="material-icons text-red-600">error</span>
          <span class="text-sm font-medium text-red-800">{{ errorMessage() }}</span>
        </div>
      </div>
    }
  `,
  styleUrls: ['./credit-card-modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditCardModal implements OnInit, OnDestroy {
  
  // Services injection
  private readonly fb = inject(FormBuilder);
  private readonly elementRef = inject(ElementRef);

  // ViewChild references for focus management
  @ViewChild('closeButton') closeButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('modalContainer') modalContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('cardHolderInput') cardHolderInput!: ElementRef<HTMLInputElement>;

  // Component state signals
  readonly isOpen = signal<boolean>(false);
  readonly isProcessing = signal<boolean>(false);
  readonly showSuccess = signal<boolean>(false);
  readonly showError = signal<boolean>(false);
  readonly successMessage = signal<string>('');
  readonly errorMessage = signal<string>('');
  readonly cardType = signal<string>('');

  // Form and validation
  cardForm!: FormGroup;
  private keyboardSubscription?: Subscription;

  // Output events
  readonly cardConfirmed = output<{
    method: string;
    cardHolder: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardType: string;
    saveCard: boolean;
    timestamp: Date;
  }>();

  ngOnInit(): void {
    this.initializeForm();
    this.setupKeyboardListeners();
  }

  ngOnDestroy(): void {
    if (this.keyboardSubscription) {
      this.keyboardSubscription.unsubscribe();
    }
  }

  /**
   * Initialize reactive form with validation
   */
  private initializeForm(): void {
    this.cardForm = this.fb.group({
      cardHolder: ['', [Validators.required, Validators.minLength(3)]],
      cardNumber: ['', [Validators.required, this.luhnValidator, Validators.minLength(13)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/), this.expiryValidator]],
      cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]],
      saveCard: [false]
    });

    // Auto-save form progress (excluding sensitive data)
    this.cardForm.valueChanges.subscribe(() => {
      this.saveToSessionStorage();
    });
  }

  /**
   * Setup keyboard event listeners for accessibility
   */
  private setupKeyboardListeners(): void {
    this.keyboardSubscription = fromEvent<KeyboardEvent>(document, 'keydown').subscribe(event => {
      if (this.isOpen() && event.key === 'Tab') {
        this.handleTabKeyPress(event);
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
   * Open credit card modal
   */
  openModal(): void {
    this.isOpen.set(true);
    this.loadFromSessionStorage();
    
    // Focus management - focus on card holder input after animation
    setTimeout(() => {
      this.cardHolderInput?.nativeElement?.focus();
    }, 100);
  }

  /**
   * Close credit card modal
   */
  closeModal(): void {
    this.isOpen.set(false);
    this.hideNotifications();
  }

  /**
   * Check if a field is invalid and has been touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.cardForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Handle credit card number input with formatting and validation
   */
  onCardNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\s/g, '').replace(/\D/g, '');
    
    // Limit to 16 digits
    if (value.length > 16) {
      value = value.substring(0, 16);
    }
    
    // Add spaces every 4 digits
    value = value.replace(/(.{4})/g, '$1 ').trim();
    input.value = value;
    
    // Detect card type
    this.detectCardType(value.replace(/\s/g, ''));
    
    this.cardForm.get('cardNumber')?.setValue(value);
  }

  /**
   * Handle expiry date input with formatting
   */
  onExpiryInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    input.value = value;
    this.cardForm.get('expiryDate')?.setValue(value);
  }

  /**
   * Handle CVV input - only numbers
   */
  onCvvInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 4) {
      value = value.substring(0, 4);
    }
    
    input.value = value;
    this.cardForm.get('cvv')?.setValue(value);
  }

  /**
   * Detect credit card type based on number
   */
  private detectCardType(cardNumber: string): void {
    const cardTypes = [
      { name: 'VISA', pattern: /^4/ },
      { name: 'MASTERCARD', pattern: /^5[1-5]/ },
      { name: 'AMEX', pattern: /^3[47]/ },
      { name: 'DISCOVER', pattern: /^6(?:011|5)/ }
    ];

    const detectedType = cardTypes.find(type => type.pattern.test(cardNumber));
    this.cardType.set(detectedType ? detectedType.name : '');
  }

  /**
   * Luhn algorithm validator for credit card numbers
   */
  private luhnValidator(control: any) {
    const value = control.value?.replace(/\s/g, '') || '';
    if (!value) return null;
    
    let sum = 0;
    let alternate = false;
    
    for (let i = value.length - 1; i >= 0; i--) {
      let digit = parseInt(value.charAt(i));
      
      if (alternate) {
        digit *= 2;
        if (digit > 9) {
          digit = (digit % 10) + 1;
        }
      }
      
      sum += digit;
      alternate = !alternate;
    }
    
    return (sum % 10 === 0) ? null : { luhn: true };
  }

  /**
   * Expiry date validator - check if card is not expired
   */
  private expiryValidator(control: any) {
    const value = control.value;
    if (!value || !value.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      return null;
    }

    const [month, year] = value.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth());

    return expiryDate >= currentMonth ? null : { expired: true };
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.cardForm.valid) {
      this.isProcessing.set(true);
      
      // Simulate processing delay
      setTimeout(() => {
        const cardData = {
          method: 'credit_card',
          cardHolder: this.cardForm.value.cardHolder,
          cardNumber: this.maskCardNumber(this.cardForm.value.cardNumber),
          expiryDate: this.cardForm.value.expiryDate,
          cvv: this.cardForm.value.cvv,
          cardType: this.cardType(),
          saveCard: this.cardForm.value.saveCard,
          timestamp: new Date()
        };

        // Emit card confirmation
        this.cardConfirmed.emit(cardData);
        
        this.isProcessing.set(false);
        this.showSuccessMessage('Tarjeta verificada exitosamente');
        this.clearSessionStorage();
        
        // Close modal after success
        setTimeout(() => {
          this.closeModal();
        }, 1500);
      }, 1000);
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  /**
   * Mask credit card number for security
   */
  private maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    return `****-****-****-${cleaned.slice(-4)}`;
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.cardForm.controls).forEach(key => {
      this.cardForm.get(key)?.markAsTouched();
    });
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

  /**
   * Save form progress to sessionStorage (excluding sensitive data)
   */
  private saveToSessionStorage(): void {
    if (typeof window !== 'undefined') {
      const formData = {
        cardHolder: this.cardForm.value.cardHolder,
        saveCard: this.cardForm.value.saveCard
        // Exclude sensitive data like card number, cvv, expiry
      };
      sessionStorage.setItem('creditCardFormProgress', JSON.stringify(formData));
    }
  }

  /**
   * Load form progress from sessionStorage
   */
  private loadFromSessionStorage(): void {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('creditCardFormProgress');
      if (saved) {
        try {
          const formData = JSON.parse(saved);
          this.cardForm.patchValue(formData);
        } catch (error) {
          console.warn('Error loading credit card form progress:', error);
        }
      }
    }
  }

  /**
   * Clear sessionStorage data
   */
  private clearSessionStorage(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('creditCardFormProgress');
    }
  }
}