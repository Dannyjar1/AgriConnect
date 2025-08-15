import { Routes } from '@angular/router';
import { superadminGuard } from '../../core/guards/superadmin.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [superadminGuard]
  },
  {
    path: 'users',
    loadComponent: () => import('./users/users').then(m => m.Users),
    canActivate: [superadminGuard]
  },
  {
    path: 'producers',
    loadComponent: () => import('./producers/producers').then(m => m.Producers),
    canActivate: [superadminGuard]
  },
  {
    path: 'products',
    loadComponent: () => import('./products/products').then(m => m.Products),
    canActivate: [superadminGuard]
  },
  {
    path: 'inventory',
    loadComponent: () => import('./inventory/inventory').then(m => m.Inventory),
    canActivate: [superadminGuard]
  },
  {
    path: 'reports',
    loadComponent: () => import('./reports/reports').then(m => m.Reports),
    canActivate: [superadminGuard]
  },
  {
    path: 'metrics',
    loadComponent: () => import('./metrics/metrics').then(m => m.Metrics),
    canActivate: [superadminGuard]
  },
  {
    path: 'algorithm',
    loadComponent: () => import('./algorithm-config/algorithm-config').then(m => m.AlgorithmConfig),
    canActivate: [superadminGuard]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];