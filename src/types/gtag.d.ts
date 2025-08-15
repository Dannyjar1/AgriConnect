/**
 * Google Analytics Global Site Tag (gtag) Type Definitions
 * Compatible with Angular 20 and TypeScript strict mode
 */

declare global {
  /**
   * Google Analytics gtag function
   * @see https://developers.google.com/analytics/devguides/collection/gtagjs
   */
  function gtag(
    command: 'config' | 'event' | 'js' | 'set',
    targetId: string | Date,
    config?: {
      // Config parameters
      page_title?: string;
      page_location?: string;
      page_path?: string;
      send_page_view?: boolean;
      custom_map?: { [key: string]: string };
      
      // Event parameters
      event_category?: string;
      event_label?: string;
      value?: number;
      currency?: string;
      transaction_id?: string;
      
      // User properties
      user_id?: string;
      user_properties?: { [key: string]: any };
      
      // Custom parameters
      [key: string]: any;
    }
  ): void;

  /**
   * Google Analytics dataLayer
   */
  var dataLayer: any[];

  /**
   * Google Analytics measurement ID
   */
  var GA_MEASUREMENT_ID: string;
}

/**
 * Type definitions for gtag commands
 */
export interface GtagConfigParams {
  page_title?: string;
  page_location?: string;
  page_path?: string;
  send_page_view?: boolean;
  custom_map?: { [key: string]: string };
  [key: string]: any;
}

export interface GtagEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  currency?: string;
  transaction_id?: string;
  [key: string]: any;
}

/**
 * Helper types for better type safety
 */
export type GtagCommand = 'config' | 'event' | 'js' | 'set';
export type GtagTarget = string | Date;

export {};