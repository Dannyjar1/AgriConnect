/**
 * Barrel export for core services
 * Following Angular 20 naming conventions
 */

export { CartService } from './cart';
export { Firebase } from './firebase';

// Re-export from other service files if they exist
export * from './auth.service';
export * from './email.service';
export * from './product.service';
export * from './order';