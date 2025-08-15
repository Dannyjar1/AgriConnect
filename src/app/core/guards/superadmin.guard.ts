import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

/**
 * Guard que verifica si el usuario actual es un superadmin (bodegero)
 * Redirige a /marketplace si no es superadmin o no está autenticado
 */
export const superadminGuard: CanActivateFn = (route, state) => {
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
      
      if (user.userType !== 'superadmin') {
        // Usuario autenticado pero no es superadmin
        console.warn('Acceso denegado: usuario no es superadmin (bodegero)');
        router.navigate(['/marketplace']);
        return false;
      }
      
      // Usuario es superadmin
      return true;
    })
  );
};