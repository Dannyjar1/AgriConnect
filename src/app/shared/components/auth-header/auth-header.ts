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