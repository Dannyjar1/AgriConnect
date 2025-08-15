import { Product } from './product.model';

/**
 * Interface for cart items - unified for the cart system
 * Integración carrito unificado + fallback de imagen
 */
export interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  qty: number;
  image: string;
  product?: Product; // Reference to complete product (optional for null-safety)
}

/**
 * Interface for cart summary calculations
 */
export interface CartSummary {
  subtotal: number;
  tax: number;
  taxRate: number;
  shipping: number;
  total: number;
  itemCount: number;
}

/**
 * Interface for cart state
 */
export interface CartState {
  items: CartItem[];
  total: number;
  count: number;
}