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
   * Verifica si el usuario actual es un superadmin (bodegero)
   */
  isSuperAdmin(): Observable<boolean> {
    return this.authService.hasRole('superadmin');
  }

  /**
   * Verifica si el usuario actual es un comprador
   */
  isBuyer(): Observable<boolean> {
    return this.authService.hasRole('buyer');
  }

  /**
   * Verifica si el usuario actual puede acceder al carrito
   * Solo compradores pueden acceder
   */
  canAccessCart(): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      map(user => user?.userType === 'buyer')
    );
  }

  /**
   * Verifica si el usuario actual puede gestionar productos
   * Solo superadmin puede gestionar productos
   */
  canManageProducts(): Observable<boolean> {
    return this.isSuperAdmin();
  }

  /**
   * Verifica si el usuario actual puede gestionar productores
   * Solo superadmin puede gestionar productores
   */
  canManageProducers(): Observable<boolean> {
    return this.isSuperAdmin();
  }

  /**
   * Verifica si el usuario actual puede gestionar inventario
   * Solo superadmin puede gestionar inventario
   */
  canManageInventory(): Observable<boolean> {
    return this.isSuperAdmin();
  }

  /**
   * Obtiene el tipo de dashboard según el rol
   */
  getDashboardRoute(): Observable<string> {
    return this.authService.currentUser$.pipe(
      map(user => {
        switch (user?.userType) {
          case 'superadmin':
            return '/admin/dashboard';
          case 'buyer':
            return '/buyer/dashboard';
          default:
            return '/marketplace';
        }
      })
    );
  }
}