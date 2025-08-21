import { Component, Input, inject, ChangeDetectionStrategy, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../../core/services/cart'; // Integración carrito unificado
import { RoleService } from '../../../core/services/role.service';
import type { CartState } from '../../../core/models/cart.model';

/**
 * SharedHeaderComponent - Header universal para AgriConnect
 * 
 * Componente header reutilizable diseñado para ser usado en todas las páginas
 * de la aplicación AgriConnect. Incluye navegación responsive, logo, botón
 * de carrito con contador en tiempo real.
 * 
 * Features:
 * - Standalone component (Angular 20+)
 * - OnPush change detection strategy
 * - Responsive design (mobile-first)
 * - Navegación dinámica basada en currentPage
 * - Botón de carrito destacado con badge count en tiempo real
 * - Material Icons integration
 * - Accessibility compliant
 * - Integración carrito unificado
 */
@Component({
  selector: 'app-shared-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shared-header.component.html',
  styleUrls: ['./shared-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SharedHeaderComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService); // Integración carrito unificado
  private readonly roleService = inject(RoleService);

  /**
   * Página actual para highlighting de navegación
   */
  @Input() currentPage: string = '';

  /**
   * Estado del menú móvil
   */
  protected readonly isMenuOpen = signal<boolean>(false);

  /**
   * Estado de carga de imagen del logo
   */
  protected readonly logoLoadError = signal<boolean>(false);
  protected readonly logoLoaded = signal<boolean>(false);
  protected imageLoadError = false;

  /**
   * Cart count for real-time updates
   * Subscribe to cart$ for real-time updates
   */
  protected readonly cartCount = signal<number>(0);

  /**
   * Indica si el usuario puede acceder al carrito
   */
  protected readonly canAccessCart = signal<boolean>(true);

  /**
   * Subscriptions
   */
  private cartSubscription?: Subscription;
  private roleSubscription?: Subscription;

  ngOnInit(): void {
    // Subscribe to cart$ for real-time updates
    this.cartSubscription = this.cartService.cart$.subscribe((cartState: CartState) => {
      this.cartCount.set(cartState.count);
    });

    // Subscribe to role permissions
    this.roleSubscription = this.roleService.canAccessCart().subscribe(canAccess => {
      this.canAccessCart.set(canAccess);
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.roleSubscription) {
      this.roleSubscription.unsubscribe();
    }
  }

  /**
   * Navegación a la página de inicio/marketplace
   */
  navigateToHome(): void {
    this.router.navigate(['/marketplace']);
    this.closeMenu();
  }

  /**
   * Navegación a la página de productos
   */
  navigateToProductos(): void {
    this.router.navigate(['/productos']);
    this.closeMenu();
  }

  /**
   * Navegación a la página de productores
   */
  navigateToProductores(): void {
    this.router.navigate(['/productores']);
    this.closeMenu();
  }

  /**
   * Navegación al perfil del usuario
   */
  navigateToProfile(): void {
    this.router.navigate(['/profile']);
    this.closeMenu();
  }

  /**
   * Navegación al carrito de compras
   */
  navigateToCart(): void {
    this.router.navigate(['/carrito']);
    this.closeMenu();
  }

  /**
   * Toggle del menú móvil
   */
  toggleMenu(): void {
    this.isMenuOpen.update(current => !current);
  }

  /**
   * Cerrar el menú móvil
   */
  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  /**
   * Verificar si una página está activa
   */
  isActivePage(page: string): boolean {
    return this.currentPage === page;
  }

  /**
   * Handle successful logo loading
   */
  onLogoLoad(): void {
    this.logoLoaded.set(true);
    this.logoLoadError.set(false);
  }

  /**
   * Handle logo loading errors with fallback
   */
  onLogoError(): void {
    this.logoLoadError.set(true);
    this.logoLoaded.set(false);
  }

  /**
   * Handle SVG logo loading errors gracefully
   * Falls back to agricultural-themed SVG icon
   */
  onImageError(event: Event): void {
    console.warn('AgriConnect logo failed to load, using fallback icon');
    this.imageLoadError = true;
    
    // Hide the failed image element
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
    }
  }

  /**
   * Get cart count for display
   */
  getCartCount(): number {
    return this.cartCount();
  }
}