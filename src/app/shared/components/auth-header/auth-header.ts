import { Component, Input, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Modern AuthHeader Component for AgriConnect Authentication Screens
 * 
 * Features:
 * - Responsive design with mobile-first approach
 * - Modern curved design elements with gradients
 * - Professional AgriConnect branding
 * - Accessible and SEO-friendly
 * - Customizable content via input properties
 * - Call-to-action functionality
 * - Smooth animations and hover effects
 */
@Component({
  selector: 'app-auth-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Main Header Container -->
    <header class="relative overflow-hidden" role="banner">
      <!-- Background with Gradient and Curved Design -->
      <div class="relative bg-gradient-to-br from-blue-600 via-blue-700 to-agri-green-600 
                  min-h-[280px] sm:min-h-[320px] lg:min-h-[380px]">
        
        <!-- Decorative Background Elements -->
        <div class="absolute inset-0 overflow-hidden" aria-hidden="true">
          <!-- Animated Background Circles -->
          <div class="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div class="absolute top-20 right-16 w-24 h-24 bg-agri-green-400/20 rounded-full blur-lg animate-bounce" style="animation-delay: 1s;"></div>
          <div class="absolute bottom-16 left-1/3 w-40 h-40 bg-blue-400/15 rounded-full blur-2xl animate-pulse" style="animation-delay: 2s;"></div>
          
          <!-- Pattern Overlay for Depth -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        </div>

        <!-- Main Content Container -->
        <div class="relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div class="max-w-7xl mx-auto">
            
            <!-- Header Grid Layout -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              
              <!-- Left Side - Branding Section -->
              <div class="flex items-center justify-center lg:justify-start">
                <div class="flex items-center space-x-4 sm:space-x-6 group">
                  
                  <!-- Logo Container with Glassmorphism Effect -->
                  <div class="flex-shrink-0 relative">
                    <div class="p-3 sm:p-4 bg-white/15 backdrop-blur-sm rounded-2xl 
                                border border-white/20 shadow-lg
                                group-hover:bg-white/25 group-hover:scale-105 
                                transition-all duration-300 ease-out">
                      <img 
                        src="/assets/images/agriconnect-logo.svg" 
                        alt="AgriConnect - Marketplace Agrícola"
                        class="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
                        loading="eager"
                        width="80" 
                        height="80">
                    </div>
                    <!-- Glow effect behind logo -->
                    <div class="absolute inset-0 bg-white/20 rounded-2xl blur-md 
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10">
                    </div>
                  </div>
                  
                  <!-- Brand Text -->
                  <div class="text-white">
                    <h1 class="font-epilogue text-2xl sm:text-3xl lg:text-4xl font-bold 
                               tracking-tight leading-tight">
                      AgriConnect
                    </h1>
                    <p class="font-noto-sans text-sm sm:text-base lg:text-lg 
                             text-white/90 font-medium tracking-wide mt-1">
                      Marketplace Agrícola
                    </p>
                  </div>
                </div>
              </div>

              <!-- Right Side - Promotional Content -->
              <div class="text-center lg:text-left space-y-6">
                
                <!-- Main Headline -->
                <div class="space-y-3">
                  <h2 class="font-epilogue text-3xl sm:text-4xl lg:text-5xl font-bold 
                             text-white leading-tight tracking-tight">
                    {{ headline }}
                  </h2>
                  <p class="font-noto-sans text-base sm:text-lg lg:text-xl 
                           text-white/95 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    {{ description }}
                  </p>
                </div>

                <!-- Feature Points -->
                @if (showFeatures) {
                  <div class="flex flex-wrap justify-center lg:justify-start 
                              gap-3 sm:gap-4 lg:gap-6 text-sm text-white/90">
                    @for (feature of features(); track $index) {
                      <div class="flex items-center space-x-2 bg-white/10 
                                  backdrop-blur-sm rounded-full px-3 py-2 sm:px-4 sm:py-2
                                  border border-white/20 hover:bg-white/20 
                                  transition-all duration-200">
                        <svg class="w-4 h-4 text-agri-green-300 flex-shrink-0" 
                             fill="none" 
                             stroke="currentColor" 
                             viewBox="0 0 24 24"
                             aria-hidden="true">
                          <path stroke-linecap="round" 
                                stroke-linejoin="round" 
                                stroke-width="2" 
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span class="font-noto-sans font-medium whitespace-nowrap">
                          {{ feature }}
                        </span>
                      </div>
                    }
                  </div>
                }

                <!-- Call to Action Button -->
                <div class="flex justify-center lg:justify-start pt-4">
                  <button 
                    class="group relative inline-flex items-center justify-center
                           bg-white hover:bg-agri-green-50 
                           text-agri-green-700 hover:text-agri-green-800
                           font-noto-sans font-semibold text-base sm:text-lg
                           px-6 py-3 sm:px-8 sm:py-4 rounded-full
                           shadow-lg hover:shadow-xl
                           transform hover:scale-105 hover:-translate-y-1
                           transition-all duration-300 ease-out
                           border-2 border-transparent hover:border-agri-green-200
                           focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                    (click)="onCtaClick()"
                    [attr.aria-label]="ctaText + ' - Conoce más sobre AgriConnect'"
                    type="button">
                    
                    <!-- Button Content -->
                    <span class="flex items-center space-x-3">
                      <!-- Lightning Icon -->
                      <svg class="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 
                                 transition-transform duration-300" 
                           fill="none" 
                           stroke="currentColor" 
                           viewBox="0 0 24 24"
                           aria-hidden="true">
                        <path stroke-linecap="round" 
                              stroke-linejoin="round" 
                              stroke-width="2" 
                              d="M13 10V3L4 14h7v7l9-11h-7z"/>
                      </svg>
                      <span>{{ ctaText }}</span>
                      <!-- Arrow Icon -->
                      <svg class="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 
                                 transition-transform duration-300" 
                           fill="none" 
                           stroke="currentColor" 
                           viewBox="0 0 24 24"
                           aria-hidden="true">
                        <path stroke-linecap="round" 
                              stroke-linejoin="round" 
                              stroke-width="2" 
                              d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                      </svg>
                    </span>

                    <!-- Button Glow Effect -->
                    <div class="absolute inset-0 rounded-full bg-white/20 
                                opacity-0 group-hover:opacity-100 
                                scale-95 group-hover:scale-100
                                transition-all duration-300 -z-10 blur-sm">
                    </div>
                  </button>
                </div>

                <!-- Trust Indicators -->
                <div class="hidden sm:flex items-center justify-center lg:justify-start 
                            space-x-4 lg:space-x-6 pt-4 text-white/80">
                  <div class="flex items-center space-x-2">
                    <div class="flex space-x-1">
                      @for (star of [1,2,3,4,5]; track star) {
                        <svg class="w-4 h-4 text-yellow-400" 
                             fill="currentColor" 
                             viewBox="0 0 20 20"
                             aria-hidden="true">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      }
                    </div>
                    <span class="font-noto-sans text-sm font-medium">
                      Plataforma confiable
                    </span>
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5 text-agri-green-300" 
                         fill="none" 
                         stroke="currentColor" 
                         viewBox="0 0 24 24"
                         aria-hidden="true">
                      <path stroke-linecap="round" 
                            stroke-linejoin="round" 
                            stroke-width="2" 
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                    <span class="font-noto-sans text-sm font-medium">
                      100% Seguro
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Curved Bottom Border -->
        <div class="absolute bottom-0 left-0 right-0">
          <svg class="w-full h-16 sm:h-20 lg:h-24 fill-white" 
               viewBox="0 0 1440 120" 
               preserveAspectRatio="none"
               aria-hidden="true">
            <path d="M0,0 C480,120 960,120 1440,0 L1440,120 L0,120 Z" />
          </svg>
        </div>
      </div>
    </header>
  `,
  styles: [`
    /* Enhanced animations for premium feel */
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-10px) rotate(2deg); }
    }
    
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    
    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
    
    .animate-shimmer {
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
      background-size: 200% 100%;
      animation: shimmer 3s infinite;
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
      .bg-white\\/10 {
        background-color: rgba(255, 255, 255, 0.3);
      }
      .border-white\\/20 {
        border-color: rgba(255, 255, 255, 0.5);
      }
    }
  `]
})
export class AuthHeaderComponent {
  /**
   * Component Input Properties
   * Allow customization for different auth screens
   */
  @Input() headline: string = 'Conéctate con el campo';
  @Input() description: string = 'Únete a la red más grande de productores y compradores agrícolas del Ecuador. Conectamos directamente el campo con tu mesa.';
  @Input() ctaText: string = 'Conócenos';
  @Input() showFeatures: boolean = true;

  /**
   * Output events
   */
  ctaClicked = output<void>();

  /**
   * Feature highlights - using signals for reactivity
   */
  protected readonly features = signal<string[]>([
    'Red confiable',
    'Precios justos', 
    'Entrega directa',
    '10k+ usuarios'
  ]);

  /**
   * Handle CTA button click
   * Emits event for parent component to handle
   */
  protected onCtaClick(): void {
    // Emit the event for parent components to handle
    this.ctaClicked.emit();
    
    // Optional: Default behavior - scroll to main content
    this.scrollToMainContent();
    
    // Analytics tracking (if implemented)
    try {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'cta_click', {
          event_category: 'engagement',
          event_label: 'auth_header_cta',
          value: 1
        });
      }
    } catch (error) {
      // Silently handle gtag errors
      console.debug('Analytics tracking not available:', error);
    }
  }

  /**
   * Smooth scroll to main content
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