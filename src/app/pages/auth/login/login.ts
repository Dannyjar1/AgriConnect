import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  login() {
    console.log('Login method called.');
    if (this.form.valid) {
      const { email, password } = this.form.getRawValue();
      // Using the null assertion operator '!' because form.valid ensures these are not null
      this.authService.login(email!, password!).subscribe({
        next: () => this.router.navigate(['/marketplace']),
        error: (err: any) => console.error('Login failed', err)
      });
    }
  }

  loginWithGoogle() {
    console.log('Login with Google method called.');
    this.authService.signInWithGoogle().subscribe({
      next: () => this.router.navigate(['/marketplace']),
      error: (err: any) => console.error('Google login failed', err)
    });
  }
}