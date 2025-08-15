import { Component, signal, computed, inject, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';

/**
 * Billing Modal Component - Post-checkout billing information management
 * 
 * Features:
 * - Different billing person option
 * - OpenStreetMap integration for address search
 * - Coordinates display and mapping
 * - Saved addresses management
 * - Ecuador-specific address validation
 * - Responsive design with TailwindCSS v4
 * 
 * @author AgriConnect Team
 * @version 1.0.0
 */

interface AddressSearchResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

interface SavedAddress {
  id: string;
  name: string;
  fullAddress: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  isDefault: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-billing-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  template: `
    <!-- Modal Backdrop -->
    @if (isOpen()) {
      <div 
        class="fixed inset-0 z-50 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="billing-title"
        (keydown.escape)="closeModal()">
        
        <!-- Semi-transparent backdrop -->
        <div 
          class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300"
          (click)="closeModal()"
          aria-hidden="true">
        </div>
        
        <!-- Modal Panel -->
        <div class="fixed inset-0 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            
            <!-- Modal Header -->
            <header class="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 rounded-t-2xl z-10">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-agri-green-500 to-agri-green-600 rounded-xl flex items-center justify-center">
                    <span class="material-icons text-white text-xl">receipt_long</span>
                  </div>
                  <h1 id="billing-title" class="text-2xl font-bold text-gray-900 font-epilogue">
                    Información de Facturación
                  </h1>
                </div>
                <button
                  (click)="closeModal()"
                  class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                  aria-label="Cerrar modal de facturación">
                  <span class="material-icons text-xl">close</span>
                </button>
              </div>
            </header>
            
            <!-- Modal Content -->
            <main class="p-6">
              <form [formGroup]="billingForm" (ngSubmit)="onSubmit()" novalidate>
                
                <!-- Billing Person Toggle -->
                <section class="mb-8">
                  <div class="bg-agri-green-50 rounded-xl p-6 border border-agri-green-100">
                    <h2 class="text-lg font-semibold text-gray-900 font-epilogue mb-4 flex items-center">
                      <span class="material-icons text-agri-green-600 mr-2">person</span>
                      Datos de Facturación
                    </h2>
                    
                    <div class="space-y-4">
                      <label class="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          formControlName="differentBillingPerson"
                          class="mt-1 w-4 h-4 text-agri-green-600 border-gray-300 rounded focus:ring-agri-green-500">
                        <div>
                          <div class="font-medium text-gray-900">Facturar a nombre de otra persona</div>
                          <div class="text-sm text-gray-600">Los datos de facturación serán diferentes a los de envío</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </section>
                
                <!-- Billing Information Section -->
                @if (billingForm.get('differentBillingPerson')?.value) {
                  <section class="mb-8">
                    <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <h3 class="text-lg font-semibold text-gray-900 font-epilogue mb-6 flex items-center">
                        <span class="material-icons text-agri-green-600 mr-2">badge</span>
                        Datos del Responsable de Facturación
                      </h3>
                      
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <!-- Name Fields -->
                        <div class="space-y-2">
                          <label for="billingNames" class="block text-sm font-medium text-gray-700">
                            Nombres *
                          </label>
                          <input
                            id="billingNames"
                            type="text"
                            formControlName="billingNames"
                            class="input-field"
                            [class.border-red-500]="isFieldInvalid('billingNames')"
                            placeholder="Nombres completos">
                          @if (isFieldInvalid('billingNames')) {
                            <div class="text-sm text-red-600 flex items-center space-x-1">
                              <span class="material-icons text-sm">error</span>
                              <span>Los nombres son requeridos</span>
                            </div>
                          }
                        </div>
                        
                        <div class="space-y-2">
                          <label for="billingLastNames" class="block text-sm font-medium text-gray-700">
                            Apellidos *
                          </label>
                          <input
                            id="billingLastNames"
                            type="text"
                            formControlName="billingLastNames"
                            class="input-field"
                            [class.border-red-500]="isFieldInvalid('billingLastNames')"
                            placeholder="Apellidos completos">
                          @if (isFieldInvalid('billingLastNames')) {
                            <div class="text-sm text-red-600 flex items-center space-x-1">
                              <span class="material-icons text-sm">error</span>
                              <span>Los apellidos son requeridos</span>
                            </div>
                          }
                        </div>
                        
                        <!-- Document Fields -->
                        <div class="space-y-2">
                          <label for="billingDocumentType" class="block text-sm font-medium text-gray-700">
                            Tipo de Documento *
                          </label>
                          <select
                            id="billingDocumentType"
                            formControlName="billingDocumentType"
                            class="input-field"
                            [class.border-red-500]="isFieldInvalid('billingDocumentType')">
                            <option value="">Seleccionar tipo</option>
                            <option value="cedula">Cédula de Identidad</option>
                            <option value="ruc">RUC</option>
                            <option value="pasaporte">Pasaporte</option>
                          </select>
                          @if (isFieldInvalid('billingDocumentType')) {
                            <div class="text-sm text-red-600 flex items-center space-x-1">
                              <span class="material-icons text-sm">error</span>
                              <span>Selecciona el tipo de documento</span>
                            </div>
                          }
                        </div>
                        
                        <div class="space-y-2">
                          <label for="billingDocumentNumber" class="block text-sm font-medium text-gray-700">
                            Número de Documento *
                          </label>
                          <input
                            id="billingDocumentNumber"
                            type="text"
                            formControlName="billingDocumentNumber"
                            class="input-field"
                            [class.border-red-500]="isFieldInvalid('billingDocumentNumber')"
                            [placeholder]="getDocumentPlaceholder()">
                          @if (isFieldInvalid('billingDocumentNumber')) {
                            <div class="text-sm text-red-600 flex items-center space-x-1">
                              <span class="material-icons text-sm">error</span>
                              <span>{{ getDocumentErrorMessage() }}</span>
                            </div>
                          }
                        </div>
                        
                        <!-- Contact Fields -->
                        <div class="space-y-2">
                          <label for="billingEmail" class="block text-sm font-medium text-gray-700">
                            Correo Electrónico *
                          </label>
                          <input
                            id="billingEmail"
                            type="email"
                            formControlName="billingEmail"
                            class="input-field"
                            [class.border-red-500]="isFieldInvalid('billingEmail')"
                            placeholder="correo@ejemplo.com">
                          @if (isFieldInvalid('billingEmail')) {
                            <div class="text-sm text-red-600 flex items-center space-x-1">
                              <span class="material-icons text-sm">error</span>
                              <span>Ingresa un correo válido</span>
                            </div>
                          }
                        </div>
                        
                        <div class="space-y-2">
                          <label for="billingPhone" class="block text-sm font-medium text-gray-700">
                            Teléfono *
                          </label>
                          <input
                            id="billingPhone"
                            type="tel"
                            formControlName="billingPhone"
                            class="input-field"
                            [class.border-red-500]="isFieldInvalid('billingPhone')"
                            placeholder="0999123456">
                          @if (isFieldInvalid('billingPhone')) {
                            <div class="text-sm text-red-600 flex items-center space-x-1">
                              <span class="material-icons text-sm">error</span>
                              <span>Teléfono inválido (10 dígitos)</span>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  </section>
                }
                
                <!-- Address Section with OpenStreetMap Integration -->
                <section class="mb-8">
                  <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 class="text-lg font-semibold text-gray-900 font-epilogue mb-6 flex items-center">
                      <span class="material-icons text-agri-green-600 mr-2">location_on</span>
                      Dirección de Facturación
                    </h3>
                    
                    <!-- Saved Addresses -->
                    @if (savedAddresses().length > 0) {
                      <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          Direcciones Guardadas
                        </label>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          @for (address of savedAddresses(); track address.id) {
                            <label class="cursor-pointer">
                              <input
                                type="radio"
                                name="savedAddress"
                                [value]="address.id"
                                (change)="selectSavedAddress(address)"
                                class="sr-only">
                              <div class="border rounded-lg p-4 hover:border-agri-green-500 transition-colors"
                                   [class.border-agri-green-500]="selectedSavedAddressId() === address.id"
                                   [class.bg-agri-green-50]="selectedSavedAddressId() === address.id">
                                <div class="flex items-start justify-between">
                                  <div class="flex-1">
                                    <div class="font-medium text-gray-900">{{ address.name }}</div>
                                    <div class="text-sm text-gray-600 mt-1">{{ address.fullAddress }}</div>
                                    <div class="text-xs text-gray-500 mt-2 flex items-center space-x-1">
                                      <span class="material-icons text-xs">place</span>
                                      <span>{{ address.coordinates.lat }}, {{ address.coordinates.lon }}</span>
                                    </div>
                                  </div>
                                  @if (address.isDefault) {
                                    <span class="bg-agri-green-100 text-agri-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                      Por defecto
                                    </span>
                                  }
                                </div>
                                <div class="mt-3 flex space-x-2">
                                  <button
                                    type="button"
                                    (click)="openMapForAddress(address)"
                                    class="text-xs text-agri-green-600 hover:text-agri-green-700 flex items-center space-x-1">
                                    <span class="material-icons text-xs">map</span>
                                    <span>Ver en mapa</span>
                                  </button>
                                  <button
                                    type="button"
                                    (click)="deleteAddress(address.id)"
                                    class="text-xs text-red-600 hover:text-red-700 flex items-center space-x-1">
                                    <span class="material-icons text-xs">delete</span>
                                    <span>Eliminar</span>
                                  </button>
                                </div>
                              </div>
                            </label>
                          }
                        </div>
                      </div>
                    }
                    
                    <!-- Address Search -->
                    <div class="space-y-4">
                      <div class="space-y-2">
                        <label for="addressSearch" class="block text-sm font-medium text-gray-700">
                          Buscar Dirección
                        </label>
                        <div class="relative">
                          <input
                            id="addressSearch"
                            type="text"
                            formControlName="addressSearch"
                            (input)="onAddressSearch($event)"
                            class="input-field pr-10"
                            placeholder="Ingresa una dirección para buscar...">
                          <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                            @if (isSearching()) {
                              <div class="animate-spin w-4 h-4 border-2 border-agri-green-600 border-t-transparent rounded-full"></div>
                            } @else {
                              <span class="material-icons text-gray-400">search</span>
                            }
                          </div>
                        </div>
                      </div>
                      
                      <!-- Search Results -->
                      @if (searchResults().length > 0) {
                        <div class="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                          @for (result of searchResults(); track result.display_name) {
                            <button
                              type="button"
                              (click)="selectSearchResult(result)"
                              class="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors">
                              <div class="font-medium text-gray-900">{{ result.display_name }}</div>
                              <div class="text-sm text-gray-600 mt-1 flex items-center space-x-1">
                                <span class="material-icons text-xs">place</span>
                                <span>{{ result.lat }}, {{ result.lon }}</span>
                              </div>
                            </button>
                          }
                        </div>
                      }
                      
                      <!-- Manual Address Input -->
                      <div class="space-y-4">
                        <div class="space-y-2">
                          <label for="billingAddress" class="block text-sm font-medium text-gray-700">
                            Dirección Completa *
                          </label>
                          <textarea
                            id="billingAddress"
                            formControlName="billingAddress"
                            rows="3"
                            class="input-field resize-none"
                            [class.border-red-500]="isFieldInvalid('billingAddress')"
                            placeholder="Calle principal, número, sector, referencias..."></textarea>
                          @if (isFieldInvalid('billingAddress')) {
                            <div class="text-sm text-red-600 flex items-center space-x-1">
                              <span class="material-icons text-sm">error</span>
                              <span>La dirección es requerida</span>
                            </div>
                          }
                        </div>
                        
                        <!-- Coordinates Display -->
                        @if (selectedCoordinates()) {
                          <div class="bg-agri-green-50 rounded-lg p-4 border border-agri-green-100">
                            <div class="flex items-center justify-between">
                              <div>
                                <div class="font-medium text-gray-900 flex items-center space-x-2">
                                  <span class="material-icons text-agri-green-600">place</span>
                                  <span>Coordenadas Seleccionadas</span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">
                                  Latitud: {{ selectedCoordinates()!.lat }}<br>
                                  Longitud: {{ selectedCoordinates()!.lon }}
                                </div>
                              </div>
                              <div class="flex space-x-2">
                                <button
                                  type="button"
                                  (click)="openMap()"
                                  class="bg-agri-green-600 hover:bg-agri-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-1 transition-colors">
                                  <span class="material-icons text-sm">map</span>
                                  <span>Ver Mapa</span>
                                </button>
                                <button
                                  type="button"
                                  (click)="clearCoordinates()"
                                  class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm flex items-center space-x-1 transition-colors">
                                  <span class="material-icons text-sm">clear</span>
                                  <span>Limpiar</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        }
                        
                        <!-- Save Address Option -->
                        <div class="flex items-center space-x-3">
                          <input
                            id="saveAddress"
                            type="checkbox"
                            formControlName="saveAddress"
                            class="w-4 h-4 text-agri-green-600 border-gray-300 rounded focus:ring-agri-green-500">
                          <label for="saveAddress" class="text-sm text-gray-700">
                            Guardar esta dirección para futuros pedidos
                          </label>
                        </div>
                        
                        @if (billingForm.get('saveAddress')?.value) {
                          <div class="space-y-2">
                            <label for="addressName" class="block text-sm font-medium text-gray-700">
                              Nombre para la dirección
                            </label>
                            <input
                              id="addressName"
                              type="text"
                              formControlName="addressName"
                              class="input-field"
                              placeholder="Casa, Oficina, etc.">
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </section>
                
                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                  <button
                    type="button"
                    (click)="closeModal()"
                    class="btn-secondary">
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    [disabled]="billingForm.invalid || isProcessing()"
                    class="btn-primary flex items-center space-x-2"
                    [class.opacity-50]="billingForm.invalid || isProcessing()">
                    @if (isProcessing()) {
                      <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    } @else {
                      <span class="material-icons text-lg">save</span>
                    }
                    <span>{{ isProcessing() ? 'Guardando...' : 'Guardar Información' }}</span>
                  </button>
                </div>
              </form>
            </main>
          </div>
        </div>
      </div>
    }
  `,
  styleUrls: ['./billing-modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingModal implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  
  readonly isOpen = signal<boolean>(false);
  readonly isProcessing = signal<boolean>(false);
  readonly isSearching = signal<boolean>(false);
  readonly searchResults = signal<AddressSearchResult[]>([]);
  readonly savedAddresses = signal<SavedAddress[]>([]);
  readonly selectedCoordinates = signal<{lat: number, lon: number} | null>(null);
  readonly selectedSavedAddressId = signal<string | null>(null);
  
  billingForm!: FormGroup;
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  ngOnInit(): void {
    this.initializeForm();
    this.setupAddressSearch();
    this.loadSavedAddresses();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private initializeForm(): void {
    this.billingForm = this.fb.group({
      differentBillingPerson: [false],
      billingNames: [''],
      billingLastNames: [''],
      billingDocumentType: [''],
      billingDocumentNumber: [''],
      billingEmail: [''],
      billingPhone: [''],
      addressSearch: [''],
      billingAddress: ['', Validators.required],
      saveAddress: [false],
      addressName: ['']
    });
    
    // Dynamic validation based on differentBillingPerson
    this.billingForm.get('differentBillingPerson')?.valueChanges.subscribe(isDifferent => {
      const requiredFields = ['billingNames', 'billingLastNames', 'billingDocumentType', 'billingDocumentNumber', 'billingEmail', 'billingPhone'];
      
      requiredFields.forEach(field => {
        const control = this.billingForm.get(field);
        if (isDifferent) {
          control?.setValidators([Validators.required]);
        } else {
          control?.clearValidators();
        }
        control?.updateValueAndValidity();
      });
      
      // Add specific validators
      if (isDifferent) {
        this.billingForm.get('billingEmail')?.setValidators([Validators.required, Validators.email]);
        this.billingForm.get('billingPhone')?.setValidators([Validators.required, Validators.pattern(/^[0-9]{10}$/)]);
      }
    });
  }
  
  private setupAddressSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.searchAddresses(query)),
      takeUntil(this.destroy$)
    ).subscribe(results => {
      this.searchResults.set(results);
      this.isSearching.set(false);
    });
  }
  
  private searchAddresses(query: string): Observable<AddressSearchResult[]> {
    if (!query || query.length < 3) {
      return of([]);
    }
    
    // OpenStreetMap Nominatim API for Ecuador
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ec&limit=5&addressdetails=1`;
    
    return this.http.get<AddressSearchResult[]>(url).pipe(
      catchError(error => {
        console.error('Address search error:', error);
        return of([]);
      })
    );
  }
  
  onAddressSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    if (query.length >= 3) {
      this.isSearching.set(true);
      this.searchSubject.next(query);
    } else {
      this.searchResults.set([]);
    }
  }
  
  selectSearchResult(result: AddressSearchResult): void {
    this.billingForm.patchValue({
      billingAddress: result.display_name,
      addressSearch: ''
    });
    
    this.selectedCoordinates.set({
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon)
    });
    
    this.searchResults.set([]);
  }
  
  selectSavedAddress(address: SavedAddress): void {
    this.selectedSavedAddressId.set(address.id);
    this.billingForm.patchValue({
      billingAddress: address.fullAddress
    });
    
    this.selectedCoordinates.set(address.coordinates);
  }
  
  openMap(): void {
    const coords = this.selectedCoordinates();
    if (coords) {
      const url = `https://www.openstreetmap.org/#map=18/${coords.lat}/${coords.lon}`;
      window.open(url, '_blank');
    }
  }
  
  openMapForAddress(address: SavedAddress): void {
    const url = `https://www.openstreetmap.org/#map=18/${address.coordinates.lat}/${address.coordinates.lon}`;
    window.open(url, '_blank');
  }
  
  clearCoordinates(): void {
    this.selectedCoordinates.set(null);
  }
  
  deleteAddress(addressId: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta dirección?')) {
      const addresses = this.savedAddresses().filter(addr => addr.id !== addressId);
      this.savedAddresses.set(addresses);
      this.saveSavedAddresses(addresses);
      
      if (this.selectedSavedAddressId() === addressId) {
        this.selectedSavedAddressId.set(null);
      }
    }
  }
  
  private loadSavedAddresses(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agriconnect-saved-addresses');
      if (saved) {
        try {
          const addresses = JSON.parse(saved).map((addr: any) => ({
            ...addr,
            createdAt: new Date(addr.createdAt)
          }));
          this.savedAddresses.set(addresses);
        } catch (error) {
          console.error('Error loading saved addresses:', error);
        }
      }
    }
  }
  
  private saveSavedAddresses(addresses: SavedAddress[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('agriconnect-saved-addresses', JSON.stringify(addresses));
    }
  }
  
  openModal(): void {
    this.isOpen.set(true);
  }
  
  closeModal(): void {
    this.isOpen.set(false);
  }
  
  onSubmit(): void {
    if (this.billingForm.valid) {
      this.isProcessing.set(true);
      
      const formData = this.billingForm.value;
      
      // Save address if requested
      if (formData.saveAddress && formData.billingAddress && this.selectedCoordinates()) {
        const newAddress: SavedAddress = {
          id: Date.now().toString(),
          name: formData.addressName || 'Dirección sin nombre',
          fullAddress: formData.billingAddress,
          coordinates: this.selectedCoordinates()!,
          isDefault: this.savedAddresses().length === 0,
          createdAt: new Date()
        };
        
        const updatedAddresses = [...this.savedAddresses(), newAddress];
        this.savedAddresses.set(updatedAddresses);
        this.saveSavedAddresses(updatedAddresses);
      }
      
      // Simulate processing
      setTimeout(() => {
        this.isProcessing.set(false);
        
        const billingData = {
          differentBillingPerson: formData.differentBillingPerson,
          billingInfo: formData.differentBillingPerson ? {
            names: formData.billingNames,
            lastNames: formData.billingLastNames,
            documentType: formData.billingDocumentType,
            documentNumber: formData.billingDocumentNumber,
            email: formData.billingEmail,
            phone: formData.billingPhone
          } : null,
          billingAddress: formData.billingAddress,
          coordinates: this.selectedCoordinates()
        };
        
        console.log('Billing data saved:', billingData);
        this.closeModal();
        
        // Emit success event or navigate to next step
        alert('✅ Información de facturación guardada exitosamente');
      }, 1500);
    } else {
      this.markAllFieldsAsTouched();
    }
  }
  
  private markAllFieldsAsTouched(): void {
    Object.keys(this.billingForm.controls).forEach(key => {
      this.billingForm.get(key)?.markAsTouched();
    });
  }
  
  isFieldInvalid(fieldName: string): boolean {
    const field = this.billingForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
  
  getDocumentPlaceholder(): string {
    const type = this.billingForm.get('billingDocumentType')?.value;
    switch (type) {
      case 'cedula': return '1234567890';
      case 'ruc': return '1234567890001';
      case 'pasaporte': return 'AB123456';
      default: return 'Número de documento';
    }
  }
  
  getDocumentErrorMessage(): string {
    const type = this.billingForm.get('billingDocumentType')?.value;
    switch (type) {
      case 'cedula': return 'Cédula debe tener 10 dígitos';
      case 'ruc': return 'RUC debe tener 13 dígitos';
      case 'pasaporte': return 'Pasaporte inválido';
      default: return 'Documento inválido';
    }
  }
}