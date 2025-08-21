import { Component, EventEmitter, Output, inject, signal, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { ProducerService } from '../../../core/services/producer.service';
import { Product } from '../../../core/models/product.model';
import { Producer } from '../../../core/models/user.model';
import { ImageUploadComponent, UploadedImage } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-register-product-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageUploadComponent],
  template: `
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
         (click)="onBackdropClick($event)">
      
      <!-- Modal Container -->
      <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto" 
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="relative bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 p-8 text-white">
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <div>
              <h2 class="text-3xl font-bold tracking-tight">Registrar Nuevo Producto</h2>
              <p class="text-orange-100 mt-1">Agrega un producto al catálogo del sistema</p>
            </div>
          </div>
        </div>

        <!-- Form Content -->
        <div class="p-8">
          <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
            
            <!-- Basic Information Section -->
            <div class="mb-8">
              <div class="flex items-center mb-6">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-800">Información Básica</h3>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Nombre del Producto -->
                <div class="lg:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    formControlName="name"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="Ej: Banano Premium Orgánico"
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

                <!-- Categoría -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                    Categoría *
                  </label>
                  <select
                    formControlName="category"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    [class.border-red-300]="isFieldInvalid('category')"
                    [class.bg-red-50]="isFieldInvalid('category')"
                  >
                    <option value="">Seleccione una categoría</option>
                    @for (category of categories; track category) {
                      <option [value]="category">{{ category }}</option>
                    }
                  </select>
                  @if (isFieldInvalid('category')) {
                    <p class="text-red-600 text-sm mt-1 flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                      </svg>
                      {{ getErrorMessage('category') }}
                    </p>
                  }
                </div>

                <!-- Productor -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Productor *
                  </label>
                  <select
                    formControlName="producerId"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    [class.border-red-300]="isFieldInvalid('producerId')"
                    [class.bg-red-50]="isFieldInvalid('producerId')"
                  >
                    <option value="">Seleccione un productor</option>
                    @for (producer of producers(); track producer.id) {
                      <option [value]="producer.id">{{ producer.name }} - {{ producer.province }}</option>
                    }
                  </select>
                  @if (isFieldInvalid('producerId')) {
                    <p class="text-red-600 text-sm mt-1 flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                      </svg>
                      {{ getErrorMessage('producerId') }}
                    </p>
                  }
                </div>

                <!-- Descripción -->
                <div class="lg:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Descripción del Producto *
                  </label>
                  <textarea
                    formControlName="description"
                    rows="4"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Descripción detallada del producto, características especiales, origen, proceso de producción..."
                    [class.border-red-300]="isFieldInvalid('description')"
                    [class.bg-red-50]="isFieldInvalid('description')"
                  ></textarea>
                  @if (isFieldInvalid('description')) {
                    <p class="text-red-600 text-sm mt-1 flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                      </svg>
                      {{ getErrorMessage('description') }}
                    </p>
                  }
                </div>
              </div>
            </div>

            <!-- Pricing & Inventory Section -->
            <div class="mb-8">
              <div class="flex items-center mb-6">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-800">Precio e Inventario</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Precio por Unidad -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                    Precio por Unidad ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    formControlName="pricePerUnit"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="0.00"
                    [class.border-red-300]="isFieldInvalid('pricePerUnit')"
                    [class.bg-red-50]="isFieldInvalid('pricePerUnit')"
                  >
                  @if (isFieldInvalid('pricePerUnit')) {
                    <p class="text-red-600 text-sm mt-1 flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                      </svg>
                      {{ getErrorMessage('pricePerUnit') }}
                    </p>
                  }
                </div>

                <!-- Unidad de Medida -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
                    </svg>
                    Unidad de Medida *
                  </label>
                  <select
                    formControlName="unit"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    [class.border-red-300]="isFieldInvalid('unit')"
                    [class.bg-red-50]="isFieldInvalid('unit')"
                  >
                    <option value="">Seleccione unidad</option>
                    @for (unit of units; track unit) {
                      <option [value]="unit">{{ unit }}</option>
                    }
                  </select>
                  @if (isFieldInvalid('unit')) {
                    <p class="text-red-600 text-sm mt-1 flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                      </svg>
                      {{ getErrorMessage('unit') }}
                    </p>
                  }
                </div>

                <!-- Cantidad Inicial -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                    Cantidad Inicial *
                  </label>
                  <input
                    type="number"
                    min="0"
                    formControlName="availability"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="0"
                    [class.border-red-300]="isFieldInvalid('availability')"
                    [class.bg-red-50]="isFieldInvalid('availability')"
                  >
                  @if (isFieldInvalid('availability')) {
                    <p class="text-red-600 text-sm mt-1 flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                      </svg>
                      {{ getErrorMessage('availability') }}
                    </p>
                  }
                </div>

                <!-- Provincia -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Provincia de Origen *
                  </label>
                  <select
                    formControlName="province"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    [class.border-red-300]="isFieldInvalid('province')"
                    [class.bg-red-50]="isFieldInvalid('province')"
                  >
                    <option value="">Seleccione provincia</option>
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

                <!-- Total Value Display -->
                <div class="md:col-span-2 lg:col-span-4">
                  <div class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-green-700">Valor Total del Inventario:</span>
                      <span class="text-xl font-bold text-green-800">
                        {{ calculateTotalValue() | currency:'USD':'symbol':'1.2-2' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Image Upload Section -->
            <div class="mb-8">
              <div class="flex items-center mb-6">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-800">Imágenes del Producto</h3>
              </div>
              
              <app-image-upload
                [maxImages]="5"
                (imagesChanged)="onImagesChanged($event)">
              </app-image-upload>
            </div>

            <!-- Certifications Section -->
            <div class="mb-8">
              <div class="flex items-center mb-6">
                <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-800">Certificaciones de Calidad</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                @for (cert of availableCertifications; track cert) {
                  <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      [value]="cert"
                      (change)="onCertificationChange(cert, $event)"
                      class="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
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
                class="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:from-orange-700 hover:to-amber-700 transition-all duration-200 font-medium transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                [disabled]="productForm.invalid || isLoading()"
              >
                <div class="flex items-center justify-center">
                  @if (isLoading()) {
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  } @else {
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Registrar Producto
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
export class RegisterProductModal implements OnInit {
  @Output() onClose = new EventEmitter<void>();
  @Output() onProductRegistered = new EventEmitter<Product>();
  @ViewChild(ImageUploadComponent) imageUpload!: ImageUploadComponent;

  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private producerService = inject(ProducerService);

  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly producers = signal<Producer[]>([]);
  readonly productImages = signal<UploadedImage[]>([]);

  readonly categories = [
    'Frutas', 'Verduras y Hortalizas', 'Lácteos', 'Carne y Aves',
    'Pescado y Mariscos', 'Granos, Legumbres y Cereales', 'Frutos Secos y Semillas',
    'Panadería y Repostería', 'Bebidas e Infusiones', 'Apícolas y Endémicos',
    'Hierbas, Especias y Condimentos'
  ];

  readonly units = [
    'kg', 'lb', 'unidad', 'litro', 'galón', 'paquete', 'docena', 'caja'
  ];

  readonly provinces = [
    'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi',
    'El Oro', 'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja',
    'Los Ríos', 'Manabí', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza',
    'Pichincha', 'Santa Elena', 'Santo Domingo', 'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe'
  ];

  readonly availableCertifications = [
    'ORGÁNICO', 'Fair Trade', 'GlobalGAP', 'Rainforest Alliance',
    'Artesanal', 'Pastoreo Libre', 'Sin Aditivos', 'Comercio Justo',
    'Pesca Sustentable', 'Acuacultura Responsable', 'Denominación de Origen'
  ];

  selectedCertifications: string[] = [];

  productForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    producerId: ['', [Validators.required]],
    category: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    pricePerUnit: [0, [Validators.required, Validators.min(0.01)]],
    unit: ['', [Validators.required]],
    availability: [0, [Validators.required, Validators.min(0)]],
    province: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.loadProducers();
  }

  private loadProducers(): void {
    this.producerService.getActiveProducers().subscribe(producers => {
      this.producers.set(producers);
    });
  }

  calculateTotalValue(): number {
    const price = this.productForm.get('pricePerUnit')?.value || 0;
    const quantity = this.productForm.get('availability')?.value || 0;
    return price * quantity;
  }

  onCertificationChange(certification: string, event: any): void {
    if (event.target.checked) {
      this.selectedCertifications.push(certification);
    } else {
      this.selectedCertifications = this.selectedCertifications.filter(c => c !== certification);
    }
  }

  /**
   * Handle image upload changes
   */
  onImagesChanged(images: UploadedImage[]): void {
    this.productImages.set(images);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field?.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (!field?.errors) return '';

    if (field.errors['required']) return `${fieldName} es obligatorio`;
    if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
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
    if (this.productForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const formValue = this.productForm.value;
      const productData = {
        name: formValue.name!,
        producerId: formValue.producerId!,
        category: formValue.category!,
        description: formValue.description!,
        images: this.productImages().map(img => img.url),
        price: {
          perUnit: formValue.pricePerUnit!,
          unit: formValue.unit!,
          minOrder: 1,
          maxOrder: formValue.availability!
        },
        availability: formValue.availability!,
        province: formValue.province!,
        certifications: this.selectedCertifications,
        isActive: true
      };

      const productId = await firstValueFrom(this.productService.createProduct(productData));
      
      const newProduct: Product = {
        id: productId,
        ...productData,
        registeredBy: '', // Se llenará en el servicio
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };

      // Emit success - el componente padre cerrará el modal
      this.onProductRegistered.emit(newProduct);
      
      // Show success feedback
      console.log('Producto registrado exitosamente:', productId);
    } catch (error: any) {
      console.error('Error registrando producto:', error);
      this.errorMessage.set(error.message || 'Error al registrar el producto');
    } finally {
      this.isLoading.set(false);
    }
  }
}