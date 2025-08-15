import { Routes } from '@angular/router';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./order-history/order-history').then(m => m.OrderHistory)
  },
  {
    path: 'pending',
    loadComponent: () => import('./pending-orders/pending-orders').then(m => m.PendingOrders)
  }
];