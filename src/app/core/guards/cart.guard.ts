import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

/**
 * Guard que permite acceso al carrito solo a compradores
 * Los productores no pueden acceder al carrito
 */
export const cartGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (!user) {
        // Usuario no autenticado
        router.navigate(['/auth/login']);
        return false;
      }
      
      if (user.userType === 'producer') {
        // Los productores no pueden acceder al carrito
        console.warn('Acceso denegado: los productores no pueden acceder al carrito');
        router.navigate(['/producer/dashboard']);
        return false;
      }
      
      // Compradores y usuarios institucionales pueden acceder
      return true;
    })
  );
};