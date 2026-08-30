import { z } from "zod";
import {
  BUSINESS_NAME_MAX_LENGTH,
  BUSINESS_TYPE_MAX_LENGTH,
  APPLICATION_DESCRIPTION_MAX_LENGTH,
  REJECTION_REASON_MAX_LENGTH,
} from "@/lib/constants/seller";

// Reasonably permissive — digits, spaces, and common phone punctuation.
const phoneRegex = /^[+]?[0-9()\-.\s]{7,20}$/;

/**
 * Draft schema: every field optional so a step-by-step form can save
 * partial progress. Full completeness is enforced separately by
 * sellerApplicationSubmitSchema, applied server-side against the
 * currently stored row right before transitioning to PENDING.
 */
export const sellerApplicationDraftSchema = z.object({
  businessName: z.string().trim().min(1).max(BUSINESS_NAME_MAX_LENGTH).optional(),
  businessType: z.string().trim().min(1).max(BUSINESS_TYPE_MAX_LENGTH).optional(),
  description: z
    .string()
    .trim()
    .max(APPLICATION_DESCRIPTION_MAX_LENGTH)
    .optional()
    .nullable(),
  contactEmail: z.string().trim().email("Please provide a valid email address").optional(),
  contactPhone: z
    .string()
    .trim()
    .regex(phoneRegex, "Please provide a valid phone number")
    .optional(),
  addressLine: z.string().trim().min(1).max(200).optional(),
  city: z.string().trim().min(1).max(100).optional(),
  state: z.string().trim().min(1).max(100).optional(),
  country: z.string().trim().min(1).max(100).optional(),
  postalCode: z.string().trim().min(1).max(20).optional(),
});
export type SellerApplicationDraftInput = z.infer<typeof sellerApplicationDraftSchema>;

/**
 * Strict schema validated server-side (against the stored row, not raw
 * client input) immediately before a DRAFT/REJECTED application is
 * allowed to transition to PENDING.
 */
export const sellerApplicationSubmitSchema = z.object({
  businessName: z.string().trim().min(2, "Business name is required").max(BUSINESS_NAME_MAX_LENGTH),
  businessType: z.string().trim().min(2, "Business type is required").max(BUSINESS_TYPE_MAX_LENGTH),
  description: z.string().trim().max(APPLICATION_DESCRIPTION_MAX_LENGTH).optional().nullable(),
  contactEmail: z.string().trim().email("A valid contact email is required"),
  contactPhone: z.string().trim().regex(phoneRegex, "A valid contact phone number is required"),
  addressLine: z.string().trim().min(3, "Address is required").max(200),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.string().trim().min(1, "State/region is required").max(100),
  country: z.string().trim().min(1, "Country is required").max(100),
  postalCode: z.string().trim().min(3, "Postal code is required").max(20),
});
export type SellerApplicationSubmitInput = z.infer<typeof sellerApplicationSubmitSchema>;

export const adminRejectApplicationSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Please provide a rejection reason")
    .max(REJECTION_REASON_MAX_LENGTH),
});
export type AdminRejectApplicationInput = z.infer<typeof adminRejectApplicationSchema>;
