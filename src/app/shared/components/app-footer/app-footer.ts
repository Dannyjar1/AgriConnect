import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Refined Minimalist Footer Component for AgriConnect
 * 
 * Features:
 * - Subtle blue gradient background complementing header design
 * - Rounded navigation buttons with proper touch targets
 * - Perfect logo alignment with AgriConnect text
 * - WCAG 2.1 AA compliant color contrast
 * - Responsive design for mobile and desktop
 * - Clean, elegant, and proportional layout
 * - Angular 20 standalone component architecture
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Minimalist Footer Container -->
    <footer class="bg-gradient-to-r from-blue-50 via-slate-50 to-blue-100 
                   border-t border-blue-200/30" 
            role="contentinfo" 
            aria-label="Información del sitio">
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        <!-- Main Footer Grid - Three Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-center">
          
          <!-- Left Section - Brand -->
          <div class="flex items-center justify-center lg:justify-start space-x-3 group">
            <!-- Logo Container with Perfect Alignment -->
            <div class="flex-shrink-0 p-2.5 bg-white rounded-xl shadow-sm 
                        group-hover:shadow-md transition-all duration-300">
              
              <!-- SVG Logo -->
              <img 
                src="/assets/images/agriconnect-logo.svg" 
                alt="AgriConnect logo"
                class="w-8 h-8 sm:w-9 sm:h-9"
                loading="lazy"
                width="36" 
                height="36"
                (error)="onImageError($event)"
                [style.display]="imageLoadError ? 'none' : 'block'">
                
              <!-- Fallback SVG with Agricultural Theme -->
              <svg 
                *ngIf="imageLoadError"
                class="w-8 h-8 sm:w-9 sm:h-9 text-agri-green-600" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true">
                <path d="M12 2L13.09 8.26L16 6L14.5 9.5L19 8L16.5 11.5L21 12L16.5 12.5L19 16L14.5 14.5L16 18L13.09 15.74L12 22L10.91 15.74L8 18L9.5 14.5L5 16L7.5 12.5L3 12L7.5 11.5L5 8L9.5 9.5L8 6L10.91 8.26L12 2Z"/>
              </svg>
            </div>
            
            <!-- Brand Text with Perfect Alignment -->
            <div class="flex flex-col justify-center">
              <h2 class="font-epilogue text-xl sm:text-2xl font-bold text-slate-800 
                         leading-tight tracking-tight">
                AgriConnect
              </h2>
              <p class="font-noto-sans text-xs sm:text-sm text-slate-600 font-medium 
                        -mt-0.5">
                Marketplace Agrícola
              </p>
            </div>
          </div>
          
          <!-- Center Section - Message -->
          <div class="text-center">
            <p class="font-noto-sans text-sm sm:text-base text-slate-700 
                     leading-relaxed max-w-xs mx-auto">
              ¿Tienes alguna duda? 
              <span class="font-medium text-slate-800 block sm:inline">
                Escríbenos en nuestros canales digitales
              </span>
            </p>
          </div>
          
          <!-- Right Section - Social Media & Copyright -->
          <div class="flex flex-col items-center lg:items-end space-y-4">
            
            <!-- Social Media Icons -->
            <nav class="flex items-center gap-3" 
                 aria-label="Redes sociales de AgriConnect">
              
              <!-- Facebook Icon -->
              <a 
                href="https://facebook.com/agriconnect"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11
                       bg-white/80 hover:bg-white
                       text-blue-600 hover:text-blue-700
                       rounded-xl border border-blue-200/50
                       shadow-sm hover:shadow-md
                       transition-all duration-300 ease-out
                       focus:outline-none focus:ring-2 focus:ring-blue-500/20 
                       focus:border-blue-400
                       transform hover:scale-105 active:scale-95"
                aria-label="Síguenos en Facebook">
                
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              
              <!-- YouTube Icon -->
              <a 
                href="https://youtube.com/@agriconnect"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11
                       bg-white/80 hover:bg-white
                       text-red-600 hover:text-red-700
                       rounded-xl border border-blue-200/50
                       shadow-sm hover:shadow-md
                       transition-all duration-300 ease-out
                       focus:outline-none focus:ring-2 focus:ring-red-500/20 
                       focus:border-red-400
                       transform hover:scale-105 active:scale-95"
                aria-label="Síguenos en YouTube">
                
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              
              <!-- Instagram Icon -->
              <a 
                href="https://instagram.com/agriconnect"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11
                       bg-white/80 hover:bg-white
                       text-pink-600 hover:text-pink-700
                       rounded-xl border border-blue-200/50
                       shadow-sm hover:shadow-md
                       transition-all duration-300 ease-out
                       focus:outline-none focus:ring-2 focus:ring-pink-500/20 
                       focus:border-pink-400
                       transform hover:scale-105 active:scale-95"
                aria-label="Síguenos en Instagram">
                
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.24-3.44-.719-.854-.412-1.594-.99-2.207-1.725-.613-.735-1.094-1.627-1.438-2.675-.344-1.048-.516-2.171-.516-3.369 0-1.198.172-2.321.516-3.369.344-1.048.825-1.94 1.438-2.675.613-.735 1.353-1.313 2.207-1.725.992-.479 2.143-.719 3.44-.719s2.448.24 3.44.719c.854.412 1.594.99 2.207 1.725.613.735 1.094 1.627 1.438 2.675.344 1.048.516 2.171.516 3.369 0 1.198-.172 2.321-.516 3.369-.344 1.048-.825 1.94-1.438 2.675-.613.735-1.353 1.313-2.207 1.725-.992.479-2.143.719-3.44.719zm3.44-12.017c-.407 0-.781.06-1.122.181-.341.121-.652.296-.932.526-.281.23-.515.51-.703.84-.188.33-.282.7-.282 1.11s.094.78.282 1.11c.188.33.422.61.703.84.281.23.591.405.932.526.341.121.715.181 1.122.181s.781-.06 1.122-.181c.341-.121.652-.296.932-.526.281-.23.515-.51.703-.84.188-.33.282-.7.282-1.11s-.094-.78-.282-1.11c-.188-.33-.422-.61-.703-.84-.281-.23-.591-.405-.932-.526-.341-.121-.715-.181-1.122-.181z"/>
                </svg>
              </a>
              
              <!-- X (Twitter) Icon -->
              <a 
                href="https://x.com/agriconnect"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11
                       bg-white/80 hover:bg-white
                       text-gray-800 hover:text-gray-900
                       rounded-xl border border-blue-200/50
                       shadow-sm hover:shadow-md
                       transition-all duration-300 ease-out
                       focus:outline-none focus:ring-2 focus:ring-gray-500/20 
                       focus:border-gray-400
                       transform hover:scale-105 active:scale-95"
                aria-label="Síguenos en X (Twitter)">
                
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
                </svg>
              </a>
            </nav>
            
            <!-- Copyright Text -->
            <div class="text-center lg:text-right">
              <p class="font-noto-sans text-xs sm:text-sm text-slate-600">
                © {{ currentYear }} 
                <span class="font-medium text-slate-800">AgriConnect Ecuador</span>. 
                <span class="block sm:inline">Todos los derechos reservados.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    /* Enhanced micro-interactions for social media icons */
    a {
      position: relative;
      overflow: hidden;
    }
    
    /* Subtle shine effect on hover for social icons */
    a::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
      );
      transition: left 0.4s ease;
    }
    
    a:hover::before {
      left: 100%;
    }
    
    /* Ensure proper text contrast for accessibility */
    .text-slate-700 {
      color: rgb(51 65 85); /* Ensures 7:1 contrast ratio */
    }
    
    .text-slate-600 {
      color: rgb(71 85 105); /* Ensures 4.5:1 contrast ratio */
    }
    
    .text-slate-800 {
      color: rgb(30 41 59); /* Strong contrast for headings */
    }
    
    /* Social media icon specific hover effects */
    a[aria-label*="Facebook"]:hover {
      background-color: rgba(59, 89, 152, 0.1) !important;
    }
    
    a[aria-label*="YouTube"]:hover {
      background-color: rgba(255, 0, 0, 0.1) !important;
    }
    
    a[aria-label*="Instagram"]:hover {
      background-color: rgba(225, 48, 108, 0.1) !important;
    }
    
    a[aria-label*="Twitter"]:hover,
    a[aria-label*="X"]:hover {
      background-color: rgba(0, 0, 0, 0.05) !important;
    }
    
    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .bg-gradient-to-r {
        background: #1e40af !important; /* High contrast blue */
      }
      
      .border-blue-200\\/30 {
        border-color: #3b82f6 !important; /* More visible border */
      }
      
      .text-slate-600 {
        color: #000000 !important; /* Maximum contrast */
      }
      
      .text-slate-700 {
        color: #000000 !important; /* Maximum contrast */
      }
      
      /* High contrast social media icons */
      a {
        border: 2px solid #000000 !important;
      }
    }
    
    /* Respect reduced motion preferences */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      
      a {
        transform: none !important;
      }
      
      a:hover {
        transform: none !important;
      }
      
      a::before {
        display: none !important;
      }
    }
    
    /* Enhanced focus styles for social media accessibility */
    a:focus-visible {
      outline: 3px solid #22c55e;
      outline-offset: 3px;
      box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.2);
    }
    
    /* Dark mode support (if needed in future) */
    @media (prefers-color-scheme: dark) {
      .bg-gradient-to-r.from-blue-50 {
        background: linear-gradient(to right, rgb(30 41 59), rgb(51 65 85), rgb(30 41 59)) !important;
      }
      
      .text-slate-800 {
        color: rgb(226 232 240) !important;
      }
      
      .text-slate-700 {
        color: rgb(203 213 225) !important;
      }
      
      .text-slate-600 {
        color: rgb(148 163 184) !important;
      }
      
      /* Dark mode social media icons */
      a {
        background: rgba(255, 255, 255, 0.1) !important;
        border-color: rgba(255, 255, 255, 0.2) !important;
      }
      
      a:hover {
        background: rgba(255, 255, 255, 0.2) !important;
      }
    }
    
    /* Mobile-specific optimizations */
    @media (max-width: 640px) {
      /* Ensure adequate touch targets on mobile */
      a {
        min-width: 44px;
        min-height: 44px;
      }
      
      /* Slightly larger gap on mobile for easier tapping */
      nav[aria-label*="sociales"] {
        gap: 1rem;
      }
    }
  `]
})
export class AppFooterComponent {
  /**
   * Current year for copyright display
   */
  protected readonly currentYear = new Date().getFullYear();
  
  /**
   * Track image loading errors for fallback SVG
   */
  protected imageLoadError = false;
  
  /**
   * Handle SVG logo loading errors gracefully
   * Falls back to agricultural-themed SVG icon
   */
  protected onImageError(event: Event): void {
    console.warn('AgriConnect logo failed to load, using fallback icon');
    this.imageLoadError = true;
    
    // Hide the failed image element
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
    }
  }
}