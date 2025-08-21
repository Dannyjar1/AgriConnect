/**
 * Shared Components Index - AgriConnect Angular 20
 * 
 * Centralized esxports for all shared components following Angular 20 conventions.
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

// Utility components
export { AutoRedirect } from './auto-redirect/auto-redirect';

// Admin components
export { AdminHeaderComponent } from './admin-header/admin-header.component';
export { RegisterProductModal } from './register-product-modal/register-product-modal';
export { SeedButtonComponent } from './seed-button/seed-button.component';
export { BillingModal } from './billing-modal/billing-modal';

// Image upload components
export { ImageUploadComponent } from './image-upload/image-upload.component';
export type { UploadedImage } from './image-upload/image-upload.component';
