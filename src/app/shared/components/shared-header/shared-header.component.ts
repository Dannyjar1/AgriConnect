import { Component, Input, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

/**
 * SharedHeaderComponent - Header universal para AgriConnect
 * 
 * Componente header reutilizable diseñado para ser usado en todas las páginas
 * de la aplicación AgriConnect. Incluye navegación responsive, logo, y botón
 * de carrito.
 * 
 * Features:
 * - Standalone component (Angular 20+)
 * - OnPush change detection strategy
 * - Responsive design (mobile-first)
 * - Navegación dinámica basada en currentPage
 * - Botón de carrito destacado
 * - Material Icons integration
 * - Accessibility compliant
 */
@Component({
  selector: 'app-shared-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shared-header.component.html',
  styleUrls: ['./shared-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SharedHeaderComponent {
  private readonly router = inject(Router);

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
}