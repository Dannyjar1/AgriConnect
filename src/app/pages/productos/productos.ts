import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface ProductFilter {
  category: string;
  searchTerm: string;
  minPrice: number | null;
  maxPrice: number | null;
  certifications: string;
}

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './productos.html',
  styleUrls: ['./productos.scss']
})
export class Productos implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  // Señales reactivas para el estado del componente
  protected readonly allProducts = signal<Product[]>([]);
  protected readonly isLoading = signal<boolean>(false);
  protected readonly selectedCategory = signal<string>('Todas');
  protected readonly viewMode = signal<'grid' | 'list'>('grid');

  // Productos organizados por categorías
  protected readonly productsByCategory = computed(() => {
    const products = this.allProducts();
    const categoriesMap = new Map<string, Product[]>();
    
    products.forEach(product => {
      const category = product.category;
      if (!categoriesMap.has(category)) {
        categoriesMap.set(category, []);
      }
      categoriesMap.get(category)!.push(product);
    });

    return Array.from(categoriesMap.entries()).map(([category, products]) => ({
      category,
      products,
      count: products.length
    }));
  });

  // Categorías únicas disponibles
  protected readonly categories = computed(() => {
    const products = this.allProducts();
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return ['Todas', ...uniqueCategories.sort()];
  });

  // Productos filtrados
  protected readonly filteredProducts = computed(() => {
    const products = this.allProducts();
    const selectedCategory = this.selectedCategory();
    const filters = this.filterForm.value;

    return this.applyFilters(products, selectedCategory, filters);
  });

  // Estadísticas computadas
  protected readonly stats = computed(() => {
    const products = this.filteredProducts();
    const totalProducts = products.length;
    const totalAvailability = products.reduce((sum, p) => sum + p.availability, 0);
    const avgPrice = products.length > 0 
      ? products.reduce((sum, p) => sum + p.price.perUnit, 0) / products.length 
      : 0;

    return {
      totalProducts,
      totalAvailability,
      avgPrice: Math.round(avgPrice * 100) / 100,
      categoriesCount: this.productsByCategory().length
    };
  });

  // Formulario reactivo para filtros
  protected readonly filterForm: FormGroup = this.fb.group({
    category: ['Todas'],
    searchTerm: [''],
    minPrice: [null],
    maxPrice: [null],
    certifications: ['']
  });

  // Observable para productos filtrados en tiempo real
  protected readonly filteredProducts$: Observable<Product[]>;

  constructor() {
    // Configurar filtros reactivos con observables
    this.filteredProducts$ = combineLatest([
      this.productService.getProducts(),
      this.filterForm.valueChanges.pipe(
        startWith(this.filterForm.value),
        debounceTime(300),
        distinctUntilChanged()
      )
    ]).pipe(
      map(([products, filters]) => {
        const category = filters.category || 'Todas';
        return this.applyFilters(products, category, filters);
      })
    );
  }

  ngOnInit(): void {
    this.loadProducts();
    this.setupFormSubscriptions();
  }

  /**
   * Carga todos los productos disponibles
   */
  private loadProducts(): void {
    this.isLoading.set(true);
    
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.allProducts.set(products);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando productos:', error);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Configura las subscripciones del formulario
   */
  private setupFormSubscriptions(): void {
    // Sincronizar el filtro de categoría con la señal
    this.filterForm.get('category')?.valueChanges.subscribe(category => {
      if (category) {
        this.selectedCategory.set(category);
      }
    });
  }

  /**
   * Aplica los filtros a la lista de productos
   */
  private applyFilters(products: Product[], category: string, filters: Partial<ProductFilter>): Product[] {
    if (!products) return [];

    return products.filter(product => {
      // Filtro por categoría
      if (category && category !== 'Todas') {
        if (product.category !== category) return false;
      }

      // Filtro por término de búsqueda
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      // Filtro por rango de precios
      if (filters.minPrice !== null && product.price.perUnit < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== null && product.price.perUnit > filters.maxPrice) {
        return false;
      }

      // Filtro por certificaciones
      if (filters.certifications) {
        const certSearch = filters.certifications.toLowerCase();
        const hasCertification = product.certifications.some(cert => 
          cert.toLowerCase().includes(certSearch)
        );
        if (!hasCertification) return false;
      }

      return true;
    });
  }

  /**
   * Selecciona una categoría específica
   */
  protected onCategorySelect(category: string): void {
    this.selectedCategory.set(category);
    this.filterForm.patchValue({ category });
  }

  /**
   * Cambia el modo de visualización (grid/list)
   */
  protected onViewModeChange(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  /**
   * Limpia todos los filtros aplicados
   */
  protected onClearFilters(): void {
    this.filterForm.reset({
      category: 'Todas',
      searchTerm: '',
      minPrice: null,
      maxPrice: null,
      certifications: ''
    });
    this.selectedCategory.set('Todas');
  }

  /**
   * Navega a los detalles de un producto específico
   */
  protected onProductClick(productId: string): void {
    this.router.navigate(['/producto', productId]);
  }

  /**
   * Navega al perfil del productor
   */
  protected onProducerClick(producerId: string): void {
    if (producerId) {
      this.router.navigate(['/productor', producerId]);
    }
  }

  /**
   * Agrega un producto al carrito (funcionalidad futura)
   */
  protected onAddToCart(product: Product): void {
    console.log('Agregando al carrito:', product.name);
    // TODO: Implementar lógica del carrito de compras
  }

  /**
   * Método para trackBy en *ngFor para optimizar rendimiento
   */
  protected trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  /**
   * Método para trackBy en categorías
   */
  protected trackByCategoryName(index: number, item: { category: string; products: Product[] }): string {
    return item.category;
  }
}