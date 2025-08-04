import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const PRODUCER_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },
  {
    path: 'products',
    loadChildren: () => import('./products/products.routes').then(m => m.PRODUCTS_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'orders',
    loadChildren: () => import('./orders/orders.routes').then(m => m.ORDERS_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];