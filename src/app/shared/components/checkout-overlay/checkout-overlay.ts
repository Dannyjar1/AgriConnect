import { Component, signal, computed, inject, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription, fromEvent } from 'rxjs';
import { CartService } from '../../../core/services/cart';
import { OrderService } from '../../../core/services/order';
import { BankTransferModal } from '../bank-transfer-modal/bank-transfer-modal';
import { CreditCardModal } from '../credit-card-modal/credit-card-modal';
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
  imports: [CommonModule, ReactiveFormsModule, BankTransferModal, CreditCardModal],
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
          class="fixed inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity duration-300"
          (click)="closeOverlay()"
          aria-hidden="true">
        </div>
        
        <!-- Overlay Panel -->
        <div class="fixed inset-y-0 right-0 w-full sm:max-w-md bg-gradient-to-br from-white to-agri-green-50 shadow-xl border-l border-agri-green-100 overflow-y-auto">
          <div class="min-h-full flex flex-col">
            
            <!-- Header -->
            <header class="sticky top-0 bg-white border-b border-agri-green-200 px-6 py-5 z-10 shadow-sm backdrop-blur-sm">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-gradient-to-br from-agri-green-500 to-agri-green-600 rounded-lg flex items-center justify-center">
                    <span class="material-icons text-white text-sm">shopping_bag</span>
                  </div>
                  <h1 id="checkout-title" class="text-xl font-bold text-gray-900 font-epilogue">
                    Finalizar Compra
                  </h1>
                </div>
                <button
                  (click)="closeOverlay()"
                  class="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/80 rounded-full transition-all duration-200 hover:shadow-md"
                  aria-label="Cerrar checkout"
                  #closeButton>
                  <span class="material-icons text-xl">close</span>
                </button>
              </div>
              
              <!-- Progress indicator -->
              <div class="mt-4 flex items-center justify-between p-3 bg-white/60 rounded-lg border border-agri-green-100">
                <div class="flex items-center space-x-2 text-sm text-slate-600">
                  <span class="material-icons text-sm text-agri-green-600">shopping_cart</span>
                  <span>{{ cartSummary().itemCount }} {{ cartSummary().itemCount === 1 ? 'artículo' : 'artículos' }}</span>
                </div>
                <div class="text-lg font-bold text-agri-green-700">\${{ cartSummary().total.toFixed(2) }}</div>
              </div>
            </header>
            
            <!-- Main Content -->
            <main class="flex-1 px-6 py-6">
              <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()" novalidate>
                
                <!-- Cart Summary Section -->
                <section class="mb-8" aria-labelledby="cart-summary-title">
                  <h2 id="cart-summary-title" class="text-lg font-semibold text-gray-900 font-epilogue mb-4 flex items-center">
                    <span class="material-icons text-agri-green-600 mr-2">receipt_long</span>
                    Resumen del Pedido
                  </h2>
                  
                  <div class="bg-gradient-to-br from-agri-green-50 to-emerald-50 rounded-xl p-5 space-y-3 border border-agri-green-100 shadow-sm">
                    @for (item of cartItems(); track item.id) {
                      <div class="flex items-center space-x-3 p-3 bg-white/70 rounded-lg border border-agri-green-100">
                        <div class="w-12 h-12 bg-gradient-to-br from-agri-green-100 to-emerald-100 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                          <img 
                            [src]="item.image" 
                            [alt]="item.nombre"
                            class="w-full h-full object-cover"
                            loading="lazy"
                            (error)="onImageError($event)">
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium text-gray-900 truncate">{{ item.nombre }}</p>
                          <p class="text-xs text-agri-green-600 font-medium">Cantidad: {{ item.qty }}</p>
                        </div>
                        <div class="text-sm font-bold text-agri-green-700">
                          \${{ (item.precio * item.qty).toFixed(2) }}
                        </div>
                      </div>
                    }
                    
                    <!-- Totals -->
                    <div class="border-t border-agri-green-200 pt-4 space-y-3 bg-white/50 rounded-lg p-4 mt-4">
                      <div class="flex justify-between text-sm">
                        <span class="text-slate-600">Subtotal</span>
                        <span class="font-semibold text-gray-800">\${{ cartSummary().subtotal.toFixed(2) }}</span>
                      </div>
                      <div class="flex justify-between text-sm">
                        <span class="text-slate-600">IVA (12%)</span>
                        <span class="font-semibold text-gray-800">\${{ cartSummary().tax.toFixed(2) }}</span>
                      </div>
                      <div class="flex justify-between text-sm">
                        <span class="text-slate-600">Envío</span>
                        @if (cartSummary().shipping === 0) {
                          <span class="font-semibold text-emerald-600">Gratis</span>
                        } @else {
                          <span class="font-semibold text-gray-800">\${{ cartSummary().shipping.toFixed(2) }}</span>
                        }
                      </div>
                      <div class="flex justify-between font-bold text-lg border-t border-agri-green-200 pt-3">
                        <span class="text-gray-800">Total</span>
                        <span class="text-agri-green-700">\${{ cartSummary().total.toFixed(2) }}</span>
                      </div>
                    </div>
                  </div>
                </section>
                
                <!-- Shipping Information Section -->
                <section class="mb-8" aria-labelledby="shipping-title">
                  <div class="bg-gradient-to-br from-agri-green-50 to-emerald-50 rounded-xl p-6 border border-agri-green-100 shadow-sm">
                    <h2 id="shipping-title" class="text-lg font-semibold text-gray-900 font-epilogue mb-6 flex items-center">
                      <span class="material-icons text-agri-green-600 mr-2">local_shipping</span>
                      Información de Envío
                    </h2>
                    
                    <div class="space-y-4">
                    <!-- Name fields -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div class="space-y-2">
                        <label for="nombres" class="block text-sm font-medium text-gray-900 relative after:content-['*'] after:text-red-500 after:ml-1">Nombres</label>
                        <input
                          id="nombres"
                          type="text"
                          formControlName="nombres"
                          [class]="'block w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ' + (isFieldInvalid('nombres') ? 'border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20 bg-red-50' : 'border-agri-green-100 bg-white/70 placeholder-gray-500 focus:border-agri-green-500 focus:ring-2 focus:ring-agri-green-500 focus:ring-opacity-20 text-gray-900')"
                          placeholder="Ingresa tus nombres"
                          aria-describedby="nombres-error"
                          autocomplete="given-name">
                        @if (isFieldInvalid('nombres')) {
                          <div id="nombres-error" class="flex items-center space-x-1 text-sm text-red-600" role="alert">
                            <span class="material-icons text-sm">error</span>
                            Los nombres son requeridos
                          </div>
                        }
                      </div>
                      
                      <div class="space-y-2">
                        <label for="apellidos" class="block text-sm font-medium text-gray-900 relative after:content-['*'] after:text-red-500 after:ml-1">Apellidos</label>
                        <input
                          id="apellidos"
                          type="text"
                          formControlName="apellidos"
                          [class]="'block w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ' + (isFieldInvalid('apellidos') ? 'border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20 bg-red-50' : 'border-agri-green-100 bg-white/70 placeholder-gray-500 focus:border-agri-green-500 focus:ring-2 focus:ring-agri-green-500 focus:ring-opacity-20 text-gray-900')"
                          placeholder="Ingresa tus apellidos"
                          aria-describedby="apellidos-error"
                          autocomplete="family-name">
                        @if (isFieldInvalid('apellidos')) {
                          <div id="apellidos-error" class="flex items-center space-x-1 text-sm text-red-600" role="alert">
                            <span class="material-icons text-sm">error</span>
                            Los apellidos son requeridos
                          </div>
                        }
                      </div>
                    </div>
                    
                    <!-- Contact fields -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div class="space-y-2">
                        <label for="correo" class="block text-sm font-medium text-gray-900  relative after:content-['*'] after:text-red-500 after:ml-1">Correo Electrónico</label>
                        <input
                          id="correo"
                          type="email"
                          formControlName="correo"
                          [class]="'block w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ' + (isFieldInvalid('correo') ? 'border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20 bg-red-50' : 'border-agri-green-100 bg-white/70 placeholder-gray-500 focus:border-agri-green-500 focus:ring-2 focus:ring-agri-green-500 focus:ring-opacity-20 text-gray-900')"
                          placeholder="ejemplo@correo.com"
                          aria-describedby="correo-error"
                          autocomplete="email">
                        @if (isFieldInvalid('correo')) {
                          <div id="correo-error" class="flex items-center space-x-1 text-sm text-red-600 " role="alert">
                            <span class="material-icons text-sm">error</span>
                            @if (checkoutForm.get('correo')?.hasError('required')) {
                              El correo es requerido
                            } @else if (checkoutForm.get('correo')?.hasError('email')) {
                              Formato de correo inválido
                            }
                          </div>
                        }
                      </div>
                      
                      <div class="space-y-2">
                        <label for="telefono" class="block text-sm font-medium text-gray-900  relative after:content-['*'] after:text-red-500 after:ml-1">Teléfono</label>
                        <input
                          id="telefono"
                          type="tel"
                          formControlName="telefono"
                          [class]="'block w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ' + (isFieldInvalid('telefono') ? 'border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20 bg-red-50 ' : 'border-agri-green-100 bg-white/70 placeholder-gray-500 focus:border-agri-green-500 focus:ring-2 focus:ring-agri-green-500 focus:ring-opacity-20 text-gray-900')"
                          placeholder="0999123456"
                          aria-describedby="telefono-error"
                          autocomplete="tel"
                          (input)="onPhoneInput($event)">
                        @if (isFieldInvalid('telefono')) {
                          <div id="telefono-error" class="flex items-center space-x-1 text-sm text-red-600 " role="alert">
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
                    <div class="space-y-2">
                      <label for="direccion" class="block text-sm font-medium text-gray-900  relative after:content-['*'] after:text-red-500 after:ml-1">Dirección</label>
                      <input
                        id="direccion"
                        type="text"
                        formControlName="direccion"
                        [class]="'block w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ' + (isFieldInvalid('direccion') ? 'border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20 bg-red-50 ' : 'border-agri-green-100 bg-white/70 placeholder-gray-500 focus:border-agri-green-500 focus:ring-2 focus:ring-agri-green-500 focus:ring-opacity-20 text-gray-900')"
                        placeholder="Calle Principal y Secundaria"
                        aria-describedby="direccion-error"
                        autocomplete="street-address">
                      @if (isFieldInvalid('direccion')) {
                        <div id="direccion-error" class="flex items-center space-x-1 text-sm text-red-600 " role="alert">
                          <span class="material-icons text-sm">error</span>
                          La dirección es requerida
                        </div>
                      }
                    </div>
                    
                    <div class="space-y-2">
                      <label for="referencia" class="block text-sm font-medium text-gray-900 ">Referencia</label>
                      <input
                        id="referencia"
                        type="text"
                        formControlName="referencia"
                        class="block w-full px-4 py-3 text-sm border border-agri-green-100 rounded-lg bg-white/70 placeholder-gray-500 focus:border-agri-green-500 focus:ring-2 focus:ring-agri-green-500 focus:ring-opacity-20 text-gray-900 transition-all duration-200"
                        placeholder="Casa de color azul, junto al parque"
                        autocomplete="address-line2">
                    </div>
                    
                    <!-- Location fields -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div class="space-y-2">
                        <label for="provincia" class="block text-sm font-medium text-gray-900  relative after:content-['*'] after:text-red-500 after:ml-1">Provincia</label>
                        <select
                          id="provincia"
                          formControlName="provincia"
                          [class]="'block w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 appearance-none bg-no-repeat bg-right bg-center pr-10 ' + (isFieldInvalid('provincia') ? 'border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20 bg-red-50 ' : 'border-agri-green-100 bg-white/70 placeholder-gray-500 focus:border-agri-green-500 focus:ring-2 focus:ring-agri-green-500 focus:ring-opacity-20 text-gray-900')"
                          style="background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' fill=\\'none\\' viewBox=\\'0 0 20 20\\'%3E%3Cpath stroke=\\'%236B7280\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'1.5\\' d=\\'M6 8l4 4 4-4\\'/%3E%3C/svg%3E'); background-size: 20px;"
                          aria-describedby="provincia-error"
                          (change)="onProvinciaChange()">
                          <option value="">Selecciona una provincia</option>
                          @for (provincia of provincias; track provincia.codigo) {
                            <option [value]="provincia.codigo">{{ provincia.nombre }}</option>
                          }
                        </select>
                        @if (isFieldInvalid('provincia')) {
                          <div id="provincia-error" class="flex items-center space-x-1 text-sm text-red-600 " role="alert">
                            <span class="material-icons text-sm">error</span>
                            La provincia es requerida
                          </div>
                        }
                      </div>
                      
                      <div class="space-y-2">
                        <label for="ciudad" class="block text-sm font-medium text-gray-900  relative after:content-['*'] after:text-red-500 after:ml-1">Ciudad</label>
                        <select
                          id="ciudad"
                          formControlName="ciudad"
                          [class]="'block w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 appearance-none bg-no-repeat bg-right bg-center pr-10 ' + (isFieldInvalid('ciudad') ? 'border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20 bg-red-50 ' : 'border-agri-green-100 bg-white/70 placeholder-gray-500 focus:border-agri-green-500 focus:ring-2 focus:ring-agri-green-500 focus:ring-opacity-20 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed')"
                          style="background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' fill=\\'none\\' viewBox=\\'0 0 20 20\\'%3E%3Cpath stroke=\\'%236B7280\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'1.5\\' d=\\'M6 8l4 4 4-4\\'/%3E%3C/svg%3E'); background-size: 20px;"
                          [disabled]="!checkoutForm.get('provincia')?.value"
                          aria-describedby="ciudad-error">
                          <option value="">Selecciona una ciudad</option>
                          @for (ciudad of ciudadesDisponibles(); track ciudad.codigo) {
                            <option [value]="ciudad.codigo">{{ ciudad.nombre }}</option>
                          }
                        </select>
                        @if (isFieldInvalid('ciudad')) {
                          <div id="ciudad-error" class="flex items-center space-x-1 text-sm text-red-600 " role="alert">
                            <span class="material-icons text-sm">error</span>
                            La ciudad es requerida
                          </div>
                        }
                      </div>
                    </div>
                    
                    <div class="space-y-2">
                      <label for="codigoPostal" class="block text-sm font-medium text-gray-900 ">Código Postal</label>
                      <input
                        id="codigoPostal"
                        type="text"
                        formControlName="codigoPostal"
                        class="block w-full px-4 py-3 text-sm border border-agri-green-100 rounded-lg bg-white/70 placeholder-gray-500 focus:border-agri-green-500 focus:ring-2 focus:ring-agri-green-500 focus:ring-opacity-20 text-gray-900 transition-all duration-200"
                        placeholder="170150"
                        maxlength="6"
                        autocomplete="postal-code">
                    </div>
                    
                    <div class="space-y-2">
                      <label for="notas" class="block text-sm font-medium text-gray-900 ">Notas Especiales</label>
                      <textarea
                        id="notas"
                        formControlName="notas"
                        class="block w-full px-4 py-3 text-sm border border-agri-green-100 rounded-lg bg-white/70 placeholder-gray-500 focus:border-agri-green-500 focus:ring-2 focus:ring-agri-green-500 focus:ring-opacity-20 text-gray-900 transition-all duration-200"
                        rows="3"
                        placeholder="Instrucciones especiales para la entrega"
                        maxlength="500"></textarea>
                      <div class="text-xs text-slate-500 ">{{ getNotasLength() }}/500 caracteres</div>
                    </div>
                    </div>
                  </div>
                </section>
                
                <!-- Payment Information Section -->
                <section class="mb-8" aria-labelledby="payment-title">
                  <div class="bg-gradient-to-br from-agri-green-50 to-emerald-50 rounded-xl p-6 border border-agri-green-100 shadow-sm">
                    <h2 id="payment-title" class="text-lg font-semibold text-gray-900 font-epilogue mb-6 flex items-center">
                      <span class="material-icons text-agri-green-600 mr-2">payment</span>
                      Información de Pago
                    </h2>
                    
                    <!-- Payment Method Selection -->
                  <div class="space-y-2">
                    <fieldset>
                      <legend class="block text-sm font-medium text-gray-900  relative after:content-['*'] after:text-red-500 after:ml-1">Método de Pago</legend>
                      <div class="space-y-3" role="radiogroup" aria-labelledby="payment-title">
                        @for (metodo of metodosPago; track metodo.value) {
                          <label class="relative cursor-pointer" [class]="checkoutForm.get('metodoPago')?.value === metodo.value ? 'selected' : ''">
                            <input
                              type="radio"
                              formControlName="metodoPago"
                              [value]="metodo.value"
                              class="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
                              style="clip: rect(0, 0, 0, 0);"
                              [attr.aria-describedby]="metodo.value + '-desc'"
                              (change)="onPaymentMethodChange(metodo.value)">
                            <div [class]="'flex items-center justify-between p-4 border rounded-lg transition-all duration-200 ' + (checkoutForm.get('metodoPago')?.value === metodo.value ? 'border-agri-green-500 bg-white ' : 'border-agri-green-200 hover:border-agri-green-300 hover:bg-white ')">
                              <div class="flex items-center space-x-3">
                                <span class="material-icons text-xl" [class]="metodo.iconClass">{{ metodo.icon }}</span>
                                <div>
                                  <div class="font-medium text-gray-800">{{ metodo.label }}</div>
                                  <div id="{{ metodo.value }}-desc" class="text-sm text-slate-500">{{ metodo.description }}</div>
                                </div>
                              </div>
                              <div [class]="'w-5 h-5 border-2 rounded-full relative transition-all duration-200 ' + (checkoutForm.get('metodoPago')?.value === metodo.value ? 'border-agri-green-500' : 'border-agri-green-300 ')">
                                <div [class]="'w-3 h-3 bg-agri-green-600 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 ' + (checkoutForm.get('metodoPago')?.value === metodo.value ? 'scale-100' : 'scale-0')"></div>
                              </div>
                            </div>
                          </label>
                        }
                      </div>
                    </fieldset>
                    @if (isFieldInvalid('metodoPago')) {
                      <div class="flex items-center space-x-1 text-sm text-red-600  mt-2" role="alert">
                        <span class="material-icons text-sm">error</span>
                        Selecciona un método de pago
                      </div>
                    }
                  </div>
                  
                  <!-- Note: Credit card fields are now handled in a separate modal -->
                  </div>
                </section>
                
                <!-- Submit Button -->
                <div class="sticky bottom-0 bg-gradient-to-r from-white via-agri-green-50 to-emerald-50 border-t border-agri-green-100 p-6 -mx-6 -mb-6 shadow-lg">
                  <button
                    type="submit"
                    [disabled]="checkoutForm.invalid || isProcessing()"
                    class="w-full bg-gradient-to-r from-agri-green-600 to-emerald-600 hover:from-agri-green-700 hover:to-emerald-700 
                           disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
                           text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 
                           flex items-center justify-center space-x-2 hover:shadow-lg transform hover:scale-[1.02]
                           disabled:transform-none disabled:shadow-none shadow-md"
                    [attr.aria-describedby]="checkoutForm.invalid ? 'form-errors' : null">
                    @if (isProcessing()) {
                      <span class="animate-spin material-icons text-lg">refresh</span>
                      <span>Procesando...</span>
                    } @else {
                      <span class="material-icons text-lg">shopping_bag</span>
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
    
    <!-- Bank Transfer Modal -->
    <app-bank-transfer-modal 
      #bankTransferModal
      (transferConfirmed)="onBankTransferConfirmed($event)">
    </app-bank-transfer-modal>
    
    <!-- Credit Card Modal -->
    <app-credit-card-modal 
      #creditCardModal
      (cardConfirmed)="onCreditCardConfirmed($event)">
    </app-credit-card-modal>
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
  @ViewChild('bankTransferModal') bankTransferModal!: BankTransferModal;
  @ViewChild('creditCardModal') creditCardModal!: CreditCardModal;

  // Component state signals
  readonly isOpen = signal<boolean>(false);
  readonly isProcessing = signal<boolean>(false);
  readonly cartItems = signal<CartItem[]>([]);

  // Form and validation
  checkoutForm!: FormGroup;
  private cartSubscription?: Subscription;
  
  // Bank transfer data
  private bankTransferData: any = null;
  
  // Credit card data
  private creditCardData: any = null;

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
      { codigo: 'rumiñahui', nombre: 'Rumiñahui' },
      { codigo: 'pedro-moncayo', nombre: 'Pedro Moncayo' },
      { codigo: 'san-miguel-de-los-bancos', nombre: 'San Miguel de los Bancos' }
    ],
    'guayas': [
      { codigo: 'guayaquil', nombre: 'Guayaquil' },
      { codigo: 'duran', nombre: 'Durán' },
      { codigo: 'milagro', nombre: 'Milagro' },
      { codigo: 'daule', nombre: 'Daule' },
      { codigo: 'samborondon', nombre: 'Samborondón' },
      { codigo: 'la-libertad', nombre: 'La Libertad' },
      { codigo: 'playas', nombre: 'Playas' },
      { codigo: 'yaguachi', nombre: 'Yaguachi' }
    ],
    'azuay': [
      { codigo: 'cuenca', nombre: 'Cuenca' },
      { codigo: 'giron', nombre: 'Girón' },
      { codigo: 'paute', nombre: 'Paute' },
      { codigo: 'gualaceo', nombre: 'Gualaceo' },
      { codigo: 'sigsig', nombre: 'Sígsig' }
    ],
    'manabi': [
      { codigo: 'portoviejo', nombre: 'Portoviejo' },
      { codigo: 'manta', nombre: 'Manta' },
      { codigo: 'chone', nombre: 'Chone' },
      { codigo: 'montecristi', nombre: 'Montecristi' },
      { codigo: 'jipijapa', nombre: 'Jipijapa' },
      { codigo: 'bahia-de-caraquez', nombre: 'Bahía de Caráquez' }
    ],
    'tungurahua': [
      { codigo: 'ambato', nombre: 'Ambato' },
      { codigo: 'banos', nombre: 'Baños de Agua Santa' },
      { codigo: 'pelileo', nombre: 'Pelileo' },
      { codigo: 'patate', nombre: 'Patate' },
      { codigo: 'cevallos', nombre: 'Cevallos' }
    ],
    'el-oro': [
      { codigo: 'machala', nombre: 'Machala' },
      { codigo: 'pasaje', nombre: 'Pasaje' },
      { codigo: 'santa-rosa', nombre: 'Santa Rosa' },
      { codigo: 'el-guabo', nombre: 'El Guabo' },
      { codigo: 'huaquillas', nombre: 'Huaquillas' }
    ],
    'los-rios': [
      { codigo: 'babahoyo', nombre: 'Babahoyo' },
      { codigo: 'quevedo', nombre: 'Quevedo' },
      { codigo: 'ventanas', nombre: 'Ventanas' },
      { codigo: 'vinces', nombre: 'Vinces' },
      { codigo: 'buena-fe', nombre: 'Buena Fe' }
    ],
    'imbabura': [
      { codigo: 'ibarra', nombre: 'Ibarra' },
      { codigo: 'otavalo', nombre: 'Otavalo' },
      { codigo: 'cotacachi', nombre: 'Cotacachi' },
      { codigo: 'antonio-ante', nombre: 'Antonio Ante' },
      { codigo: 'pimampiro', nombre: 'Pimampiro' }
    ],
    'esmeraldas': [
      { codigo: 'esmeraldas', nombre: 'Esmeraldas' },
      { codigo: 'atacames', nombre: 'Atacames' },
      { codigo: 'quininde', nombre: 'Quinindé' },
      { codigo: 'san-lorenzo', nombre: 'San Lorenzo' },
      { codigo: 'muisne', nombre: 'Muisne' }
    ],
    'loja': [
      { codigo: 'loja', nombre: 'Loja' },
      { codigo: 'catamayo', nombre: 'Catamayo' },
      { codigo: 'cariamanga', nombre: 'Cariamanga' },
      { codigo: 'catacocha', nombre: 'Catacocha' },
      { codigo: 'macara', nombre: 'Macará' }
    ]
  };

  readonly ciudadesDisponibles = signal<Array<{codigo: string, nombre: string}>>([]);

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
      metodoPago: ['contraentrega', Validators.required]
    });

    // Note: Credit card validation is now handled in the modal

    // Setup provincia change listener for cities update
    this.checkoutForm.get('provincia')?.valueChanges.subscribe(provincia => {
      const ciudades = this.ciudadesPorProvincia[provincia] || [];
      this.ciudadesDisponibles.set(ciudades);
      this.checkoutForm.get('ciudad')?.setValue('');
      console.log('Provincia cambiada a:', provincia, 'Ciudades:', ciudades);
    });

    // Auto-save form progress
    this.checkoutForm.valueChanges.subscribe(() => {
      this.saveToSessionStorage();
    });
  }

  // Note: Payment validation functions moved to respective modal components

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
    // Check if bank transfer is selected but not configured
    if (this.checkoutForm.value.metodoPago === 'transferencia' && !this.bankTransferData) {
      alert('Por favor configure los datos de transferencia bancaria primero.');
      return;
    }

    // Check if credit card is selected but not configured
    if (this.checkoutForm.value.metodoPago === 'tarjeta' && !this.creditCardData) {
      alert('Por favor configure los datos de la tarjeta de crédito primero.');
      return;
    }

    if (this.checkoutForm.valid) {
      this.isProcessing.set(true);
      
      // Prepare payment data based on method
      let paymentData: any = {
        metodo: this.checkoutForm.value.metodoPago
      };

      // Add specific data based on payment method
      if (this.checkoutForm.value.metodoPago === 'tarjeta' && this.creditCardData) {
        paymentData = {
          ...paymentData,
          creditCard: {
            cardHolder: this.creditCardData.cardHolder,
            cardNumber: this.creditCardData.cardNumber, // Already masked
            expiryDate: this.creditCardData.expiryDate,
            cardType: this.creditCardData.cardType,
            saveCard: this.creditCardData.saveCard,
            timestamp: this.creditCardData.timestamp
          }
        };
      } else if (this.checkoutForm.value.metodoPago === 'transferencia' && this.bankTransferData) {
        paymentData = {
          ...paymentData,
          bankTransfer: {
            voucherNumber: this.bankTransferData.voucherNumber,
            paymentLink: this.bankTransferData.paymentLink,
            qrImagePath: this.bankTransferData.qrImagePath,
            notes: this.bankTransferData.notes,
            timestamp: this.bankTransferData.timestamp
          }
        };
      }
      
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
        payment: paymentData,
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
            const message = `🎉 ¡Pedido realizado con éxito!\n\n📦 ID del pedido: ${response.orderId}\n💰 Total: $${this.cartSummary().total.toFixed(2)}\n\n📧 Te hemos enviado un correo de confirmación a:\n${orderData.shipping.correo}\n\n🚚 Tiempo estimado de entrega: ${response.estimatedDelivery ? new Date(response.estimatedDelivery).toLocaleDateString('es-EC') : '2-3 días hábiles'}`;
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

  // Note: Credit card input formatting moved to CreditCardModal component

  /**
   * Handle provincia change to update cities
   */
  onProvinciaChange(): void {
    const provinciaSeleccionada = this.checkoutForm.get('provincia')?.value;
    const ciudades = this.ciudadesPorProvincia[provinciaSeleccionada] || [];
    
    // Update cities signal
    this.ciudadesDisponibles.set(ciudades);
    
    // Clear previously selected city
    this.checkoutForm.get('ciudad')?.setValue('');
    
    console.log('Provincia seleccionada:', provinciaSeleccionada);
    console.log('Ciudades disponibles:', ciudades);
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

  /**
   * Handle payment method selection - open appropriate modal if selected
   */
  onPaymentMethodChange(metodo: string): void {
    if (metodo === 'transferencia') {
      // Open bank transfer modal
      setTimeout(() => {
        this.bankTransferModal?.openModal();
      }, 100);
      // Clear credit card data if switching methods
      this.creditCardData = null;
    } else if (metodo === 'tarjeta') {
      // Open credit card modal
      setTimeout(() => {
        this.creditCardModal?.openModal();
      }, 100);
      // Clear bank transfer data if switching methods
      this.bankTransferData = null;
    } else {
      // Clear all payment data if another method is selected
      this.bankTransferData = null;
      this.creditCardData = null;
    }
  }

  /**
   * Handle bank transfer confirmation from modal
   */
  onBankTransferConfirmed(transferData: any): void {
    this.bankTransferData = transferData;
    console.log('Bank transfer confirmed:', transferData);
    
    // Update form to indicate transfer is configured
    // The normal checkout flow will continue with this data
  }

  /**
   * Handle credit card confirmation from modal
   */
  onCreditCardConfirmed(cardData: any): void {
    this.creditCardData = cardData;
    console.log('Credit card confirmed:', cardData);
    
    // Update form to indicate card is configured
    // The normal checkout flow will continue with this data
  }
}