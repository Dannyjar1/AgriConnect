import { Component, signal, computed, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SharedHeaderComponent } from '../../shared/components/shared-header/shared-header.component';
import { CartService, CartState, CartItem } from '../../core/services/cart'; // Integración carrito unificado

/**
 * Interface for cart summary calculations
 */
export interface CartSummary {
  subtotal: number;
  tax: number;
  taxRate: number;
  shipping: number;
  total: number;
  itemCount: number;
}

/**
 * CarritoComponent - Shopping Cart Page for AgriConnect
 * 
 * Modern Angular 20 standalone component with comprehensive cart functionality.
 * Features include:
 * - Signal-based reactive state management
 * - Real-time calculations for subtotals, taxes, and totals
 * - Responsive design with mobile-first approach
 * - Accessibility compliant (WCAG 2.1 AA)
 * - Modern UI with AgriConnect design system
 * - Enhanced visual elements with multifrutas pattern
 * - Empty state with call-to-action
 * - Quantity management with validation
 * - Remove item functionality
 * - Checkout process integration ready
 * - Integración carrito unificado + fallback de imagen
 * 
 * @author AgriConnect Team
 * @version 1.0.0
 */
@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, SharedHeaderComponent],
  template: `
    <!-- Page Header -->
    <app-shared-header currentPage="carrito" />
    
    <!-- Main Cart Content -->
    <main class="min-h-screen bg-gray-50" role="main">
      <div class="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        
        <!-- Page Title -->
        <header class="mb-8">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 font-epilogue tracking-tight">
            Mi Carrito de Compras
          </h1>
          <p class="mt-2 text-gray-600 font-noto-sans">
            Productos frescos directamente de productores ecuatorianos
          </p>
        </header>

        <!-- Cart Content or Empty State -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Cart Items Section -->
          <div class="lg:col-span-2">
            @if (cartItems().length === 0) {
              <!-- Empty Cart State -->
              <div class="card p-12 text-center animate-fade-in-scale relative overflow-hidden">
                <!-- Subtle multifrutas background for empty state -->
                <div class="absolute inset-0 opacity-[0.02]
                            transition-opacity duration-300 pointer-events-none"
                     style="background-image: url('assets/images/multifrutas.webp'); 
                            background-size: cover; 
                            background-position: center;"
                     role="presentation"
                     aria-hidden="true">
                </div>
                
                <div class="relative z-10">
                  <div class="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <span class="material-icons text-4xl text-gray-400">shopping_cart</span>
                  </div>
                  
                  <h2 class="text-2xl font-bold text-gray-900 font-epilogue mb-4">
                    Tu carrito está vacío
                  </h2>
                  
                  <p class="text-gray-600 font-noto-sans mb-8 max-w-md mx-auto">
                    Descubre productos frescos y artesanales de productores locales ecuatorianos. 
                    ¡Comienza a llenar tu carrito con productos de calidad!
                  </p>
                  
                  <div class="space-y-4">
                    <button 
                      (click)="navigateToProducts()"
                      class="btn-primary w-full sm:w-auto inline-flex items-center justify-center space-x-2"
                      aria-label="Explorar productos disponibles">
                      <span class="material-icons text-lg">inventory_2</span>
                      <span>Explorar Productos</span>
                    </button>
                    
                    <button 
                      (click)="navigateToMarketplace()"
                      class="btn-secondary w-full sm:w-auto inline-flex items-center justify-center space-x-2 ml-0 sm:ml-4"
                      aria-label="Ver marketplace principal">
                      <span class="material-icons text-lg">storefront</span>
                      <span>Ver Marketplace</span>
                    </button>
                  </div>
                </div>
              </div>
              
            } @else {
              <!-- Cart Items List -->
              <div class="space-y-6">
                @for (item of cartItems(); track item.id) {
                  <article 
                    class="card p-6 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
                    [class.updating]="isUpdatingItem() === item.id"
                    [attr.aria-label]="'Producto: ' + item.nombre + ', cantidad: ' + item.qty">
                    
                    <!-- Subtle multifrutas background pattern for cart items -->
                    <div class="absolute inset-0 opacity-[0.025] group-hover:opacity-[0.04] 
                                transition-opacity duration-300 pointer-events-none"
                         style="background-image: url('assets/images/multifrutas.webp'); 
                                background-size: cover; 
                                background-position: center;"
                         role="presentation"
                         aria-hidden="true">
                    </div>
                    
                    <div class="relative z-10 flex flex-col sm:flex-row gap-6">
                      <!-- Product Image with Enhanced Visual Elements -->
                      <div class="flex-shrink-0 relative">
                        <div class="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-lg overflow-hidden relative group/image">
                          <img 
                            [src]="item.image" 
                            [alt]="item.nombre"
                            class="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            loading="lazy"
                            (error)="onImageError($event)">
                          
                          <!-- Fresh Product Badge with multifrutas accent -->
                          <div class="absolute top-1 right-1 bg-gradient-to-r from-green-500 to-emerald-600
                                      text-white text-xs font-semibold px-2 py-1 rounded-full
                                      shadow-lg backdrop-blur-sm bg-opacity-95
                                      flex items-center gap-1"
                               role="img" 
                               aria-label="Producto fresco">
                            <div class="w-2 h-2 rounded-full bg-white bg-opacity-20
                                        bg-[url('assets/images/multifrutas.webp')] bg-cover bg-center"
                                 aria-hidden="true">
                            </div>
                            <span class="hidden sm:inline">Fresh</span>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Product Details -->
                      <div class="flex-grow space-y-3 relative">
                        <div>
                          <h3 class="text-lg font-semibold text-gray-900 font-epilogue group-hover:text-agri-green-700 transition-colors">
                            {{ item.nombre }}
                          </h3>
                          <p class="text-gray-600 font-noto-sans text-sm line-clamp-2">
                            {{ item.product.description }}
                          </p>
                          
                          <!-- Product Meta Information -->
                          <div class="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                            @if (item.product.province) {
                              <span class="flex items-center space-x-1">
                                <span class="material-icons text-sm text-agri-green-500">place</span>
                                <span>{{ item.product.province }}</span>
                              </span>
                            }
                            @if (item.product.certifications.length > 0) {
                              <span class="flex items-center space-x-1">
                                <span class="material-icons text-sm text-agri-green-500">verified</span>
                                <span>{{ item.product.certifications[0] }}</span>
                              </span>
                            }
                            <!-- AgriConnect freshness indicator -->
                            <span class="flex items-center space-x-1 text-agri-green-600">
                              <div class="w-3 h-3 rounded-full bg-gradient-to-br from-green-100 to-emerald-100
                                          bg-[url('assets/images/multifrutas.webp')] bg-cover bg-center
                                          opacity-40"
                                   aria-hidden="true">
                              </div>
                              <span class="text-xs font-medium">AgriConnect</span>
                            </span>
                          </div>
                        </div>
                        
                        <!-- Price and Actions -->
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <!-- Price Information -->
                          <div class="space-y-1">
                            <div class="flex items-baseline space-x-2">
                              <span class="text-2xl font-bold text-agri-green-600 font-epilogue group-hover:text-agri-green-700 transition-colors">
                                \${{ item.precio.toFixed(2) }}
                              </span>
                              <span class="text-gray-500 text-sm">
                                por {{ item.product.price.unit }}
                              </span>
                              <!-- Subtle multifrutas accent in price area -->
                              <div class="w-5 h-5 rounded-full bg-gradient-to-br from-green-100 to-emerald-100
                                          bg-[url('assets/images/multifrutas.webp')] bg-cover bg-center
                                          opacity-15 group-hover:opacity-25 transition-opacity duration-200"
                                   aria-hidden="true">
                              </div>
                            </div>
                            <div class="text-sm text-gray-600">
                              Subtotal: <span class="font-semibold text-agri-green-600">\${{ (item.precio * item.qty).toFixed(2) }}</span>
                            </div>
                          </div>
                          
                          <!-- Quantity Controls -->
                          <div class="flex items-center space-x-4">
                            <div class="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
                              <button
                                (click)="decreaseQuantity(item.id)"
                                [disabled]="item.qty <= 1"
                                class="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors relative group/btn"
                                [attr.aria-label]="'Disminuir cantidad de ' + item.nombre">
                                <span class="material-icons text-lg text-gray-600 group-hover/btn:text-agri-green-600 transition-colors">remove</span>
                              </button>
                              
                              <div class="px-4 py-2 border-x border-gray-300 min-w-16 text-center font-semibold bg-gray-50 relative">
                                {{ item.qty }}
                                <!-- Quantity update animation indicator -->
                                @if (isUpdatingItem() === item.id) {
                                  <div class="absolute inset-0 bg-agri-green-100 rounded animate-pulse"></div>
                                }
                              </div>
                              
                              <button
                                (click)="increaseQuantity(item.id)"
                                [disabled]="item.qty >= item.product.availability"
                                class="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors relative group/btn"
                                [attr.aria-label]="'Aumentar cantidad de ' + item.nombre">
                                <span class="material-icons text-lg text-gray-600 group-hover/btn:text-agri-green-600 transition-colors">add</span>
                              </button>
                            </div>
                            
                            <!-- Remove Item Button -->
                            <button
                              (click)="removeItem(item.id)"
                              class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all group/remove relative"
                              [attr.aria-label]="'Eliminar ' + item.nombre + ' del carrito'">
                              <span class="material-icons text-lg">delete</span>
                              <!-- Remove button ripple effect -->
                              <div class="absolute inset-0 bg-red-100 rounded-lg scale-0 group-hover/remove:scale-100 transition-transform duration-200 -z-10"></div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                }
              </div>
            }
          </div>
          
          <!-- Order Summary Sidebar -->
          @if (cartItems().length > 0) {
            <div class="lg:col-span-1">
              <aside class="card p-6 sticky top-28 relative overflow-hidden" role="complementary" aria-label="Resumen del pedido">
                <!-- Subtle multifrutas background for order summary -->
                <div class="absolute inset-0 opacity-[0.02] 
                            transition-opacity duration-300 pointer-events-none"
                     style="background-image: url('assets/images/multifrutas.webp'); 
                            background-size: cover; 
                            background-position: center;"
                     role="presentation"
                     aria-hidden="true">
                </div>
                
                <div class="relative z-10">
                  <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-bold text-gray-900 font-epilogue">
                      Resumen del Pedido
                    </h2>
                    <!-- AgriConnect quality indicator -->
                    <div class="w-6 h-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-100
                                bg-[url('assets/images/multifrutas.webp')] bg-cover bg-center
                                opacity-30 ring-2 ring-agri-green-200"
                         aria-hidden="true"
                         title="Productos frescos certificados">
                    </div>
                  </div>
                  
                  <div class="space-y-4">
                    <!-- Order Details -->
                    <div class="space-y-3 text-sm">
                      <div class="flex justify-between items-center hover:bg-gray-50 -mx-3 px-3 py-2 rounded-lg transition-colors">
                        <span class="text-gray-600">Artículos ({{ cartSummary().itemCount }})</span>
                        <span class="font-semibold">\${{ cartSummary().subtotal.toFixed(2) }}</span>
                      </div>
                      
                      <div class="flex justify-between items-center hover:bg-gray-50 -mx-3 px-3 py-2 rounded-lg transition-colors">
                        <span class="text-gray-600">IVA ({{ (cartSummary().taxRate * 100).toFixed(0) }}%)</span>
                        <span class="font-semibold">\${{ cartSummary().tax.toFixed(2) }}</span>
                      </div>
                      
                      <div class="flex justify-between items-center hover:bg-gray-50 -mx-3 px-3 py-2 rounded-lg transition-colors">
                        <span class="text-gray-600">Envío</span>
                        @if (cartSummary().shipping === 0) {
                          <span class="font-semibold text-agri-green-600">Gratis</span>
                        } @else {
                          <span class="font-semibold">\${{ cartSummary().shipping.toFixed(2) }}</span>
                        }
                      </div>
                      
                      <hr class="border-gray-200">
                      
                      <div class="flex justify-between items-center text-lg font-bold text-gray-900 hover:bg-agri-green-50 -mx-3 px-3 py-2 rounded-lg transition-colors">
                        <span>Total</span>
                        <div class="flex items-center space-x-2">
                          <span class="text-agri-green-600">\${{ cartSummary().total.toFixed(2) }}</span>
                          <div class="w-4 h-4 rounded-full bg-gradient-to-br from-green-200 to-emerald-200
                                      bg-[url('assets/images/multifrutas.webp')] bg-cover bg-center
                                      opacity-50"
                               aria-hidden="true">
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Checkout Button -->
                    <button
                      (click)="proceedToCheckout()"
                      class="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 
                             text-gray-900 font-bold py-4 px-6 rounded-lg transition-all duration-200 
                             flex items-center justify-center space-x-2 hover:shadow-lg transform hover:scale-105
                             relative overflow-hidden"
                      aria-label="Proceder al checkout">
                      <!-- Subtle checkout button enhancement -->
                      <div class="absolute inset-0 bg-[url('assets/images/multifrutas.webp')] bg-cover bg-center opacity-5"></div>
                      <span class="material-icons text-lg relative z-10">payment</span>
                      <span class="relative z-10">Proceder al Checkout</span>
                    </button>
                    
                    <!-- Continue Shopping -->
                    <button
                      (click)="navigateToProducts()"
                      class="w-full btn-secondary flex items-center justify-center space-x-2"
                      aria-label="Continuar comprando productos">
                      <span class="material-icons text-lg">arrow_back</span>
                      <span>Continuar Comprando</span>
                    </button>
                  </div>
                  
                  <!-- Shipping Info -->
                  <div class="mt-6 p-4 bg-agri-green-50 rounded-lg relative overflow-hidden">
                    <!-- Enhanced shipping info with multifrutas accent -->
                    <div class="absolute top-0 right-0 w-16 h-16 bg-[url('assets/images/multifrutas.webp')] 
                                bg-cover bg-center opacity-10 rounded-bl-lg"
                         aria-hidden="true">
                    </div>
                    <div class="flex items-start space-x-3 relative z-10">
                      <span class="material-icons text-agri-green-600 mt-0.5">local_shipping</span>
                      <div class="text-sm">
                        <p class="font-semibold text-agri-green-900">Envío gratuito</p>
                        <p class="text-agri-green-700 mt-1">
                          En compras superiores a $25. Delivery en 24-48 horas en zona metropolitana.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          }
        </div>
      </div>
    </main>
  `,
  styleUrls: ['./carrito.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarritoComponent implements OnInit, OnDestroy {
  
  // Router injection for navigation
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService); // Integración carrito unificado
  
  // Cart state management with signals - Subscribe to CartService
  protected readonly cartItems = signal<CartItem[]>([]);
  
  // Loading states
  protected readonly isLoading = signal<boolean>(false);
  protected readonly isUpdatingItem = signal<string | null>(null);
  
  // Subscription to cart service
  private cartSubscription?: Subscription;
  
  // Calculated cart summary using computed signals
  protected readonly cartSummary = computed<CartSummary>(() => {
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
    // Subscribe to cart$ and render items in real-time
    this.cartSubscription = this.cartService.cart$.subscribe((cartState: CartState) => {
      this.cartItems.set(cartState.items);
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  /**
   * Handle image loading errors with fallback
   * Integración carrito unificado + fallback de imagen
   */
  protected onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      // Si no hay imagen válida, usar multifrutas.webp como fallback
      if (!img.src.includes('multifrutas.webp')) {
        img.src = 'assets/images/multifrutas.webp';
        img.className = 'w-full h-full object-cover transition-transform duration-300 hover:scale-110';
      } else {
        // Si multifrutas.webp también falla, mostrar icono
        img.style.display = 'none';
        const parent = img.parentElement;
        if (parent) {
          parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="material-icons text-gray-400 text-2xl">image</span></div>';
        }
      }
    }
  }

  /**
   * Increase quantity of a cart item using CartService
   */
  protected increaseQuantity(itemId: string): void {
    this.cartService.incrementQuantity(itemId);
    this.animateItemUpdate(itemId);
  }

  /**
   * Decrease quantity of a cart item using CartService
   */
  protected decreaseQuantity(itemId: string): void {
    this.cartService.decrementQuantity(itemId);
    this.animateItemUpdate(itemId);
  }

  /**
   * Remove item from cart using CartService
   */
  protected removeItem(itemId: string): void {
    this.cartService.remove(itemId);
    console.log('Producto eliminado del carrito');
  }

  /**
   * Navigate to products page
   */
  protected navigateToProducts(): void {
    this.router.navigate(['/productos']);
  }

  /**
   * Navigate to marketplace page
   */
  protected navigateToMarketplace(): void {
    this.router.navigate(['/marketplace']);
  }

  /**
   * Proceed to checkout
   * TODO: Implement checkout flow
   */
  protected proceedToCheckout(): void {
    // In a real implementation, this would navigate to checkout
    // or open a checkout modal/component
    console.log('Procediendo al checkout...', {
      items: this.cartItems(),
      summary: this.cartSummary()
    });
    
    // For now, show alert
    alert(`Procediendo al checkout por un total de $${this.cartSummary().total.toFixed(2)}`);
  }

  /**
   * Animate item update for better UX
   */
  private animateItemUpdate(itemId: string): void {
    this.isUpdatingItem.set(itemId);
    setTimeout(() => {
      this.isUpdatingItem.set(null);
    }, 300);
  }

  /**
   * Clear entire cart using CartService
   */
  protected clearCart(): void {
    this.cartService.clear();
  }

  /**
   * Get cart item count for badge display
   */
  getCartItemCount(): number {
    return this.cartSummary().itemCount;
  }

  /**
   * Get cart total for quick reference
   */
  getCartTotal(): number {
    return this.cartSummary().total;
  }
}