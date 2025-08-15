import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ProducerService } from '../../../core/services/producer.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { AuthService } from '../../../core/services/auth.service';
import { ActivityService, Activity } from '../../../core/services/activity.service';
import { Product, InventoryEntry } from '../../../core/models/product.model';
import { Producer } from '../../../core/models/user.model';
import { RegisterProducerModal } from '../../../shared/components/register-producer-modal/register-producer-modal';
import { RegisterProductModal } from '../../../shared/components/register-product-modal/register-product-modal';
import { InventoryEntryModal } from '../../../shared/components/inventory-entry-modal/inventory-entry-modal';
import { SeedButtonComponent } from '../../../shared/components/seed-button/seed-button.component';
import { AdminHeaderComponent } from '../../../shared/components/admin-header/admin-header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RegisterProducerModal,
    RegisterProductModal,
    InventoryEntryModal,
    SeedButtonComponent,
    AdminHeaderComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  // Services
  private productService = inject(ProductService);
  private producerService = inject(ProducerService);
  private inventoryService = inject(InventoryService);
  private authService = inject(AuthService);
  private activityService = inject(ActivityService);
  private router = inject(Router);

  // Signals for reactive data
  readonly totalProducts = signal<number>(0);
  readonly totalProducers = signal<number>(0);
  readonly totalInventoryEntries = signal<number>(0);
  readonly lowStockProducts = signal<number>(0);
  readonly expiringProducts = signal<number>(0);
  readonly recentActivities = signal<Activity[]>([]);

  // Modal states
  readonly showRegisterProducerModal = signal<boolean>(false);
  readonly showRegisterProductModal = signal<boolean>(false);
  readonly showInventoryEntryModal = signal<boolean>(false);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Cargar todos los datos del dashboard
   */
  private loadDashboardData(): void {
    // Cargar estadísticas (el guard ya verifica que sea superadmin)
    this.loadProducts();
    this.loadProducers();
    this.loadInventoryEntries();
    this.loadLowStockProducts();
    this.loadExpiringProducts();
    this.loadRecentActivities();
  }

  /**
   * Cargar productos
   */
  private loadProducts(): void {
    this.productService.getProducts().subscribe(products => {
      this.totalProducts.set(products.length);
    });
  }

  /**
   * Cargar productores
   */
  private loadProducers(): void {
    this.producerService.getActiveProducers().subscribe(producers => {
      this.totalProducers.set(producers.length);
    });
  }

  /**
   * Cargar entradas de inventario
   */
  private loadInventoryEntries(): void {
    this.inventoryService.getInventoryEntries().subscribe(entries => {
      this.totalInventoryEntries.set(entries.length);
    });
  }

  /**
   * Cargar productos con stock bajo
   */
  private loadLowStockProducts(): void {
    this.productService.getLowStockProducts(10).subscribe(products => {
      this.lowStockProducts.set(products.length);
    });
  }

  /**
   * Cargar productos próximos a vencer
   */
  private loadExpiringProducts(): void {
    this.inventoryService.getExpiringEntries(7).subscribe(entries => {
      this.expiringProducts.set(entries.length);
    });
  }

  /**
   * Cargar actividades recientes desde Firebase
   */
  private loadRecentActivities(): void {
    this.activityService.getRecentActivities(10).subscribe({
      next: (activities) => {
        this.recentActivities.set(activities);
      },
      error: (error) => {
        console.error('Error loading activities:', error);
        // Set empty array on error
        this.recentActivities.set([]);
      }
    });
  }

  /**
   * Abrir modal de registro de productor
   */
  openRegisterProducerModal(): void {
    this.showRegisterProducerModal.set(true);
  }

  /**
   * Cerrar modal de registro de productor
   */
  closeRegisterProducerModal(): void {
    this.showRegisterProducerModal.set(false);
  }

  /**
   * Manejar registro de productor
   */
  onProducerRegistered(producer: Producer): void {
    this.closeRegisterProducerModal();
    this.loadProducers(); // Recargar estadísticas
    
    // Log activity to Firebase
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.uid) {
      this.activityService.logProducerRegistration(
        producer.name, 
        producer.province || 'N/A', 
        currentUser.uid
      ).subscribe({
        next: () => {
          // Reload activities to include the new one
          this.loadRecentActivities();
        },
        error: (error) => console.error('Error logging activity:', error)
      });
    }
  }

  /**
   * Abrir modal de registro de producto
   */
  openRegisterProductModal(): void {
    this.showRegisterProductModal.set(true);
  }

  /**
   * Cerrar modal de registro de producto
   */
  closeRegisterProductModal(): void {
    this.showRegisterProductModal.set(false);
  }

  /**
   * Manejar registro de producto
   */
  onProductRegistered(product: Product): void {
    this.closeRegisterProductModal();
    this.loadProducts(); // Recargar estadísticas
    
    // Log activity to Firebase
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.uid) {
      this.activityService.logProductRegistration(
        product.name, 
        product.category, 
        currentUser.uid
      ).subscribe({
        next: () => {
          // Reload activities to include the new one
          this.loadRecentActivities();
        },
        error: (error) => console.error('Error logging activity:', error)
      });
    }
  }

  /**
   * Abrir modal de entrada de inventario
   */
  openInventoryEntryModal(): void {
    this.showInventoryEntryModal.set(true);
  }

  /**
   * Cerrar modal de entrada de inventario
   */
  closeInventoryEntryModal(): void {
    this.showInventoryEntryModal.set(false);
  }

  /**
   * Manejar registro de inventario
   */
  onInventoryRegistered(entry: InventoryEntry): void {
    this.closeInventoryEntryModal();
    this.loadInventoryEntries(); // Recargar estadísticas
    this.loadLowStockProducts(); // Actualizar stock bajo
    
    // Log activity to Firebase
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.uid) {
      this.activityService.logInventoryEntry(
        entry.productName || 'Producto', 
        entry.quantity, 
        entry.unit, 
        currentUser.uid
      ).subscribe({
        next: () => {
          // Reload activities to include the new one
          this.loadRecentActivities();
        },
        error: (error) => console.error('Error logging activity:', error)
      });
    }
  }

  /**
   * Navegar a gestión de productores
   */
  navigateToProducers(): void {
    this.router.navigate(['/admin/producers']);
  }

  /**
   * Navegar a gestión de productos
   */
  navigateToProducts(): void {
    this.router.navigate(['/admin/products']);
  }

  /**
   * Navegar a gestión de inventario
   */
  navigateToInventory(): void {
    this.router.navigate(['/admin/inventory']);
  }

  /**
   * Navegar a reportes
   */
  navigateToReports(): void {
    this.router.navigate(['/admin/reports']);
  }

  /**
   * Ver productos con stock bajo
   */
  viewLowStockProducts(): void {
    this.router.navigate(['/admin/products'], { queryParams: { filter: 'low-stock' } });
  }

  /**
   * Ver productos próximos a vencer
   */
  viewExpiringProducts(): void {
    this.router.navigate(['/admin/inventory'], { queryParams: { filter: 'expiring' } });
  }
}
