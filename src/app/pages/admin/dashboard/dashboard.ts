import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ProducerService } from '../../../core/services/producer.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product, InventoryEntry } from '../../../core/models/product.model';
import { Producer } from '../../../core/models/user.model';
import { RegisterProducerModal } from '../../../shared/components/register-producer-modal/register-producer-modal';
import { RegisterProductModal } from '../../../shared/components/register-product-modal/register-product-modal';
import { InventoryEntryModal } from '../../../shared/components/inventory-entry-modal/inventory-entry-modal';

interface Activity {
  id: string;
  type: 'producer' | 'product' | 'inventory' | 'order';
  icon: string;
  description: string;
  timestamp: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RegisterProducerModal,
    RegisterProductModal,
    InventoryEntryModal
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
   * Cargar actividades recientes
   */
  private loadRecentActivities(): void {
    // Simulación de actividades recientes
    // En una implementación real, esto vendría de un servicio de auditoría
    const activities: Activity[] = [
      {
        id: '1',
        type: 'inventory',
        icon: 'fas fa-truck',
        description: 'Nueva entrega de Banano Premium registrada - 50 kg',
        timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutos atrás
      },
      {
        id: '2',
        type: 'producer',
        icon: 'fas fa-user-plus',
        description: 'Nuevo productor registrado: Juan Pérez - Loja',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 horas atrás
      },
      {
        id: '3',
        type: 'product',
        icon: 'fas fa-plus-circle',
        description: 'Nuevo producto registrado: Quinua Orgánica',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4 horas atrás
      },
      {
        id: '4',
        type: 'inventory',
        icon: 'fas fa-truck',
        description: 'Entrega de Mango Tommy registrada - 25 kg',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6) // 6 horas atrás
      }
    ];

    this.recentActivities.set(activities);
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
    
    // Agregar actividad reciente
    const newActivity: Activity = {
      id: Date.now().toString(),
      type: 'producer',
      icon: 'fas fa-user-plus',
      description: `Nuevo productor registrado: ${producer.name} - ${producer.province}`,
      timestamp: new Date()
    };
    
    const currentActivities = this.recentActivities();
    this.recentActivities.set([newActivity, ...currentActivities.slice(0, 9)]);
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
    
    // Agregar actividad reciente
    const newActivity: Activity = {
      id: Date.now().toString(),
      type: 'product',
      icon: 'fas fa-plus-circle',
      description: `Nuevo producto registrado: ${product.name}`,
      timestamp: new Date()
    };
    
    const currentActivities = this.recentActivities();
    this.recentActivities.set([newActivity, ...currentActivities.slice(0, 9)]);
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
    
    // Agregar actividad reciente
    const newActivity: Activity = {
      id: Date.now().toString(),
      type: 'inventory',
      icon: 'fas fa-truck',
      description: `Nueva entrega registrada - ${entry.quantity} ${entry.unit}`,
      timestamp: new Date()
    };
    
    const currentActivities = this.recentActivities();
    this.recentActivities.set([newActivity, ...currentActivities.slice(0, 9)]);
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
