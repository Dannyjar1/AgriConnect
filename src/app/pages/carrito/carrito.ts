import { Component, signal, computed, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedHeaderComponent } from '../../shared/components/shared-header/shared-header.component';
import { Product } from '../../core/models/product.model';

/**
 * Interface for cart items with quantity and additional metadata
 */
interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  addedAt: Date;
  subtotal: number;
}

/**
 * Interface for cart summary calculations
 */
interface CartSummary {
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
 * - Empty state with call-to-action
 * - Quantity management with validation
 * - Remove item functionality
 * - Checkout process integration ready
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
              <div class="card p-12 text-center animate-fade-in-scale">
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
              
            } @else {
              <!-- Cart Items List -->
              <div class="space-y-6">
                @for (item of cartItems(); track item.id) {
                  <article 
                    class="card p-6 hover:shadow-lg transition-all duration-300"
                    [attr.aria-label]="'Producto: ' + item.product.name + ', cantidad: ' + item.quantity">
                    
                    <div class="flex flex-col sm:flex-row gap-6">
                      <!-- Product Image -->
                      <div class="flex-shrink-0">
                        <div class="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-lg overflow-hidden">
                          @if (item.product.images && item.product.images.length > 0) {
                            <img 
                              [src]="item.product.images[0]" 
                              [alt]="item.product.name"
                              class="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                              loading="lazy">
                          } @else {
                            <div class="w-full h-full flex items-center justify-center">
                              <span class="material-icons text-gray-400 text-2xl">image</span>
                            </div>
                          }
                        </div>
                      </div>
                      
                      <!-- Product Details -->
                      <div class="flex-grow space-y-3">
                        <div>
                          <h3 class="text-lg font-semibold text-gray-900 font-epilogue">
                            {{ item.product.name }}
                          </h3>
                          <p class="text-gray-600 font-noto-sans text-sm line-clamp-2">
                            {{ item.product.description }}
                          </p>
                          
                          <!-- Product Meta Information -->
                          <div class="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                            @if (item.product.province) {
                              <span class="flex items-center space-x-1">
                                <span class="material-icons text-sm">place</span>
                                <span>{{ item.product.province }}</span>
                              </span>
                            }
                            @if (item.product.certifications.length > 0) {
                              <span class="flex items-center space-x-1">
                                <span class="material-icons text-sm">verified</span>
                                <span>{{ item.product.certifications[0] }}</span>
                              </span>
                            }
                          </div>
                        </div>
                        
                        <!-- Price and Actions -->
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <!-- Price Information -->
                          <div class="space-y-1">
                            <div class="flex items-baseline space-x-2">
                              <span class="text-2xl font-bold text-agri-green-600 font-epilogue">
                                ${{ item.product.price.perUnit.toFixed(2) }}
                              </span>
                              <span class="text-gray-500 text-sm">
                                por {{ item.product.price.unit }}
                              </span>
                            </div>
                            <div class="text-sm text-gray-600">
                              Subtotal: <span class="font-semibold">${{ item.subtotal.toFixed(2) }}</span>
                            </div>
                          </div>
                          
                          <!-- Quantity Controls -->
                          <div class="flex items-center space-x-4">
                            <div class="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                              <button
                                (click)="decreaseQuantity(item.id)"
                                [disabled]="item.quantity <= 1"
                                class="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                [attr.aria-label]="'Disminuir cantidad de ' + item.product.name">
                                <span class="material-icons text-lg">remove</span>
                              </button>
                              
                              <div class="px-4 py-2 border-x border-gray-300 min-w-16 text-center font-semibold">
                                {{ item.quantity }}
                              </div>
                              
                              <button
                                (click)="increaseQuantity(item.id)"
                                [disabled]="item.quantity >= item.product.availability"
                                class="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                [attr.aria-label]="'Aumentar cantidad de ' + item.product.name">
                                <span class="material-icons text-lg">add</span>
                              </button>
                            </div>
                            
                            <!-- Remove Item Button -->
                            <button
                              (click)="removeItem(item.id)"
                              class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                              [attr.aria-label]="'Eliminar ' + item.product.name + ' del carrito'">
                              <span class="material-icons text-lg">delete</span>
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
              <aside class="card p-6 sticky top-28" role="complementary" aria-label="Resumen del pedido">
                <h2 class="text-xl font-bold text-gray-900 font-epilogue mb-6">
                  Resumen del Pedido
                </h2>
                
                <div class="space-y-4">
                  <!-- Order Details -->
                  <div class="space-y-3 text-sm">
                    <div class="flex justify-between items-center">
                      <span class="text-gray-600">Artículos ({{ cartSummary().itemCount }})</span>
                      <span class="font-semibold">${{ cartSummary().subtotal.toFixed(2) }}</span>
                    </div>
                    
                    <div class="flex justify-between items-center">
                      <span class="text-gray-600">IVA ({{ (cartSummary().taxRate * 100).toFixed(0) }}%)</span>
                      <span class="font-semibold">${{ cartSummary().tax.toFixed(2) }}</span>
                    </div>
                    
                    <div class="flex justify-between items-center">
                      <span class="text-gray-600">Envío</span>
                      @if (cartSummary().shipping === 0) {
                        <span class="font-semibold text-agri-green-600">Gratis</span>
                      } @else {
                        <span class="font-semibold">${{ cartSummary().shipping.toFixed(2) }}</span>
                      }
                    </div>
                    
                    <hr class="border-gray-200">
                    
                    <div class="flex justify-between items-center text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span class="text-agri-green-600">${{ cartSummary().total.toFixed(2) }}</span>
                    </div>
                  </div>
                  
                  <!-- Checkout Button -->
                  <button
                    (click)="proceedToCheckout()"
                    class="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 hover:shadow-lg transform hover:scale-105"
                    aria-label="Proceder al checkout">
                    <span class="material-icons text-lg">payment</span>
                    <span>Proceder al Checkout</span>
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
                <div class="mt-6 p-4 bg-agri-green-50 rounded-lg">
                  <div class="flex items-start space-x-3">
                    <span class="material-icons text-agri-green-600 mt-0.5">local_shipping</span>
                    <div class="text-sm">
                      <p class="font-semibold text-agri-green-900">Envío gratuito</p>
                      <p class="text-agri-green-700 mt-1">
                        En compras superiores a $25. Delivery en 24-48 horas en zona metropolitana.
                      </p>
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
export class CarritoComponent implements OnInit {
  
  // Router injection for navigation
  private readonly router = inject(Router);
  
  // Cart state management with signals
  protected readonly cartItems = signal<CartItem[]>([]);
  
  // Loading states
  protected readonly isLoading = signal<boolean>(false);
  protected readonly isUpdatingItem = signal<string | null>(null);
  
  // Calculated cart summary using computed signals
  protected readonly cartSummary = computed<CartSummary>(() => {
    const items = this.cartItems();
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const taxRate = 0.12; // 12% IVA Ecuador
    const tax = subtotal * taxRate;
    const shipping = subtotal >= 25 ? 0 : 3.50; // Free shipping over $25
    const total = subtotal + tax + shipping;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    
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
    this.loadCartItems();
  }

  /**
   * Load cart items (mock data for demonstration)
   * TODO: Replace with actual cart service integration
   */
  private loadCartItems(): void {
    this.isLoading.set(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock cart data with sample products
      const mockCartItems: CartItem[] = [
        {
          id: 'cart-item-1',
          product: {
            id: 'fruit-001',
            name: 'Banano Ecuatoriano Orgánico',
            description: 'Banano ecuatoriano de exportación, dulce y nutritivo, cultivado de forma orgánica sin pesticidas.',
            category: 'Frutas',
            price: { perUnit: 0.75, unit: 'lb' },
            availability: 250,
            certifications: ['ORGÁNICO', 'COMERCIO JUSTO'],
            images: ['assets/images/products/banano.jpg'],
            province: 'El Oro'
          },
          quantity: 3,
          addedAt: new Date(),
          subtotal: 2.25
        },
        {
          id: 'cart-item-2',
          product: {
            id: 'dairy-001',
            name: 'Queso de Hoja Tradicional',
            description: 'Queso fresco tradicional de la sierra norte del Ecuador, elaborado artesanalmente.',
            category: 'Lácteos',
            price: { perUnit: 3.50, unit: 'lb' },
            availability: 150,
            certifications: ['ARTESANAL', 'TRADICIONAL'],
            images: ['assets/images/products/queso-hoja.jpg'],
            province: 'Imbabura'
          },
          quantity: 2,
          addedAt: new Date(),
          subtotal: 7.00
        },
        {
          id: 'cart-item-3',
          product: {
            id: 'veg-001',
            name: 'Papa Chaucha Andina',
            description: 'Papa pequeña y cremosa de los valles andinos, perfecta para preparaciones gourmet.',
            category: 'Verduras y Hortalizas',
            price: { perUnit: 1.25, unit: 'lb' },
            availability: 400,
            certifications: ['ORGÁNICO', 'ANDINO'],
            images: ['assets/images/products/papa-chaucha.jpg'],
            province: 'Carchi'
          },
          quantity: 5,
          addedAt: new Date(),
          subtotal: 6.25
        }
      ];
      
      this.cartItems.set(mockCartItems);
      this.isLoading.set(false);
    }, 800);
  }

  /**
   * Increase quantity of a cart item
   */
  protected increaseQuantity(itemId: string): void {
    const items = this.cartItems();
    const updatedItems = items.map(item => {
      if (item.id === itemId && item.quantity < item.product.availability) {
        const newQuantity = item.quantity + 1;
        const newSubtotal = newQuantity * item.product.price.perUnit;
        return { 
          ...item, 
          quantity: newQuantity,
          subtotal: newSubtotal
        };
      }
      return item;
    });
    
    this.cartItems.set(updatedItems);
    this.animateItemUpdate(itemId);
  }

  /**
   * Decrease quantity of a cart item
   */
  protected decreaseQuantity(itemId: string): void {
    const items = this.cartItems();
    const updatedItems = items.map(item => {
      if (item.id === itemId && item.quantity > 1) {
        const newQuantity = item.quantity - 1;
        const newSubtotal = newQuantity * item.product.price.perUnit;
        return { 
          ...item, 
          quantity: newQuantity,
          subtotal: newSubtotal
        };
      }
      return item;
    });
    
    this.cartItems.set(updatedItems);
    this.animateItemUpdate(itemId);
  }

  /**
   * Remove item from cart
   */
  protected removeItem(itemId: string): void {
    const items = this.cartItems();
    const updatedItems = items.filter(item => item.id !== itemId);
    this.cartItems.set(updatedItems);
    
    // Show confirmation (could be replaced with a toast notification)
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
   * Add product to cart (helper method for external use)
   * TODO: Integrate with cart service
   */
  addProductToCart(product: Product, quantity: number = 1): void {
    const items = this.cartItems();
    const existingItem = items.find(item => item.product.id === product.id);
    
    if (existingItem) {
      // Update quantity if item already exists
      this.increaseQuantity(existingItem.id);
    } else {
      // Add new item
      const newItem: CartItem = {
        id: `cart-item-${Date.now()}`,
        product,
        quantity,
        addedAt: new Date(),
        subtotal: quantity * product.price.perUnit
      };
      
      this.cartItems.set([...items, newItem]);
    }
  }

  /**
   * Clear entire cart
   */
  protected clearCart(): void {
    this.cartItems.set([]);
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