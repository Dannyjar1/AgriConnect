import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'producer',
    loadChildren: () => import('./pages/producer/producer.routes').then(m => m.PRODUCER_ROUTES)
  },
  {
    path: 'buyer',
    loadChildren: () => import('./pages/buyer/buyer.routes').then(m => m.BUYER_ROUTES)
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'marketplace',
    loadComponent: () => import('./pages/marketplace/marketplace/marketplace').then(m => m.Marketplace),
    canActivate: [authGuard],
    children: [
      {
        path: 'catalog',
        loadChildren: () => import('./pages/marketplace/product-catalog/product-catalog.routes').then(m => m.PRODUCT_CATALOG_ROUTES)
      }
    ]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'productos',
    loadComponent: () => import('./pages/productos/productos').then(m => m.Productos)
  },
  {
    path: 'productores',
    loadComponent: () => import('./pages/productores/productores').then(m => m.ProductoresComponent)
  },
  {
    path: '',
    loadComponent: () => import('./pages/welcome/welcome').then(m => m.WelcomeComponent)
  }
];