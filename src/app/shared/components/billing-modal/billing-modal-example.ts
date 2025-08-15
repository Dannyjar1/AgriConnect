import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingModal } from './billing-modal';

/**
 * Example component showing how to use BillingModal
 * This can be integrated into checkout flow or any other component
 */
@Component({
  selector: 'app-billing-modal-example',
  standalone: true,
  imports: [CommonModule, BillingModal],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Billing Modal Example</h1>
      
      <div class="space-y-4">
        <p class="text-gray-600">
          Click the button below to open the billing modal with OpenStreetMap integration
        </p>
        
        <button 
          (click)="openBillingModal()"
          class="bg-agri-green-600 hover:bg-agri-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors">
          <span class="material-icons">receipt_long</span>
          <span>Abrir Facturación</span>
        </button>
        
        <div class="bg-agri-green-50 border border-agri-green-200 rounded-lg p-4">
          <h3 class="font-semibold text-agri-green-800 mb-2">Características del Modal:</h3>
          <ul class="text-sm text-agri-green-700 space-y-1">
            <li>✅ Opción de facturar a datos de personas diferentes</li>
            <li>✅ Integración con OpenStreetMap API (https://www.openstreetmap.org/)</li>
            <li>✅ Búsqueda de direcciones en Ecuador</li>
            <li>✅ Mostrar y guardar coordenadas</li>
            <li>✅ Abrir mapa en nueva pestaña</li>
            <li>✅ Gestión de direcciones guardadas</li>
            <li>✅ Responsive design con TailwindCSS v4</li>
            <li>✅ Validación de formularios reactivos</li>
            <li>✅ Accessibility compliance (WCAG 2.1 AA)</li>
          </ul>
        </div>
        
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 class="font-semibold text-blue-800 mb-2">Ejemplo de Coordenadas:</h3>
          <p class="text-sm text-blue-700">
            Para probar, busca direcciones como: "Quito, Ecuador", "Guayaquil Centro", "Universidad Central del Ecuador"
          </p>
          <p class="text-xs text-blue-600 mt-2">
            Las coordenadas se mostrarán automáticamente y podrás abrir el mapa en OpenStreetMap
          </p>
        </div>
      </div>
    </div>
    
    <!-- Billing Modal Component -->
    <app-billing-modal #billingModal></app-billing-modal>
  `
})
export class BillingModalExample {
  @ViewChild('billingModal') billingModal!: BillingModal;
  
  openBillingModal(): void {
    this.billingModal?.openModal();
  }
}