import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },
  {
    path: 'users',
    loadComponent: () => import('./users/users').then(m => m.Users),
    canActivate: [authGuard]
  },
  {
    path: 'metrics',
    loadComponent: () => import('./metrics/metrics').then(m => m.Metrics),
    canActivate: [authGuard]
  },
  {
    path: 'algorithm',
    loadComponent: () => import('./algorithm-config/algorithm-config').then(m => m.AlgorithmConfig),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];