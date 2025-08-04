import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const BUYER_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },
  {
    path: 'orders',
    loadComponent: () => import('./order-history/order-history').then(m => m.OrderHistory),
    canActivate: [authGuard]
  },
  {
    path: 'favorites',
    loadComponent: () => import('./favorites/favorites').then(m => m.Favorites),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];