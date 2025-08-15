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