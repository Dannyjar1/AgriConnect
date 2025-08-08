import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { SharedHeaderComponent } from '../../../shared/components/shared-header/shared-header.component';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface SearchForm {
  productType: string;
  quantity: string;
  features: string;
  certifications: string;
  location: string;
  category: string;
  searchTerm: string;
  customNeed: string;
}

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedHeaderComponent
  ],
  templateUrl: './marketplace.html',
  styleUrls: ['./marketplace.scss']
})
export class Marketplace implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  // Señales reactivas
  readonly allProducts = signal<Product[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly selectedCategory = signal<string>('');

  // Productos ecuatorianos organizados por categorías
  readonly productsByCategory = signal<Array<{category: string, products: Product[]}>>([]);

  // Formulario reactivo
  readonly searchForm: FormGroup<any> = this.fb.group({
    productType: [''],
    quantity: [''],
    features: [''],
    certifications: [''],
    location: [''],
    category: [''],
    searchTerm: [''],
    customNeed: ['']
  });

  // Observable para productos filtrados
  readonly filteredProducts$: Observable<Product[]>;

  // Categorías disponibles - Adaptadas al contexto ecuatoriano
  readonly categories = computed(() => {
    const products = this.allProducts();
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return ['Todas', ...uniqueCategories];
  });

  constructor() {
    // Configurar filtros reactivos
    this.filteredProducts$ = combineLatest([
      this.productService.getProducts(),
      this.searchForm.valueChanges.pipe(
        startWith(this.searchForm.value),
        debounceTime(300),
        distinctUntilChanged()
      )
    ]).pipe(
      map(([products, filters]) => this.filterProducts(products, filters))
    );
  }

  ngOnInit(): void {
    this.loadProducts();
    // this.loadEcuadorianProducts(); // Sección eliminada - Solo productos principales
  }

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

  private filterProducts(products: Product[], filters: Partial<SearchForm>): Product[] {
    if (!products || !filters) return products;

    return products.filter(product => {
      // Filtro por término de búsqueda
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      // Filtro por tipo de producto
      if (filters.productType) {
        const productType = filters.productType.toLowerCase();
        if (!product.name.toLowerCase().includes(productType)) return false;
      }

      // Filtro por categoría
      if (filters.category && filters.category !== 'Todas') {
        if (product.category !== filters.category) return false;
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

  onCategorySelect(category: string): void {
    this.selectedCategory.set(category);
    this.searchForm.patchValue({ category });
  }

  onSubmitNeeds(): void {
    const formValue = this.searchForm.value;
    console.log('Búsqueda de necesidades:', formValue);
    
    // Aquí se implementaría la lógica del algoritmo de asignación equitativa
    // Por ahora, solo aplicamos los filtros existentes
  }

  onClearFilters(): void {
    this.searchForm.reset();
    this.selectedCategory.set('');
  }


  /**
   * Load Ecuadorian products organized by categories
   */
  private loadEcuadorianProducts(): void {
    const ecuadorianProducts: Array<{category: string, products: Product[]}> = [
      {
        category: 'Frutas',
        products: [
          {
            id: 'fruit-01',
            name: 'Banano',
            description: 'Banano ecuatoriano de exportación, dulce y nutritivo',
            category: 'Frutas',
            price: { perUnit: 0.75, unit: 'lb' },
            availability: 250,
            certifications: ['ORGÁNICO'],
            images: ['/assets/images/products/banano.jpg'],
            province: 'El Oro'
          },
          {
            id: 'fruit-02',
            name: 'Cacao Nacional',
            description: 'Cacao fino de aroma, reconocido mundialmente por su calidad',
            category: 'Frutas',
            price: { perUnit: 12.50, unit: 'kg' },
            availability: 180,
            certifications: ['ORGÁNICO', 'COMERCIO JUSTO'],
            images: ['/assets/images/products/cacao.jpg'],
            province: 'Manabí'
          }
        ]
      },
      {
        category: 'Verduras',
        products: [
          {
            id: 'veg-01',
            name: 'Brócoli Andino',
            description: 'Brócoli cultivado en los valles andinos, rico en nutrientes',
            category: 'Verduras',
            price: { perUnit: 1.25, unit: 'unidad' },
            availability: 120,
            certifications: ['NATURAL'],
            images: ['/assets/images/products/brocoli.jpg'],
            province: 'Pichincha'
          },
          {
            id: 'veg-02',
            name: 'Quinoa Orgánica',
            description: 'Quinoa de altura, superfood ancestral ecuatoriano',
            category: 'Verduras',
            price: { perUnit: 8.90, unit: 'lb' },
            availability: 95,
            certifications: ['ORGÁNICO', 'ANCESTRAL'],
            images: ['/assets/images/products/quinoa.jpg'],
            province: 'Chimborazo'
          }
        ]
      },
      {
        category: 'Mariscos',
        products: [
          {
            id: 'sea-01',
            name: 'Camarón Ecuatoriano',
            description: 'Camarón fresco de las piscinas ecuatorianas, sabor inigualable',
            category: 'Mariscos',
            price: { perUnit: 15.75, unit: 'lb' },
            availability: 60,
            certifications: ['FRESCO', 'SUSTENTABLE'],
            images: ['/assets/images/products/camaron.jpg'],
            province: 'Guayas'
          }
        ]
      }
    ];
    this.productsByCategory.set(ecuadorianProducts);
  }

  /**
   * Método para cargar productos por categoría desde API (listo para implementar)
   */
  loadProductsByCategoryFromAPI(): void {
    // TODO: Implementar llamada a API para obtener productos por categoría
    // this.http.get<Array<{category: string, products: Product[]}>>('/api/products/by-category')
    //   .subscribe(data => {
    //     this.productsByCategory.set(data);
    //   });
  }
}
