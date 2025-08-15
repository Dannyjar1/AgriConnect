import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss']
})
export class ForgotPassword {
  // Form data using ngModel
  protected email: string = '';

  // State management using Angular 20 signals
  protected readonly isLoading = signal<boolean>(false);
  protected readonly message = signal<string>('');
  protected readonly messageType = signal<'success' | 'error' | ''>('');
  protected readonly isEmailSent = signal<boolean>(false);

  // Services
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /**
   * Validate email format
   */
  protected isEmailValid(): boolean {
    if (!this.email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  /**
   * Check if email field has been touched and is invalid
   */
  protected showEmailError(): boolean {
    return this.email.length > 0 && !this.isEmailValid();
  }

  /**
   * Get appropriate error message for email field
   */
  protected getEmailErrorMessage(): string {
    if (!this.email) {
      return 'El correo electrónico es obligatorio';
    }
    if (!this.isEmailValid()) {
      return 'Ingrese un correo electrónico válido';
    }
    return '';
  }

  /**
   * Main function to request password reset
   */
  protected async requestPasswordReset(): Promise<void> {
    // Validate email first
    if (!this.email) {
      this.setMessage('Por favor, ingresa tu correo electrónico', 'error');
      return;
    }

    if (!this.isEmailValid()) {
      this.setMessage('Por favor, ingresa un correo electrónico válido', 'error');
      return;
    }

    // Prevent double submission
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.clearMessage();

    try {
      await this.authService.sendPasswordResetEmail(this.email).toPromise();
      
      // Success state
      this.isEmailSent.set(true);
      this.setMessage(
        `Se ha enviado un enlace de recuperación a ${this.email}. Revisa tu bandeja de entrada y carpeta de spam.`,
        'success'
      );

      // Analytics tracking
      if (typeof gtag !== 'undefined') {
        gtag('event', 'password_reset_requested', {
          event_category: 'auth',
          event_label: 'forgot_password_form'
        });
      }

    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      
      let errorMessage = 'Ocurrió un error al enviar el correo. Por favor, intenta nuevamente.';
      
      if (error?.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'No se encontró una cuenta con este correo electrónico. Verifica que esté escrito correctamente.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'El formato del correo electrónico no es válido.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Demasiadas solicitudes. Espera un momento antes de intentar nuevamente.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }
      
      this.setMessage(errorMessage, 'error');
      
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Set message with type
   */
  private setMessage(msg: string, type: 'success' | 'error'): void {
    this.message.set(msg);
    this.messageType.set(type);
  }

  /**
   * Clear message
   */
  private clearMessage(): void {
    this.message.set('');
    this.messageType.set('');
  }

  /**
   * Clear error message when user starts typing
   */
  protected clearErrorMessage(): void {
    if (this.messageType() === 'error') {
      this.clearMessage();
    }
  }

  /**
   * Navigate back to login
   */
  protected goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Navigate to register page
   */
  protected goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  /**
   * Reset form to send another email
   */
  protected sendAnotherEmail(): void {
    this.isEmailSent.set(false);
    this.email = '';
    this.clearMessage();
  }

  /**
   * Check if form is ready to submit
   */
  protected canSubmit(): boolean {
    return this.email.length > 0 && this.isEmailValid() && !this.isLoading();
  }
}