import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil, filter, take } from 'rxjs/operators';

/**
 * Componente de redirección automática
 * Se encarga de redirigir usuarios autenticados a su dashboard correspondiente
 */
@Component({
  selector: 'app-auto-redirect',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div class="text-center">
        <!-- Logo/Icon Circle -->
        <div class="mx-auto w-16 h-16 bg-agri-green-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
          <svg class="w-8 h-8 text-agri-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
        </div>
        
        <!-- Loading Spinner -->
        <div class="flex items-center justify-center mb-4">
          <svg class="animate-spin h-8 w-8 text-agri-green-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        
        <!-- Loading Text -->
        <h2 class="text-xl font-bold text-gray-900 font-epilogue mb-2">AgriConnect</h2>
        <p class="text-gray-600 font-noto-sans">{{ redirectMessage }}</p>
      </div>
    </div>
  `,
  styles: []
})
export class AutoRedirect implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private timeoutId?: number;
  private hasRedirected = false;

  redirectMessage = 'Redirigiendo...';

  ngOnInit(): void {
    console.log('🚀 AutoRedirect iniciado');
    this.handleRedirection();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  private handleRedirection(): void {
    // Timeout de seguridad - si no hay redirección en 8 segundos, ir a marketplace
    this.timeoutId = window.setTimeout(() => {
      if (!this.hasRedirected) {
        console.log('⏰ Timeout de redirección, yendo a marketplace');
        this.redirectToDefault();
      }
    }, 8000);

    // Esperar a que el usuario esté completamente cargado
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$),
      filter(user => user !== null), // Solo proceder cuando tengamos un usuario válido
      take(1) // Solo tomar el primer valor válido
    ).subscribe({
      next: (user) => {
        if (!this.hasRedirected) {
          console.log('🎯 Usuario válido detectado para redirección:', user);
          this.redirectToUserDashboard(user);
        }
      },
      error: (error) => {
        if (!this.hasRedirected) {
          console.error('❌ Error en redirección automática:', error);
          this.redirectToDefault();
        }
      }
    });
  }

  private redirectToUserDashboard(user: any): void {
    if (this.hasRedirected) return;
    
    const userType = user.userType;
    console.log('🎯 Redirigiendo usuario con tipo:', userType);

    let redirectPath: string;
    let message: string;

    switch (userType) {
      case 'superadmin':
        console.log('👨‍💼 Redirigiendo a dashboard de administrador');
        redirectPath = '/admin/dashboard';
        message = 'Redirigiendo al panel de administración...';
        break;
      case 'buyer':
        console.log('🛒 Redirigiendo a dashboard de comprador');
        redirectPath = '/buyer/dashboard';
        message = 'Redirigiendo al panel de comprador...';
        break;
      default:
        console.log('🏪 Redirigiendo a marketplace por defecto');
        redirectPath = '/marketplace';
        message = 'Redirigiendo al marketplace...';
        break;
    }

    this.redirectMessage = message;
    this.hasRedirected = true;
    
    // Cancelar timeout ya que vamos a redirigir
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    console.log('🚀 Navegando a:', redirectPath);
    
    // Usar setTimeout para asegurar que la UI se actualice
    setTimeout(() => {
      this.router.navigate([redirectPath]).then(success => {
        console.log('✅ Navegación exitosa:', success);
        if (!success) {
          console.warn('⚠️ Navegación falló, intentando marketplace');
          this.redirectToDefault();
        }
      }).catch(error => {
        console.error('❌ Error en navegación:', error);
        this.redirectToDefault();
      });
    }, 500);
  }

  private redirectToDefault(): void {
    if (this.hasRedirected) return;
    
    console.log('🔄 Redirigiendo a marketplace por defecto');
    this.redirectMessage = 'Redirigiendo al marketplace...';
    this.hasRedirected = true;
    
    // Cancelar timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    setTimeout(() => {
      this.router.navigate(['/marketplace']);
    }, 500);
  }
}