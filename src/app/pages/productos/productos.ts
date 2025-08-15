import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart';
import { ProductService } from '../../core/services/product.service';
import { SharedHeaderComponent } from '../../shared/components/shared-header/shared-header.component';

interface ProductsByCategory {
  category: string;
  products: Product[];
}

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedHeaderComponent],
  templateUrl: './productos.html',
  styleUrls: ['./productos.scss']
})
export class Productos implements OnInit {
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  private readonly productService = inject(ProductService);

  // Señales reactivas
  readonly isLoading = signal<boolean>(false);
  readonly selectedCategory = signal<string>('');
  readonly error = signal<string>('');

  // Nueva señal para la imagen de multifrutas
  readonly multifruitImage = signal<string>('assets/images/multifrutas.webp');

  // Productos organizados por categorías - Datos completos
  readonly productsByCategory = signal<ProductsByCategory[]>([]);

  // Productos totales para filtros
  readonly allProducts = computed(() => {
    return this.productsByCategory()
      .flatMap(category => category.products);
  });

  // Categorías disponibles
  readonly categories = computed(() => {
    return this.productsByCategory().map(cat => cat.category);
  });

  // Computed para determinar si una categoría es de frutas para mostrar la imagen decorativa
  readonly isFruitCategory = computed(() => (categoryName: string) => {
    return categoryName.toLowerCase().includes('fruta') ||
      categoryName.toLowerCase().includes('fruit');
  });

  ngOnInit(): void {
    this.loadProductsFromFirebase();
  }

  private loadProductsFromFirebase(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.productService.getActiveProducts().subscribe({
      next: (products: Product[]) => {
        this.organizeProductsByCategory(products);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading products from Firebase:', error);
        this.error.set('Error al cargar los productos. Por favor, intenta de nuevo.');
        this.isLoading.set(false);
      }
    });
  }

  private organizeProductsByCategory(products: Product[]): void {
    // Group products by category
    const categoriesMap = new Map<string, Product[]>();
    
    products.forEach(product => {
      const category = product.category;
      if (!categoriesMap.has(category)) {
        categoriesMap.set(category, []);
      }
      categoriesMap.get(category)!.push(product);
    });

    // Convert to the expected format
    const productsByCategory: ProductsByCategory[] = Array.from(categoriesMap.entries()).map(([category, products]) => ({
      category,
      products
    }));

    this.productsByCategory.set(productsByCategory);
  }

  /**
   * Navigate to product detail page
   */
  navigateToProduct(productId: string): void {
    this.router.navigate(['/producto', productId]);
  }

  /**
   * Navigate to producer profile
   */
  navigateToProducer(producerId: string): void {
    this.router.navigate(['/productor', producerId]);
  }

  /**
   * Filter products by category
   */
  onCategorySelect(category: string): void {
    this.selectedCategory.set(category);
  }

  /**
   * Add product to cart using CartService
   * Integración carrito unificado + fallback de imagen
   */
  addToCart(product: Product): void {
    // Conectar "Agregar" buttons al CartService.add(product)
    this.cartService.add(product, 1);
    console.log('Producto agregado al carrito:', product.name);

    // Opcional: Mostrar feedback visual (toast, notification, etc.)
    // Para este ejemplo, usamos console.log
  }

  /**
   * Handle image loading errors
   * Integración carrito unificado + fallback de imagen
   */
  onImageError(event: any): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      // Si no hay imagen válida, usar multifrutas.webp como fallback
      if (!img.src.includes('multifrutas.webp')) {
        img.src = 'assets/images/multifrutas.webp';
        img.className = 'w-full h-40 object-cover rounded-lg'; // Aplicar clase específica
      } else {
        // Si multifrutas.webp también falla, mostrar icono
        img.style.display = 'none';
        const parent = img.parentElement;
        if (parent) {
          parent.innerHTML = '<div class="w-full h-40 flex items-center justify-center bg-gray-100 rounded-lg"><span class="material-icons text-gray-400 text-2xl">image</span></div>';
        }
      }
    }
  }

  /**
   * Get background image style for multifruit decorative elements
   */
  getMultifruitBackgroundStyle(opacity: number = 0.1): string {
    return `background-image: url('${this.multifruitImage()}'); opacity: ${opacity}; background-size: cover; background-position: center; background-repeat: no-repeat;`;
  }

  /**
   * Check if product is in cart
   */
  isInCart(productId: string): boolean {
    return this.cartService.isInCart(productId);
  }

  /**
   * Get product quantity in cart
   */
  getProductCartQuantity(productId: string): number {
    return this.cartService.getProductQuantity(productId);
  }
}