import { Routes } from '@angular/router';
import { producerGuard } from '../../core/guards/producer.guard';

export const PRODUCER_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [producerGuard]
  },
  {
    path: 'products',
    loadChildren: () => import('./products/products.routes').then(m => m.PRODUCTS_ROUTES),
    canActivate: [producerGuard]
  },
  {
    path: 'orders',
    loadChildren: () => import('./orders/orders.routes').then(m => m.ORDERS_ROUTES),
    canActivate: [producerGuard]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];