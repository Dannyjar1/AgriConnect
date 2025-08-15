import { Component, EventEmitter, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../../core/services/inventory.service';
import { ProductService } from '../../../core/services/product.service';
import { ProducerService } from '../../../core/services/producer.service';
import { InventoryEntry, Product } from '../../../core/models/product.model';
import { Producer } from '../../../core/models/user.model';

@Component({
  selector: 'app-inventory-entry-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Modal Backdrop -->
    <div 
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      (click)="onBackdropClick($event)"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description">
      
      <!-- Modal Content -->
      <div 
        class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-scale"
        (click)="$event.stopPropagation()"
        tabindex="-1">
        
        <!-- Modal Header -->
        <div class="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gradient-to-r from-agri-green-600 to-agri-green-700 rounded-xl flex items-center justify-center">
                <i class="fas fa-plus text-white text-lg" aria-hidden="true"></i>
              </div>
              <div>
                <h2 id="modal-title" class="text-2xl font-bold text-gray-900 font-epilogue">
                  Registrar Entrega de Producto
                </h2>
                <p id="modal-description" class="text-sm text-gray-600 mt-1 font-noto-sans">
                  Complete la información de la nueva entrada al inventario
                </p>
              </div>
            </div>
            <button 
              (click)="closeModal()"
              type="button"
              class="w-10 h-10 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-agri-green-300"
              aria-label="Cerrar modal">
              <i class="fas fa-times text-sm" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="px-8 py-6">
          <form [formGroup]="inventoryForm" (ngSubmit)="onSubmit()" class="space-y-8">
            
            <!-- Producer and Product Selection -->
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 font-epilogue flex items-center gap-2">
                <i class="fas fa-user-tie text-agri-green-600" aria-hidden="true"></i>
                Información del Productor y Producto
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Productor -->
                <div class="space-y-2">
                  <label for="producer-select" class="block text-sm font-semibold text-gray-700 font-noto-sans">
                    Productor <span class="text-red-500" aria-label="Campo obligatorio">*</span>
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i class="fas fa-user text-gray-400" aria-hidden="true"></i>
                    </div>
                    <select
                      id="producer-select"
                      formControlName="producerId"
                      (change)="onProducerChange()"
                      class="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-agri-green-100 focus:border-agri-green-500 transition-all duration-200 font-noto-sans"
                      [class.border-red-300]="isFieldInvalid('producerId')"
                      [class.border-gray-300]="!isFieldInvalid('producerId')"
                      aria-describedby="producer-error"
                      required>
                      <option value="">Seleccione un productor</option>
                      @for (producer of producers(); track producer.id) {
                        <option [value]="producer.id">
                          {{ producer.name }} - {{ producer.province }}
                        </option>
                      }
                    </select>
                  </div>
                  @if (isFieldInvalid('producerId')) {
                    <p id="producer-error" class="text-red-600 text-sm mt-1 flex items-center gap-1" role="alert">
                      <i class="fas fa-exclamation-circle text-xs" aria-hidden="true"></i>
                      {{ getErrorMessage('producerId') }}
                    </p>
                  }
                </div>

                <!-- Producto -->
                <div class="space-y-2">
                  <label for="product-select" class="block text-sm font-semibold text-gray-700 font-noto-sans">
                    Producto <span class="text-red-500" aria-label="Campo obligatorio">*</span>
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i class="fas fa-seedling text-gray-400" aria-hidden="true"></i>
                    </div>
                    <select
                      id="product-select"
                      formControlName="productId"
                      class="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-agri-green-100 focus:border-agri-green-500 transition-all duration-200 font-noto-sans disabled:bg-gray-100 disabled:cursor-not-allowed"
                      [class.border-red-300]="isFieldInvalid('productId')"
                      [class.border-gray-300]="!isFieldInvalid('productId')"
                      [disabled]="!inventoryForm.get('producerId')?.value"
                      aria-describedby="product-error"
                      required>
                      <option value="">
                        {{ !inventoryForm.get('producerId')?.value ? 'Primero seleccione un productor' : 'Seleccione un producto' }}
                      </option>
                      @for (product of filteredProducts(); track product.id) {
                        <option [value]="product.id">
                          {{ product.name }} ({{ product.price.unit }})
                        </option>
                      }
                    </select>
                  </div>
                  @if (isFieldInvalid('productId')) {
                    <p id="product-error" class="text-red-600 text-sm mt-1 flex items-center gap-1" role="alert">
                      <i class="fas fa-exclamation-circle text-xs" aria-hidden="true"></i>
                      {{ getErrorMessage('productId') }}
                    </p>
                  }
                </div>
              </div>
            </div>

            <!-- Quantity and Pricing -->
            <div class="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 font-epilogue flex items-center gap-2">
                <i class="fas fa-calculator text-blue-600" aria-hidden="true"></i>
                Cantidad y Precios
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Cantidad -->
                <div class="space-y-2">
                  <label for="quantity-input" class="block text-sm font-semibold text-gray-700 font-noto-sans">
                    Cantidad Entregada <span class="text-red-500" aria-label="Campo obligatorio">*</span>
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i class="fas fa-weight text-gray-400" aria-hidden="true"></i>
                    </div>
                    <input
                      id="quantity-input"
                      type="number"
                      min="0.01"
                      step="0.01"
                      formControlName="quantity"
                      (input)="calculateTotalValue()"
                      class="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-agri-green-100 focus:border-agri-green-500 transition-all duration-200 font-noto-sans"
                      [class.border-red-300]="isFieldInvalid('quantity')"
                      [class.border-gray-300]="!isFieldInvalid('quantity')"
                      placeholder="0.00"
                      aria-describedby="quantity-error"
                      required>
                  </div>
                  @if (isFieldInvalid('quantity')) {
                    <p id="quantity-error" class="text-red-600 text-sm mt-1 flex items-center gap-1" role="alert">
                      <i class="fas fa-exclamation-circle text-xs" aria-hidden="true"></i>
                      {{ getErrorMessage('quantity') }}
                    </p>
                  }
                </div>

                <!-- Precio por Unidad -->
                <div class="space-y-2">
                  <label for="price-input" class="block text-sm font-semibold text-gray-700 font-noto-sans">
                    Precio por Unidad <span class="text-red-500" aria-label="Campo obligatorio">*</span>
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i class="fas fa-dollar-sign text-gray-400" aria-hidden="true"></i>
                    </div>
                    <input
                      id="price-input"
                      type="number"
                      min="0.01"
                      step="0.01"
                      formControlName="pricePerUnit"
                      (input)="calculateTotalValue()"
                      class="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-agri-green-100 focus:border-agri-green-500 transition-all duration-200 font-noto-sans"
                      [class.border-red-300]="isFieldInvalid('pricePerUnit')"
                      [class.border-gray-300]="!isFieldInvalid('pricePerUnit')"
                      placeholder="0.00"
                      aria-describedby="price-error"
                      required>
                  </div>
                  @if (isFieldInvalid('pricePerUnit')) {
                    <p id="price-error" class="text-red-600 text-sm mt-1 flex items-center gap-1" role="alert">
                      <i class="fas fa-exclamation-circle text-xs" aria-hidden="true"></i>
                      {{ getErrorMessage('pricePerUnit') }}
                    </p>
                  }
                </div>

                <!-- Valor Total -->
                <div class="space-y-2">
                  <label for="total-value" class="block text-sm font-semibold text-gray-700 font-noto-sans">
                    Valor Total
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i class="fas fa-coins text-gray-400" aria-hidden="true"></i>
                    </div>
                    <input
                      id="total-value"
                      type="text"
                      [value]="totalValue() | currency:'USD':'symbol':'1.2-2'"
                      class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 font-semibold font-noto-sans"
                      readonly
                      tabindex="-1">
                  </div>
                  <p class="text-xs text-gray-500 mt-1">Calculado automáticamente</p>
                </div>
              </div>
            </div>

            <!-- Quality and Dates -->
            <div class="bg-amber-50 p-6 rounded-xl border border-amber-100">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 font-epilogue flex items-center gap-2">
                <i class="fas fa-star text-amber-600" aria-hidden="true"></i>
                Calidad y Fechas
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Calidad -->
                <div class="space-y-2">
                  <label for="quality-select" class="block text-sm font-semibold text-gray-700 font-noto-sans">
                    Calidad <span class="text-red-500" aria-label="Campo obligatorio">*</span>
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i class="fas fa-medal text-gray-400" aria-hidden="true"></i>
                    </div>
                    <select
                      id="quality-select"
                      formControlName="quality"
                      class="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-agri-green-100 focus:border-agri-green-500 transition-all duration-200 font-noto-sans"
                      [class.border-red-300]="isFieldInvalid('quality')"
                      [class.border-gray-300]="!isFieldInvalid('quality')"
                      aria-describedby="quality-error"
                      required>
                      <option value="">Seleccione calidad</option>
                      <option value="A">🥇 A - Excelente</option>
                      <option value="B">🥈 B - Buena</option>
                      <option value="C">🥉 C - Regular</option>
                    </select>
                  </div>
                  @if (isFieldInvalid('quality')) {
                    <p id="quality-error" class="text-red-600 text-sm mt-1 flex items-center gap-1" role="alert">
                      <i class="fas fa-exclamation-circle text-xs" aria-hidden="true"></i>
                      {{ getErrorMessage('quality') }}
                    </p>
                  }
                </div>

                <!-- Fecha de Entrega -->
                <div class="space-y-2">
                  <label for="delivery-date" class="block text-sm font-semibold text-gray-700 font-noto-sans">
                    Fecha de Entrega <span class="text-red-500" aria-label="Campo obligatorio">*</span>
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i class="fas fa-calendar-alt text-gray-400" aria-hidden="true"></i>
                    </div>
                    <input
                      id="delivery-date"
                      type="date"
                      formControlName="deliveryDate"
                      class="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-agri-green-100 focus:border-agri-green-500 transition-all duration-200 font-noto-sans"
                      [class.border-red-300]="isFieldInvalid('deliveryDate')"
                      [class.border-gray-300]="!isFieldInvalid('deliveryDate')"
                      aria-describedby="delivery-date-error"
                      required>
                  </div>
                  @if (isFieldInvalid('deliveryDate')) {
                    <p id="delivery-date-error" class="text-red-600 text-sm mt-1 flex items-center gap-1" role="alert">
                      <i class="fas fa-exclamation-circle text-xs" aria-hidden="true"></i>
                      {{ getErrorMessage('deliveryDate') }}
                    </p>
                  }
                </div>

                <!-- Fecha de Vencimiento -->
                <div class="space-y-2">
                  <label for="expiration-date" class="block text-sm font-semibold text-gray-700 font-noto-sans">
                    Fecha de Vencimiento
                    <span class="text-gray-500 text-xs">(Opcional)</span>
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i class="fas fa-clock text-gray-400" aria-hidden="true"></i>
                    </div>
                    <input
                      id="expiration-date"
                      type="date"
                      formControlName="expirationDate"
                      class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-green-100 focus:border-agri-green-500 transition-all duration-200 font-noto-sans">
                  </div>
                  <p class="text-xs text-gray-500 mt-1">Ayuda a controlar el inventario por vencimiento</p>
                </div>
              </div>
            </div>

            <!-- Additional Information -->
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 font-epilogue flex items-center gap-2">
                <i class="fas fa-info-circle text-gray-600" aria-hidden="true"></i>
                Información Adicional
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Lote/Batch -->
                <div class="space-y-2">
                  <label for="batch-input" class="block text-sm font-semibold text-gray-700 font-noto-sans">
                    Lote/Batch
                    <span class="text-gray-500 text-xs">(Opcional)</span>
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i class="fas fa-barcode text-gray-400" aria-hidden="true"></i>
                    </div>
                    <input
                      id="batch-input"
                      type="text"
                      formControlName="batch"
                      class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-green-100 focus:border-agri-green-500 transition-all duration-200 font-noto-sans"
                      placeholder="Ej: BAN-2024-001"
                      maxlength="20">
                  </div>
                  <p class="text-xs text-gray-500 mt-1">Código de identificación del lote</p>
                </div>

                <!-- Notas -->
                <div class="space-y-2">
                  <label for="notes-textarea" class="block text-sm font-semibold text-gray-700 font-noto-sans">
                    Notas Adicionales
                    <span class="text-gray-500 text-xs">(Opcional)</span>
                  </label>
                  <textarea
                    id="notes-textarea"
                    formControlName="notes"
                    rows="4"
                    maxlength="500"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-green-100 focus:border-agri-green-500 transition-all duration-200 font-noto-sans resize-none"
                    placeholder="Observaciones sobre la entrega, estado del producto, etc."
                    aria-describedby="notes-help"></textarea>
                  <p id="notes-help" class="text-xs text-gray-500 mt-1">
                    Información adicional sobre la entrega (máx. 500 caracteres)
                  </p>
                </div>
              </div>
            </div>

            <!-- Error Message -->
            @if (errorMessage()) {
              <div class="bg-red-50 border border-red-200 rounded-xl p-4" role="alert" aria-live="polite">
                <div class="flex items-start gap-3">
                  <i class="fas fa-exclamation-triangle text-red-500 text-lg mt-0.5" aria-hidden="true"></i>
                  <div>
                    <h4 class="text-red-800 font-semibold font-epilogue">Error al registrar entrada</h4>
                    <p class="text-red-700 text-sm mt-1 font-noto-sans">{{ errorMessage() }}</p>
                  </div>
                </div>
              </div>
            }

            <!-- Form Actions -->
            <div class="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                (click)="closeModal()"
                class="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-noto-sans"
                [disabled]="isLoading()">
                <span class="flex items-center justify-center gap-2">
                  <i class="fas fa-times text-sm" aria-hidden="true"></i>
                  Cancelar
                </span>
              </button>
              
              <button
                type="submit"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-agri-green-600 to-agri-green-700 hover:from-agri-green-700 hover:to-agri-green-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-agri-green-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 font-noto-sans"
                [disabled]="inventoryForm.invalid || isLoading()"
                [attr.aria-label]="isLoading() ? 'Registrando entrada...' : 'Registrar entrada de inventario'">
                <span class="flex items-center justify-center gap-2">
                  @if (isLoading()) {
                    <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registrando...
                  } @else {
                    <i class="fas fa-check text-sm" aria-hidden="true"></i>
                    Registrar Entrada
                  }
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Modal animation */
    @keyframes fadeInScale {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(-10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .animate-fade-in-scale {
      animation: fadeInScale 0.2s ease-out;
    }

    /* Custom scrollbar for modal */
    .overflow-y-auto::-webkit-scrollbar {
      width: 6px;
    }

    .overflow-y-auto::-webkit-scrollbar-track {
      background: #f1f5f9;
    }

    .overflow-y-auto::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }

    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    /* Enhanced focus styles */
    input:focus,
    select:focus,
    textarea:focus {
      outline: none;
      box-shadow: 
        0 0 0 2px var(--color-agri-green-100),
        0 1px 3px 0 rgb(0 0 0 / 0.1);
    }

    /* Form section backgrounds */
    .bg-gray-50 {
      background-color: rgba(249, 250, 251, 0.8);
    }

    .bg-blue-50 {
      background-color: rgba(239, 246, 255, 0.8);
    }

    .bg-amber-50 {
      background-color: rgba(255, 251, 235, 0.8);
    }
  `]
})
export class InventoryEntryModal implements OnInit {
  @Output() onClose = new EventEmitter<void>();
  @Output() onInventoryRegistered = new EventEmitter<InventoryEntry>();

  private fb = inject(FormBuilder);
  private inventoryService = inject(InventoryService);
  private productService = inject(ProductService);
  private producerService = inject(ProducerService);

  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly producers = signal<Producer[]>([]);
  readonly products = signal<Product[]>([]);
  readonly filteredProducts = signal<Product[]>([]);
  readonly totalValue = signal<number>(0);

  inventoryForm = this.fb.group({
    producerId: ['', [Validators.required]],
    productId: ['', [Validators.required]],
    quantity: [0, [Validators.required, Validators.min(0.01)]],
    pricePerUnit: [0, [Validators.required, Validators.min(0.01)]],
    quality: ['', [Validators.required]],
    deliveryDate: [this.getTodayString(), [Validators.required]],
    expirationDate: [''],
    batch: [''],
    notes: ['']
  });

  ngOnInit(): void {
    this.loadProducers();
    this.loadProducts();
    
    // Set focus to the first input when modal opens
    setTimeout(() => {
      const firstInput = document.getElementById('producer-select');
      firstInput?.focus();
    }, 100);
  }

  private getTodayString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  private loadProducers(): void {
    this.producerService.getActiveProducers().subscribe(producers => {
      this.producers.set(producers);
    });
  }

  private loadProducts(): void {
    this.productService.getProducts().subscribe(products => {
      this.products.set(products);
    });
  }

  onProducerChange(): void {
    const producerId = this.inventoryForm.get('producerId')?.value;
    if (producerId) {
      const filtered = this.products().filter(p => p.producerId === producerId);
      this.filteredProducts.set(filtered);
    } else {
      this.filteredProducts.set([]);
    }
    
    // Reset dependent fields
    this.inventoryForm.patchValue({
      productId: '',
      pricePerUnit: 0
    });
    this.calculateTotalValue();
  }

  calculateTotalValue(): void {
    const quantity = this.inventoryForm.get('quantity')?.value || 0;
    const pricePerUnit = this.inventoryForm.get('pricePerUnit')?.value || 0;
    this.totalValue.set(quantity * pricePerUnit);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.inventoryForm.get(fieldName);
    return !!(field?.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.inventoryForm.get(fieldName);
    if (!field?.errors) return '';

    const fieldLabels: { [key: string]: string } = {
      producerId: 'El productor',
      productId: 'El producto',
      quantity: 'La cantidad',
      pricePerUnit: 'El precio por unidad',
      quality: 'La calidad',
      deliveryDate: 'La fecha de entrega'
    };

    const label = fieldLabels[fieldName] || 'Este campo';

    if (field.errors['required']) return `${label} es obligatorio`;
    if (field.errors['min']) return `${label} debe ser mayor a ${field.errors['min'].min}`;

    return `${label} no es válido`;
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  closeModal(): void {
    this.onClose.emit();
  }

  async onSubmit(): Promise<void> {
    if (this.inventoryForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.inventoryForm.controls).forEach(key => {
        this.inventoryForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const formValue = this.inventoryForm.value;
      const selectedProduct = this.filteredProducts().find(p => p.id === formValue.productId);
      
      if (!selectedProduct) {
        throw new Error('Producto no encontrado');
      }

      const entryData = {
        productId: formValue.productId!,
        producerId: formValue.producerId!,
        quantity: formValue.quantity!,
        unit: selectedProduct.price.unit,
        pricePerUnit: formValue.pricePerUnit!,
        totalValue: this.totalValue(),
        deliveryDate: new Date(formValue.deliveryDate!),
        expirationDate: formValue.expirationDate ? new Date(formValue.expirationDate) : undefined,
        batch: formValue.batch || undefined,
        quality: formValue.quality as 'A' | 'B' | 'C',
        notes: formValue.notes || undefined
      };

      const entryId = await this.inventoryService.registerInventoryEntry(entryData).toPromise();
      
      const newEntry: InventoryEntry = {
        id: entryId!,
        ...entryData,
        registeredBy: '', // Will be filled by service
        registeredAt: new Date(),
        status: 'received'
      };

      this.onInventoryRegistered.emit(newEntry);
    } catch (error: any) {
      console.error('Error registrando entrada de inventario:', error);
      this.errorMessage.set(error.message || 'Error al registrar la entrada de inventario. Por favor, intente nuevamente.');
    } finally {
      this.isLoading.set(false);
    }
  }
}