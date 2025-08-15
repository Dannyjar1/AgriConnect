import { Routes } from '@angular/router';
import { buyerGuard } from '../../core/guards/buyer.guard';

export const BUYER_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [buyerGuard]
  },
  {
    path: 'orders',
    loadComponent: () => import('./order-history/order-history').then(m => m.OrderHistory),
    canActivate: [buyerGuard]
  },
  {
    path: 'favorites',
    loadComponent: () => import('./favorites/favorites').then(m => m.Favorites),
    canActivate: [buyerGuard]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];