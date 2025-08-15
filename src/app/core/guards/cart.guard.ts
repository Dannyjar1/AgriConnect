import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

/**
 * Guard que permite acceso al carrito solo a compradores
 * Los superadmin no pueden acceder al carrito (no compran, administran)
 */
export const cartGuard: CanActivateFn = () => {
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

      if (user.userType === 'superadmin') {
        // Los superadmin no pueden acceder al carrito
        console.warn('Acceso denegado: los administradores no pueden acceder al carrito');
        router.navigate(['/admin/dashboard']);
        return false;
      }

      // Solo compradores pueden acceder al carrito
      return user.userType === 'buyer';
    })
  );
};