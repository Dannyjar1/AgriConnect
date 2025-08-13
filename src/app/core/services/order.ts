import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { delay, map, catchError, switchMap } from 'rxjs/operators';
import { Firestore, collection, addDoc, doc, setDoc, serverTimestamp } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { EmailService, OrderConfirmationEmailData } from './email.service';
import { CartService } from './cart';
import type { CartState, CartSummary } from '../models/cart.model';

/**
 * Order Service - Order management for AgriConnect
 * 
 * Angular 20 service for handling order placement and management.
 * Features include:
 * - Order creation and validation
 * - Integration with CartService
 * - Error handling and retry logic
 * - Navigation after successful orders
 * - Order status tracking
 * - Ecuador-specific order processing
 * 
 * @author AgriConnect Team
 * @version 1.0.0
 */

export interface ShippingInfo {
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  direccion: string;
  referencia?: string;
  provincia: string;
  ciudad: string;
  codigoPostal?: string;
  notas?: string;
}

export interface PaymentInfo {
  metodo: 'tarjeta' | 'transferencia' | 'contraentrega';
  titular?: string;
  numeroTarjeta?: string; // Masked for security
  fechaVencimiento?: string;
}

export interface OrderRequest {
  cart: CartState;
  shipping: ShippingInfo;
  payment: PaymentInfo;
  summary: CartSummary;
}

export interface OrderResponse {
  success: boolean;
  orderId?: string;
  message: string;
  estimatedDelivery?: Date;
  trackingNumber?: string;
  error?: string;
}

export interface OrderStatus {
  orderId: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  statusText: string;
  estimatedDelivery?: Date;
  trackingNumber?: string;
  lastUpdated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  // Injected services
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly firestore = inject(Firestore);
  private readonly authService = inject(AuthService);
  private readonly emailService = inject(EmailService);

  // Configuration
  private readonly API_ENDPOINT = '/api/orders'; // In production, this would be the real API
  private readonly ORDER_TIMEOUT = 30000; // 30 seconds timeout

  /**
   * Place a new order
   * 
   * @param orderData - Complete order information
   * @returns Observable with order response
   */
  placeOrder(orderData: OrderRequest): Observable<OrderResponse> {
    console.log('OrderService: Placing order', orderData);

    // Validate order data
    const validation = this.validateOrderData(orderData);
    if (!validation.isValid) {
      return throwError(() => new Error(validation.message));
    }

    // Process order with Firebase integration
    return this.processOrderWithFirebase(orderData).pipe(
      delay(1000), // Simulate processing time
      switchMap(response => {
        if (response.success) {
          // Send confirmation email
          return this.sendOrderConfirmationEmail(orderData, response).pipe(
            map(emailResult => {
              console.log('Email sent result:', emailResult);
              
              // Clear cart on successful order
              this.cartService.clear();
              
              // Store order in local storage for tracking
              this.storeOrderLocally(response);
              
              console.log('OrderService: Order placed successfully', response);
              return response;
            }),
            catchError(emailError => {
              console.warn('Email sending failed but order was successful:', emailError);
              // Still return success even if email fails
              this.cartService.clear();
              this.storeOrderLocally(response);
              return of(response);
            })
          );
        }
        return of(response);
      }),
      catchError(error => {
        console.error('OrderService: Order placement failed', error);
        return of({
          success: false,
          message: 'Error al procesar el pedido. Por favor intenta nuevamente.',
          error: error.message
        });
      })
    );
  }

  /**
   * Get order status by ID
   * 
   * @param orderId - Order ID to track
   * @returns Observable with order status
   */
  getOrderStatus(orderId: string): Observable<OrderStatus> {
    console.log('OrderService: Getting order status for', orderId);

    // Simulate API call
    return of({
      orderId,
      status: 'confirmed' as const,
      statusText: 'Pedido confirmado y en preparación',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      trackingNumber: `AGC${orderId.slice(-8).toUpperCase()}`,
      lastUpdated: new Date()
    }).pipe(
      delay(1000)
    );
  }

