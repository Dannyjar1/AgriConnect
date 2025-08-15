import { Component, Input, Output, EventEmitter, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tutorial } from '../../../core/services/tutorial';
import type { UserRole, TutorialContext } from '../../../core/models/tutorial.model';

/**
 * Enhanced Tutorial Trigger Component - Modern UI/UX Implementation
 * 
 * Premium tutorial trigger with glassmorphism effects, smooth animations,
 * and seamless integration with AgriConnect design system.
 * 
 * Features:
 * - Floating action button with pulse animation
 * - Glassmorphism auto-prompt with premium styling
 * - Responsive design with mobile optimization
 * - Accessibility-first approach (WCAG 2.1 AA)
 * - Smooth micro-interactions and animations
 * - Real-time progress indicator
 * - Multi-state loading and success feedback
 * 
 * @example
 * ```html
 * <app-tutorial-trigger 
 *   userRole="producer" 
 *   context="dashboard"
 *   [showFloatingButton]="true"
 *   [showAutoPrompt]="true"
 *   variant="floating"
 *   (tutorialStarted)="onTutorialStarted()"
 *   (tutorialCompleted)="onTutorialCompleted()">
 * </app-tutorial-trigger>
 * ```
 * 
 * @version 2.0.0
 * @author AgriConnect Team
 */
