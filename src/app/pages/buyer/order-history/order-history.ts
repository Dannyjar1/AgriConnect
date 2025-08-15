import { Component, signal, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService, OrderStatus } from '../../../core/services/order';
import { SharedHeaderComponent } from '../../../shared/components/shared-header/shared-header.component';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, SharedHeaderComponent],
  templateUrl: './order-history.html',
  styleUrl: './order-history.scss',
  changeDetection: ChangeDetectionStrategy.Default
})
export class OrderHistory implements OnInit {
  private readonly orderService = inject(OrderService);
  protected readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  // Signals for reactive state management
  readonly orders = signal<OrderStatus[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string>('');

  // Alternative: Traditional properties for debugging
  public ordersArray: OrderStatus[] = [];
  public loadingState: boolean = false;
  public errorMessage: string = '';

  ngOnInit(): void {
    this.loadOrders();
  }

  protected loadOrders(): void {
    console.log('🔄 OrderHistory: Loading orders...');
    
    // Set loading states
    this.isLoading.set(true);
    this.loadingState = true;
    this.error.set('');
    this.errorMessage = '';

    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        console.log('✅ OrderHistory: Orders received:', orders);
        console.log('📊 OrderHistory: Orders count:', orders.length);
        console.log('📦 OrderHistory: First order:', orders[0]);
        
        // Set both signal and traditional property
        this.orders.set(orders);
        this.ordersArray = [...orders]; // Create a new array
        
        // Verify signal update
        console.log('📊 OrderHistory: Orders signal updated, current value:', this.orders());
        console.log('📊 OrderHistory: Signal length after update:', this.orders().length);
        console.log('📊 OrderHistory: Orders array length:', this.ordersArray.length);
        
        // Stop loading
        this.isLoading.set(false);
        this.loadingState = false;
        console.log('📊 OrderHistory: Loading set to false:', this.isLoading());
        
        // Force change detection
        this.cdr.detectChanges();
        
        // Verify after change detection
        setTimeout(() => {
          console.log('📊 OrderHistory: After timeout - Orders length:', this.orders().length);
          console.log('📊 OrderHistory: After timeout - Array length:', this.ordersArray.length);
          console.log('📊 OrderHistory: After timeout - Is loading:', this.isLoading());
          console.log('📊 OrderHistory: After timeout - Error:', this.error());
          this.cdr.detectChanges();
        }, 100);
      },
      error: (error) => {
        console.error('❌ OrderHistory: Error loading orders:', error);
        this.error.set('Error al cargar el historial de compras. Por favor, intenta de nuevo.');
        this.isLoading.set(false);
      }
    });
  }

  protected getStatusBadgeClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'preparing': 'bg-orange-100 text-orange-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  protected getStatusText(status: string): string {
    const statusTexts: Record<string, string> = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmado',
      'preparing': 'Preparando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return statusTexts[status] || status;
  }

  protected viewOrderDetails(orderId: string): void {
    this.router.navigate(['/buyer/order-details'], { queryParams: { id: orderId } });
  }

  protected reorder(order: OrderStatus): void {
    // Logic to add order items back to cart
    console.log('Reordering:', order);
    // Navigate to marketplace or cart
    this.router.navigate(['/marketplace']);
  }

  protected onImageError(event: any): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/images/multifrutas.webp';
    }
  }
}
