import { Routes } from '@angular/router';
import { superadminGuard } from '../../core/guards/superadmin.guard';

/**
 * Rutas de productor - ahora redirigen a funcionalidades de admin
 * Los productores son ahora manejados por el superadmin (bodegero)
 */
export const PRODUCER_ROUTES: Routes = [
  {
    path: 'dashboard',
    redirectTo: '/admin/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'products',
    redirectTo: '/admin/products',
    pathMatch: 'full'
  },
  {
    path: 'orders',
    redirectTo: '/admin/orders',
    pathMatch: 'full'
  },
  {
    path: '',
    redirectTo: '/admin/dashboard',
    pathMatch: 'full'
  }
];