/**
 * Barrel export for shared components
 * Following Angular 20 naming conventions
 */

export { TutorialTrigger } from './tutorial-trigger/tutorial-trigger';

// Existing components - update these paths based on actual file names
// export * from './app-footer/app-footer.component';
// export * from './auth-header/auth-header.component';
// export * from './bank-transfer-modal/bank-transfer-modal.component';
// export * from './billing-modal/billing-modal.component';
// export * from './checkout-overlay/checkout-overlay.component';
// export * from './credit-card-modal/credit-card-modal.component';
// export * from './product-card/product-card.component';
// export * from './shared-header/shared-header.component';

// Add more component exports as needed
 * Shared Components Index - AgriConnect Angular 20
 * 
 * Centralized exports for all shared components following Angular 20 conventions.
 * This allows for cleaner imports across the application.
 * 
 * Usage:
 * import { CheckoutOverlay, BankTransferModal } from '@shared/components';
 * 
 * @author AgriConnect Team
 * @version 1.0.0
 */

// Authentication components
export { AuthHeaderComponent as AuthHeader } from './auth-header/auth-header';

// Layout components  
export { AppFooterComponent as AppFooter } from './app-footer/app-footer';
export { SharedHeaderComponent } from './shared-header/shared-header.component';

// Product components
export { ProductCard } from './product-card/product-card';

// Checkout components
export { CheckoutOverlay } from './checkout-overlay/checkout-overlay';
export { BankTransferModal } from './bank-transfer-modal/bank-transfer-modal';
export { CreditCardModal } from './credit-card-modal/credit-card-modal';

// Modal components
export { RoleSelectionModal } from './role-selection-modal/role-selection-modal';