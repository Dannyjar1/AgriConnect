import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register {
  // Form and state management
  protected readonly registerForm: FormGroup;
  protected readonly isLoading = signal<boolean>(false);
  protected readonly isGoogleLoading = signal<boolean>(false);
  protected readonly errorMessage = signal<string>('');

  // Services
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // User type options
  protected readonly userTypeOptions = [
    { value: 'producer', label: 'Productor' },
    { value: 'buyer', label: 'Comprador' }
  ] as const;

  constructor() {
    this.registerForm = this.fb.group({
      fullName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          this.nameValidator
        ]
      ],
      phone: [
        '',
        [
          Validators.required,
          this.ecuadorianPhoneValidator
        ]
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],
      userType: [
        '',
        [Validators.required]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          this.passwordStrengthValidator
        ]
      ],
      confirmPassword: [
        '',
        [Validators.required]
      ]
    }, {
      validators: [this.passwordMatchValidator]
    });
  }

  /**
   * Custom validator for names - only letters and spaces
   */
  private nameValidator(control: AbstractControl): ValidationErrors | null {
    const namePattern = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/;
    
    if (!control.value) {
      return null; // Let required validator handle empty values
    }

    if (!namePattern.test(control.value)) {
      return { invalidName: true };
    }

    // Check for multiple consecutive spaces
    if (/\s{2,}/.test(control.value)) {
      return { multipleSpaces: true };
    }

    // Check if starts or ends with space
    if (control.value.trim() !== control.value) {
      return { leadingTrailingSpaces: true };
    }

    return null;
  }

  /**
   * Custom validator for Ecuadorian phone numbers
   * Format: 10 digits starting with 09
   */
  private ecuadorianPhoneValidator(control: AbstractControl): ValidationErrors | null {
    const phonePattern = /^09\d{8}$/;
    
    if (!control.value) {
      return null; // Let required validator handle empty values
    }

    // Remove any non-digit characters for validation
    const cleanPhone = control.value.replace(/\D/g, '');

    if (!phonePattern.test(cleanPhone)) {
      return { invalidEcuadorianPhone: true };
    }

    return null;
  }

  /**
   * Custom validator for password strength
   * Must contain: uppercase, lowercase, number, and symbol
   */
  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    
    if (!password) {
      return null; // Let required validator handle empty values
    }

    const errors: ValidationErrors = {};

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors['noUppercase'] = true;
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
      errors['noLowercase'] = true;
    }

    // Check for number
    if (!/\d/.test(password)) {
      errors['noNumber'] = true;
    }

    // Check for special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors['noSymbol'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  /**
   * Custom validator to check if passwords match
   */
  private passwordMatchValidator(formGroup: AbstractControl): ValidationErrors | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null; // Don't validate if either field is empty
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  /**
   * Get form control for easy access in template
   */
  protected getControl(controlName: string): AbstractControl | null {
    return this.registerForm.get(controlName);
  }

  /**
   * Check if a field has a specific error
   */
  protected hasError(controlName: string, errorType: string): boolean {
    const control = this.getControl(controlName);
    return !!(control?.errors?.[errorType] && (control.dirty || control.touched));
  }

  /**
   * Check if form has password mismatch error
   */
  protected hasPasswordMismatch(): boolean {
    const form = this.registerForm;
    const confirmPasswordControl = this.getControl('confirmPassword');
    
    return !!(
      form.errors?.['passwordMismatch'] &&
      confirmPasswordControl?.dirty &&
      confirmPasswordControl?.value
    );
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
      case 'fullName':
        if (errors['required']) return 'El nombre completo es obligatorio';
        if (errors['minlength']) return 'El nombre debe tener al menos 2 caracteres';
        if (errors['invalidName']) return 'El nombre solo puede contener letras y espacios';
        if (errors['multipleSpaces']) return 'No se permiten espacios múltiples consecutivos';
        if (errors['leadingTrailingSpaces']) return 'El nombre no puede empezar o terminar con espacios';
        break;

      case 'phone':
        if (errors['required']) return 'El teléfono es obligatorio';
        if (errors['invalidEcuadorianPhone']) return 'Ingrese un teléfono válido (09xxxxxxxx)';
        break;

      case 'email':
        if (errors['required']) return 'El correo electrónico es obligatorio';
        if (errors['email']) return 'Ingrese un correo electrónico válido';
        break;

      case 'userType':
        if (errors['required']) return 'Debe seleccionar un tipo de usuario';
        break;

      case 'password':
        if (errors['required']) return 'La contraseña es obligatoria';
        if (errors['minlength']) return 'La contraseña debe tener al menos 8 caracteres';
        if (errors['noUppercase']) return 'La contraseña debe contener al menos una letra mayúscula';
        if (errors['noLowercase']) return 'La contraseña debe contener al menos una letra minúscula';
        if (errors['noNumber']) return 'La contraseña debe contener al menos un número';
        if (errors['noSymbol']) return 'La contraseña debe contener al menos un símbolo (!@#$%^&*(),.?":{}|<>)';
        break;

      case 'confirmPassword':
        if (errors['required']) return 'La confirmación de contraseña es obligatoria';
        break;
    }

    return '';
  }

  /**
   * Get password strength level for visual feedback
   */
  protected getPasswordStrength(): { level: number; label: string; color: string } {
    const passwordControl = this.getControl('password');
    const password = passwordControl?.value || '';
    
    if (!password) {
      return { level: 0, label: '', color: '' };
    }

    let score = 0;
    const checks = [
      /[A-Z]/.test(password), // uppercase
      /[a-z]/.test(password), // lowercase
      /\d/.test(password),    // number
      /[!@#$%^&*(),.?":{}|<>]/.test(password), // symbol
      password.length >= 8    // length
    ];

    score = checks.filter(Boolean).length;

    if (score < 2) {
      return { level: 1, label: 'Muy débil', color: 'bg-red-500' };
    } else if (score < 3) {
      return { level: 2, label: 'Débil', color: 'bg-orange-500' };
    } else if (score < 4) {
      return { level: 3, label: 'Media', color: 'bg-yellow-500' };
    } else if (score < 5) {
      return { level: 4, label: 'Fuerte', color: 'bg-blue-500' };
    } else {
      return { level: 5, label: 'Muy fuerte', color: 'bg-green-500' };
    }
  }

  /**
   * Handle form submission
   */
  protected async onSubmit(): Promise<void> {
    // Mark all fields as touched to show validation errors
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) {
      this.errorMessage.set('Por favor, corrija los errores en el formulario');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const formValue = this.registerForm.value;
      
      await this.authService.registerWithUserData(
        formValue.email, 
        formValue.password,
        {
          displayName: formValue.fullName,
          phone: formValue.phone,
          userType: formValue.userType
        }
      ).toPromise();
      
      // Registration successful - navigate to marketplace
      this.router.navigate(['/marketplace']);
      
    } catch (error: any) {
      console.error('Error during registration:', error);
      
      // Handle specific Firebase errors
      let errorMessage = 'Ocurrió un error durante el registro. Por favor, intenta nuevamente.';
      
      if (error?.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Este correo electrónico ya está registrado. ¿Quieres iniciar sesión?';
            break;
          case 'auth/weak-password':
            errorMessage = 'La contraseña es demasiado débil. Por favor, elige una más segura.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'El correo electrónico no es válido.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
            break;
          default:
            errorMessage = `Error: ${error.message}`;
        }
      }
      
      this.errorMessage.set(errorMessage);
      
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Format phone number for display (optional enhancement)
   */
  protected formatPhoneNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    
    // Limit to 10 digits
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    
    // Update form control value
    this.getControl('phone')?.setValue(value, { emitEvent: false });
    
    // Update display value with formatting (optional)
    if (value.length >= 2) {
      input.value = value.replace(/(\d{2})(\d{0,4})(\d{0,4})/, '$1 $2 $3').trim();
    }
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
   * Handle Google registration
   */
  protected async registerWithGoogle(): Promise<void> {
    // Prevent double submission
    if (this.isGoogleLoading()) return;
    
    this.isGoogleLoading.set(true);
    this.errorMessage.set('');
    
    try {
      await this.authService.registerWithGoogle().toPromise();
      this.router.navigate(['/marketplace']);
      
    } catch (error: any) {
      console.error('Error during Google registration:', error);
      
      let errorMessage = 'Error al registrarse con Google. Por favor, intenta nuevamente.';
      
      if (error?.code) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = 'Registro cancelado. La ventana fue cerrada.';
            break;
          case 'auth/popup-blocked':
            errorMessage = 'Popup bloqueado por el navegador. Permite ventanas emergentes para este sitio.';
            break;
          case 'auth/cancelled-popup-request':
            errorMessage = 'Solicitud de registro cancelada.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
            break;
          case 'auth/account-exists-with-different-credential':
            errorMessage = 'Ya existe una cuenta con este correo usando otro método de registro.';
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
}