import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthHeaderComponent } from './shared/components/auth-header/auth-header';
import { AppFooterComponent } from './shared/components/app-footer/app-footer';
import { AuthService } from './core/services/auth.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, AuthHeaderComponent, AppFooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('AgriConnect');
  protected readonly showHeader = signal<boolean>(true);
  
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  // Rutas donde NO se debe mostrar el header (marketplace requiere vista más limpia)
  private readonly hiddenHeaderRoutes = ['/marketplace' , '/profile', '/productores','/productos'];

  ngOnInit(): void {
    // Escuchar cambios de ruta para actualizar la visibilidad del header
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.updateHeaderVisibility(event.urlAfterRedirects);
      });

    // Verificar ruta inicial
    this.updateHeaderVisibility(this.router.url);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Actualiza la visibilidad del header basado en la ruta actual
   */
  private updateHeaderVisibility(url: string): void {
    // Normalizar la URL para comparación
    const normalizedUrl = url === '' ? '/' : url;
    
    // Ocultar header solo en marketplace para mantener diseño limpio
    const shouldHideHeader = this.hiddenHeaderRoutes.some(route => 
      normalizedUrl.startsWith(route)
    );
    
    this.showHeader.set(!shouldHideHeader);
  }

  /**
   * Handler para el evento CTA del AuthHeader
   * Redirige a login si no está autenticado, o a marketplace si está autenticado
   */
  protected onHeaderCtaClick(): void {
    // Verificar el estado de autenticación
    this.authService.authState$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((user: any) => {
      if (user) {
        // Usuario autenticado - ir a marketplace
        this.router.navigate(['/marketplace']);
      } else {
        // Usuario no autenticado - ir a login
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
