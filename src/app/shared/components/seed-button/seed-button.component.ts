import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeedService } from '../../../core/services/seed.service';

@Component({
  selector: 'app-seed-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div class="flex items-start space-x-4">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7M4 7l2-2h12l2 2M4 7l6 6m0 0l6-6m-6 6V3"></path>
            </svg>
          </div>
        </div>
        
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Llenar Base de Datos
          </h3>
          
          <p class="text-sm text-gray-600 mb-4">
            Agrega datos de ejemplo a la base de datos: 6 productores y 10 productos con información completa.
          </p>
          
          @if (databaseStatus()) {
            <div class="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-blue-700">
                    <strong>Estado actual:</strong> 
                    {{ databaseStatus()?.producersCount }} productores, 
                    {{ databaseStatus()?.productsCount }} productos
                  </p>
                </div>
              </div>
            </div>
          }
          
          @if (isLoading()) {
            <div class="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="animate-spin w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-yellow-800">
                    Llenando base de datos...
                  </p>
                </div>
              </div>
            </div>
          }
          
          @if (resultMessage()) {
            <div [class]="resultMessage()?.success ? 
              'bg-green-50 border border-green-200 rounded-md p-3 mb-4' : 
              'bg-red-50 border border-red-200 rounded-md p-3 mb-4'">
              <div class="flex">
                <div class="flex-shrink-0">
                  @if (resultMessage()?.success) {
                    <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                  } @else {
                    <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                    </svg>
                  }
                </div>
                <div class="ml-3">
                  <p [class]="resultMessage()?.success ? 'text-sm text-green-700' : 'text-sm text-red-700'">
                    {{ resultMessage()?.message }}
                  </p>
                  @if (resultMessage()?.success && resultMessage()?.producersCount) {
                    <p class="text-xs text-green-600 mt-1">
                      ✓ {{ resultMessage()?.producersCount }} productores y {{ resultMessage()?.productsCount }} productos agregados
                    </p>
                  }
                </div>
              </div>
            </div>
          }
          
          <div class="flex space-x-3">
            <button 
              (click)="fillDatabase()"
              [disabled]="isLoading()"
              [class]="isLoading() ? 
                'btn-primary opacity-50 cursor-not-allowed' : 
                'btn-primary hover:bg-emerald-700 transform hover:scale-105 transition-all duration-200'">
              @if (isLoading()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Llenando...
              } @else {
                🌱 Llenar Base de Datos
              }
            </button>
            
            <button 
              (click)="checkStatus()"
              [disabled]="isLoading()"
              class="btn-secondary">
              🔍 Verificar Estado
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SeedButtonComponent {
  private seedService = inject(SeedService);
  
  isLoading = signal<boolean>(false);
  databaseStatus = signal<{hasProducers: boolean, hasProducts: boolean, producersCount: number, productsCount: number} | null>(null);
  resultMessage = signal<{success: boolean, message: string, producersCount?: number, productsCount?: number} | null>(null);

  constructor() {
    // Verificar el estado al cargar el componente
    this.checkStatus();
  }

  checkStatus(): void {
    this.resultMessage.set(null);
    this.seedService.checkExistingData().subscribe({
      next: (status) => {
        this.databaseStatus.set(status);
      },
      error: (error) => {
        console.error('Error checking database status:', error);
        this.resultMessage.set({
          success: false,
          message: 'Error verificando el estado de la base de datos'
        });
      }
    });
  }

  fillDatabase(): void {
    this.isLoading.set(true);
    this.resultMessage.set(null);
    
    this.seedService.runSeed().subscribe({
      next: (result) => {
        this.isLoading.set(false);
        this.resultMessage.set(result);
        
        if (result.success) {
          // Actualizar el estado después de llenar
          this.checkStatus();
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.resultMessage.set({
          success: false,
          message: `Error llenando la base de datos: ${error.message}`
        });
      }
    });
  }
}