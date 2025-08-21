import { Component, EventEmitter, Output, Input, signal, inject, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Cloudinary } from 'cloudinary-core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <!-- Image Upload Component -->
    <div class="w-full">
      
      <!-- Upload Options -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          Imágenes del Producto
        </label>
        
        <!-- Upload Buttons -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <!-- Camera Button -->
          <button
            type="button"
            (click)="openCamera()"
            class="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all duration-200"
            [disabled]="isUploading()"
          >
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span class="text-sm font-medium">Cámara</span>
          </button>
          
          <!-- File Upload Button -->
          <button
            type="button"
            (click)="triggerFileInput()"
            class="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all duration-200"
            [disabled]="isUploading()"
          >
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <span class="text-sm font-medium">Archivo</span>
          </button>
          
          <!-- Gallery Button -->
          <button
            type="button"
            (click)="openGallery()"
            class="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all duration-200"
            [disabled]="isUploading()"
          >
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            <span class="text-sm font-medium">Galería</span>
          </button>
        </div>
      </div>

      <!-- Hidden File Inputs -->
      <input
        #fileInput
        type="file"
        class="hidden"
        accept="image/*"
        multiple
        (change)="onFileSelected($event)"
      >
      
      <input
        #cameraInput
        type="file"
        class="hidden"
        accept="image/*"
        capture="environment"
        (change)="onFileSelected($event)"
      >

      <!-- Upload Progress -->
      @if (isUploading()) {
        <div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-blue-800">Subiendo imagen{{ uploadProgress() > 0 ? 's' : '' }}...</span>
            <span class="text-sm text-blue-600">{{ uploadProgress() }}%</span>
          </div>
          <div class="w-full bg-blue-200 rounded-full h-2">
            <div 
              class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              [style.width.%]="uploadProgress()">
            </div>
          </div>
        </div>
      }

      <!-- Error Message -->
      @if (errorMessage()) {
        <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
            <p class="text-red-800 text-sm font-medium">{{ errorMessage() }}</p>
          </div>
        </div>
      }

      <!-- Uploaded Images Preview -->
      @if (uploadedImages().length > 0) {
        <div class="mb-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Imágenes Cargadas ({{ uploadedImages().length }})</h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            @for (image of uploadedImages(); track image.publicId) {
              <div class="relative group">
                <img
                  [src]="image.url"
                  [alt]="'Imagen del producto'"
                  class="w-full h-24 object-cover rounded-lg border border-gray-200"
                >
                
                <!-- Remove Button -->
                <button
                  type="button"
                  (click)="removeImage(image)"
                  class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            }
          </div>
        </div>
      }

      <!-- Upload Instructions -->
      @if (uploadedImages().length === 0 && !isUploading()) {
        <div class="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <p class="text-gray-500 text-sm">Selecciona una opción arriba para agregar imágenes del producto</p>
          <p class="text-gray-400 text-xs mt-1">JPG, PNG, WebP hasta 5MB cada una</p>
        </div>
      }
    </div>
  `
})
export class ImageUploadComponent implements OnDestroy {
  @Input() maxImages: number = 5;
  @Input() maxFileSize: number = 5 * 1024 * 1024; // 5MB
  @Output() imagesChanged = new EventEmitter<UploadedImage[]>();
  
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('cameraInput') cameraInput!: ElementRef<HTMLInputElement>;

  readonly isUploading = signal<boolean>(false);
  readonly uploadProgress = signal<number>(0);
  readonly errorMessage = signal<string>('');
  readonly uploadedImages = signal<UploadedImage[]>([]);

  private cloudinary: Cloudinary;
  private uploadQueue: File[] = [];
  private http = inject(HttpClient);

  constructor() {
    this.cloudinary = new Cloudinary({
      cloud_name: environment.cloudinary.cloudName,
      secure: true
    });
  }

  ngOnDestroy(): void {
    // Clean up any pending uploads
    this.uploadQueue = [];
  }

  /**
   * Trigger file input for regular file upload
   */
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  /**
   * Open camera for photo capture
   */
  openCamera(): void {
    this.cameraInput.nativeElement.click();
  }

  /**
   * Open gallery/file picker (same as file input)
   */
  openGallery(): void {
    this.fileInput.nativeElement.click();
  }

  /**
   * Handle file selection
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    this.processFiles(files);
    
    // Reset input
    input.value = '';
  }

  /**
   * Process selected files
   */
  private processFiles(files: File[]): void {
    this.errorMessage.set('');
    
    // Validate file count
    const totalImages = this.uploadedImages().length + files.length;
    if (totalImages > this.maxImages) {
      this.errorMessage.set(`Máximo ${this.maxImages} imágenes permitidas`);
      return;
    }

    // Validate file types and sizes
    const validFiles: File[] = [];
    for (const file of files) {
      if (!this.validateFile(file)) {
        return; // Error message already set in validateFile
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      this.uploadFiles(validFiles);
    }
  }

  /**
   * Validate individual file
   */
  private validateFile(file: File): boolean {
    // Check file type
    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('Solo se permiten archivos de imagen');
      return false;
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      const maxSizeMB = this.maxFileSize / (1024 * 1024);
      this.errorMessage.set(`El archivo es demasiado grande. Máximo ${maxSizeMB}MB`);
      return false;
    }

    return true;
  }

  /**
   * Upload files to Cloudinary
   */
  private async uploadFiles(files: File[]): Promise<void> {
    this.isUploading.set(true);
    this.uploadProgress.set(0);
    this.errorMessage.set('');

    try {
      // Try using HttpClient first (more reliable with Angular)
      const uploadPromises = files.map((file, index) => this.uploadSingleFileWithHttp(file, index, files.length));
      const results = await Promise.all(uploadPromises);
      
      const currentImages = this.uploadedImages();
      const newImages = [...currentImages, ...results.filter(Boolean) as UploadedImage[]];
      
      this.uploadedImages.set(newImages);
      this.imagesChanged.emit(newImages);
      
    } catch (error: any) {
      console.error('Error uploading files:', error);
      // Show more specific error message
      if (error.message.includes('Invalid')) {
        this.errorMessage.set('Configuración de Cloudinary inválida. Contacta al administrador.');
      } else if (error.message.includes('preset')) {
        this.errorMessage.set('Preset de upload no encontrado. Verifica la configuración.');
      } else if (error.message.includes('CORS')) {
        this.errorMessage.set('Error de CORS. Verifica la configuración de Cloudinary.');
      } else {
        this.errorMessage.set(`Error al subir las imágenes: ${error.message}`);
      }
    } finally {
      this.isUploading.set(false);
      this.uploadProgress.set(0);
    }
  }

  /**
   * Upload single file to Cloudinary
   */
  private uploadSingleFile(file: File, index: number, total: number): Promise<UploadedImage | null> {
    return new Promise((resolve, reject) => {
      console.log('Starting upload for file:', file.name, 'Size:', file.size, 'Type:', file.type);
      console.log('Upload preset:', environment.cloudinary.uploadPreset);
      console.log('Cloud name:', environment.cloudinary.cloudName);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', environment.cloudinary.uploadPreset);
      // La carpeta 'productos' ya está configurada en el upload preset

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const fileProgress = (event.loaded / event.total) * 100;
          const totalProgress = ((index + fileProgress / 100) / total) * 100;
          this.uploadProgress.set(Math.round(totalProgress));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('Cloudinary response:', response);
            const uploadedImage: UploadedImage = {
              url: response.secure_url,
              publicId: response.public_id,
              width: response.width,
              height: response.height
            };
            resolve(uploadedImage);
          } catch (error) {
            console.error('Error parsing Cloudinary response:', error);
            reject(new Error('Error procesando la respuesta del servidor'));
          }
        } else {
          console.error('Upload failed:', xhr.status, xhr.responseText);
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.error?.message || `Error ${xhr.status}: ${xhr.statusText}`));
          } catch {
            reject(new Error(`Error ${xhr.status}: ${xhr.statusText}`));
          }
        }
      };

      xhr.onerror = () => {
        console.error('Network error during upload');
        reject(new Error('Error de conexión. Verifica tu internet e inténtalo de nuevo'));
      };

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`);
      xhr.send(formData);
    });
  }

  /**
   * Remove image from uploaded list
   */
  removeImage(imageToRemove: UploadedImage): void {
    const currentImages = this.uploadedImages();
    const filteredImages = currentImages.filter(img => img.publicId !== imageToRemove.publicId);
    
    this.uploadedImages.set(filteredImages);
    this.imagesChanged.emit(filteredImages);
  }

  /**
   * Get current images
   */
  getImages(): UploadedImage[] {
    return this.uploadedImages();
  }

  /**
   * Set images (for editing existing products)
   */
  setImages(images: UploadedImage[]): void {
    this.uploadedImages.set(images);
  }

  /**
   * Clear all images
   */
  clearImages(): void {
    this.uploadedImages.set([]);
    this.imagesChanged.emit([]);
  }

  /**
   * Upload single file using Angular HttpClient (more reliable)
   */
  private uploadSingleFileWithHttp(file: File, index: number, total: number): Promise<UploadedImage | null> {
    return new Promise((resolve, reject) => {
      console.log('Starting HTTP upload for file:', file.name, 'Size:', file.size, 'Type:', file.type);
      console.log('Upload preset:', environment.cloudinary.uploadPreset);
      console.log('Cloud name:', environment.cloudinary.cloudName);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', environment.cloudinary.uploadPreset);
      
      // Don't specify public_id, let Cloudinary handle it based on your preset settings
      // The folder 'productos' is already configured in the upload preset
      
      console.log('Upload parameters:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        preset: environment.cloudinary.uploadPreset,
        cloudName: environment.cloudinary.cloudName
      });
      
      const uploadUrl = `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`;
      
      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const fileProgress = (event.loaded / event.total) * 100;
          const totalProgress = ((index + fileProgress / 100) / total) * 100;
          this.uploadProgress.set(Math.round(totalProgress));
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('Cloudinary HTTP response:', response);
            
            if (response.error) {
              reject(new Error(response.error.message || 'Upload failed'));
              return;
            }
            
            const uploadedImage: UploadedImage = {
              url: response.secure_url || response.url,
              publicId: response.public_id,
              width: response.width || 0,
              height: response.height || 0
            };
            resolve(uploadedImage);
          } catch (error) {
            console.error('Error parsing response:', error, xhr.responseText);
            reject(new Error('Error procesando respuesta del servidor'));
          }
        } else {
          console.error('HTTP Upload failed:', xhr.status, xhr.responseText);
          let errorMessage = `Error HTTP ${xhr.status}`;
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            if (errorResponse.error) {
              errorMessage = errorResponse.error.message || errorMessage;
              
              // Specific error handling for common issues
              if (errorMessage.includes('Invalid upload preset')) {
                errorMessage = 'Upload preset "product_images" no encontrado. Verifica la configuración en Cloudinary.';
              } else if (errorMessage.includes('Invalid cloud_name')) {
                errorMessage = 'Cloud name inválido. Verifica la configuración.';
              } else if (errorMessage.includes('Invalid signature') || errorMessage.includes('Invalid timestamp')) {
                errorMessage = 'Error de autenticación. El preset debe ser "unsigned".';
              } else if (errorMessage.includes('File size too large')) {
                errorMessage = 'El archivo es demasiado grande. Máximo 10MB.';
              } else if (errorMessage.includes('Invalid image file')) {
                errorMessage = 'Formato de imagen inválido. Solo JPG, PNG, WebP permitidos.';
              }
            }
          } catch (e) {
            // Keep default error message
          }
          reject(new Error(errorMessage));
        }
      });
      
      xhr.addEventListener('error', () => {
        console.error('Network error during HTTP upload');
        reject(new Error('Error de conexión. Verifica tu internet.'));
      });
      
      xhr.addEventListener('timeout', () => {
        console.error('Upload timeout');
        reject(new Error('Tiempo de espera agotado. Inténtalo de nuevo.'));
      });
      
      xhr.open('POST', uploadUrl);
      xhr.timeout = 60000; // 60 seconds timeout
      xhr.send(formData);
    });
  }

  /**
   * Test Cloudinary configuration (development only)
   */
  testCloudinaryConfig(): void {
    console.log('=== CLOUDINARY CONFIG TEST ===');
    console.log('Cloud Name:', environment.cloudinary.cloudName);
    console.log('Upload Preset:', environment.cloudinary.uploadPreset);
    console.log('Environment:', environment.production ? 'production' : 'development');
    
    // Test URL construction
    const testUrl = `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`;
    console.log('Upload URL:', testUrl);
    
    // Test with a simple fetch to check if preset exists
    fetch(testUrl, {
      method: 'POST',
      body: new FormData()
    })
    .then(response => response.text())
    .then(text => {
      console.log('Cloudinary test response:', text);
      try {
        const json = JSON.parse(text);
        if (json.error) {
          console.log('Cloudinary error details:', json.error);
          this.errorMessage.set(`Config Error: ${json.error.message}`);
        }
      } catch (e) {
        console.log('Non-JSON response');
      }
    })
    .catch(error => {
      console.error('Cloudinary test failed:', error);
      this.errorMessage.set(`Connection Error: ${error.message}`);
    });
  }
}