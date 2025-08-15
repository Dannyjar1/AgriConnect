import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Guard que espera a que la autenticación esté completamente inicializada
 * Previene navegación prematura antes de que Firebase Auth determine el estado del usuario
 */
export const authInitGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);

  return authService.authState$.pipe(
    take(1),
    timeout(5000), // Timeout de 5 segundos para evitar bloqueos
    map(() => true),
    // Si hay timeout, permitir navegación de todos modos
    catchError(() => of(true))
  );
};