import { Component, signal, computed, inject, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription, fromEvent } from 'rxjs';
import { CartService } from '../../../core/services/cart';
import { OrderService } from '../../../core/services/order';
import type { CartItem, CartSummary, CartState } from '../../../core/models/cart.model';
import type { OrderRequest } from '../../../core/services/order';

/**
 * CheckoutOverlay Component - Floating checkout overlay for AgriConnect
 * 
 * Comprehensive Angular 20 standalone component for checkout process.
 * Features include:
 * - Modal/drawer overlay with backdrop
 * - Reactive forms with validation
 * - Real-time cart integration
 * - Accessibility compliance (WCAG 2.1 AA)
 * - Focus trap and keyboard navigation
 * - Responsive design with mobile-first approach
 * - SessionStorage persistence for form progress
 * - Luhn algorithm validation for credit cards
 * - Ecuador-specific address fields
 * - Order placement with OrderService integration
 * 
 * Comment: Checkout overlay: envío y pago con validación + accesibilidad + resumen en tiempo real
 * 
 * @author AgriConnect Team
 * @version 1.1.0
 */
@Component({
  selector: 'app-checkout-overlay',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Overlay Backdrop -->
    @if (isOpen()) {
      <div 
        class="fixed inset-0 z-50 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        (keydown.escape)="closeOverlay()"
        #overlayContainer>
        
        <!-- Semi-transparent backdrop -->
        <div 
          class="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
          (click)="closeOverlay()"
          aria-hidden="true">
        </div>
        
        <!-- Overlay Panel -->
        <div class="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white shadow-2xl overflow-y-auto">
          <div class="min-h-full flex flex-col">
            
            <!-- Header -->
            <header class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
              <div class="flex items-center justify-between">
                <h1 id="checkout-title" class="text-xl font-bold text-gray-900 font-epilogue">
                  Finalizar Compra
                </h1>
                <button
                  (click)="closeOverlay()"
                  class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Cerrar checkout"
                  #closeButton>
                  <span class="material-icons text-xl">close</span>
                </button>
              </div>
              
              <!-- Progress indicator -->
              <div class="mt-4 flex items-center space-x-2 text-sm text-gray-600">
                <span class="material-icons text-sm text-agri-green-500">shopping_cart</span>
                <span>{{ cartSummary().itemCount }} {{ cartSummary().itemCount === 1 ? 'artículo' : 'artículos' }}</span>
                <span>•</span>
                <span class="font-semibold text-agri-green-600">\${{ cartSummary().total.toFixed(2) }}</span>
              </div>
            </header>
            
            <!-- Main Content -->
            <main class="flex-1 px-6 py-6">
              <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()" novalidate>
                
                <!-- Cart Summary Section -->
                <section class="mb-8" aria-labelledby="cart-summary-title">
                  <h2 id="cart-summary-title" class="text-lg font-semibold text-gray-900 font-epilogue mb-4">
                    Resumen del Pedido
                  </h2>
                  
                  <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                    @for (item of cartItems(); track item.id) {
                      <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            [src]="item.image" 
                            [alt]="item.nombre"
                            class="w-full h-full object-cover"
                            loading="lazy"
                            (error)="onImageError($event)">
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium text-gray-900 truncate">{{ item.nombre }}</p>
                          <p class="text-xs text-gray-500">Cantidad: {{ item.qty }}</p>
                        </div>
                        <div class="text-sm font-semibold text-gray-900">
                          \${{ (item.precio * item.qty).toFixed(2) }}
                        </div>
                      </div>
                    }
                    
                    <!-- Totals -->
                    <div class="border-t border-gray-200 pt-3 space-y-2">
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Subtotal</span>
                        <span class="font-medium">\${{ cartSummary().subtotal.toFixed(2) }}</span>
                      </div>
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-600">IVA (12%)</span>
                        <span class="font-medium">\${{ cartSummary().tax.toFixed(2) }}</span>
                      </div>
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Envío</span>
                        @if (cartSummary().shipping === 0) {
                          <span class="font-medium text-agri-green-600">Gratis</span>
                        } @else {
                          <span class="font-medium">\${{ cartSummary().shipping.toFixed(2) }}</span>
                        }
                      </div>
                      <div class="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
                        <span>Total</span>
                        <span class="text-agri-green-600">\${{ cartSummary().total.toFixed(2) }}</span>
                      </div>
                    </div>
                  </div>
                </section>
                
                <!-- Shipping Information Section -->
                <section class="mb-8" aria-labelledby="shipping-title">
                  <h2 id="shipping-title" class="text-lg font-semibold text-gray-900 font-epilogue mb-4">
                    Información de Envío
                  </h2>
                  
                  <div class="space-y-4">
                    <!-- Name fields -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div class="form-group">
                        <label for="nombres" class="form-label required">Nombres</label>
                        <input
                          id="nombres"
                          type="text"
                          formControlName="nombres"
                          class="form-input"
                          [class.error]="isFieldInvalid('nombres')"
                          placeholder="Ingresa tus nombres"
                          aria-describedby="nombres-error"
                          autocomplete="given-name">
                        @if (isFieldInvalid('nombres')) {
                          <div id="nombres-error" class="form-error" role="alert">
                            <span class="material-icons text-sm">error</span>
                            Los nombres son requeridos
                          </div>
                        }
                      </div>
                      
                      <div class="form-group">
                        <label for="apellidos" class="form-label required">Apellidos</label>
                        <input
                          id="apellidos"
                          type="text"
                          formControlName="apellidos"
                          class="form-input"
                          [class.error]="isFieldInvalid('apellidos')"
                          placeholder="Ingresa tus apellidos"
                          aria-describedby="apellidos-error"
                          autocomplete="family-name">
                        @if (isFieldInvalid('apellidos')) {
                          <div id="apellidos-error" class="form-error" role="alert">
                            <span class="material-icons text-sm">error</span>
                            Los apellidos son requeridos
                          </div>
                        }
                      </div>
                    </div>
                    
                    <!-- Contact fields -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div class="form-group">
                        <label for="correo" class="form-label required">Correo Electrónico</label>
                        <input
                          id="correo"
                          type="email"
                          formControlName="correo"
                          class="form-input"
                          [class.error]="isFieldInvalid('correo')"
                          placeholder="ejemplo@correo.com"
                          aria-describedby="correo-error"
                          autocomplete="email">
                        @if (isFieldInvalid('correo')) {
                          <div id="correo-error" class="form-error" role="alert">
                            <span class="material-icons text-sm">error</span>
                            @if (checkoutForm.get('correo')?.hasError('required')) {
                              El correo es requerido
                            } @else if (checkoutForm.get('correo')?.hasError('email')) {
                              Formato de correo inválido
                            }
                          </div>
                        }
                      </div>
                      
                      <div class="form-group">
                        <label for="telefono" class="form-label required">Teléfono</label>
                        <input
                          id="telefono"
                          type="tel"
                          formControlName="telefono"
                          class="form-input"
                          [class.error]="isFieldInvalid('telefono')"
                          placeholder="0999123456"
                          aria-describedby="telefono-error"
                          autocomplete="tel"
                          (input)="onPhoneInput($event)">
                        @if (isFieldInvalid('telefono')) {
                          <div id="telefono-error" class="form-error" role="alert">
                            <span class="material-icons text-sm">error</span>
                            @if (checkoutForm.get('telefono')?.hasError('required')) {
                              El teléfono es requerido
                            } @else if (checkoutForm.get('telefono')?.hasError('pattern')) {
                              Formato de teléfono inválido (10 dígitos)
                            }
                          </div>
                        }
                      </div>
                    </div>
                    
                    <!-- Address fields -->
                    <div class="form-group">
                      <label for="direccion" class="form-label required">Dirección</label>
                      <input
                        id="direccion"
                        type="text"
                        formControlName="direccion"
                        class="form-input"
                        [class.error]="isFieldInvalid('direccion')"
                        placeholder="Calle principal y secundaria"
                        aria-describedby="direccion-error"
                        autocomplete="street-address">
                      @if (isFieldInvalid('direccion')) {
                        <div id="direccion-error" class="form-error" role="alert">
                          <span class="material-icons text-sm">error</span>
                          La dirección es requerida
                        </div>
                      }
                    </div>
                    
                    <div class="form-group">
                      <label for="referencia" class="form-label">Referencia</label>
                      <input
                        id="referencia"
                        type="text"
                        formControlName="referencia"
                        class="form-input"
                        placeholder="Casa de color azul, junto al parque"
                        autocomplete="address-line2">
                    </div>
                    
                    <!-- Location fields -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div class="form-group">
                        <label for="provincia" class="form-label required">Provincia</label>
                        <select
                          id="provincia"
                          formControlName="provincia"
                          class="form-input"
                          [class.error]="isFieldInvalid('provincia')"
                          aria-describedby="provincia-error"
                          (change)="onProvinciaChange()">
                          <option value="">Selecciona una provincia</option>
                          @for (provincia of provincias; track provincia.codigo) {
                            <option [value]="provincia.codigo">{{ provincia.nombre }}</option>
                          }
                        </select>
                        @if (isFieldInvalid('provincia')) {
                          <div id="provincia-error" class="form-error" role="alert">
                            <span class="material-icons text-sm">error</span>
                            La provincia es requerida
                          </div>
                        }
                      </div>
                      
                      <div class="form-group">
                        <label for="ciudad" class="form-label required">Ciudad</label>
                        <select
                          id="ciudad"
                          formControlName="ciudad"
                          class="form-input"
                          [class.error]="isFieldInvalid('ciudad')"
                          [disabled]="!checkoutForm.get('provincia')?.value"
                          aria-describedby="ciudad-error">
                          <option value="">Selecciona una ciudad</option>
                          @for (ciudad of ciudadesDisponibles(); track ciudad.codigo) {
                            <option [value]="ciudad.codigo">{{ ciudad.nombre }}</option>
                          }
                        </select>
                        @if (isFieldInvalid('ciudad')) {
                          <div id="ciudad-error" class="form-error" role="alert">
                            <span class="material-icons text-sm">error</span>
                            La ciudad es requerida
                          </div>
                        }
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label for="codigoPostal" class="form-label">Código Postal</label>
                      <input
                        id="codigoPostal"
                        type="text"
                        formControlName="codigoPostal"
                        class="form-input"
                        placeholder="170150"
                        maxlength="6"
                        autocomplete="postal-code">
                    </div>
                    
                    <div class="form-group">
                      <label for="notas" class="form-label">Notas Especiales</label>
                      <textarea
                        id="notas"
                        formControlName="notas"
                        class="form-input"
                        rows="3"
                        placeholder="Instrucciones especiales para la entrega"
                        maxlength="500"></textarea>
                      <div class="form-hint">{{ getNotasLength() }}/500 caracteres</div>
                    </div>
                  </div>
                </section>
                
                <!-- Payment Information Section -->
                <section class="mb-8" aria-labelledby="payment-title">
                  <h2 id="payment-title" class="text-lg font-semibold text-gray-900 font-epilogue mb-4">
                    Información de Pago
                  </h2>
                  
                  <!-- Payment Method Selection -->
                  <div class="form-group">
                    <fieldset>
                      <legend class="form-label required">Método de Pago</legend>
                      <div class="space-y-3" role="radiogroup" aria-labelledby="payment-title">
                        @for (metodo of metodosPago; track metodo.value) {
                          <label class="payment-option" [class.selected]="checkoutForm.get('metodoPago')?.value === metodo.value">
                            <input
                              type="radio"
                              formControlName="metodoPago"
                              [value]="metodo.value"
                              class="sr-only"
                              [attr.aria-describedby]="metodo.value + '-desc'">
                            <div class="payment-option-content">
                              <div class="flex items-center space-x-3">
                                <span class="material-icons text-xl" [class]="metodo.iconClass">{{ metodo.icon }}</span>
                                <div>
                                  <div class="font-medium text-gray-900">{{ metodo.label }}</div>
                                  <div id="{{ metodo.value }}-desc" class="text-sm text-gray-500">{{ metodo.description }}</div>
                                </div>
                              </div>
                              <div class="payment-option-radio">
                                <div class="payment-option-radio-inner"></div>
                              </div>
                            </div>
                          </label>
                        }
                      </div>
                    </fieldset>
                    @if (isFieldInvalid('metodoPago')) {
                      <div class="form-error mt-2" role="alert">
                        <span class="material-icons text-sm">error</span>
                        Selecciona un método de pago
                      </div>
                    }
                  </div>
                  
                  <!-- Credit Card Fields (shown when tarjeta is selected) -->
                  @if (checkoutForm.get('metodoPago')?.value === 'tarjeta') {
                    <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div class="flex items-start space-x-2 mb-4">
                        <span class="material-icons text-blue-600 text-sm mt-0.5">info</span>
                        <div class="text-sm text-blue-800">
                          <p class="font-medium">Información Segura</p>
                          <p>No almacenamos información de tarjetas de crédito. Los datos se procesan de forma segura.</p>
                        </div>
                      </div>
                      
                      <div class="space-y-4">
                        <div class="form-group">
                          <label for="titular" class="form-label required">Nombre del Titular</label>
                          <input
                            id="titular"
                            type="text"
                            formControlName="titular"
                            class="form-input"
                            [class.error]="isFieldInvalid('titular')"
                            placeholder="Como aparece en la tarjeta"
                            aria-describedby="titular-error"
                            autocomplete="cc-name">
                          @if (isFieldInvalid('titular')) {
                            <div id="titular-error" class="form-error" role="alert">
                              <span class="material-icons text-sm">error</span>
                              El nombre del titular es requerido
                            </div>
                          }
                        </div>
                        
                        <div class="form-group">
                          <label for="numeroTarjeta" class="form-label required">Número de Tarjeta</label>
                          <input
                            id="numeroTarjeta"
                            type="text"
                            formControlName="numeroTarjeta"
                            class="form-input"
                            [class.error]="isFieldInvalid('numeroTarjeta')"
                            placeholder="1234 5678 9012 3456"
                            aria-describedby="numeroTarjeta-error"
                            autocomplete="cc-number"
                            maxlength="19"
                            (input)="onCardNumberInput($event)">
                          @if (isFieldInvalid('numeroTarjeta')) {
                            <div id="numeroTarjeta-error" class="form-error" role="alert">
                              <span class="material-icons text-sm">error</span>
                              @if (checkoutForm.get('numeroTarjeta')?.hasError('required')) {
                                El número de tarjeta es requerido
                              } @else if (checkoutForm.get('numeroTarjeta')?.hasError('luhn')) {
                                Número de tarjeta inválido
                              }
                            </div>
                          }
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                          <div class="form-group">
                            <label for="fechaVencimiento" class="form-label required">Fecha de Vencimiento</label>
                            <input
                              id="fechaVencimiento"
                              type="text"
                              formControlName="fechaVencimiento"
                              class="form-input"
                              [class.error]="isFieldInvalid('fechaVencimiento')"
                              placeholder="MM/YY"
                              aria-describedby="fechaVencimiento-error"
                              autocomplete="cc-exp"
                              maxlength="5"
                              (input)="onExpiryInput($event)">
                            @if (isFieldInvalid('fechaVencimiento')) {
                              <div id="fechaVencimiento-error" class="form-error" role="alert">
                                <span class="material-icons text-sm">error</span>
                                @if (checkoutForm.get('fechaVencimiento')?.hasError('required')) {
                                  La fecha es requerida
                                } @else if (checkoutForm.get('fechaVencimiento')?.hasError('pattern')) {
                                  Formato inválido (MM/YY)
                                }
                              </div>
                            }
                          </div>
                          
                          <div class="form-group">
                            <label for="cvc" class="form-label required">CVC</label>
                            <input
                              id="cvc"
                              type="text"
                              formControlName="cvc"
                              class="form-input"
                              [class.error]="isFieldInvalid('cvc')"
                              placeholder="123"
                              aria-describedby="cvc-error"
                              autocomplete="cc-csc"
                              maxlength="4">
                            @if (isFieldInvalid('cvc')) {
                              <div id="cvc-error" class="form-error" role="alert">
                                <span class="material-icons text-sm">error</span>
                                @if (checkoutForm.get('cvc')?.hasError('required')) {
                                  El CVC es requerido
                                } @else if (checkoutForm.get('cvc')?.hasError('pattern')) {
                                  CVC inválido (3-4 dígitos)
                                }
                              </div>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </section>
                
                <!-- Submit Button -->
                <div class="sticky bottom-0 bg-white border-t border-gray-200 p-6 -mx-6 -mb-6">
                  <button
                    type="submit"
                    [disabled]="checkoutForm.invalid || isProcessing()"
                    class="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 
                           disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
                           text-gray-900 font-bold py-4 px-6 rounded-lg transition-all duration-200 
                           flex items-center justify-center space-x-2 hover:shadow-lg transform hover:scale-105
                           disabled:transform-none disabled:shadow-none"
                    [attr.aria-describedby]="checkoutForm.invalid ? 'form-errors' : null">
                    @if (isProcessing()) {
                      <span class="animate-spin material-icons text-lg">refresh</span>
                      <span>Procesando...</span>
                    } @else {
                      <span class="material-icons text-lg">payment</span>
                      <span>Confirmar Pedido - \${{ cartSummary().total.toFixed(2) }}</span>
                    }
                  </button>
                  
                  @if (checkoutForm.invalid && checkoutForm.touched) {
                    <div id="form-errors" class="mt-3 text-sm text-red-600 text-center" role="alert">
                      <span class="material-icons text-sm">error</span>
                      Por favor corrige los errores antes de continuar
                    </div>
                  }
                </div>
              </form>
            </main>
          </div>
        </div>
      </div>
    }
  `,
  styleUrls: ['./checkout-overlay.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutOverlay implements OnInit, OnDestroy {

  // Services injection
  private readonly fb = inject(FormBuilder);
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly elementRef = inject(ElementRef);

  // ViewChild references for focus management
  @ViewChild('closeButton') closeButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('overlayContainer') overlayContainer!: ElementRef<HTMLDivElement>;

  // Component state signals
  readonly isOpen = signal<boolean>(false);
  readonly isProcessing = signal<boolean>(false);
  readonly cartItems = signal<CartItem[]>([]);

  // Form and validation
  checkoutForm!: FormGroup;
  private cartSubscription?: Subscription;

  // Ecuador provinces and cities data
  readonly provincias = [
    { codigo: 'pichincha', nombre: 'Pichincha' },
    { codigo: 'guayas', nombre: 'Guayas' },
    { codigo: 'azuay', nombre: 'Azuay' },
    { codigo: 'manabi', nombre: 'Manabí' },
    { codigo: 'tungurahua', nombre: 'Tungurahua' },
    { codigo: 'el-oro', nombre: 'El Oro' },
    { codigo: 'los-rios', nombre: 'Los Ríos' },
    { codigo: 'imbabura', nombre: 'Imbabura' },
    { codigo: 'esmeraldas', nombre: 'Esmeraldas' },
    { codigo: 'loja', nombre: 'Loja' }
  ];

  private readonly ciudadesPorProvincia: Record<string, Array<{codigo: string, nombre: string}>> = {
    'pichincha': [
      { codigo: 'quito', nombre: 'Quito' },
      { codigo: 'cayambe', nombre: 'Cayambe' },
      { codigo: 'mejia', nombre: 'Mejía' },
      { codigo: 'rumiñahui', nombre: 'Rumiñahui' }
    ],
    'guayas': [
      { codigo: 'guayaquil', nombre: 'Guayaquil' },
      { codigo: 'duran', nombre: 'Durán' },
      { codigo: 'milagro', nombre: 'Milagro' },
      { codigo: 'daule', nombre: 'Daule' }
    ],
    'azuay': [
      { codigo: 'cuenca', nombre: 'Cuenca' },
      { codigo: 'giron', nombre: 'Girón' },
      { codigo: 'paute', nombre: 'Paute' }
    ]
  };

  readonly ciudadesDisponibles = computed(() => {
    const provinciaSeleccionada = this.checkoutForm?.get('provincia')?.value;
    return this.ciudadesPorProvincia[provinciaSeleccionada] || [];
  });

  // Payment methods configuration
  readonly metodosPago = [
    {
      value: 'tarjeta',
      label: 'Tarjeta de Crédito/Débito',
      description: 'Visa, MasterCard, American Express',
      icon: 'credit_card',
      iconClass: 'text-blue-600'
    },
    {
      value: 'transferencia',
      label: 'Transferencia Bancaria',
      description: 'Transferencia directa a cuenta bancaria',
      icon: 'account_balance',
      iconClass: 'text-green-600'
    },
    {
      value: 'contraentrega',
      label: 'Pago Contra Entrega',
      description: 'Paga en efectivo al recibir tu pedido',
      icon: 'local_shipping',
      iconClass: 'text-orange-600'
    }
  ];

  // Computed cart summary
  readonly cartSummary = computed<CartSummary>(() => {
    const items = this.cartItems();
    const subtotal = items.reduce((sum, item) => sum + (item.precio * item.qty), 0);
    const taxRate = 0.12; // 12% IVA Ecuador
    const tax = subtotal * taxRate;
    const shipping = subtotal >= 25 ? 0 : 3.50; // Free shipping over $25
    const total = subtotal + tax + shipping;
    const itemCount = items.reduce((sum, item) => sum + item.qty, 0);
    
    return {
      subtotal,
      tax,
      taxRate,
      shipping,
      total,
      itemCount
    };
  });

  ngOnInit(): void {
    this.initializeForm();
    this.subscribeToCart();
    this.loadFromSessionStorage();
    this.setupKeyboardListeners();
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  /**
   * Initialize reactive form with validation
   */
  private initializeForm(): void {
    this.checkoutForm = this.fb.group({
      // Shipping information
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      direccion: ['', [Validators.required, Validators.minLength(10)]],
      referencia: [''],
      provincia: ['', Validators.required],
      ciudad: ['', Validators.required],
      codigoPostal: [''],
      notas: ['', Validators.maxLength(500)],
      
      // Payment information
      metodoPago: ['', Validators.required],
      titular: [''],
      numeroTarjeta: [''],
      fechaVencimiento: [''],
      cvc: ['']
    });

    // Setup conditional validators for credit card fields
    this.checkoutForm.get('metodoPago')?.valueChanges.subscribe(metodo => {
      this.updatePaymentValidators(metodo);
    });

    // Auto-save form progress
    this.checkoutForm.valueChanges.subscribe(() => {
      this.saveToSessionStorage();
    });
  }

  /**
   * Update payment validators based on selected method
   */
  private updatePaymentValidators(metodo: string): void {
    const titularControl = this.checkoutForm.get('titular');
    const numeroTarjetaControl = this.checkoutForm.get('numeroTarjeta');
    const fechaVencimientoControl = this.checkoutForm.get('fechaVencimiento');
    const cvcControl = this.checkoutForm.get('cvc');

    if (metodo === 'tarjeta') {
      titularControl?.setValidators([Validators.required, Validators.minLength(3)]);
      numeroTarjetaControl?.setValidators([Validators.required, this.luhnValidator]);
      fechaVencimientoControl?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)]);
      cvcControl?.setValidators([Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]);
    } else {
      titularControl?.clearValidators();
      numeroTarjetaControl?.clearValidators();
      fechaVencimientoControl?.clearValidators();
      cvcControl?.clearValidators();
    }

    titularControl?.updateValueAndValidity();
    numeroTarjetaControl?.updateValueAndValidity();
    fechaVencimientoControl?.updateValueAndValidity();
    cvcControl?.updateValueAndValidity();
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
   * Subscribe to cart service updates
   */
  private subscribeToCart(): void {
    this.cartSubscription = this.cartService.cart$.subscribe((cartState: CartState) => {
      this.cartItems.set(cartState.items);
    });
  }

  /**
   * Setup keyboard event listeners for accessibility
   */
  private setupKeyboardListeners(): void {
    fromEvent<KeyboardEvent>(document, 'keydown').subscribe(event => {
      if (this.isOpen() && event.key === 'Tab') {
        this.handleTabKeyPress(event);
      }
    });
  }

  /**
   * Handle tab key press for focus trap
   */
  private handleTabKeyPress(event: KeyboardEvent): void {
    const focusableElements = this.overlayContainer?.nativeElement?.querySelectorAll(
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
   * Open checkout overlay
   */
  openOverlay(): void {
    this.isOpen.set(true);
    // Focus management - focus on close button after animation
    setTimeout(() => {
      this.closeButton?.nativeElement?.focus();
    }, 100);
  }

  /**
   * Close checkout overlay
   */
  closeOverlay(): void {
    this.isOpen.set(false);
  }

  /**
   * Handle form submission with OrderService integration
   */
  onSubmit(): void {
    if (this.checkoutForm.valid) {
      this.isProcessing.set(true);
      
      // Prepare order data for OrderService
      const orderData: OrderRequest = {
        cart: this.cartService.getCurrentState(),
        shipping: {
          nombres: this.checkoutForm.value.nombres,
          apellidos: this.checkoutForm.value.apellidos,
          correo: this.checkoutForm.value.correo,
          telefono: this.checkoutForm.value.telefono,
          direccion: this.checkoutForm.value.direccion,
          referencia: this.checkoutForm.value.referencia,
          provincia: this.checkoutForm.value.provincia,
          ciudad: this.checkoutForm.value.ciudad,
          codigoPostal: this.checkoutForm.value.codigoPostal,
          notas: this.checkoutForm.value.notas
        },
        payment: {
          metodo: this.checkoutForm.value.metodoPago,
          titular: this.checkoutForm.value.titular,
          numeroTarjeta: this.checkoutForm.value.numeroTarjeta ? this.maskCardNumber(this.checkoutForm.value.numeroTarjeta) : undefined,
          fechaVencimiento: this.checkoutForm.value.fechaVencimiento,
        },
        summary: this.cartSummary()
      };

      // Place order using OrderService
      this.orderService.placeOrder(orderData).subscribe({
        next: (response) => {
          this.isProcessing.set(false);
          
          if (response.success) {
            console.log('Order placed successfully:', response);
            this.clearSessionStorage();
            this.closeOverlay();
            
            // Show success message with order details
            const message = `¡Pedido realizado con éxito!\n\nID del pedido: ${response.orderId}\nTotal: $${this.cartSummary().total.toFixed(2)}\n\nTe hemos enviado un correo de confirmación.`;
            alert(message);
            
            // Reset form for next use
            this.checkoutForm.reset();
          } else {
            console.error('Order placement failed:', response);
            alert(`Error al procesar el pedido: ${response.message}`);
          }
        },
        error: (error) => {
          this.isProcessing.set(false);
          console.error('Order placement error:', error);
          alert('Error al procesar el pedido. Por favor intenta nuevamente.');
        }
      });
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
    Object.keys(this.checkoutForm.controls).forEach(key => {
      this.checkoutForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Check if a field is invalid and has been touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Handle phone number input formatting
   */
  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    input.value = value;
    this.checkoutForm.get('telefono')?.setValue(value);
  }

  /**
   * Handle credit card number input formatting
   */
  onCardNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\s/g, '').replace(/\D/g, '');
    if (value.length > 16) {
      value = value.substring(0, 16);
    }
    // Add spaces every 4 digits
    value = value.replace(/(.{4})/g, '$1 ').trim();
    input.value = value;
    this.checkoutForm.get('numeroTarjeta')?.setValue(value);
  }

  /**
   * Handle expiry date input formatting
   */
  onExpiryInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
    this.checkoutForm.get('fechaVencimiento')?.setValue(value);
  }

  /**
   * Handle provincia change to update cities
   */
  onProvinciaChange(): void {
    this.checkoutForm.get('ciudad')?.setValue('');
  }

  /**
   * Get notes character count
   */
  getNotasLength(): number {
    return this.checkoutForm.get('notas')?.value?.length || 0;
  }

  /**
   * Handle image error with fallback
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.includes('multifrutas.webp')) {
      img.src = 'assets/images/multifrutas.webp';
    }
  }

  /**
   * Save form progress to sessionStorage
   */
  private saveToSessionStorage(): void {
    if (typeof window !== 'undefined') {
      const formData = this.checkoutForm.value;
      // Don't save sensitive payment information
      const dataToSave = {
        ...formData,
        numeroTarjeta: '',
        cvc: '',
        titular: ''
      };
      sessionStorage.setItem('checkoutFormProgress', JSON.stringify(dataToSave));
    }
  }

  /**
   * Load form progress from sessionStorage
   */
  private loadFromSessionStorage(): void {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('checkoutFormProgress');
      if (saved) {
        try {
          const formData = JSON.parse(saved);
          this.checkoutForm.patchValue(formData);
        } catch (error) {
          console.warn('Error loading form progress:', error);
        }
      }
    }
  }

  /**
   * Clear sessionStorage data
   */
  private clearSessionStorage(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('checkoutFormProgress');
    }
  }
}