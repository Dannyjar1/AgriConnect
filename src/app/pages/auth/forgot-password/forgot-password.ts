import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss']
})
export class ForgotPassword {
  email!: string;
  message: string | null = null;
  isError: boolean = false;

  private authService = inject(AuthService);

  async requestPasswordReset() {
    if (!this.email) {
      this.isError = true;
      this.message = 'Por favor, ingresa tu correo electrónico.';
      return;
    }

    try {
      await this.authService.sendPasswordResetEmail(this.email).toPromise();
      this.isError = false;
      this.message = 'Se ha enviado un enlace de recuperación a tu correo.';
    } catch (error: any) {
      this.isError = true;
      switch (error.code) {
        case 'auth/user-not-found':
          this.message = 'No se encontró ningún usuario con este correo electrónico.';
          break;
        default:
          this.message = 'Ocurrió un error al enviar el correo. Inténtalo de nuevo.';
          break;
      }
    }
  }
}