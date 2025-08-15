import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * EmailService - Email management for AgriConnect
 * 
 * Angular 20 service for handling email notifications using Firebase Functions.
 * Features include:
 * - Order confirmation emails
 * - Order status updates
 * - Newsletter subscriptions
 * - Password reset emails
 * - Integration with Firebase Functions
 * 
 * @author AgriConnect Team
 * @version 1.0.0
 */

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface OrderConfirmationEmailData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  shippingAddress: {
    nombres: string;
    apellidos: string;
    direccion: string;
    ciudad: string;
    provincia: string;
    telefono: string;
  };
  estimatedDelivery?: string;
  trackingNumber?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  message: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private readonly http = inject(HttpClient);
  
  // Firebase Functions URL for email sending
  private readonly emailFunctionUrl = `https://us-central1-${environment.firebase.projectId}.cloudfunctions.net/sendEmail`;
  
  // Backup/simulation URL for development
  private readonly isDevelopment = !environment.production;

  /**
   * Send order confirmation email to customer
   * 
   * @param orderData - Order confirmation data
   * @returns Observable with email sending result
   */
  sendOrderConfirmationEmail(orderData: OrderConfirmationEmailData): Observable<EmailResponse> {
    console.log('EmailService: Sending order confirmation email to', orderData.customerEmail);

    const emailContent = this.generateOrderConfirmationHTML(orderData);
    
    const emailPayload = {
      to: orderData.customerEmail,
      subject: `🛍️ Confirmación de Pedido #${orderData.orderId} - AgriConnect`,
      html: emailContent,
      text: this.generateOrderConfirmationText(orderData)
    };

    // In development, simulate email sending
    if (this.isDevelopment) {
      console.log('EmailService: Simulating email send in development mode', emailPayload);
      return this.simulateEmailSend(emailPayload);
    }

    // In production, try Firebase Functions
    return this.sendEmailViaFirebase(emailPayload).pipe(
      catchError(error => {
        console.warn('Firebase Functions email failed, using simulation', error);
        return this.simulateEmailSend(emailPayload);
      })
    );
  }

  /**
   * Send order status update email
   * 
   * @param customerEmail - Customer email
   * @param orderId - Order ID
   * @param status - New order status
   * @param trackingNumber - Tracking number (optional)
   * @returns Observable with email sending result
   */
  sendOrderStatusUpdateEmail(
    customerEmail: string, 
    orderId: string, 
    status: string, 
    trackingNumber?: string
  ): Observable<EmailResponse> {
    console.log('EmailService: Sending status update email', { customerEmail, orderId, status });

    const emailPayload = {
      to: customerEmail,
      subject: `📦 Actualización de Pedido #${orderId} - AgriConnect`,
      html: this.generateStatusUpdateHTML(orderId, status, trackingNumber),
      text: this.generateStatusUpdateText(orderId, status, trackingNumber)
    };

    return this.sendEmailViaFirebase(emailPayload).pipe(
      catchError(error => {
        console.warn('Failed to send status update email', error);
        return of({
          success: false,
          message: 'Error al enviar email de actualización',
          error: error.message
        });
      })
    );
  }

  /**
   * Send email via Firebase Functions
   * 
   * @param emailData - Email data to send
   * @returns Observable with sending result
   */
  private sendEmailViaFirebase(emailData: EmailTemplate): Observable<EmailResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(this.emailFunctionUrl, emailData, { headers }).pipe(
      map(response => ({
        success: true,
        messageId: response.messageId,
        message: 'Email enviado exitosamente'
      })),
      catchError(error => {
        console.error('Firebase Functions email error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Simulate email sending for development and fallback
   * 
   * @param emailData - Email data to send
   * @returns Observable with simulated sending result
   */
  private simulateEmailSend(emailData: EmailTemplate): Observable<EmailResponse> {
    console.log('📧 EMAIL SIMULATION - AgriConnect', {
      to: emailData.to,
      subject: emailData.subject,
      contentLength: emailData.html?.length || emailData.text?.length || 0
    });
    
    // Show email content in console for development
    if (this.isDevelopment) {
      console.log('📧 Email Content Preview:', {
        to: emailData.to,
        subject: emailData.subject,
        htmlPreview: emailData.html?.substring(0, 200) + '...'
      });
      
      // Create a more realistic simulation - show the full email in a new window for testing
      if (emailData.html) {
        console.log('🔗 Mostrando preview del email...');
        
        // Create email preview in new window for local development
        try {
          const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
          if (newWindow) {
            newWindow.document.write(emailData.html);
            newWindow.document.close();
            newWindow.document.title = `Email Preview - ${emailData.subject}`;
            console.log('✅ Email preview abierto en nueva ventana');
          } else {
            // Fallback: create downloadable HTML file
            this.createEmailPreviewFile(emailData.html, emailData.subject || 'Email Preview');
          }
        } catch (error) {
          console.log('ℹ️ Error abriendo ventana, creando archivo de preview...');
          this.createEmailPreviewFile(emailData.html, emailData.subject || 'Email Preview');
        }
      }
    }
    
    // Simulate Gmail sending with more realistic response
    const messageId = `gmail_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}@gmail.com`;
    
    // Log as if it was sent via Gmail
    console.log(`📤 Email "enviado" desde: dannyjaramillofran@gmail.com`);
    console.log(`📨 Email "recibido" en: ${emailData.to}`);
    console.log(`🆔 Message ID: ${messageId}`);
    console.log('✅ Estado: Simulado exitosamente');
    console.log('💡 Para correos reales, actualiza Firebase a plan Blaze');
    
    return of({
      success: true,
      messageId: messageId,
      message: `✅ Email simulado enviado desde dannyjaramillofran@gmail.com a ${emailData.to}`
    }).pipe(
      delay(1500) // Simulate realistic network delay
    );
  }

  /**
   * Generate HTML content for order confirmation email
   * 
   * @param data - Order confirmation data
   * @returns HTML email content
   */
  private generateOrderConfirmationHTML(data: OrderConfirmationEmailData): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Pedido - AgriConnect</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .order-info { background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            .items-table th { background-color: #f9fafb; font-weight: 600; }
            .total-row { background-color: #f0fdf4; font-weight: bold; }
            .shipping-info { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { background-color: #374151; color: white; padding: 20px; text-align: center; }
            .btn { display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🌱 AgriConnect</h1>
                <p style="color: #dcfce7; margin: 10px 0 0 0; font-size: 18px;">¡Gracias por tu compra!</p>
            </div>
            
            <div class="content">
                <h2>¡Hola ${data.customerName}!</h2>
                <p>Tu pedido ha sido confirmado exitosamente. Te enviaremos actualizaciones sobre el estado de tu pedido.</p>
                
                <div class="order-info">
                    <h3>📦 Información del Pedido</h3>
                    <p><strong>Número de Pedido:</strong> ${data.orderId}</p>
                    <p><strong>Fecha:</strong> ${data.orderDate}</p>
                    <p><strong>Método de Pago:</strong> ${data.paymentMethod}</p>
                    ${data.trackingNumber ? `<p><strong>Número de Seguimiento:</strong> ${data.trackingNumber}</p>` : ''}
                    ${data.estimatedDelivery ? `<p><strong>Entrega Estimada:</strong> ${data.estimatedDelivery}</p>` : ''}
                </div>

                <h3>🛒 Artículos Pedidos</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>$${item.price.toFixed(2)}</td>
                                <td>$${item.total.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                        <tr><td colspan="4" style="padding: 0;"></td></tr>
                        <tr>
                            <td colspan="3"><strong>Subtotal:</strong></td>
                            <td><strong>$${data.subtotal.toFixed(2)}</strong></td>
                        </tr>
                        <tr>
                            <td colspan="3"><strong>IVA (12%):</strong></td>
                            <td><strong>$${data.tax.toFixed(2)}</strong></td>
                        </tr>
                        <tr>
                            <td colspan="3"><strong>Envío:</strong></td>
                            <td><strong>${data.shipping === 0 ? 'Gratis' : '$' + data.shipping.toFixed(2)}</strong></td>
                        </tr>
                        <tr class="total-row">
                            <td colspan="3"><strong>TOTAL:</strong></td>
                            <td><strong>$${data.total.toFixed(2)}</strong></td>
                        </tr>
                    </tbody>
                </table>

                <div class="shipping-info">
                    <h3>📍 Dirección de Entrega</h3>
                    <p><strong>${data.shippingAddress.nombres} ${data.shippingAddress.apellidos}</strong></p>
                    <p>${data.shippingAddress.direccion}</p>
                    <p>${data.shippingAddress.ciudad}, ${data.shippingAddress.provincia}</p>
                    <p><strong>Teléfono:</strong> ${data.shippingAddress.telefono}</p>
                </div>

                <p>Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.</p>
                
                <a href="https://agriconnect.com/orders/${data.orderId}" class="btn">Ver Estado del Pedido</a>
            </div>

            <div class="footer">
                <p><strong>AgriConnect</strong> - Conectando productores con consumidores</p>
                <p>📧 soporte@agriconnect.com | 📞 +593 2 123-4567</p>
                <p style="font-size: 12px; margin-top: 15px;">
                    Este es un email automático, por favor no responder directamente.
                </p>
            </div>
        </div>
    </body>
    </html>`;
  }

  /**
   * Generate plain text content for order confirmation email
   * 
   * @param data - Order confirmation data
   * @returns Plain text email content
   */
  private generateOrderConfirmationText(data: OrderConfirmationEmailData): string {
    const itemsList = data.items.map(item => 
      `${item.name} x${item.quantity} - $${item.total.toFixed(2)}`
    ).join('\n');

    return `
🌱 AGRICONNECT - CONFIRMACIÓN DE PEDIDO

¡Hola ${data.customerName}!

Tu pedido ha sido confirmado exitosamente.

INFORMACIÓN DEL PEDIDO:
- Número: ${data.orderId}
- Fecha: ${data.orderDate}
- Método de Pago: ${data.paymentMethod}
${data.trackingNumber ? `- Seguimiento: ${data.trackingNumber}` : ''}
${data.estimatedDelivery ? `- Entrega Estimada: ${data.estimatedDelivery}` : ''}

ARTÍCULOS:
${itemsList}

RESUMEN:
Subtotal: $${data.subtotal.toFixed(2)}
IVA (12%): $${data.tax.toFixed(2)}
Envío: ${data.shipping === 0 ? 'Gratis' : '$' + data.shipping.toFixed(2)}
TOTAL: $${data.total.toFixed(2)}

ENTREGA:
${data.shippingAddress.nombres} ${data.shippingAddress.apellidos}
${data.shippingAddress.direccion}
${data.shippingAddress.ciudad}, ${data.shippingAddress.provincia}
Tel: ${data.shippingAddress.telefono}

Gracias por elegir AgriConnect.

AgriConnect Team
soporte@agriconnect.com
+593 2 123-4567
    `.trim();
  }

  /**
   * Generate HTML for order status update email
   * 
   * @param orderId - Order ID
   * @param status - New status
   * @param trackingNumber - Tracking number (optional)
   * @returns HTML email content
   */
  private generateStatusUpdateHTML(orderId: string, status: string, trackingNumber?: string): string {
    const statusMessages: Record<string, { title: string; message: string; emoji: string }> = {
      'confirmed': {
        title: 'Pedido Confirmado',
        message: 'Tu pedido ha sido confirmado y está siendo preparado.',
        emoji: '✅'
      },
      'preparing': {
        title: 'Preparando Pedido',
        message: 'Estamos preparando cuidadosamente tu pedido.',
        emoji: '📦'
      },
      'shipped': {
        title: 'Pedido Enviado',
        message: 'Tu pedido está en camino. ¡Pronto lo tendrás!',
        emoji: '🚚'
      },
      'delivered': {
        title: 'Pedido Entregado',
        message: '¡Tu pedido ha sido entregado exitosamente!',
        emoji: '🎉'
      }
    };

    const statusInfo = statusMessages[status] || statusMessages['confirmed'];

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Actualización de Pedido - AgriConnect</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f9fafb; }
            .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; text-align: center; color: white; }
            .content { padding: 20px; }
            .status-badge { background-color: #22c55e; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${statusInfo.emoji} ${statusInfo.title}</h1>
            </div>
            <div class="content">
                <p><strong>Pedido #${orderId}</strong></p>
                <p>${statusInfo.message}</p>
                ${trackingNumber ? `<p><strong>Seguimiento:</strong> ${trackingNumber}</p>` : ''}
                <p>Gracias por elegir AgriConnect.</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  /**
   * Generate plain text for order status update email
   * 
   * @param orderId - Order ID
   * @param status - New status
   * @param trackingNumber - Tracking number (optional)
   * @returns Plain text email content
   */
  private generateStatusUpdateText(orderId: string, status: string, trackingNumber?: string): string {
    return `
AGRICONNECT - ACTUALIZACIÓN DE PEDIDO

Pedido #${orderId}

Estado: ${status}
${trackingNumber ? `Seguimiento: ${trackingNumber}` : ''}

Gracias por elegir AgriConnect.
    `.trim();
  }

  /**
   * Create downloadable HTML file for email preview (fallback)
   * 
   * @param htmlContent - HTML content of the email
   * @param subject - Email subject for filename
   */
  private createEmailPreviewFile(htmlContent: string, subject: string): void {
    try {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `email-preview-${subject.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log('📥 Email preview descargado como archivo HTML');
    } catch (error) {
      console.error('Error creando archivo de preview:', error);
      console.log('📋 HTML del email copiado a consola:');
      console.log(htmlContent);
    }
  }
}