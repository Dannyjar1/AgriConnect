/**
 * Carrito Module Barrel Exports
 * 
 * Central export point for the AgriConnect shopping cart functionality
 */

export { CarritoComponent } from './carrito';

// Re-export cart-related interfaces and types from unified models
export type { CartItem, CartSummary, CartState } from '../../core/models/cart.model';