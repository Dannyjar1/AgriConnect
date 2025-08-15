import { Component, signal, computed, ChangeDetectionStrategy, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProducerService } from '../../core/services/producer.service';
import { Producer } from '../../core/models/user.model';
import { SharedHeaderComponent } from '../../shared/components/shared-header/shared-header.component';

interface CategoryStats {
  key: string;
  name: string;
  icon: string;
  count: number;
  producers?: Producer[];
}

@Component({
  selector: 'app-productores',
  standalone: true,
  imports: [CommonModule, SharedHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './productores.html',
  styleUrls: ['./productores.scss']
})
export class ProductoresComponent implements OnInit, OnDestroy {
  
  // Router injection for navigation
  private readonly router = inject(Router);
  private readonly producerService = inject(ProducerService);
  
  // Multifrutas image path for visual enhancements
  protected readonly multifrutasImagePath = 'assets/images/multifrutas.webp';
  
  // Signals for reactive data management
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string>('');
  private readonly allProducers = signal<Producer[]>([]);

  // Categorías con sus estadísticas
  protected readonly categories = signal<CategoryStats[]>([
    { key: 'Frutas', name: 'Frutas', icon: '🍎', count: 0 },
    { key: 'Lácteos', name: 'Lácteos', icon: '🥛', count: 0 },
    { key: 'Verduras y Hortalizas', name: 'Hortalizas', icon: '🥬', count: 0 },
    { key: 'Carne y Aves', name: 'Carnes', icon: '🥩', count: 0 },
    { key: 'Granos, Legumbres y Cereales', name: 'Granos y Cereales', icon: '🌾', count: 0 },
    { key: 'Hierbas, Especias y Condimentos', name: 'Productos Orgánicos', icon: '🌿', count: 0 }
  ]);

  // Filtro de categoría seleccionada
  protected readonly selectedCategory = signal<string>('');

  // Productores filtrados por categoría
  protected readonly filteredProducers = computed(() => {
    const selected = this.selectedCategory();
    if (!selected) return this.allProducers();
    
    return this.allProducers().filter(producer => 
      producer.certifications?.some(cert => cert.toLowerCase().includes(selected.toLowerCase())) ||
      selected === 'todos'
    );
  });

  // Productores organizados por categoría
  protected readonly producersByCategory = computed(() => {
    const producers = this.allProducers();
    const categoriesWithData = this.categories().map(cat => {
      const categoryProducers = producers.filter(p => 
        p.certifications?.some(cert => cert.toLowerCase().includes(cat.key.toLowerCase()))
      );
      return {
        ...cat,
        count: categoryProducers.length,
        producers: categoryProducers
      };
    });
    
    this.categories.set(categoriesWithData);
    
    return categoriesWithData;
  });

  // Estado para las cards volteadas
  private readonly flippedCards = signal<Set<string>>(new Set());
  
  // Estado para timers activos
  private readonly activeTimers = signal<Set<string>>(new Set());

  // Estadísticas totales
  protected readonly totalProducers = computed(() => this.allProducers().length);
  protected readonly activeProducers = computed(() => 
    this.allProducers().filter(p => p.isActive).length
  );

  ngOnInit(): void {
    this.loadProducersFromFirebase();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private loadProducersFromFirebase(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.producerService.getActiveProducers().subscribe({
      next: (producers) => {
        this.allProducers.set(producers);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading producers from Firebase:', error);
        this.error.set('Error al cargar los productores. Por favor, intenta de nuevo.');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Navigate to producer profile page
   */
  protected navigateToProducer(producerId: string): void {
    this.router.navigate(['/productor', producerId]);
  }

  /**
   * Filter producers by category
   */
  protected onCategorySelect(categoryKey: string): void {
    const currentSelected = this.selectedCategory();
    // Toggle category selection
    this.selectedCategory.set(currentSelected === categoryKey ? '' : categoryKey);
  }

  /**
   * Reset category filter
   */
  protected resetFilter(): void {
    this.selectedCategory.set('');
  }

  /**
   * Handle image loading errors
   */
  protected onImageError(event: any): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      // Fallback to a default producer image or hide the image
      img.style.display = 'none';
      const parent = img.parentElement;
      if (parent) {
        parent.innerHTML = '<div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center"><span class="text-gray-400 text-2xl">👤</span></div>';
      }
    }
  }

  /**
   * Get category display name
   */
  protected getCategoryDisplayName(categoryKey: string): string {
    const category = this.categories().find(cat => cat.key === categoryKey);
    return category ? category.name : categoryKey;
  }

  /**
   * Get category icon
   */
  protected getCategoryIcon(categoryKey: string): string {
    const category = this.categories().find(cat => cat.key === categoryKey);
    return category ? category.icon : '📦';
  }

  /**
   * Set category filter
   */
  setCategory(categoryKey: string): void {
    this.selectedCategory.set(categoryKey);
  }

  /**
   * Toggle card flip state
   */
  toggleCard(producerId: string): void {
    const currentFlipped = this.flippedCards();
    const newFlipped = new Set(currentFlipped);
    
    if (newFlipped.has(producerId)) {
      newFlipped.delete(producerId);
    } else {
      newFlipped.add(producerId);
    }
    
    this.flippedCards.set(newFlipped);
  }

  /**
   * Check if card is flipped
   */
  isCardFlipped(producerId: string): boolean {
    return this.flippedCards().has(producerId);
  }

  /**
   * Get card aria label for accessibility
   */
  getCardAriaLabel(producer: Producer): string {
    return `Información del productor ${this.getDisplayName(producer)}. ${this.isCardFlipped(producer.id) ? 'Mostrando detalles' : 'Mostrando información básica'}`;
  }

  /**
   * Get front card style
   */
  getFrontCardStyle(): any {
    return {
      'background': 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
    };
  }

  /**
   * Get back card style
   */
  getBackCardStyle(): any {
    return {
      'background': 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
    };
  }

  /**
   * Get display name for producer
   */
  getDisplayName(producer: Producer): string {
    return producer.name || producer.displayName || 'Productor';
  }

  /**
   * Get producer type label
   */
  getProducerTypeLabel(type: string | undefined): string {
    if (!type) return 'Productor';
    
    const typeLabels: { [key: string]: string } = {
      'individual': 'Productor Individual',
      'cooperative': 'Cooperativa',
      'company': 'Empresa',
      'association': 'Asociación'
    };
    return typeLabels[type] || type;
  }

  /**
   * Check if producer has active timer
   */
  hasActiveTimer(producerId: string): boolean {
    return this.activeTimers().has(producerId);
  }

  /**
   * Update categories with producers
   */
  private updateCategoriesWithProducers(): void {
    const producers = this.allProducers();
    const updatedCategories = this.categories().map(category => ({
      ...category,
      producers: producers.filter(producer => 
        producer.certifications?.some(cert => 
          cert.toLowerCase().includes(category.key.toLowerCase())
        )
      )
    }));
    
    // Note: categories signal already updated in computed, this is for template compatibility
  }
}