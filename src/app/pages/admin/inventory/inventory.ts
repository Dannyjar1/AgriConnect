import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { InventoryService } from '../../../core/services/inventory.service';
import { ProductService } from '../../../core/services/product.service';
import { ProducerService } from '../../../core/services/producer.service';
import { InventoryEntry } from '../../../core/models/product.model';
import { Product } from '../../../core/models/product.model';
import { Producer } from '../../../core/models/user.model';
import { InventoryEntryModal } from '../../../shared/components/inventory-entry-modal/inventory-entry-modal';
import { AdminHeaderComponent } from '../../../shared/components/admin-header/admin-header.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InventoryEntryModal, AdminHeaderComponent],
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss'
})
export class Inventory implements OnInit {
  private inventoryService = inject(InventoryService);
  private productService = inject(ProductService);
  private producerService = inject(ProducerService);

  // Signals para el estado
  readonly inventoryEntries = signal<InventoryEntry[]>([]);
  readonly products = signal<Product[]>([]);
  readonly producers = signal<Producer[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly showModal = signal<boolean>(false);
  readonly searchTerm = signal<string>('');

  // Filtros
  readonly statusOptions = [
    { value: 'all', label: 'Todas las entradas' },
    { value: 'fresh', label: 'Productos frescos' },
    { value: 'expiring', label: 'Próximos a vencer' },
    { value: 'expired', label: 'Vencidos' }
  ];

  readonly selectedStatus = signal<string>('all');

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Cargar datos iniciales
   */
  private async loadData(): Promise<void> {
    await Promise.all([
      this.loadInventoryEntries(),
      this.loadProducts(),
      this.loadProducers()
    ]);
  }

  /**
   * Cargar entradas de inventario
   */
  private async loadInventoryEntries(): Promise<void> {
    this.isLoading.set(true);
    try {
      const entries$ = this.inventoryService.getInventoryEntries();
      const entries = await entries$.toPromise();
      this.inventoryEntries.set(entries || []);
    } catch (error) {
      console.error('Error cargando inventario:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Cargar productos
   */
  private async loadProducts(): Promise<void> {
    try {
      const products$ = this.productService.getProducts();
      const products = await products$.toPromise();
      this.products.set(products || []);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  }

  /**
   * Cargar productores
   */
  private async loadProducers(): Promise<void> {
    try {
      const producers$ = this.producerService.getProducers();
      const producers = await producers$.toPromise();
      this.producers.set(producers || []);
    } catch (error) {
      console.error('Error cargando productores:', error);
    }
  }

  /**
   * Entradas filtradas
   */
  get filteredEntries(): InventoryEntry[] {
    let filtered = this.inventoryEntries();

    // Filtrar por estado
    if (this.selectedStatus() !== 'all') {
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));

      filtered = filtered.filter(entry => {
        switch (this.selectedStatus()) {
          case 'fresh':
            return entry.expirationDate ? new Date(entry.expirationDate.toDate()) > threeDaysFromNow : true;
          case 'expiring':
            const expDate = entry.expirationDate ? new Date(entry.expirationDate.toDate()) : null;
            return expDate ? (expDate <= threeDaysFromNow && expDate > now) : false;
          case 'expired':
            return entry.expirationDate ? new Date(entry.expirationDate.toDate()) <= now : false;
          default:
            return true;
        }
      });
    }

    // Filtrar por término de búsqueda
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(entry => {
        const product = this.getProduct(entry.productId);
        const producer = this.getProducer(entry.producerId);
        return product?.name.toLowerCase().includes(search) ||
          producer?.name.toLowerCase().includes(search);
      });
    }

    return filtered.sort((a, b) => {
      const aDate = a.registeredAt?.toDate ? a.registeredAt.toDate() : new Date(a.registeredAt);
      const bDate = b.registeredAt?.toDate ? b.registeredAt.toDate() : new Date(b.registeredAt);
      return bDate.getTime() - aDate.getTime();
    });
  }

  /**
   * Abrir modal para nueva entrada
   */
  openCreateModal(): void {
    this.showModal.set(true);
  }

  /**
   * Cerrar modal
   */
  closeModal(): void {
    this.showModal.set(false);
  }

  /**
   * Manejar registro de entrada de inventario
   */
  async onInventoryRegistered(entry: InventoryEntry): Promise<void> {
    this.closeModal();
    await this.loadInventoryEntries();
  }

  /**
   * Obtener producto por ID
   */
  getProduct(productId: string): Product | undefined {
    return this.products().find(p => p.id === productId);
  }

  /**
   * Obtener productor por ID
   */
  getProducer(producerId: string): Producer | undefined {
    return this.producers().find(p => p.id === producerId);
  }

  /**
   * Obtener estado de la entrada con mejor contraste y accesibilidad
   */
  getEntryStatus(entry: InventoryEntry): { label: string; class: string; icon: string } {
    if (!entry.expirationDate) {
      return {
        label: 'Sin fecha',
        class: 'bg-gray-100 text-gray-800 border border-gray-200',
        icon: 'fas fa-question-circle'
      };
    }

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    const expDate = new Date(entry.expirationDate.toDate());

    if (expDate <= now) {
      return {
        label: 'Vencido',
        class: 'bg-red-50 text-red-800 border border-red-200',
        icon: 'fas fa-times-circle'
      };
    } else if (expDate <= threeDaysFromNow) {
      return {
        label: 'Próximo a vencer',
        class: 'bg-amber-50 text-amber-800 border border-amber-200',
        icon: 'fas fa-clock'
      };
    } else {
      return {
        label: 'Fresco',
        class: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
        icon: 'fas fa-leaf'
      };
    }
  }

  /**
   * Actualizar filtro de estado
   */
  updateStatusFilter(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedStatus.set(target.value);
  }

  /**
   * Actualizar término de búsqueda
   */
  updateSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  /**
   * Formatear fecha con mejor legibilidad
   */
  formatDate(date: any): string {
    if (!date) return 'N/A';
    
    const d = date.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(d);
  }

  /**
   * Formatear precio
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  /**
   * Obtener días hasta vencimiento
   */
  getDaysUntilExpiry(expirationDate: any): number {
    if (!expirationDate) return 0;
    const now = new Date();
    const expDate = expirationDate.toDate ? expirationDate.toDate() : new Date(expirationDate);
    const diffTime = expDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Obtener estadísticas mejoradas
   */
  get totalEntries(): number {
    return this.inventoryEntries().length;
  }

  get freshEntries(): number {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    return this.inventoryEntries().filter(entry => {
      if (!entry.expirationDate) return true;
      const expDate = entry.expirationDate.toDate ? entry.expirationDate.toDate() : new Date(entry.expirationDate);
      return expDate > threeDaysFromNow;
    }).length;
  }

  get expiringEntries(): number {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    return this.inventoryEntries().filter(entry => {
      if (!entry.expirationDate) return false;
      const expDate = entry.expirationDate.toDate ? entry.expirationDate.toDate() : new Date(entry.expirationDate);
      return expDate <= threeDaysFromNow && expDate > now;
    }).length;
  }

  get expiredEntries(): number {
    const now = new Date();
    return this.inventoryEntries().filter(entry => {
      if (!entry.expirationDate) return false;
      const expDate = entry.expirationDate.toDate ? entry.expirationDate.toDate() : new Date(entry.expirationDate);
      return expDate <= now;
    }).length;
  }

  get totalValue(): number {
    return this.inventoryEntries().reduce((sum, entry) =>
      sum + (entry.quantity * entry.pricePerUnit), 0
    );
  }
}