  /**
   * Get user's order history
   * 
   * @param userId - User ID (optional, could use session)
   * @returns Observable with order list
   */
  getUserOrders(userId?: string): Observable<OrderStatus[]> {
    console.log('OrderService: Getting user orders', userId);

    // Get orders from local storage (in production, this would be from API)
    const localOrders = this.getLocalOrders();
    
    return of(localOrders).pipe(
      delay(800)
    );
  }

  /**
   * Cancel an order
   * 
   * @param orderId - Order ID to cancel
   * @returns Observable with cancellation result
   */
  cancelOrder(orderId: string): Observable<{ success: boolean; message: string }> {
    console.log('OrderService: Cancelling order', orderId);

    // Simulate API call
    return of({
      success: true,
      message: 'Pedido cancelado exitosamente. El reembolso será procesado en 3-5 días hábiles.'
    }).pipe(
      delay(1500)
    );
  }

  /**
   * Navigate to order success page
   * 
   * @param orderId - Order ID for the success page
   */
  navigateToOrderSuccess(orderId: string): void {
    this.router.navigate(['/order-success'], { 
      queryParams: { id: orderId }
    });
  }

  /**
   * Navigate to order tracking page
   * 
   * @param orderId - Order ID for tracking
   */
  navigateToOrderTracking(orderId: string): void {
    this.router.navigate(['/order-tracking'], { 
      queryParams: { id: orderId }
    });
  }

  /**
   * Validate order data before submission
   * 
   * @param orderData - Order data to validate
   * @returns Validation result
   */
  private validateOrderData(orderData: OrderRequest): { isValid: boolean; message: string } {
    // Check if cart has items
    if (!orderData.cart.items || orderData.cart.items.length === 0) {
      return {
        isValid: false,
        message: 'El carrito está vacío. Agrega productos antes de continuar.'
      };
    }

    // Check if total matches
    if (orderData.cart.total <= 0) {
      return {
        isValid: false,
        message: 'El total del pedido debe ser mayor a cero.'
      };
    }

    // Validate shipping information
    const shipping = orderData.shipping;
    const requiredShippingFields = ['nombres', 'apellidos', 'correo', 'telefono', 'direccion', 'provincia', 'ciudad'];
    
    for (const field of requiredShippingFields) {
      if (!shipping[field as keyof ShippingInfo] || shipping[field as keyof ShippingInfo]?.toString().trim() === '') {
        return {
          isValid: false,
          message: `El campo ${field} es requerido para el envío.`
        };
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shipping.correo)) {
      return {
        isValid: false,
        message: 'El formato del correo electrónico es inválido.'
      };
    }

    // Validate phone format (Ecuador)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(shipping.telefono)) {
      return {
        isValid: false,
        message: 'El número de teléfono debe tener 10 dígitos.'
      };
    }

    // Validate payment method
    if (!orderData.payment.metodo) {
      return {
        isValid: false,
        message: 'Selecciona un método de pago.'
      };
    }

    // Additional validation for credit card
    if (orderData.payment.metodo === 'tarjeta') {
      if (!orderData.payment.titular || !orderData.payment.numeroTarjeta || !orderData.payment.fechaVencimiento) {
        return {
          isValid: false,
          message: 'Completa toda la información de la tarjeta de crédito.'
        };
      }
    }

