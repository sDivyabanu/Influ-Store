import { SellerApplicationStatus, SellerDocumentType } from "@prisma/client";

export type { SellerApplicationStatus, SellerDocumentType };

export interface SellerDocumentItem {
  id: string;
  type: SellerDocumentType;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  createdAt: string | Date;
}

/** The current user's own application — safe to return to them in full. */
export interface SellerApplicationItem {
  id: string;
  status: SellerApplicationStatus;
  businessName: string;
  businessType: string;
  description: string | null;
  contactEmail: string;
  contactPhone: string;
  addressLine: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  submittedAt: string | Date | null;
  reviewedAt: string | Date | null;
  rejectionReason: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  documents: SellerDocumentItem[];
}

/** Applicant summary shown in the admin applications list. */
export interface AdminSellerApplicationSummary {
  id: string;
  status: SellerApplicationStatus;
  businessName: string;
  submittedAt: string | Date | null;
  createdAt: string | Date;
  applicant: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    email: string;
  };
}

/** Full detail shown on the admin review page — still no storageKey anywhere. */
export interface AdminSellerApplicationDetail extends SellerApplicationItem {
  applicant: AdminSellerApplicationSummary["applicant"];
  reviewer: { id: string; username: string; displayName: string } | null;
}
