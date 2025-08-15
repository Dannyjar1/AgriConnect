import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RoleSelectionModal } from '../../../shared/components/role-selection-modal/role-selection-modal';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, RoleSelectionModal],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login implements OnInit {
  // Form and state management
  protected readonly loginForm: FormGroup;
  protected readonly isLoading = signal<boolean>(false);
  protected readonly isGoogleLoading = signal<boolean>(false);
  protected readonly errorMessage = signal<string>('');
  protected readonly showSuccessMessage = signal<boolean>(false);

  // Services
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  // ViewChild reference for role selection modal
  @ViewChild(RoleSelectionModal) roleSelectionModal!: RoleSelectionModal;

  constructor() {
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8)
        ]
      ]
    });
  }

  ngOnInit(): void {
    // Detectar el parámetro success=true en la URL
    this.route.queryParams.subscribe(params => {
      if (params['success'] === 'true') {
        this.showSuccessMessage.set(true);
        
        // Ocultar el mensaje después de 3 segundos
        setTimeout(() => {
          this.showSuccessMessage.set(false);
        }, 3000);
      }
    });
  }

  /**
   * Get form control for easy access in template
   */
  protected getControl(controlName: string): AbstractControl | null {
    return this.loginForm.get(controlName);
  }

  /**
   * Check if a field has a specific error
   */
  protected hasError(controlName: string, errorType: string): boolean {
    const control = this.getControl(controlName);
    return !!(control?.errors?.[errorType] && (control.dirty || control.touched));
  }

  /**
   * Check if a specific field is valid
   */
  protected isFieldValid(controlName: string): boolean {
    const control = this.getControl(controlName);
    return !!(control?.valid && (control.dirty || control.touched));
  }

  /**
   * Check if a specific field is invalid
   */
  protected isFieldInvalid(controlName: string): boolean {
    const control = this.getControl(controlName);
    return !!(control?.invalid && (control.dirty || control.touched));
  }

  /**
   * Get appropriate error message for a field
   */
  protected getErrorMessage(controlName: string): string {
    const control = this.getControl(controlName);
    
    if (!control?.errors || (!control.dirty && !control.touched)) {
      return '';
    }

    const errors = control.errors;

    switch (controlName) {
      case 'email':
        if (errors['required']) return 'El correo electrónico es obligatorio';
        if (errors['email']) return 'Ingrese un correo electrónico válido';
        break;

      case 'password':
        if (errors['required']) return 'La contraseña es obligatoria';
        if (errors['minlength']) return 'La contraseña debe tener al menos 8 caracteres';
        break;
    }

    return '';
  }

  /**
   * Handle form submission
   */
  protected async onSubmit(): Promise<void> {
    // Mark all fields as touched to show validation errors
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      this.errorMessage.set('Por favor, corrija los errores en el formulario');
      return;
    }

    // Prevent double submission
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const formValue = this.loginForm.value;
      
      // Use the AuthService login method
      await this.authService.login(formValue.email, formValue.password).toPromise();
      
      // Login successful - redirect based on user role
      this.redirectBasedOnUserRole();
      
    } catch (error: any) {
      console.error('Error during login:', error);
      
      // Handle specific Firebase authentication errors
      let errorMessage = 'Ocurrió un error durante el inicio de sesión. Por favor, intenta nuevamente.';
      
      if (error?.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'No existe una cuenta con este correo electrónico. ¿Quieres crear una cuenta?';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Contraseña incorrecta. Por favor, verifica tus credenciales.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'El formato del correo electrónico no es válido.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'Esta cuenta ha sido deshabilitada. Contacta al soporte técnico.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Demasiados intentos fallidos. Tu cuenta ha sido temporalmente bloqueada. Intenta más tarde.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
            break;
          case 'auth/invalid-credential':
            errorMessage = 'Credenciales inválidas. Verifica tu correo y contraseña.';
            break;
          case 'auth/account-exists-with-different-credential':
            errorMessage = 'Ya existe una cuenta con este correo usando otro método de inicio de sesión.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'El inicio de sesión con correo y contraseña no está habilitado.';
            break;
          case 'auth/weak-password':
            errorMessage = 'La contraseña es demasiado débil.';
            break;
          default:
            // For development, show the actual error message
            errorMessage = error.message || errorMessage;
        }
      }
      
      this.errorMessage.set(errorMessage);
      
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Handle Google login
   */
  protected async loginWithGoogle(): Promise<void> {
    // Prevent double submission
    if (this.isGoogleLoading()) return;
    
    this.isGoogleLoading.set(true);
    this.errorMessage.set('');
    
    try {
      const result = await this.authService.loginWithGoogle().toPromise();
      
      if (result.isNewUser) {
        // New user - show role selection modal
        const userInfo = {
          uid: result.user.uid,
          email: result.user.email!,
          displayName: result.user.displayName || '',
          photoURL: result.user.photoURL || ''
        };
        
        this.roleSelectionModal.openModal(userInfo);
      } else {
        // Existing user - redirect based on their role
        this.redirectBasedOnUserRole();
      }
      
    } catch (error: any) {
      console.error('Error during Google login:', error);
      
      let errorMessage = 'Error al iniciar sesión con Google. Por favor, intenta nuevamente.';
      
      if (error?.code) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = 'Inicio de sesión cancelado. La ventana fue cerrada.';
            break;
          case 'auth/popup-blocked':
            errorMessage = 'Popup bloqueado por el navegador. Permite ventanas emergentes para este sitio.';
            break;
          case 'auth/cancelled-popup-request':
            errorMessage = 'Solicitud de inicio de sesión cancelada.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
            break;
          case 'auth/account-exists-with-different-credential':
            errorMessage = 'Ya existe una cuenta con este correo usando otro método de inicio de sesión.';
            break;
          case 'auth/credential-already-in-use':
            errorMessage = 'Esta cuenta de Google ya está vinculada a otro usuario.';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }
      
      this.errorMessage.set(errorMessage);
      
    } finally {
      this.isGoogleLoading.set(false);
    }
  }

  /**
   * Handle role selection from modal
   */
  protected async onRoleSelected(event: { role: 'buyer' | 'producer'; userInfo: any }): Promise<void> {
    try {
      // Create user document with selected role
      await this.authService.createUserWithRole(event.userInfo, event.role).toPromise();
      
      // Redirect based on selected role
      this.redirectToRoleBasedDashboard(event.role);
      
    } catch (error) {
      console.error('Error creating user with role:', error);
      this.errorMessage.set('Error al configurar tu perfil. Por favor, intenta nuevamente.');
    }
  }

  /**
   * Handle modal close
   */
  protected onModalClosed(): void {
    // If modal is closed without role selection, sign out the user
    this.authService.logout().subscribe();
  }

  /**
   * Redirect user based on their role
   */
  private async redirectBasedOnUserRole(): Promise<void> {
    try {
      const userRole = await this.authService.getUserRole().toPromise();
      this.redirectToRoleBasedDashboard(userRole || null);
    } catch (error) {
      console.error('Error getting user role:', error);
      this.router.navigate(['/marketplace']);
    }
  }

  /**
   * Redirect to role-based dashboard
   */
  private redirectToRoleBasedDashboard(role: 'buyer' | 'producer' | 'institutional' | null): void {
    switch (role) {
      case 'producer':
        this.router.navigate(['/producer/dashboard']);
        break;
      case 'buyer':
        this.router.navigate(['/buyer/dashboard']);
        break;
      case 'institutional':
        this.router.navigate(['/buyer/dashboard']); // Institutional users use buyer dashboard
        break;
      default:
        this.router.navigate(['/marketplace']);
        break;
    }
  }

  /**
   * Navigate to forgot password page
   */
  protected goToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  /**
   * Navigate to register page
   */
  protected goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  /**
   * Clear error message when user starts typing
   */
  protected clearErrorMessage(): void {
    if (this.errorMessage()) {
      this.errorMessage.set('');
    }
  }

  /**
   * Check if the form is valid and ready to submit
   */
  protected get isFormValid(): boolean {
    return this.loginForm.valid;
  }

  /**
   * Check if the form is invalid and has been touched
   */
  protected get isFormInvalid(): boolean {
    return this.loginForm.invalid && (this.loginForm.dirty || this.loginForm.touched);
  }

  /**
   * Get email form control for easier access in template
   */
  protected get emailControl(): AbstractControl | null {
    return this.getControl('email');
  }

  /**
   * Get password form control for easier access in template
   */
  protected get passwordControl(): AbstractControl | null {
    return this.getControl('password');
  }

}