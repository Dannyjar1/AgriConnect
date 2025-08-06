import { Component, Input, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Minimalist AuthHeader Component for AgriConnect
 * 
 * Features:
 * - Clean, minimalist design philosophy
 * - Professional appearance suitable for all screens
 * - Responsive with mobile-first approach
 * - Accessible and WCAG 2.1 AA compliant
 * - Subtle animations and elegant typography
 * - Maintains AgriConnect branding consistency
 */
@Component({
  selector: 'app-auth-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Ultra-Minimalist Header -->
    <header class="bg-gradient-to-r from-blue-50 via-slate-50 to-blue-100 
                   border-b border-blue-200/30 shadow-sm" 
            role="banner">
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14 sm:h-16 lg:h-18">
          
          <!-- Left Side - Logo and Brand -->
          <div class="flex items-center space-x-3 group">
            
            <!-- Logo Container -->
            <div class="flex-shrink-0 p-1 sm:p-1.5 bg-white rounded-lg shadow-sm
                        transition-all duration-300 group-hover:shadow-md">
              
              <!-- Primary Logo -->
              <img 
                src="/assets/images/agriconnect-logo.svg" 
                alt="AgriConnect - Marketplace Agrícola"
                class="w-7 h-7 sm:w-8 sm:h-8"
                loading="eager"
                width="32" 
                height="32"
                (error)="onImageError($event)"
                (load)="onImageLoad()"
                [style.display]="imageLoadError ? 'none' : 'block'">
              
              <!-- Fallback SVG -->
              <svg 
                *ngIf="imageLoadError"
                class="w-7 h-7 sm:w-8 sm:h-8 text-agri-green-600" 
                fill="none"
                stroke="currentColor"
                viewBox="0 0 40 40"
                role="img"
                aria-label="AgriConnect logo">
                
                <!-- Circular background -->
                <circle cx="20" cy="20" r="18" fill="currentColor" stroke="none"/>
                
                <!-- Leaf design -->
                <path d="M12 20c0-8 6-12 12-12s8 4 8 12c0 4-2 6-4 8-2-2-4-4-4-8 0-4-2-6-4-6s-4 2-4 6c-2-2-4-4-4 0z" 
                      fill="white" 
                      opacity="0.9"/>
                
                <!-- Growth lines -->
                <path d="M20 28v8M16 32h8" 
                      stroke="white" 
                      stroke-width="2" 
                      stroke-linecap="round"/>
              </svg>
              
              <!-- Loading state -->
              <div *ngIf="!imageLoaded && !imageLoadError"
                   class="w-7 h-7 sm:w-8 sm:h-8 bg-agri-green-100 rounded animate-pulse">
              </div>
            </div>
            
            <!-- Brand Text - Extra Compact -->
            <div class="hidden sm:block">
              <h1 class="font-epilogue text-base sm:text-lg font-bold text-slate-800 
                         tracking-tight leading-tight">
                AgriConnect
              </h1>
              <p class="font-noto-sans text-xs text-slate-600 font-medium 
                        -mt-0.5 hidden lg:block">
                Marketplace Agrícola
              </p>
            </div>
          </div>

          <!-- Right Side - Navigation/Actions (Optional) -->
          <div class="flex items-center space-x-4">
            <!-- Optional navigation items can be added here -->
            <div class="hidden md:flex items-center space-x-2 text-sm text-slate-600">
              <div class="w-2 h-2 bg-agri-green-500 rounded-full"></div>
              <span class="font-noto-sans font-medium">Plataforma confiable</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    /* Ultra-minimal header with performance focus */
    :host {
      display: block;
    }
    
    /* Subtle logo hover effect */
    .group:hover .shadow-sm {
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    }
    
    /* Accessibility: Respect reduced motion preference */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    
    /* High contrast mode support */
    @media (prefers-contrast: high) {
      header {
        border-bottom: 2px solid rgb(75 85 99) !important;
      }
      
      .bg-white {
        border: 1px solid rgb(75 85 99) !important;
      }
      
      .text-slate-800 {
        color: rgb(0 0 0) !important;
      }
      
      .text-slate-600 {
        color: rgb(55 65 81) !important;
      }
    }
    
    /* Mobile responsiveness optimization */
    @media (max-width: 640px) {
      .group {
        justify-content: flex-start;
      }
      
      header {
        padding-left: 1rem;
        padding-right: 1rem;
      }
    }
    
    /* Ensure proper spacing on all screen sizes */
    @media (min-width: 1024px) {
      .max-w-7xl {
        padding-left: 2rem;
        padding-right: 2rem;
      }
    }
  `]
})
export class AuthHeaderComponent {
  /**
   * Component Input Properties - Same interface as original
   */
  @Input() headline: string = 'Conéctate con el campo';
  @Input() description: string = 'Únete a la red más grande de productores y compradores agrícolas del Ecuador. Conectamos directamente el campo con tu mesa.';
  @Input() ctaText: string = 'Conócenos';
  @Input() showFeatures: boolean = true;

  /**
   * Output events - Same as original
   */
  ctaClicked = output<void>();

  /**
   * Feature highlights - Simplified list
   */
  protected readonly features = signal<string[]>([
    'Red confiable',
    'Precios justos', 
    'Entrega directa',
    '10k+ usuarios'
  ]);

  /**
   * Image loading state management
   */
  protected imageLoadError = false;
  protected imageLoaded = false;

  /**
   * Handle CTA button click - Same logic as original
   */
  protected onCtaClick(): void {
    this.ctaClicked.emit();
    this.scrollToMainContent();
    
    // Analytics tracking (if available)
    try {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'cta_click', {
          event_category: 'engagement',
          event_label: 'auth_header_cta_minimalist',
          value: 1
        });
      }
    } catch (error) {
      console.debug('Analytics tracking not available:', error);
    }
  }

  /**
   * Handle successful logo loading
   */
  protected onImageLoad(): void {
    console.info('AgriConnect header logo loaded successfully');
    this.imageLoaded = true;
    this.imageLoadError = false;
  }

  /**
   * Handle logo loading errors with fallback
   */
  protected onImageError(event: Event): void {
    console.warn('AgriConnect header logo failed to load, using fallback SVG');
    this.imageLoadError = true;
    this.imageLoaded = false;
    
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
    }
  }

  /**
   * Smooth scroll to main content - Same as original
   */
  private scrollToMainContent(): void {
    const mainContent = document.querySelector('main') || 
                       document.querySelector('.auth-form-container') ||
                       document.querySelector('[role="main"]');
    
    if (mainContent) {
      mainContent.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}