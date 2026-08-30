/**
 * Central limits for the product catalog system. Shared between
 * client-side forms and server-side validation so the two never drift
 * apart.
 */

export const PRODUCT_NAME_MAX_LENGTH = 140;
export const PRODUCT_DESCRIPTION_MAX_LENGTH = 5000;

export const SKU_MAX_LENGTH = 64;

export const MAX_PRODUCT_OPTIONS = 3;
export const MAX_OPTION_VALUES_PER_OPTION = 20;
export const OPTION_NAME_MAX_LENGTH = 40;
export const OPTION_VALUE_MAX_LENGTH = 40;

export const MAX_VARIANTS_PER_PRODUCT = 100;

export const DEFAULT_PRODUCT_CURRENCY = "INR";

// An allow-list, not a hardcoded single currency — adding one is a
// one-line change, never a schema change (Phase 6 spec section 12).
export const SUPPORTED_CURRENCIES = ["INR", "USD", "EUR", "GBP"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const MAX_PRICE = 10_000_000;
export const MAX_STOCK_PER_VARIANT = 1_000_000;

export const PRODUCT_PAGE_SIZE = 24;
export const MY_PRODUCTS_PAGE_SIZE = 20;
