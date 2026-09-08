import { SellerApplicationStatus, SellerVerificationDocument } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { SELLER_APPLICATIONS_PAGE_SIZE } from "@/lib/constants/seller";
import {
  AdminSellerApplicationDetail,
  AdminSellerApplicationSummary,
  SellerDocumentItem,
} from "@/types/seller";
import { CursorPage } from "@/types/post";

/**
 * Every function here assumes it is only ever called from a route that
 * has already run requireAdmin() (see lib/auth/admin.ts) — it does not
 * re-check the caller's role itself, the same convention the rest of
 * the service layer follows (route handlers own authn/authz; services
 * own data access + business rules).
 */

const applicantSelect = {
  id: true,
  username: true,
  email: true,
  profile: { select: { displayName: true, avatarUrl: true } },
} as const;

function serializeApplicant(user: {
  id: string;
  username: string;
  email: string;
  profile: { displayName: string; avatarUrl: string | null } | null;
}): AdminSellerApplicationSummary["applicant"] {
  return {
    id: user.id,
    username: user.username,
    displayName: user.profile?.displayName || user.username,
    avatarUrl: user.profile?.avatarUrl ?? null,
    email: user.email,
  };
}

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

export async function listApplications(
  status?: SellerApplicationStatus,
  cursor?: string | null,
  limit: number = SELLER_APPLICATIONS_PAGE_SIZE
): Promise<CursorPage<AdminSellerApplicationSummary>> {
  const applications = await prisma.sellerApplication.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: { user: { select: applicantSelect } },
  });

  const hasMore = applications.length > limit;
  const page = hasMore ? applications.slice(0, limit) : applications;

  return {
    items: page.map((app) => ({
      id: app.id,
      status: app.status,
      businessName: app.businessName,
      submittedAt: app.submittedAt,
      createdAt: app.createdAt,
      applicant: serializeApplicant(app.user),
    })),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}

export async function getApplicationDetail(
  applicationId: string
): Promise<AdminSellerApplicationDetail | null> {
  const app = await prisma.sellerApplication.findUnique({
    where: { id: applicationId },
    include: {
      user: { select: applicantSelect },
      reviewer: { select: { id: true, username: true, profile: { select: { displayName: true } } } },
      documents: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!app) return null;

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
    applicant: serializeApplicant(app.user),
    reviewer: app.reviewer
      ? {
          id: app.reviewer.id,
          username: app.reviewer.username,
          displayName: app.reviewer.profile?.displayName || app.reviewer.username,
        }
      : null,
  };
}

/**
 * Looks up a document scoped to a specific application, so a documentId
 * can never be used to fetch a document belonging to a different
 * application than the one the admin is currently reviewing.
 */
export async function getDocumentForAdmin(
  applicationId: string,
  documentId: string
): Promise<SellerVerificationDocument | null> {
  const doc = await prisma.sellerVerificationDocument.findUnique({
    where: { id: documentId },
  });
  if (!doc || doc.applicationId !== applicationId) return null;
  return doc;
}

export async function approveApplication(
  applicationId: string,
  adminUserId: string
): Promise<void> {
  const app = await prisma.sellerApplication.findUnique({
    where: { id: applicationId },
    select: { status: true, userId: true },
  });
  if (!app) throw new NotFoundError("Application not found.");
  if (app.status !== "PENDING") {
    throw new ConflictError("Only pending applications can be approved.");
  }

  await prisma.$transaction([
    prisma.sellerApplication.update({
      where: { id: applicationId },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedBy: adminUserId,
        rejectionReason: null,
      },
    }),
    prisma.user.update({
      where: { id: app.userId },
      data: { role: "SELLER" },
    }),
  ]);
}

export async function rejectApplication(
  applicationId: string,
  adminUserId: string,
  reason: string
): Promise<void> {
  const app = await prisma.sellerApplication.findUnique({
    where: { id: applicationId },
    select: { status: true },
  });
  if (!app) throw new NotFoundError("Application not found.");
  if (app.status !== "PENDING") {
    throw new ConflictError("Only pending applications can be rejected.");
  }

  await prisma.sellerApplication.update({
    where: { id: applicationId },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedBy: adminUserId,
      rejectionReason: reason,
    },
  });
}
