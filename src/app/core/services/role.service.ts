import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private authService = inject(AuthService);

  /**
   * Verifica si el usuario actual es un productor
   */
  isProducer(): Observable<boolean> {
    return this.authService.hasRole('producer');
  }

  /**
   * Verifica si el usuario actual es un comprador
   */
  isBuyer(): Observable<boolean> {
    return this.authService.hasRole('buyer');
  }

  /**
   * Verifica si el usuario actual es institucional
   */
  isInstitutional(): Observable<boolean> {
    return this.authService.hasRole('institutional');
  }

  /**
   * Verifica si el usuario actual puede acceder al carrito
   * Solo compradores e institucionales pueden acceder
   */
  canAccessCart(): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      map(user => user?.userType !== 'producer')
    );
  }

  /**
   * Verifica si el usuario actual puede gestionar productos
   * Solo productores pueden gestionar productos
   */
  canManageProducts(): Observable<boolean> {
    return this.isProducer();
  }

  /**
   * Obtiene el tipo de dashboard según el rol
   */
  getDashboardRoute(): Observable<string> {
    return this.authService.currentUser$.pipe(
      map(user => {
        switch (user?.userType) {
          case 'producer':
            return '/producer/dashboard';
          case 'buyer':
          case 'institutional':
            return '/buyer/dashboard';
          default:
            return '/marketplace';
        }
      })
    );
  }
}