    return {
      isValid: true,
      message: 'Orden válida'
    };
  }

  /**
   * Process order with Firebase integration
   * 
   * @param orderData - Order data
   * @returns Observable with order response
   */
  private processOrderWithFirebase(orderData: OrderRequest): Observable<OrderResponse> {
    // Generate unique order ID
    const orderId = this.generateOrderId();
    
    // Calculate estimated delivery (2-3 days for most of Ecuador)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + (orderData.shipping.provincia === 'pichincha' ? 2 : 3));
    
    // Generate tracking number
    const trackingNumber = `AGC${orderId.slice(-8).toUpperCase()}`;

    // Prepare order document for Firestore
    const orderDocument = {
      orderId,
      status: 'confirmed',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      customer: {
        email: orderData.shipping.correo,
        nombres: orderData.shipping.nombres,
        apellidos: orderData.shipping.apellidos,
        telefono: orderData.shipping.telefono
      },
      shipping: orderData.shipping,
      payment: {
        method: orderData.payment.metodo,
        // Don't store sensitive payment data
        processedAt: serverTimestamp()
      },
      items: orderData.cart.items.map(item => ({
        id: item.id,
        nombre: item.nombre,
        precio: item.precio,
        qty: item.qty,
        total: item.precio * item.qty,
        image: item.image
      })),
      summary: {
        itemCount: orderData.summary.itemCount,
        subtotal: orderData.summary.subtotal,
        tax: orderData.summary.tax,
        shipping: orderData.summary.shipping,
        total: orderData.summary.total
      },
      estimatedDelivery,
      trackingNumber,
      notifications: {
        emailSent: false,
        smsSent: false
      }
    };

    // Save to Firestore
    return new Observable<OrderResponse>(observer => {
      const ordersCollection = collection(this.firestore, 'orders');
      
      addDoc(ordersCollection, orderDocument)
        .then(docRef => {
          console.log('Order saved to Firestore with ID:', docRef.id);
          
          // Update document with Firestore document ID
          setDoc(doc(this.firestore, 'orders', docRef.id), {
            ...orderDocument,
            firestoreId: docRef.id
          }, { merge: true });
          
          observer.next({
            success: true,
            orderId,
            message: '¡Pedido realizado exitosamente! Te hemos enviado un correo de confirmación.',
            estimatedDelivery,
            trackingNumber
          });
          observer.complete();
        })
        .catch(error => {
          console.error('Error saving order to Firestore:', error);
          observer.error(error);
        });
    });
  }

  /**
   * Send order confirmation email to customer
   * 
   * @param orderData - Order data
   * @param orderResponse - Order response with ID
   * @returns Observable with email result
   */
  private sendOrderConfirmationEmail(orderData: OrderRequest, orderResponse: OrderResponse): Observable<any> {
    const emailData: OrderConfirmationEmailData = {
      customerName: `${orderData.shipping.nombres} ${orderData.shipping.apellidos}`,
      customerEmail: orderData.shipping.correo,
      orderId: orderResponse.orderId!,
      orderDate: new Date().toLocaleDateString('es-EC', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      items: orderData.cart.items.map(item => ({
        name: item.nombre,
        quantity: item.qty,
        price: item.precio,
        total: item.precio * item.qty
      })),
      subtotal: orderData.summary.subtotal,
      tax: orderData.summary.tax,
      shipping: orderData.summary.shipping,
      total: orderData.summary.total,
      paymentMethod: this.getPaymentMethodLabel(orderData.payment.metodo),
      shippingAddress: {
        nombres: orderData.shipping.nombres,
        apellidos: orderData.shipping.apellidos,
        direccion: orderData.shipping.direccion,
        ciudad: orderData.shipping.ciudad,
        provincia: orderData.shipping.provincia,
        telefono: orderData.shipping.telefono
      },
      estimatedDelivery: orderResponse.estimatedDelivery?.toLocaleDateString('es-EC', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      trackingNumber: orderResponse.trackingNumber
    };

    return this.emailService.sendOrderConfirmationEmail(emailData);
  }

  /**
   * Generate unique order ID
   * 
   * @returns Unique order ID
   */
  private generateOrderId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `AGC-${timestamp}-${randomPart}`.toUpperCase();
  }

  /**
   * Store order locally for tracking (in production, this would be handled by backend)
   * 
   * @param orderResponse - Order response to store
   */
  private storeOrderLocally(orderResponse: OrderResponse): void {
    if (typeof window === 'undefined') return;

    try {
      const orders = this.getLocalOrders();
      const newOrder: OrderStatus = {
        orderId: orderResponse.orderId!,
        status: 'confirmed' as const,
        statusText: 'Pedido confirmado y en preparación',
        estimatedDelivery: orderResponse.estimatedDelivery,
        trackingNumber: orderResponse.trackingNumber,
        lastUpdated: new Date()
      };

      orders.unshift(newOrder); // Add to beginning
      
      // Keep only last 20 orders
      const ordersToStore = orders.slice(0, 20);
      
      localStorage.setItem('agri_connect_orders', JSON.stringify(ordersToStore));
    } catch (error) {
      console.warn('OrderService: Could not store order locally', error);
    }
  }

  /**
   * Get orders from local storage
   * 
   * @returns Array of local orders
   */
  private getLocalOrders(): OrderStatus[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem('agri_connect_orders');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('OrderService: Could not retrieve local orders', error);
      return [];
    }
  }

  /**
   * Clear local order storage (useful for testing or user logout)
   */
  clearLocalOrders(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agri_connect_orders');
    }
  }

  /**
   * Update order notification status in Firestore
   * 
   * @param orderId - Order ID
   * @param notificationType - Type of notification (email, sms)
   * @param sent - Whether notification was sent successfully
   */
  private updateNotificationStatus(orderId: string, notificationType: 'email' | 'sms', sent: boolean): void {
    // In a real implementation, we would update the Firestore document
    console.log(`Order ${orderId}: ${notificationType} notification ${sent ? 'sent' : 'failed'}`);
  }

  /**
   * Get order summary for display
   * 
   * @param orderData - Order data
   * @returns Formatted order summary
   */
  getOrderSummary(orderData: OrderRequest): {
    itemCount: number;
    totalItems: number;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    paymentMethod: string;
    deliveryAddress: string;
  } {
    const summary = orderData.summary;
    const shipping = orderData.shipping;
    
    return {
      itemCount: summary.itemCount,
      totalItems: orderData.cart.items.reduce((sum, item) => sum + item.qty, 0),
      subtotal: summary.subtotal,
      tax: summary.tax,
      shipping: summary.shipping,
      total: summary.total,
      paymentMethod: this.getPaymentMethodLabel(orderData.payment.metodo),
      deliveryAddress: `${shipping.direccion}, ${shipping.ciudad}, ${shipping.provincia}`
    };
  }

  /**
   * Get human-readable payment method label
   * 
   * @param metodo - Payment method code
   * @returns Human-readable label
   */
  private getPaymentMethodLabel(metodo: string): string {
    const labels: Record<string, string> = {
      'tarjeta': 'Tarjeta de Crédito/Débito',
      'transferencia': 'Transferencia Bancaria',
      'contraentrega': 'Pago Contra Entrega'
    };
    
    return labels[metodo] || metodo;
  }

  /**
   * Check if delivery is available for the given address
   * 
   * @param provincia - Province code
   * @param ciudad - City code
   * @returns Delivery availability info
   */
  checkDeliveryAvailability(provincia: string, ciudad: string): {
    available: boolean;
    estimatedDays: number;
    shippingCost: number;
    message: string;
  } {
    // Ecuador delivery zones
    const deliveryZones: Record<string, { days: number; cost: number }> = {
      'pichincha': { days: 1, cost: 0 }, // Quito area - next day, free
      'guayas': { days: 2, cost: 0 }, // Guayaquil area - 2 days, free
      'azuay': { days: 3, cost: 2.50 }, // Cuenca area - 3 days, small fee
      'default': { days: 4, cost: 5.00 } // Other areas - 4 days, standard fee
    };

    const zone = deliveryZones[provincia] || deliveryZones['default'];
    
    return {
      available: true, // AgriConnect delivers nationwide
      estimatedDays: zone.days,
      shippingCost: zone.cost,
      message: zone.days === 1 
        ? 'Entrega al día siguiente disponible'
        : `Entrega en ${zone.days} días hábiles`
    };
  }
}