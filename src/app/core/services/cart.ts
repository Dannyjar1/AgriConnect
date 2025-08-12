import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';
import type { CartItem, CartState } from '../models/cart.model';

/**
 * Cart Service - Servicio unificado de carrito para AgriConnect
 * 
 * Implementa gestión de estado reactiva del carrito de compras usando Angular 20
 * con BehaviorSubject para persistencia y signals para reactividad.
 * 
 * Features:
 * - Estado reactivo con BehaviorSubject
 * - Cálculos automáticos de total y count
 * - Validación de cantidad mínima
 * - Manejo de duplicados sumando cantidades
 * - Integración carrito unificado + fallback de imagen
 * 
 * @version 1.0.0
 * @author AgriConnect Team
 */
@Injectable({
  providedIn: 'root'
})
export class CartService {
  
  // Estado inicial del carrito
  private readonly initialState: CartState = {
    items: [],
    total: 0,
    count: 0
  };

  // BehaviorSubject para el estado del carrito
  private readonly cartState$ = new BehaviorSubject<CartState>(this.initialState);

  // Observable público del carrito
  public readonly cart$: Observable<CartState> = this.cartState$.asObservable();

  // Signals para reactividad moderna (Angular 16+)
  readonly cartItems = signal<CartItem[]>([]);
  readonly cartTotal = signal<number>(0);
  readonly cartCount = signal<number>(0);

  // Computed signals derivados
  readonly isEmpty = computed(() => this.cartItems().length === 0);
  readonly hasItems = computed(() => this.cartItems().length > 0);

  constructor() {
    // Inicializar el carrito vacío al cargar la app
    this.initializeCart();
    
    // Sincronizar BehaviorSubject con signals
    this.cart$.subscribe(state => {
      this.cartItems.set(state.items);
      this.cartTotal.set(state.total);
      this.cartCount.set(state.count);
    });
  }

  /**
   * Inicializar carrito vacío
   */
  private initializeCart(): void {
    this.updateCartState(this.initialState);
  }

  /**
   * Normaliza un producto con valores por defecto para null-safety
   */
  private withDefaults(product: Product): Product {
    return {
      ...product,
      description: product.description || '-',
      province: product.province || '',
      certifications: product.certifications || [],
      price: product.price || { perUnit: 0, unit: 'unidad' },
      availability: product.availability || 0,
      images: product.images?.length > 0 ? product.images : ['assets/images/multifrutas.webp']
    };
  }

  /**
   * Agregar producto al carrito
   * Maneja duplicados sumando qty si id existe
   * 
   * @param producto - Producto a agregar
   * @param qty - Cantidad (default = 1)
   */
  add(producto: Product, qty: number = 1): void {
    // Validar cantidad mínima
    if (qty < 1) {
      console.warn('Cantidad mínima es 1');
      return;
    }

    // Normalizar producto con valores por defecto
    const normalizedProduct = this.withDefaults(producto);

    const currentState = this.cartState$.value;
    const existingItemIndex = currentState.items.findIndex(item => item.id === normalizedProduct.id);

    let updatedItems: CartItem[];

    if (existingItemIndex >= 0) {
      // El producto ya existe, sumar cantidad
      updatedItems = [...currentState.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        qty: updatedItems[existingItemIndex].qty + qty
      };
    } else {
      // Nuevo producto, agregarlo al carrito
      const newItem: CartItem = {
        id: normalizedProduct.id,
        nombre: normalizedProduct.name,
        precio: normalizedProduct.price.perUnit,
        qty: qty,
        image: this.getValidImageUrl(normalizedProduct),
        product: normalizedProduct
      };
      updatedItems = [...currentState.items, newItem];
    }

    // Actualizar estado
    this.updateCartState({
      items: updatedItems,
      total: this.calculateTotal(updatedItems),
      count: this.calculateCount(updatedItems)
    });
  }

  /**
   * Establecer cantidad específica para un producto
   * 
   * @param id - ID del producto
   * @param qty - Nueva cantidad (mínimo 1)
   */
  setQty(id: string, qty: number): void {
    // Validar cantidad mínima
    if (qty < 1) {
      console.warn('Cantidad mínima es 1');
      return;
    }

    const currentState = this.cartState$.value;
    const updatedItems = currentState.items.map(item => 
      item.id === id ? { ...item, qty } : item
    );

    this.updateCartState({
      items: updatedItems,
      total: this.calculateTotal(updatedItems),
      count: this.calculateCount(updatedItems)
    });
  }

  /**
   * Remover producto del carrito
   * 
   * @param id - ID del producto a remover
   */
  remove(id: string): void {
    const currentState = this.cartState$.value;
    const updatedItems = currentState.items.filter(item => item.id !== id);

    this.updateCartState({
      items: updatedItems,
      total: this.calculateTotal(updatedItems),
      count: this.calculateCount(updatedItems)
    });
  }

  /**
   * Limpiar carrito completamente
   */
  clear(): void {
    this.updateCartState(this.initialState);
  }

  /**
   * Obtener URL de imagen válida con fallback
   * Integración carrito unificado + fallback de imagen
   * 
   * @param producto - Producto
   * @returns URL de imagen válida
   */
  private getValidImageUrl(producto: Product): string {
    // Si el producto tiene imágenes válidas, usar la primera
    if (producto.images && producto.images.length > 0 && producto.images[0]) {
      return producto.images[0];
    }
    
    // Si no hay imagen válida, usar multifrutas.webp como fallback
    return 'assets/images/multifrutas.webp';
  }

  /**
   * Calcular total del carrito
   * 
   * @param items - Items del carrito
   * @returns Total calculado
   */
  private calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + (item.precio * item.qty), 0);
  }

  /**
   * Calcular count total de items
   * 
   * @param items - Items del carrito
   * @returns Count total
   */
  private calculateCount(items: CartItem[]): number {
    return items.reduce((count, item) => count + item.qty, 0);
  }

  /**
   * Actualizar estado del carrito
   * 
   * @param newState - Nuevo estado
   */
  private updateCartState(newState: CartState): void {
    this.cartState$.next(newState);
  }

  /**
   * Obtener estado actual del carrito
   * 
   * @returns Estado actual del carrito
   */
  getCurrentState(): CartState {
    return this.cartState$.value;
  }

  /**
   * Verificar si un producto está en el carrito
   * 
   * @param productId - ID del producto
   * @returns true si está en el carrito
   */
  isInCart(productId: string): boolean {
    return this.cartState$.value.items.some(item => item.id === productId);
  }

  /**
   * Obtener cantidad de un producto específico en el carrito
   * 
   * @param productId - ID del producto
   * @returns Cantidad en el carrito (0 si no está)
   */
  getProductQuantity(productId: string): number {
    const item = this.cartState$.value.items.find(item => item.id === productId);
    return item ? item.qty : 0;
  }

  /**
   * Incrementar cantidad de un producto
   * 
   * @param id - ID del producto
   */
  incrementQuantity(id: string): void {
    const currentState = this.cartState$.value;
    const item = currentState.items.find(item => item.id === id);
    
    if (item) {
      this.setQty(id, item.qty + 1);
    }
  }

  /**
   * Decrementar cantidad de un producto (mínimo 1)
   * 
   * @param id - ID del producto
   */
  decrementQuantity(id: string): void {
    const currentState = this.cartState$.value;
    const item = currentState.items.find(item => item.id === id);
    
    if (item && item.qty > 1) {
      this.setQty(id, item.qty - 1);
    }
  }
}