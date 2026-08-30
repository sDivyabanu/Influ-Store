/**
 * Central limits for the seller application / verification system.
 */

export const SUPPORTED_DOCUMENT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;
export type SupportedDocumentMimeType = (typeof SUPPORTED_DOCUMENT_MIME_TYPES)[number];

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_DOCUMENTS_PER_APPLICATION = 6;

export const BUSINESS_NAME_MAX_LENGTH = 120;
export const BUSINESS_TYPE_MAX_LENGTH = 60;
export const APPLICATION_DESCRIPTION_MAX_LENGTH = 2000;
export const REJECTION_REASON_MAX_LENGTH = 1000;

/** How long an admin's signed document-view URL stays valid. */
export const SIGNED_DOCUMENT_URL_EXPIRY_SECONDS = 5 * 60; // 5 minutes

export const SELLER_APPLICATIONS_PAGE_SIZE = 20;

export const BUSINESS_TYPE_OPTIONS = [
  "Individual / Sole Proprietor",
  "Partnership",
  "Private Limited Company",
  "LLC",
  "Other",
] as const;
