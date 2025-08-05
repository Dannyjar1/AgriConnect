import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register {
  email!: string;
  password!: string;
  confirmPassword!: string;
  passwordMismatch: boolean = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  async register() {
    if (this.password !== this.confirmPassword) {
      this.passwordMismatch = true;
      return;
    }
    this.passwordMismatch = false;

    try {
      await this.authService.register(this.email, this.password).toPromise();
      this.router.navigate(['/marketplace']); // Redirigir a /marketplace después de un registro exitoso
    } catch (error) {
      console.error('Error during registration:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  }
}