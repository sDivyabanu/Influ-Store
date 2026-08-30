import { SellerApplication, SellerVerificationDocument } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getPrivateDocumentStorageService } from "@/lib/storage";
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError } from "@/lib/errors";
import { MAX_DOCUMENTS_PER_APPLICATION } from "@/lib/constants/seller";
import {
  sellerApplicationSubmitSchema,
  SellerApplicationDraftInput,
} from "@/lib/validations/seller.schema";
import { RegisterSellerDocumentInput } from "@/lib/validations/seller-document.schema";
import { SellerApplicationItem, SellerDocumentItem } from "@/types/seller";
import { assertSellerDocumentKeyOwnedByUser } from "./seller-document-upload.service";

/** Statuses in which the applicant may still edit fields or documents. */
const EDITABLE_STATUSES = ["DRAFT", "REJECTED"] as const;

type ApplicationWithDocuments = SellerApplication & {
  documents: SellerVerificationDocument[];
};

function serializeDocument(doc: SellerVerificationDocument): SellerDocumentItem {
  return {
    id: doc.id,
    type: doc.type,
    originalFilename: doc.originalFilename,
    mimeType: doc.mimeType,
    fileSize: doc.fileSize,
    createdAt: doc.createdAt,
  };
}

function serializeApplication(app: ApplicationWithDocuments): SellerApplicationItem {
  return {
    id: app.id,
    status: app.status,
    businessName: app.businessName,
    businessType: app.businessType,
    description: app.description,
    contactEmail: app.contactEmail,
    contactPhone: app.contactPhone,
    addressLine: app.addressLine,
    city: app.city,
    state: app.state,
    country: app.country,
    postalCode: app.postalCode,
    submittedAt: app.submittedAt,
    reviewedAt: app.reviewedAt,
    rejectionReason: app.rejectionReason,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
    documents: app.documents.map(serializeDocument),
  };
}

function assertEditable(app: SellerApplication): void {
  if (!EDITABLE_STATUSES.includes(app.status as (typeof EDITABLE_STATUSES)[number])) {
    throw new ConflictError(
      app.status === "APPROVED"
        ? "This application has already been approved and can no longer be edited."
        : "Your application is under review and can't be edited right now."
    );
  }
}

/** Returns the current user's application (with documents), or null if they haven't started one. */
export async function getMyApplication(userId: string): Promise<SellerApplicationItem | null> {
  const app = await prisma.sellerApplication.findUnique({
    where: { userId },
    include: { documents: { orderBy: { createdAt: "asc" } } },
  });
  if (!app) return null;
  return serializeApplication(app);
}

/** Creates the application row on first save, or updates fields on an editable one. */
export async function saveDraft(
  userId: string,
  input: SellerApplicationDraftInput
): Promise<SellerApplicationItem> {
  const existing = await prisma.sellerApplication.findUnique({ where: { userId } });

  if (existing) {
    assertEditable(existing);
  }

  const data: {
    businessName?: string;
    businessType?: string;
    description?: string | null;
    contactEmail?: string;
    contactPhone?: string;
    addressLine?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  } = {};
  if (input.businessName !== undefined) data.businessName = input.businessName;
  if (input.businessType !== undefined) data.businessType = input.businessType;
  if (input.description !== undefined) data.description = input.description;
  if (input.contactEmail !== undefined) data.contactEmail = input.contactEmail;
  if (input.contactPhone !== undefined) data.contactPhone = input.contactPhone;
  if (input.addressLine !== undefined) data.addressLine = input.addressLine;
  if (input.city !== undefined) data.city = input.city;
  if (input.state !== undefined) data.state = input.state;
  if (input.country !== undefined) data.country = input.country;
  if (input.postalCode !== undefined) data.postalCode = input.postalCode;

  const app = existing
    ? await prisma.sellerApplication.update({
        where: { userId },
        data,
        include: { documents: { orderBy: { createdAt: "asc" } } },
      })
    : await prisma.sellerApplication.create({
        data: { userId, ...data },
        include: { documents: { orderBy: { createdAt: "asc" } } },
      });

  return serializeApplication(app);
}

/** Validates the stored application is complete, then transitions DRAFT/REJECTED -> PENDING. */
export async function submitApplication(userId: string): Promise<SellerApplicationItem> {
  const existing = await prisma.sellerApplication.findUnique({
    where: { userId },
    include: { documents: true },
  });
  if (!existing) {
    throw new NotFoundError("Save your application details before submitting.");
  }
  assertEditable(existing);

  // Re-validates the STORED row server-side — never trusts that the
  // client-side form already enforced completeness.
  sellerApplicationSubmitSchema.parse({
    businessName: existing.businessName,
    businessType: existing.businessType,
    description: existing.description,
    contactEmail: existing.contactEmail,
    contactPhone: existing.contactPhone,
    addressLine: existing.addressLine,
    city: existing.city,
    state: existing.state,
    country: existing.country,
    postalCode: existing.postalCode,
  });

  if (existing.documents.length === 0) {
    throw new BadRequestError("Please upload at least one verification document before submitting.");
  }

  const app = await prisma.sellerApplication.update({
    where: { userId },
    data: {
      status: "PENDING",
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null,
    },
    include: { documents: { orderBy: { createdAt: "asc" } } },
  });

  return serializeApplication(app);
}

export async function addDocument(
  userId: string,
  input: RegisterSellerDocumentInput
): Promise<SellerDocumentItem> {
  assertSellerDocumentKeyOwnedByUser(input.storageKey, userId);

  const application = await prisma.sellerApplication.findUnique({
    where: { userId },
    include: { _count: { select: { documents: true } } },
  });
  if (!application) {
    throw new NotFoundError("Save your application details before uploading documents.");
  }
  assertEditable(application);

  if (application._count.documents >= MAX_DOCUMENTS_PER_APPLICATION) {
    throw new ConflictError(`You can upload up to ${MAX_DOCUMENTS_PER_APPLICATION} documents.`);
  }

  const doc = await prisma.sellerVerificationDocument.create({
    data: {
      applicationId: application.id,
      type: input.type,
      storageKey: input.storageKey,
      originalFilename: input.originalFilename,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
    },
  });

  return serializeDocument(doc);
}

export async function removeDocument(userId: string, documentId: string): Promise<void> {
  const doc = await prisma.sellerVerificationDocument.findUnique({
    where: { id: documentId },
    include: { application: true },
  });
  if (!doc) {
    throw new NotFoundError("Document not found.");
  }
  // Never trust the URL alone — the owning application must belong to
  // the requesting user.
  if (doc.application.userId !== userId) {
    throw new ForbiddenError("You can only remove your own documents.");
  }
  assertEditable(doc.application);

  await prisma.sellerVerificationDocument.delete({ where: { id: documentId } });

  const storage = getPrivateDocumentStorageService();
  await storage.deleteFile(doc.storageKey);
}
