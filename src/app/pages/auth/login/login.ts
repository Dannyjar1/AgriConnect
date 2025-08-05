import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'] // Vinculación correcta de la hoja de estilos.
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  async loginWithGoogle() {
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/marketplace']); // Redirigir a /marketplace después de un login exitoso
    } catch (error) {
      console.error('Error during Google login:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  }
}