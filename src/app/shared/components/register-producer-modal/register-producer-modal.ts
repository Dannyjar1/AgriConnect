import { Component, EventEmitter, Output, Input, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProducerService } from '../../../core/services/producer.service';
import { Producer } from '../../../core/models/user.model';

@Component({
    selector: 'app-register-producer-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
         (click)="onBackdropClick($event)">
      
      <!-- Modal Container -->
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto" 
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 p-8 text-white">
          <!-- Close Button -->
          <button (click)="closeModal()" 
                  class="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          <!-- Header Content -->
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div>
              <h2 class="text-3xl font-bold tracking-tight">
                {{ editingProducer ? 'Editar Productor' : 'Registrar Nuevo Productor' }}
              </h2>
              <p class="text-green-100 mt-1">
                {{ editingProducer ? 'Actualiza la información del productor' : 'Agrega un nuevo productor al sistema' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Form Content -->
        <div class="p-8">
          <form [formGroup]="producerForm" (ngSubmit)="onSubmit()">
            
            <!-- Personal Information Section -->
            <div class="mb-8">
              <div class="flex items-center mb-6">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-800">Información Personal</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Nombre -->
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    formControlName="name"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                    placeholder="Ingrese el nombre completo del productor"
                    [class.border-red-300]="isFieldInvalid('name')"
                    [class.bg-red-50]="isFieldInvalid('name')"
                  >
                  @if (isFieldInvalid('name')) {
                    <p class="text-red-600 text-sm mt-1 flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                      </svg>
                      {{ getErrorMessage('name') }}
                    </p>
                  }
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                    </svg>
                    Email (Opcional)
                  </label>
                  <input
                    type="email"
                    formControlName="email"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                    placeholder="correo@ejemplo.com"
                    [class.border-red-300]="isFieldInvalid('email')"
                    [class.bg-red-50]="isFieldInvalid('email')"
                  >
                  @if (isFieldInvalid('email')) {
                    <p class="text-red-600 text-sm mt-1 flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                      </svg>
                      {{ getErrorMessage('email') }}
                    </p>
                  }
                </div>

                <!-- Teléfono -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    formControlName="phone"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                    placeholder="09xxxxxxxx"
                    [class.border-red-300]="isFieldInvalid('phone')"
                    [class.bg-red-50]="isFieldInvalid('phone')"
                  >
                  @if (isFieldInvalid('phone')) {
                    <p class="text-red-600 text-sm mt-1 flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                      </svg>
                      {{ getErrorMessage('phone') }}
                    </p>
                  }
                </div>
              </div>
            </div>

            <!-- Location Section -->
            <div class="mb-8">
              <div class="flex items-center mb-6">
                <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-800">Ubicación</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Dirección -->
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    Dirección Completa *
                  </label>
                  <textarea
                    formControlName="address"
                    rows="3"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Dirección completa del productor (calle, número, sector, etc.)"
                    [class.border-red-300]="isFieldInvalid('address')"
                    [class.bg-red-50]="isFieldInvalid('address')"
                  ></textarea>
                  @if (isFieldInvalid('address')) {
                    <p class="text-red-600 text-sm mt-1 flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                      </svg>
                      {{ getErrorMessage('address') }}
                    </p>
                  }
                </div>

                <!-- Provincia -->
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                    </svg>
                    Provincia *
                  </label>
                  <select
                    formControlName="province"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                    [class.border-red-300]="isFieldInvalid('province')"
                    [class.bg-red-50]="isFieldInvalid('province')"
                  >
                    <option value="">Seleccione una provincia</option>
                    @for (province of provinces; track province) {
                      <option [value]="province">{{ province }}</option>
                    }
                  </select>
                  @if (isFieldInvalid('province')) {
                    <p class="text-red-600 text-sm mt-1 flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                      </svg>
                      {{ getErrorMessage('province') }}
                    </p>
                  }
                </div>
              </div>
            </div>

            <!-- Certifications Section -->
            <div class="mb-8">
              <div class="flex items-center mb-6">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-800">Certificaciones</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                @for (cert of availableCertifications; track cert) {
                  <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      [value]="cert"
                      (change)="onCertificationChange(cert, $event)"
                      class="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                      [checked]="selectedCertifications.includes(cert)"
                    >
                    <span class="ml-3 text-sm font-medium text-gray-700">{{ cert }}</span>
                  </label>
                }
              </div>
            </div>

            <!-- Error Message -->
            @if (errorMessage()) {
              <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                  </svg>
                  <p class="text-red-800 text-sm font-medium">{{ errorMessage() }}</p>
                </div>
              </div>
            }

            <!-- Action Buttons -->
            <div class="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                (click)="closeModal()"
                class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                [disabled]="isLoading()"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-200 font-medium transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                [disabled]="producerForm.invalid || isLoading()"
              >
                <div class="flex items-center justify-center">
                  @if (isLoading()) {
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  } @else {
                    @if (editingProducer) {
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                      Actualizar Productor
                    } @else {
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      Registrar Productor
                    }
                  }
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class RegisterProducerModal implements OnInit {
    @Input() editingProducer: Producer | null = null;
    @Output() onClose = new EventEmitter<void>();
    @Output() onProducerRegistered = new EventEmitter<Producer>();

    private fb = inject(FormBuilder);
    private producerService = inject(ProducerService);

    readonly isLoading = signal<boolean>(false);
    readonly errorMessage = signal<string>('');

    readonly provinces = [
        'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi',
        'El Oro', 'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja',
        'Los Ríos', 'Manabí', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza',
        'Pichincha', 'Santa Elena', 'Santo Domingo', 'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe'
    ];

    readonly availableCertifications = [
        'ORGÁNICO', 'Fair Trade', 'GlobalGAP', 'Rainforest Alliance',
        'Artesanal', 'Pastoreo Libre', 'Sin Aditivos', 'Comercio Justo'
    ];

    selectedCertifications: string[] = [];

    producerForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^09\d{8}$/)]],
        address: ['', [Validators.required, Validators.minLength(10)]],
        province: ['', [Validators.required]]
    });

    ngOnInit(): void {
        if (this.editingProducer) {
            this.populateForm();
        }
    }

    private populateForm(): void {
        if (!this.editingProducer) return;

        this.producerForm.patchValue({
            name: this.editingProducer.name,
            email: this.editingProducer.email || '',
            phone: this.editingProducer.phone || '',
            address: this.editingProducer.address,
            province: this.editingProducer.province || ''
        });

        this.selectedCertifications = [...(this.editingProducer.certifications || [])];
    }

    onCertificationChange(certification: string, event: any): void {
        if (event.target.checked) {
            this.selectedCertifications.push(certification);
        } else {
            this.selectedCertifications = this.selectedCertifications.filter(c => c !== certification);
        }
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.producerForm.get(fieldName);
        return !!(field?.invalid && (field.dirty || field.touched));
    }

    getErrorMessage(fieldName: string): string {
        const field = this.producerForm.get(fieldName);
        if (!field?.errors) return '';

        if (field.errors['required']) return `${fieldName} es obligatorio`;
        if (field.errors['email']) return 'Email inválido';
        if (field.errors['pattern']) return 'Formato de teléfono inválido (09xxxxxxxx)';
        if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;

        return 'Campo inválido';
    }

    onBackdropClick(event: Event): void {
        if (event.target === event.currentTarget) {
            this.closeModal();
        }
    }

    closeModal(): void {
        this.onClose.emit();
    }

    async onSubmit(): Promise<void> {
        if (this.producerForm.invalid) return;

        this.isLoading.set(true);
        this.errorMessage.set('');

        try {
            const formValue = this.producerForm.value;
            const producerData = {
                name: formValue.name!,
                email: formValue.email || undefined,
                phone: formValue.phone!,
                address: formValue.address!,
                province: formValue.province!,
                certifications: this.selectedCertifications,
                isActive: this.editingProducer?.isActive ?? true
            };

            let result: Producer;

            if (this.editingProducer) {
                // Update existing producer
                await this.producerService.updateProducer(this.editingProducer.id, producerData);
                result = {
                    ...this.editingProducer,
                    ...producerData
                };
            } else {
                // Create new producer
                const producerId = await this.producerService.createProducer(producerData).toPromise();
                result = {
                    id: producerId!,
                    ...producerData,
                    registeredBy: '', // Se llenará en el servicio
                    registeredAt: new Date(),
                    isActive: true
                };
            }

            this.onProducerRegistered.emit(result);
        } catch (error: any) {
            console.error('Error procesando productor:', error);
            this.errorMessage.set(error.message || 'Error al procesar el productor');
        } finally {
            this.isLoading.set(false);
        }
    }
}