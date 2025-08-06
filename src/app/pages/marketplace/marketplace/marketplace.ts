import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
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
    ReactiveFormsModule
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
   * Navigate to user profile page
   */
  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
