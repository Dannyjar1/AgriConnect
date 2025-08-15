import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RoleSelectionModal } from '../../../shared/components/role-selection-modal/role-selection-modal';
import { take, timeout } from 'rxjs/operators';

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

    // Disable form controls during loading
    this.loginForm.disable();

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
      // Re-enable form controls
      this.loginForm.enable();
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

    // Disable form controls during Google login
    this.loginForm.disable();

    try {
      const result = await this.authService.loginWithGoogle().toPromise();
      console.log('Google login result:', result);

      if (result.isNewUser) {
        console.log('Nuevo usuario detectado, mostrando modal de selección de rol');
        // New user - show role selection modal
        const userInfo = {
          uid: result.user.uid,
          email: result.user.email!,
          displayName: result.user.displayName || '',
          photoURL: result.user.photoURL || ''
        };

        this.roleSelectionModal.openModal(userInfo);
      } else {
        console.log('Usuario existente - verificando documento en Firestore');

        // Verificar inmediatamente que el documento existe
        setTimeout(async () => {
          // Debug: verificar estado actual
          this.authService.debugCurrentUser();
          await this.authService.checkFirestoreDocument();

          // Reparar documento si es necesario
          await this.authService.repairCurrentUserDocument();
          
          console.log('Documento reparado, aplicando redirección');
          await this.authService.forceRedirectToUserDashboard();
        }, 1000);
      }

    } catch (error: any) {
      console.error('Error during Google login:', error);

      // Manejo de errores mejorado según la guía
      let errorMessage = this.handleAuthError(error);
      this.errorMessage.set(errorMessage);

    } finally {
      this.isGoogleLoading.set(false);
      // Re-enable form controls
      this.loginForm.enable();
    }
  }

  /**
   * Handle role selection from modal
   */
  protected async onRoleSelected(event: { role: 'buyer' | 'superadmin'; userInfo: any }): Promise<void> {
    try {
      console.log('Creando usuario con rol:', event.role);
      // Create user document with selected role
      await this.authService.createUserWithRole(event.userInfo, event.role).toPromise();

      console.log('Usuario creado exitosamente, redirigiendo...');
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
  private redirectBasedOnUserRole(userData?: any): void {
    console.log('Redirigiendo usuario con datos:', userData);

    if (userData && userData.userType) {
      // Si tenemos los datos del usuario directamente
      console.log('Usando datos directos del usuario:', userData.userType);
      this.redirectToRoleBasedDashboard(userData.userType);
    } else {
      // Fallback: obtener rol del servicio
      console.log('Obteniendo rol del servicio de autenticación');
      this.authService.getUserRole().pipe(
        take(1),
        timeout(5000)
      ).subscribe({
        next: (userRole) => {
          console.log('User role obtenido del servicio:', userRole);
          if (userRole) {
            this.redirectToRoleBasedDashboard(userRole);
          } else {
            console.log('No se encontró rol, usando auto-redirect');
            this.router.navigate(['/redirect']);
          }
        },
        error: (error) => {
          console.error('Error getting user role:', error);
          this.router.navigate(['/redirect']);
        }
      });
    }
  }

  /**
   * Redirect to role-based dashboard
   */
  private redirectToRoleBasedDashboard(role: 'buyer' | 'superadmin' | null): void {
    console.log('Redirigiendo usuario con rol:', role);

    switch (role) {
      case 'superadmin':
        console.log('Navegando a admin dashboard');
        this.router.navigate(['/admin/dashboard']).then(success => {
          console.log('Navegación a admin dashboard:', success ? 'exitosa' : 'falló');
        });
        break;
      case 'buyer':
        console.log('Navegando al marketplace para compradores');
        this.router.navigate(['/marketplace']).then(success => {
          console.log('Navegación a marketplace:', success ? 'exitosa' : 'falló');
        });
        break;
      default:
        console.log('Navegando a marketplace (default)');
        this.router.navigate(['/marketplace']).then(success => {
          console.log('Navegación a marketplace:', success ? 'exitosa' : 'falló');
        });
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

  /**
   * Check if the form is currently disabled
   */
  protected get isFormDisabled(): boolean {
    return this.loginForm.disabled;
  }

  /**
   * Manejo de errores de autenticación según la guía Firebase
   */
  private handleAuthError(error: any): string {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'Usuario no encontrado';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/user-disabled':
        return 'Usuario deshabilitado';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Intenta más tarde';
      case 'auth/popup-closed-by-user':
        return 'Inicio de sesión cancelado. La ventana fue cerrada.';
      case 'auth/popup-blocked':
        return 'Popup bloqueado por el navegador. Permite ventanas emergentes para este sitio.';
      case 'auth/cancelled-popup-request':
        return 'Solicitud de inicio de sesión cancelada.';
      case 'auth/network-request-failed':
        return 'Error de conexión. Verifica tu internet e intenta nuevamente.';
      case 'auth/account-exists-with-different-credential':
        return 'Ya existe una cuenta con este correo usando otro método de inicio de sesión.';
      case 'auth/credential-already-in-use':
        return 'Esta cuenta de Google ya está vinculada a otro usuario.';
      default:
        return error.message || 'Error de autenticación desconocido';
    }
  }

}