@Component({
  selector: 'app-tutorial-trigger',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Floating Action Button Trigger -->
    @if (variant === 'floating' && showFloatingButton) {
      <div class="tutorial-floating-trigger" 
           [class.tutorial-floating-trigger--mobile]="isMobileView()"
           role="region" 
           aria-label="Tutorial Helper">
        <button
          type="button"
          class="trigger-button"
          [class.loading]="isLoading()"
          [class.pulse]="shouldShowPulse()"
          [disabled]="isLoading() || tutorialService.isActive()"
          (click)="startTutorial()"
          [attr.aria-label]="getButtonAriaLabel()"
          [attr.aria-describedby]="showTooltip ? 'tutorial-tooltip' : null"
        >
          <span class="sr-only">{{ getButtonAriaLabel() }}</span>
          
          @if (isLoading()) {
            <!-- Loading spinner -->
            <svg class="icon loading-spin" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          } @else if (tutorialService.isActive()) {
            <!-- Active tutorial icon -->
            <svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
            </svg>
          } @else {
            <!-- Default help icon -->
            <svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m12 17 .01 0"></path>
            </svg>
          }
          
          <!-- New tutorial notification badge -->
          @if (hasNewTutorials() && !tutorialService.isActive()) {
            <div class="notification-badge" 
                 aria-label="Nuevos tutoriales disponibles"
                 role="status">
            </div>
          }
        </button>
        
        <!-- Tooltip -->
        @if (showTooltip) {
          <div id="tutorial-tooltip" 
               class="trigger-tooltip" 
               role="tooltip"
               [attr.aria-hidden]="!showTooltip">
            {{ tooltipText }}
          </div>
        }
        
        <!-- Progress indicator for active tutorial -->
        @if (tutorialService.isActive() && showProgress) {
          <div class="floating-progress" 
               role="progressbar"
               [attr.aria-valuenow]="tutorialService.currentStep()"
               [attr.aria-valuemax]="tutorialService.totalSteps()"
               [attr.aria-valuetext]="getProgressText()">
            <div class="progress-ring">
              <svg width="56" height="56" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="25" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"></circle>
                <circle cx="28" cy="28" r="25" fill="none" stroke="white" stroke-width="2"
                        [style.stroke-dasharray]="157"
                        [style.stroke-dashoffset]="157 - (tutorialService.progress() / 100 * 157)"
                        class="progress-circle"></circle>
              </svg>
              <span class="progress-text" aria-hidden="true">
                {{ tutorialService.currentStep() }}/{{ tutorialService.totalSteps() }}
              </span>
            </div>
          </div>
        }
      </div>
    }

    <!-- Inline Button Trigger -->
    @if (variant === 'inline' && showButton) {
      <div class="tutorial-inline-trigger">
        <button
          type="button"
          class="inline-trigger-button"
          [class.tutorial-active]="tutorialService.isActive()"
          [disabled]="isLoading() || tutorialService.isActive()"
          (click)="startTutorial()"
          [attr.aria-label]="getButtonAriaLabel()"
        >
          @if (isLoading()) {
            <svg class="loading-spin inline-icon" fill="none" viewBox="0 0 24 24" width="16" height="16">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Iniciando...</span>
          } @else {
            <svg class="inline-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{{ buttonText }}</span>
          }
        </button>
        
        <!-- Inline progress indicator -->
        @if (showProgress && tutorialService.isActive()) {
          <div class="inline-progress-indicator" role="progressbar"
               [attr.aria-valuenow]="tutorialService.progress()"
               [attr.aria-valuemax]="100"
               [attr.aria-valuetext]="getProgressText()">
            <div class="progress-bar-wrapper">
              <div class="progress-bar-fill" 
                   [style.width.%]="tutorialService.progress()">
              </div>
            </div>
            <span class="progress-text" aria-live="polite">
              {{ getProgressText() }}
            </span>
          </div>
        }
      </div>
    }

    <!-- Enhanced Auto Prompt -->
    @if (showAutoPrompt && shouldShowPrompt()) {
      <div class="tutorial-auto-prompt" 
           [class.fade-in]="!hasPromptBeenShown()"
           role="dialog"
           aria-labelledby="prompt-title"
           aria-describedby="prompt-description"
           [attr.aria-hidden]="!shouldShowPrompt()">
        
        <div class="prompt-content">
          <div class="prompt-icon" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m12 17 .01 0"></path>
            </svg>
          </div>
          
          <div class="prompt-text">
            <h3 id="prompt-title" class="prompt-title">
              ¿Primera vez en {{ getContextLabel() }}?
            </h3>
            <p id="prompt-description" class="prompt-description">
              Te ofrecemos un tutorial interactivo para conocer las funcionalidades principales 
              y aprovechar al máximo tu experiencia en AgriConnect.
            </p>
          </div>
        </div>
        
        <div class="prompt-actions">
          <button
            type="button"
            class="prompt-dismiss"
            (click)="dismissPrompt()"
            [attr.aria-label]="'Cerrar tutorial automático para ' + getContextLabel()"
          >
            No, gracias
          </button>
          <button
            type="button"
            class="prompt-start"
            (click)="startTutorialFromPrompt()"
            [disabled]="isLoading()"
            [attr.aria-label]="'Iniciar tutorial para ' + getContextLabel()"
          >
            @if (isLoading()) {
              <svg class="loading-spin prompt-icon-small" fill="none" viewBox="0 0 24 24" width="16" height="16">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Iniciando...
            } @else {
              <svg class="prompt-icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              Comenzar tutorial
            }
          </button>
        </div>
        
        <button
          type="button"
          class="prompt-close"
          (click)="dismissPrompt()"
          aria-label="Cerrar aviso de tutorial"
        >
          <svg class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    }
  `,
  styles: [`
    /* Enhanced Floating Trigger Styles - No @apply directives */
    .tutorial-floating-trigger {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 1000;
      
      .trigger-button {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 4rem;
        height: 4rem;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        color: white;
        font-size: 1.25rem;
        font-weight: 500;
        transition: all 0.3s ease-out;
        outline: none;
        
        background: linear-gradient(135deg, 
          var(--color-agri-green-600), 
          var(--color-agri-green-700)
        );
        box-shadow: 
          0 8px 32px rgba(22, 163, 74, 0.3),
          0 4px 16px rgba(0, 0, 0, 0.1);
        
        /* Pulse ring animation */
        &::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid var(--color-agri-green-500);
          animation: ping 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          opacity: 0.6;
          pointer-events: none;
        }
        
        &.pulse::before {
          animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
        }
        
        &:hover {
          transform: scale(1.1);
          box-shadow: 
            0 12px 40px rgba(22, 163, 74, 0.4),
            0 6px 20px rgba(0, 0, 0, 0.15);
        }
        
        &:focus {
          box-shadow: 
            0 8px 32px rgba(22, 163, 74, 0.3),
            0 4px 16px rgba(0, 0, 0, 0.1),
            0 0 0 4px var(--color-agri-green-200);
        }
        
        &:active {
          transform: scale(0.95);
        }
        
        &:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: scale(1);
          
          &:hover {
            transform: scale(1);
          }
        }
        
        .icon {
          transition: transform 0.2s;
        }
        
        .loading-spin {
          animation: spin 1s linear infinite;
        }
        
        .notification-badge {
          position: absolute;
          top: -0.25rem;
          right: -0.25rem;
          width: 1rem;
          height: 1rem;
          background-color: var(--color-red-500);
          border-radius: 50%;
          border: 2px solid white;
          animation: bounce 1s infinite;
        }
      }
      
      .trigger-tooltip {
        position: absolute;
        bottom: 100%;
        right: 0;
        margin-bottom: 0.75rem;
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: rgb(31 41 55);
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 0.5rem;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        opacity: 0;
        pointer-events: none;
        transition: all 0.2s;
        white-space: nowrap;
      }
      
      .trigger-button:hover + .trigger-tooltip,
      .trigger-button:focus + .trigger-tooltip {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0);
      }
      
      /* Floating progress ring */
      .floating-progress {
        position: absolute;
        top: -0.5rem;
        left: -0.5rem;
        right: -0.5rem;
        bottom: -0.5rem;
        pointer-events: none;
        
        .progress-ring {
          position: relative;
          width: 100%;
          height: 100%;
          
          svg {
            position: absolute;
            inset: 0;
            transform: rotate(-90deg);
          }
          
          .progress-circle {
            transition: all 0.5s ease-out;
            stroke-linecap: round;
          }
          
          .progress-text {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 700;
            color: white;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          }
        }
      }
      
      &.tutorial-floating-trigger--mobile {
        bottom: 1rem;
        right: 1rem;
        
        .trigger-button {
          width: 3.5rem;
          height: 3.5rem;
          font-size: 1.125rem;
        }
      }
    }

    /* Enhanced Inline Trigger Styles */
    .tutorial-inline-trigger {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      
      .inline-trigger-button {
        display: flex;
        align-items: center;
        padding: 0.75rem 1.5rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: rgb(75 85 99);
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        border: 1px solid rgba(229, 231, 235, 0.8);
        border-radius: 0.75rem;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        transition: all 0.2s;
        outline: none;
        cursor: pointer;
        
        .inline-icon {
          margin-right: 0.5rem;
          flex-shrink: 0;
        }
        
        .loading-spin {
          animation: spin 1s linear infinite;
        }
        
        &:hover {
          background: var(--color-agri-green-50);
          color: var(--color-agri-green-700);
          border-color: var(--color-agri-green-200);
          transform: translateY(-0.125rem);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
        
        &:focus {
          box-shadow: 0 0 0 2px var(--color-agri-green-500);
        }
        
        &.tutorial-active {
          background: var(--color-agri-green-100);
          color: var(--color-agri-green-800);
          border-color: var(--color-agri-green-300);
        }
        
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: translateY(0);
        }
      }
      
      .inline-progress-indicator {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        
        .progress-bar-wrapper {
          width: 100%;
          background: rgba(229, 231, 235, 0.8);
          border-radius: 1rem;
          height: 0.5rem;
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
          
          .progress-bar-fill {
            height: 100%;
            border-radius: 1rem;
            transition: width 0.5s ease-out;
            position: relative;
            overflow: hidden;
            background: linear-gradient(90deg, 
              var(--color-agri-green-500), 
              var(--color-agri-green-600)
            );
            
            /* Shimmer effect */
            &::after {
              content: '';
              position: absolute;
              inset: 0;
              background: linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.4),
                transparent
              );
              animation: shimmer 2s infinite;
            }
          }
        }
        
        .progress-text {
          font-size: 0.75rem;
          color: rgb(107 114 128);
          text-align: center;
          font-weight: 500;
        }
      }
    }

    /* Enhanced Auto Prompt Styles */
    .tutorial-auto-prompt {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      max-width: 24rem;
      z-index: 50;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 1rem;
      box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      transform: translateY(0);
      transition: all 0.5s;
      
      /* Premium border effect */
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
      }
      
      .prompt-content {
        padding: 1.5rem;
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        
        .prompt-icon {
          flex-shrink: 0;
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          background: linear-gradient(135deg, 
            var(--color-agri-green-100), 
            var(--color-agri-green-200)
          );
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-agri-green-600);
        }
        
        .prompt-text {
          flex: 1;
          
          .prompt-title {
            font-size: 1.125rem;
            font-weight: 700;
            color: rgb(17 24 39);
            margin: 0 0 0.5rem 0;
            font-family: 'Epilogue', system-ui, sans-serif;
            letter-spacing: -0.025em;
          }
          
          .prompt-description {
            font-size: 0.875rem;
            color: rgb(107 114 128);
            line-height: 1.5;
            margin: 0 0 1.5rem 0;
            font-family: 'Noto Sans', system-ui, sans-serif;
          }
        }
      }
      
      .prompt-actions {
        display: flex;
        gap: 0.75rem;
        padding: 0 1.5rem 1.5rem 1.5rem;
        
        .prompt-dismiss,
        .prompt-start {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 0.5rem;
          transition: all 0.2s;
          outline: none;
          border: none;
          cursor: pointer;
          
          &:focus {
            box-shadow: 0 0 0 2px var(--color-agri-green-500);
          }
        }
        
        .prompt-dismiss {
          color: rgb(107 114 128);
          background: rgba(243, 244, 246, 0.8);
          
          &:hover {
            background: rgba(229, 231, 235, 0.9);
            color: rgb(55 65 81);
          }
        }
        
        .prompt-start {
          color: white;
          background: linear-gradient(135deg, 
            var(--color-agri-green-600), 
            var(--color-agri-green-700)
          );
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          
          .prompt-icon-small {
            margin-right: 0.5rem;
            flex-shrink: 0;
          }
          
          .loading-spin {
            animation: spin 1s linear infinite;
          }
          
          &:hover {
            background: linear-gradient(135deg, 
              var(--color-agri-green-700), 
              var(--color-agri-green-800)
            );
            transform: translateY(-0.125rem);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          }
          
          &:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: translateY(0);
          }
        }
      }
      
      .prompt-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        padding: 0.5rem;
        color: rgb(156 163 175);
        background: rgba(243, 244, 246, 0.5);
        border: none;
        border-radius: 0.375rem;
        transition: all 0.2s;
        cursor: pointer;
        
        .close-icon {
          display: block;
        }
        
        &:hover {
          background: rgba(239, 68, 68, 0.1);
          color: rgb(239, 68, 68);
        }
        
        &:focus {
          outline: none;
          box-shadow: 0 0 0 2px var(--color-agri-green-500);
        }
      }
      
      &.fade-in {
        animation: slideInUpBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
    }

    /* Responsive adjustments */
    @media (max-width: 640px) {
      .tutorial-auto-prompt {
        bottom: 1rem;
        right: 1rem;
        left: 1rem;
        max-width: none;
        
        .prompt-content {
          padding: 1rem;
          gap: 0.75rem;
          
          .prompt-icon {
            width: 2.5rem;
            height: 2.5rem;
          }
          
          .prompt-text .prompt-title {
            font-size: 1rem;
          }
        }
        
        .prompt-actions {
          padding: 0 1rem 1rem 1rem;
          flex-direction: column;
          gap: 0.5rem;
        }
      }
    }

    /* Custom animations */
    @keyframes pulse-ring {
      0% {
        transform: scale(1);
        opacity: 0.6;
      }
      100% {
        transform: scale(1.8);
        opacity: 0;
      }
    }

    @keyframes slideInUpBounce {
      0% {
        opacity: 0;
        transform: translateY(2rem);
      }
      60% {
        opacity: 1;
        transform: translateY(-0.25rem);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes bounce {
      0%, 20%, 53%, 80%, 100% {
        transform: translate3d(0, 0, 0);
      }
      40%, 43% {
        transform: translate3d(0, -0.5rem, 0);
      }
      70% {
        transform: translate3d(0, -0.25rem, 0);
      }
      90% {
        transform: translate3d(0, -0.125rem, 0);
      }
    }

    @keyframes ping {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    /* High contrast support */
    @media (prefers-contrast: high) {
      .tutorial-floating-trigger .trigger-button {
        border: 2px solid white;
      }
      
      .tutorial-auto-prompt {
        border: 2px solid rgb(209 213 219);
        background: white;
        backdrop-filter: none;
      }
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .tutorial-floating-trigger .trigger-button,
      .tutorial-auto-prompt,
      .inline-trigger-button,
      .progress-bar-fill {
        transition: none;
        animation: none !important;
      }
      
      .tutorial-floating-trigger .trigger-button:hover {
        transform: scale(1);
      }
    }
  `]
})
export class TutorialTrigger implements OnDestroy {
  
  // Injected services
  protected readonly tutorialService = inject(Tutorial);
  
  // Input properties
  @Input() userRole: UserRole = 'buyer';
  @Input() context: TutorialContext = 'dashboard';
  @Input() variant: 'floating' | 'inline' = 'floating';
  @Input() showButton: boolean = true;
  @Input() showFloatingButton: boolean = true;
  @Input() showProgress: boolean = true;
  @Input() showAutoPrompt: boolean = false;
  @Input() showTooltip: boolean = true;
  @Input() buttonText: string = 'Iniciar tutorial';
  @Input() tooltipText: string = 'Ayuda interactiva';
  @Input() autoStartDelay: number = 3000; // milliseconds
  @Input() enablePulseAnimation: boolean = true;
  
  // Output events
  @Output() tutorialStarted = new EventEmitter<void>();
  @Output() tutorialCompleted = new EventEmitter<void>();
  @Output() tutorialCancelled = new EventEmitter<void>();
  @Output() promptDismissed = new EventEmitter<void>();
  
  // Internal state
  protected readonly isLoading = signal<boolean>(false);
  private readonly hasPromptBeenShown = signal<boolean>(false);
  private readonly isMobileView = signal<boolean>(false);
  private autoPromptTimeout?: number;
  private resizeObserver?: ResizeObserver;
  private checkIntervalId?: number;
  
  // Computed properties
  protected readonly shouldShowPulse = () => 
    this.enablePulseAnimation && 
    !this.tutorialService.isActive() && 
    !this.isLoading() &&
    this.hasNewTutorials();

  constructor() {
    // Initialize mobile detection
    this.checkMobileView();
    this.setupResizeObserver();
    
    // Auto-start prompt if enabled
    if (this.showAutoPrompt) {
      this.scheduleAutoPrompt();
    }
    
    // Listen to tutorial events
    this.setupEventListeners();
  }

  /**
   * Start tutorial manually
   */
  async startTutorial(): Promise<void> {
    if (this.isLoading() || this.tutorialService.isActive()) {
      return;
    }

    this.isLoading.set(true);
    
    try {
      await this.tutorialService.startWelcomeTour(this.userRole, this.context);
      this.tutorialStarted.emit();
      
      // Track analytics
      this.trackTutorialEvent('tutorial_started', {
        userRole: this.userRole,
        context: this.context,
        variant: this.variant
      });
      
    } catch (error) {
      console.error('Error starting tutorial:', error);
      this.showErrorFeedback();
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Start tutorial from auto prompt
   */
  async startTutorialFromPrompt(): Promise<void> {
    this.dismissPrompt();
    
    // Small delay for smooth transition
    setTimeout(async () => {
      await this.startTutorial();
    }, 150);
  }

  /**
   * Dismiss auto prompt
   */
  dismissPrompt(): void {
    this.hasPromptBeenShown.set(false);
    
    if (this.autoPromptTimeout) {
      clearTimeout(this.autoPromptTimeout);
    }
    
    // Remember user preference
    const dismissKey = `tutorial_prompt_dismissed_${this.context}_${this.userRole}`;
    localStorage.setItem(dismissKey, JSON.stringify({
      dismissed: true,
      timestamp: Date.now(),
      version: '2.0'
    }));
    
    this.promptDismissed.emit();
    
    // Track analytics
    this.trackTutorialEvent('prompt_dismissed', {
      context: this.context,
      userRole: this.userRole
    });
  }

  /**
   * Check if should show auto prompt
   */
  protected shouldShowPrompt(): boolean {
    if (!this.showAutoPrompt) return false;
    if (this.tutorialService.isTutorialCompleted()) return false;
    if (this.tutorialService.isActive()) return false;
    
    const dismissKey = `tutorial_prompt_dismissed_${this.context}_${this.userRole}`;
    const dismissed = localStorage.getItem(dismissKey);
    
    if (dismissed) {
      try {
        const dismissData = JSON.parse(dismissed);
        const daysSinceDismiss = (Date.now() - dismissData.timestamp) / (1000 * 60 * 60 * 24);
        
        // Show again after 7 days
        if (daysSinceDismiss < 7) {
          return false;
        }
      } catch (e) {
        // Invalid data, show prompt
      }
    }
    
    return this.hasPromptBeenShown();
  }

  /**
   * Check if has new tutorials available
   */
  protected hasNewTutorials(): boolean {
    // In a real implementation, this would check for new tutorial content
    // For now, return true if tutorial hasn't been completed
    return !this.tutorialService.isTutorialCompleted(`${this.userRole}-${this.context}`);
  }

  /**
   * Get context label for display
   */
  protected getContextLabel(): string {
    const labels: Record<TutorialContext, string> = {
      'dashboard': 'Panel de Control',
      'marketplace': 'Marketplace',
      'product-create': 'Creación de Productos',
      'product-edit': 'Edición de Productos',
      'profile': 'Perfil',
      'orders': 'Pedidos',
      'cart': 'Carrito'
    };
    
    return labels[this.context] || 'la aplicación';
  }

  /**
   * Get accessible button aria-label
   */
  protected getButtonAriaLabel(): string {
    if (this.isLoading()) {
      return `Iniciando tutorial para ${this.getContextLabel()}`;
    }
    
    if (this.tutorialService.isActive()) {
      return `Tutorial activo: ${this.tutorialService.currentStep()} de ${this.tutorialService.totalSteps()}`;
    }
    
    return `Iniciar tutorial interactivo para ${this.getContextLabel()}`;
  }

  /**
   * Get progress text for screen readers
   */
  protected getProgressText(): string {
    return `Paso ${this.tutorialService.currentStep()} de ${this.tutorialService.totalSteps()}`;
  }

  /**
   * Schedule auto prompt appearance
   */
  private scheduleAutoPrompt(): void {
    if (!this.showAutoPrompt) return;
    
    this.autoPromptTimeout = window.setTimeout(() => {
      if (!this.tutorialService.isTutorialCompleted() && 
          !this.tutorialService.isActive() &&
          this.shouldShowPrompt()) {
        this.hasPromptBeenShown.set(true);
      }
    }, this.autoStartDelay);
  }

  /**
   * Setup event listeners for tutorial state
   */
  private setupEventListeners(): void {
    // Check tutorial status periodically
    this.checkIntervalId = window.setInterval(() => {
      if (!this.tutorialService.isActive() && this.isLoading()) {
        this.isLoading.set(false);
        
        if (this.tutorialService.isTutorialCompleted()) {
          this.tutorialCompleted.emit();
          this.showSuccessFeedback();
        } else {
          this.tutorialCancelled.emit();
        }
      }
    }, 1000);
  }

  /**
   * Check if current view is mobile
   */
  private checkMobileView(): void {
    this.isMobileView.set(window.innerWidth < 640);
  }

  /**
   * Setup resize observer for responsive behavior
   */
  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.checkMobileView();
      });
      
      this.resizeObserver.observe(document.body);
    } else {
      // Fallback to window resize event
      window.addEventListener('resize', () => {
        this.checkMobileView();
      });
    }
  }

  /**
   * Show success feedback
   */
  private showSuccessFeedback(): void {
    // Could integrate with a toast service here
    console.log('Tutorial completed successfully! 🎉');
  }

  /**
   * Show error feedback
   */
  private showErrorFeedback(): void {
    // Could integrate with a toast service here
    console.error('Error starting tutorial. Please try again.');
  }

  /**
   * Track tutorial analytics events
   */
  private trackTutorialEvent(event: string, data: any): void {
    // In a real implementation, this would send data to analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, {
        event_category: 'Tutorial',
        event_label: `${data.userRole}-${data.context}`,
        custom_parameter_variant: data.variant,
        custom_parameter_context: data.context
      });
    }
  }

  /**
   * Cleanup on component destroy
   */
  ngOnDestroy(): void {
    if (this.autoPromptTimeout) {
      clearTimeout(this.autoPromptTimeout);
    }
    
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}