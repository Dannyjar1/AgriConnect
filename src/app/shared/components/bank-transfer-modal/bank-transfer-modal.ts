import { Component, signal, inject, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription, fromEvent } from 'rxjs';

/**
 * BankTransferModal Component - Modal for bank transfer payment method
 * 
 * Standalone Angular 20 component for handling bank transfer payments.
 * Features include:
 * - QR code display and download functionality
 * - Payment link copy and external opening
 * - Voucher number validation (letters and numbers only)
 * - Accessibility compliance (WCAG 2.1 AA)
 * - Focus trap and keyboard navigation
 * - Responsive design with mobile-first approach
 * - SessionStorage persistence for form data
 * 
 * @author AgriConnect Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-bank-transfer-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Modal Backdrop -->
    @if (isOpen()) {
      <div 
        class="fixed inset-0 z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bank-transfer-title"
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
          <div class="relative transform overflow-hidden rounded-xl bg-white shadow-xl transition-all w-full max-w-lg sm:max-w-md animate-fade-in-scale">
            
            <!-- Header -->
            <header class="bg-gradient-to-r from-agri-green-50 to-emerald-50 px-6 py-4 border-b border-agri-green-100">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-gradient-to-br from-agri-green-500 to-agri-green-600 rounded-lg flex items-center justify-center">
                    <span class="material-icons text-white text-sm">account_balance</span>
                  </div>
                  <h1 id="bank-transfer-title" class="text-lg font-bold text-gray-900 font-epilogue">
                    Transferencia Bancaria
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
              
              <!-- QR Code Section -->
              <section class="mb-6" aria-labelledby="qr-section-title">
                <h2 id="qr-section-title" class="text-base font-semibold text-gray-900 font-epilogue mb-4 flex items-center">
                  <span class="material-icons text-agri-green-600 mr-2 text-sm">qr_code</span>
                  Código QR de Pago
                </h2>
                
                <div class="bg-gradient-to-br from-agri-green-50 to-emerald-50 rounded-xl p-4 border border-agri-green-100 shadow-sm">
                  <div class="flex flex-col items-center space-y-4">
                    <!-- QR Code Image -->
                    <div class="bg-white p-3 rounded-lg shadow-sm border border-agri-green-100">
                      <img 
                        [src]="qrImagePath" 
                        alt="Código QR para transferencia bancaria"
                        class="w-32 h-32 object-contain"
                        #qrImage
                        (error)="onQRImageError($event)">
                    </div>
                    
                    <!-- QR Actions -->
                    <div class="flex flex-wrap gap-2 justify-center">
                      <button
                        type="button"
                        (click)="downloadQR()"
                        class="inline-flex items-center px-3 py-2 text-xs font-medium text-agri-green-700 bg-agri-green-50 border border-agri-green-200 rounded-lg hover:bg-agri-green-100 transition-colors duration-200">
                        <span class="material-icons text-sm mr-1">download</span>
                        Descargar QR
                      </button>
                    </div>
                  </div>
                </div>
              </section>
              
              <!-- Payment Link Section -->
              <section class="mb-6" aria-labelledby="link-section-title">
                <h2 id="link-section-title" class="text-base font-semibold text-gray-900 font-epilogue mb-4 flex items-center">
                  <span class="material-icons text-agri-green-600 mr-2 text-sm">link</span>
                  Link de Cobro
                </h2>
                
                <div class="bg-gradient-to-br from-agri-green-50 to-emerald-50 rounded-xl p-4 border border-agri-green-100 shadow-sm">
                  <div class="space-y-3">
                    <!-- Link Display -->
                    <div class="bg-white/70 rounded-lg p-3 border border-agri-green-100">
                      <p class="text-xs text-gray-600 mb-1">Link de pago:</p>
                      <p class="text-sm text-gray-900 font-mono break-all">{{ paymentLink }}</p>
                    </div>
                    
                    <!-- Link Actions -->
                    <div class="flex flex-wrap gap-2">
                      <button
                        type="button"
                        (click)="copyLink()"
                        class="inline-flex items-center px-3 py-2 text-xs font-medium text-agri-green-700 bg-agri-green-50 border border-agri-green-200 rounded-lg hover:bg-agri-green-100 transition-colors duration-200">
                        <span class="material-icons text-sm mr-1">content_copy</span>
                        Copiar Link
                      </button>
                      <button
                        type="button"
                        (click)="openLink()"
                        class="inline-flex items-center px-3 py-2 text-xs font-medium text-agri-green-700 bg-agri-green-50 border border-agri-green-200 rounded-lg hover:bg-agri-green-100 transition-colors duration-200">
                        <span class="material-icons text-sm mr-1">open_in_new</span>
                        Abrir Link
                      </button>
                    </div>
                  </div>
                </div>
              </section>
              
              <!-- Voucher Form Section -->
              <section aria-labelledby="voucher-section-title">
                <h2 id="voucher-section-title" class="text-base font-semibold text-gray-900 font-epilogue mb-4 flex items-center">
                  <span class="material-icons text-agri-green-600 mr-2 text-sm">receipt</span>
                  Datos de Transferencia
                </h2>
                
                <form [formGroup]="transferForm" (ngSubmit)="onSubmit()" novalidate>
                  <div class="bg-gradient-to-br from-agri-green-50 to-emerald-50 rounded-xl p-4 border border-agri-green-100 shadow-sm space-y-4">
                    
                    <!-- Voucher Number Field -->
                    <div class="space-y-2">
                      <label for="voucherNumber" class="block text-sm font-medium text-gray-900 relative after:content-['*'] after:text-red-500 after:ml-1">
                        Número de Comprobante
                      </label>
                      <input
                        id="voucherNumber"
                        type="text"
                        formControlName="voucherNumber"
                        [class]="'block w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 uppercase ' + (isFieldInvalid('voucherNumber') ? 'border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20 bg-red-50' : 'border-agri-green-100 bg-white/70 placeholder-gray-500 focus:border-agri-green-500 focus:ring-2 focus:ring-agri-green-500 focus:ring-opacity-20 text-gray-900')"
                        placeholder="Ej: ABC123456789"
                        aria-describedby="voucherNumber-error voucherNumber-help"
                        autocomplete="off"
                        maxlength="20"
                        #voucherInput>
                      <div id="voucherNumber-help" class="text-xs text-gray-600">
                        Solo letras mayúsculas y números (6-20 caracteres)
                      </div>
                      @if (isFieldInvalid('voucherNumber')) {
                        <div id="voucherNumber-error" class="flex items-center space-x-1 text-sm text-red-600" role="alert">
                          <span class="material-icons text-sm">error</span>
                          @if (transferForm.get('voucherNumber')?.hasError('required')) {
                            El número de comprobante es requerido
                          } @else if (transferForm.get('voucherNumber')?.hasError('pattern')) {
                            Solo se permiten letras mayúsculas y números (6-20 caracteres)
                          } @else if (transferForm.get('voucherNumber')?.hasError('minlength')) {
                            Mínimo 6 caracteres
                          } @else if (transferForm.get('voucherNumber')?.hasError('maxlength')) {
                            Máximo 20 caracteres
                          }
                        </div>
                      }
                    </div>
                    
                    <!-- Notes Field -->
                    <div class="space-y-2">
                      <label for="notes" class="block text-sm font-medium text-gray-900">
                        Notas Adicionales
                      </label>
                      <textarea
                        id="notes"
                        formControlName="notes"
                        class="block w-full px-4 py-3 text-sm border border-agri-green-100 rounded-lg bg-white/70 placeholder-gray-500 focus:border-agri-green-500 focus:ring-2 focus:ring-agri-green-500 focus:ring-opacity-20 text-gray-900 transition-all duration-200"
                        rows="3"
                        placeholder="Información adicional sobre la transferencia (opcional)"
                        maxlength="300"
                        aria-describedby="notes-help"></textarea>
                      <div id="notes-help" class="text-xs text-gray-600">
                        {{ getNotesLength() }}/300 caracteres
                      </div>
                    </div>
                  </div>
                  
                  <!-- Submit Button -->
                  <div class="mt-6">
                    <button
                      type="submit"
                      [disabled]="transferForm.invalid || isProcessing()"
                      class="w-full bg-gradient-to-r from-agri-green-600 to-emerald-600 hover:from-agri-green-700 hover:to-emerald-700 
                             disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
                             text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 
                             flex items-center justify-center space-x-2 hover:shadow-lg transform hover:scale-[1.02]
                             disabled:transform-none disabled:shadow-none shadow-md"
                      [attr.aria-describedby]="transferForm.invalid ? 'form-errors' : null">
                      @if (isProcessing()) {
                        <span class="animate-spin material-icons text-lg">refresh</span>
                        <span>Procesando...</span>
                      } @else {
                        <span class="material-icons text-lg">check_circle</span>
                        <span>Confirmar Transferencia</span>
                      }
                    </button>
                    
                    @if (transferForm.invalid && transferForm.touched) {
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
  styleUrls: ['./bank-transfer-modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BankTransferModal implements OnInit, OnDestroy {
  
  // Services injection
  private readonly fb = inject(FormBuilder);
  private readonly elementRef = inject(ElementRef);

  // ViewChild references for focus management
  @ViewChild('closeButton') closeButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('modalContainer') modalContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('voucherInput') voucherInput!: ElementRef<HTMLInputElement>;
  @ViewChild('qrImage') qrImage!: ElementRef<HTMLImageElement>;

  // Component state signals
  readonly isOpen = signal<boolean>(false);
  readonly isProcessing = signal<boolean>(false);
  readonly showSuccess = signal<boolean>(false);
  readonly showError = signal<boolean>(false);
  readonly successMessage = signal<string>('');
  readonly errorMessage = signal<string>('');

  // Form and validation
  transferForm!: FormGroup;
  private keyboardSubscription?: Subscription;

  // Payment configuration
  readonly qrImagePath = 'assets/images/QR.png';
  readonly paymentLink = 'https://ahorita.bancodeloja.fin.ec/pay?D3A2B373B79140DFA62BB46F6CCE0ABA31691D7A';

  // Output events
  readonly transferConfirmed = output<{
    method: string;
    voucherNumber: string;
    paymentLink: string;
    qrImagePath: string;
    notes: string;
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
    this.transferForm = this.fb.group({
      voucherNumber: ['', [
        Validators.required,
        Validators.pattern(/^[A-Z0-9]{6,20}$/),
        Validators.minLength(6),
        Validators.maxLength(20)
      ]],
      notes: ['', [Validators.maxLength(300)]]
    });

    // Auto-save form progress
    this.transferForm.valueChanges.subscribe(() => {
      this.saveToSessionStorage();
    });

    // Transform input to uppercase
    this.transferForm.get('voucherNumber')?.valueChanges.subscribe(value => {
      if (value) {
        const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (upperValue !== value) {
          this.transferForm.get('voucherNumber')?.setValue(upperValue, { emitEvent: false });
        }
      }
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
   * Open bank transfer modal
   */
  openModal(): void {
    this.isOpen.set(true);
    this.loadFromSessionStorage();
    
    // Focus management - focus on voucher input after animation
    setTimeout(() => {
      this.voucherInput?.nativeElement?.focus();
    }, 100);
  }

  /**
   * Close bank transfer modal
   */
  closeModal(): void {
    this.isOpen.set(false);
    this.hideNotifications();
  }

  /**
   * Check if a field is invalid and has been touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.transferForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Get notes character count
   */
  getNotesLength(): number {
    return this.transferForm.get('notes')?.value?.length || 0;
  }

  /**
   * Copy payment link to clipboard
   */
  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.paymentLink);
      this.showSuccessMessage('Link copiado al portapapeles');
    } catch (error) {
      console.error('Error copying link:', error);
      this.showErrorMessage('Error al copiar el link');
    }
  }

  /**
   * Open payment link in new tab
   */
  openLink(): void {
    try {
      window.open(this.paymentLink, '_blank', 'noopener,noreferrer');
      this.showSuccessMessage('Link abierto en nueva pestaña');
    } catch (error) {
      console.error('Error opening link:', error);
      this.showErrorMessage('Error al abrir el link');
    }
  }

  /**
   * Download QR code as PNG
   */
  downloadQR(): void {
    try {
      const link = document.createElement('a');
      link.href = this.qrImagePath;
      link.download = 'QR-Transferencia-AgriConnect.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.showSuccessMessage('QR descargado exitosamente');
    } catch (error) {
      console.error('Error downloading QR:', error);
      this.showErrorMessage('Error al descargar el QR');
    }
  }

  /**
   * Handle QR image error with fallback
   */
  onQRImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02NCA5NkM4MC41NjkyIDk2IDk0IDgyLjU2OTIgOTQgNjZDOTQgNDkuNDMwOCA4MC41NjkyIDM2IDY0IDM2QzQ3LjQzMDggMzYgMzQgNDkuNDMwOCAzNCA2NkMzNCA4Mi41NjkyIDQ3LjQzMDggOTYgNjQgOTZaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNNTcuMTcxNiA3MS44Mjg0TDcwLjgyODQgNTguMTcxNiIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8cGF0aCBkPSJNNTcuMTcxNiA1OC4xNzE2TDcwLjgyODQgNzEuODI4NCIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K';
      this.showErrorMessage('Error al cargar el código QR');
    }
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.transferForm.valid) {
      this.isProcessing.set(true);
      
      // Simulate processing delay
      setTimeout(() => {
        const transferData = {
          method: 'bank_transfer',
          voucherNumber: this.transferForm.value.voucherNumber,
          paymentLink: this.paymentLink,
          qrImagePath: this.qrImagePath,
          notes: this.transferForm.value.notes || '',
          timestamp: new Date()
        };

        // Emit transfer confirmation
        this.transferConfirmed.emit(transferData);
        
        this.isProcessing.set(false);
        this.showSuccessMessage('Transferencia confirmada exitosamente');
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
   * Mark all form fields as touched to show validation errors
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.transferForm.controls).forEach(key => {
      this.transferForm.get(key)?.markAsTouched();
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
   * Save form progress to sessionStorage
   */
  private saveToSessionStorage(): void {
    if (typeof window !== 'undefined') {
      const formData = this.transferForm.value;
      sessionStorage.setItem('bankTransferFormProgress', JSON.stringify(formData));
    }
  }

  /**
   * Load form progress from sessionStorage
   */
  private loadFromSessionStorage(): void {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('bankTransferFormProgress');
      if (saved) {
        try {
          const formData = JSON.parse(saved);
          this.transferForm.patchValue(formData);
        } catch (error) {
          console.warn('Error loading bank transfer form progress:', error);
        }
      }
    }
  }

  /**
   * Clear sessionStorage data
   */
  private clearSessionStorage(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('bankTransferFormProgress');
    }
  }
}