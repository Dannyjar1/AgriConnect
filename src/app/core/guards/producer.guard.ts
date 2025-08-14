import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

/**
 * Guard que verifica si el usuario actual es un productor
 * Redirige a /marketplace si no es productor o no está autenticado
 */
export const producerGuard: CanActivateFn = (route, state) => {
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
      
      if (user.userType !== 'producer') {
        // Usuario autenticado pero no es productor
        console.warn('Acceso denegado: usuario no es productor');
        router.navigate(['/marketplace']);
        return false;
      }
      
      // Usuario es productor
      return true;
    })
  );
};