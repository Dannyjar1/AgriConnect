import { Component, inject, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          
          <!-- Logo y título -->
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <i class="fas fa-leaf text-white text-lg"></i>
              </div>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">AgriConnect</h1>
              <p class="text-xs text-gray-500">Panel de Administración</p>
            </div>
          </div>

          <!-- Navegación central -->
          <nav class="hidden md:flex space-x-1">
            <button 
              (click)="navigateTo('/admin/dashboard')"
              [class]="currentRoute() === '/admin/dashboard' ? 
                'bg-emerald-100 text-emerald-700 px-3 py-2 rounded-md text-sm font-medium transition-colors' :
                'text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors'">
              <i class="fas fa-chart-line mr-2"></i>Dashboard
            </button>
            <button 
              (click)="navigateTo('/admin/producers')"
              [class]="currentRoute() === '/admin/producers' ? 
                'bg-emerald-100 text-emerald-700 px-3 py-2 rounded-md text-sm font-medium transition-colors' :
                'text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors'">
              <i class="fas fa-users mr-2"></i>Productores
            </button>
            <button 
              (click)="navigateTo('/admin/products')"
              [class]="currentRoute() === '/admin/products' ? 
                'bg-emerald-100 text-emerald-700 px-3 py-2 rounded-md text-sm font-medium transition-colors' :
                'text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors'">
              <i class="fas fa-box mr-2"></i>Productos
            </button>
            <button 
              (click)="navigateTo('/admin/inventory')"
              [class]="currentRoute() === '/admin/inventory' ? 
                'bg-emerald-100 text-emerald-700 px-3 py-2 rounded-md text-sm font-medium transition-colors' :
                'text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors'">
              <i class="fas fa-warehouse mr-2"></i>Inventario
            </button>
          </nav>

          <!-- Usuario y logout -->
          <div class="flex items-center space-x-4">
            <!-- Notificaciones -->
            <button class="text-gray-600 hover:text-gray-900 relative">
              <i class="fas fa-bell text-lg"></i>
              <span class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            <!-- Dropdown del usuario -->
            <div class="relative">
              <button 
                (click)="toggleUserMenu()"
                class="flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-lg p-2 transition-colors">
                
                <!-- Avatar -->
                <div class="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  @if (currentUser()?.photoURL) {
                    <img [src]="currentUser()?.photoURL" [alt]="currentUser()?.displayName || 'Admin'" class="w-8 h-8 rounded-full">
                  } @else {
                    <span class="text-white text-sm font-medium">
                      {{ getInitials(currentUser()?.displayName || currentUser()?.email || 'A') }}
                    </span>
                  }
                </div>

                <!-- Info del usuario -->
                <div class="hidden sm:block text-left">
                  <p class="text-sm font-medium">{{ getDisplayName() }}</p>
                  <p class="text-xs text-gray-500">Administrador</p>
                </div>

                <!-- Icono dropdown -->
                <i [class]="isUserMenuOpen() ? 'fas fa-chevron-up text-gray-400' : 'fas fa-chevron-down text-gray-400'"></i>
              </button>

              <!-- Dropdown menu -->
              @if (isUserMenuOpen()) {
                <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div class="px-4 py-2 border-b border-gray-100">
                    <p class="text-sm font-medium text-gray-900">{{ getDisplayName() }}</p>
                    <p class="text-xs text-gray-500">{{ currentUser()?.email }}</p>
                  </div>
                  
                  <button 
                    (click)="navigateTo('/admin/profile')"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors">
                    <i class="fas fa-user text-gray-400"></i>
                    <span>Mi Perfil</span>
                  </button>
                  
                  <button 
                    (click)="navigateTo('/admin/settings')"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors">
                    <i class="fas fa-cog text-gray-400"></i>
                    <span>Configuración</span>
                  </button>
                  
                  <div class="border-t border-gray-100 mt-1 pt-1">
                    <button 
                      (click)="logout()"
                      class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors">
                      <i class="fas fa-sign-out-alt text-red-500"></i>
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              }
            </div>

            <!-- Botón menú móvil -->
            <button 
              (click)="toggleMobileMenu()"
              class="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg p-2">
              <i class="fas fa-bars text-lg"></i>
            </button>
          </div>
        </div>

        <!-- Menú móvil -->
        @if (isMobileMenuOpen()) {
          <div class="md:hidden border-t border-gray-200 py-2">
            <nav class="space-y-1">
              <button 
                (click)="navigateTo('/admin/dashboard')"
                [class]="currentRoute() === '/admin/dashboard' ? 
                  'bg-emerald-100 text-emerald-700 block px-3 py-2 text-sm font-medium w-full text-left rounded-md' :
                  'text-gray-600 hover:text-gray-900 hover:bg-gray-100 block px-3 py-2 text-sm font-medium w-full text-left rounded-md'">
                <i class="fas fa-chart-line mr-2"></i>Dashboard
              </button>
              <button 
                (click)="navigateTo('/admin/producers')"
                [class]="currentRoute() === '/admin/producers' ? 
                  'bg-emerald-100 text-emerald-700 block px-3 py-2 text-sm font-medium w-full text-left rounded-md' :
                  'text-gray-600 hover:text-gray-900 hover:bg-gray-100 block px-3 py-2 text-sm font-medium w-full text-left rounded-md'">
                <i class="fas fa-users mr-2"></i>Productores
              </button>
              <button 
                (click)="navigateTo('/admin/products')"
                [class]="currentRoute() === '/admin/products' ? 
                  'bg-emerald-100 text-emerald-700 block px-3 py-2 text-sm font-medium w-full text-left rounded-md' :
                  'text-gray-600 hover:text-gray-900 hover:bg-gray-100 block px-3 py-2 text-sm font-medium w-full text-left rounded-md'">
                <i class="fas fa-box mr-2"></i>Productos
              </button>
              <button 
                (click)="navigateTo('/admin/inventory')"
                [class]="currentRoute() === '/admin/inventory' ? 
                  'bg-emerald-100 text-emerald-700 block px-3 py-2 text-sm font-medium w-full text-left rounded-md' :
                  'text-gray-600 hover:text-gray-900 hover:bg-gray-100 block px-3 py-2 text-sm font-medium w-full text-left rounded-md'">
                <i class="fas fa-warehouse mr-2"></i>Inventario
              </button>
            </nav>
          </div>
        }
      </div>
    </header>
  `,
  styles: []
})
export class AdminHeaderComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  isUserMenuOpen = signal<boolean>(false);
  isMobileMenuOpen = signal<boolean>(false);
  currentRoute = signal<string>('');

  ngOnInit(): void {
    // Suscribirse al usuario actual
    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
    });

    // Obtener ruta actual
    this.currentRoute.set(this.router.url);
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Cerrar menús cuando se hace clic fuera de ellos
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.isUserMenuOpen.set(false);
      this.isMobileMenuOpen.set(false);
    }
  }

  getDisplayName(): string {
    const user = this.currentUser();
    return user?.displayName || user?.email?.split('@')[0] || 'Administrador';
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.set(!this.isUserMenuOpen());
    // Cerrar menú móvil si está abierto
    if (this.isMobileMenuOpen()) {
      this.isMobileMenuOpen.set(false);
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
    // Cerrar menú de usuario si está abierto
    if (this.isUserMenuOpen()) {
      this.isUserMenuOpen.set(false);
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.currentRoute.set(route);
    // Cerrar menús
    this.isUserMenuOpen.set(false);
    this.isMobileMenuOpen.set(false);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Sesión cerrada exitosamente');
        this.router.navigate(['/auth/login']);
      },
      error: (error: any) => {
        console.error('Error al cerrar sesión:', error);
        // Redirigir de todas formas en caso de error
        this.router.navigate(['/auth/login']);
      }
    });

    // Cerrar menú
    this.isUserMenuOpen.set(false);
  }
}