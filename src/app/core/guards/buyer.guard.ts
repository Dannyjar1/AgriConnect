import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

/**
 * Guard que verifica si el usuario actual es un comprador
 * Redirige a /marketplace si no es comprador o no está autenticado
 */
export const buyerGuard: CanActivateFn = (route, state) => {
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
      
      if (user.userType !== 'buyer') {
        // Usuario autenticado pero no es comprador
        console.warn('Acceso denegado: usuario no es comprador');
        router.navigate(['/marketplace']);
        return false;
      }
      
      // Usuario es comprador
      return true;
    })
  );
};