import { prisma } from "@/lib/db/prisma";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { MAX_PRODUCT_TAGS_PER_CONTENT } from "@/lib/constants/product";

/**
 * Enforces Phase 6 spec section 29: only a product's own seller may tag
 * it, and only in their own content — never someone else's product,
 * never a product that isn't ACTIVE (a tag preview is public, so a
 * DRAFT/ARCHIVED product must never leak into a feed response via a
 * tag). Shared by post and reel product tagging; throws on any
 * violation, returns nothing on success.
 */
export async function assertProductsTaggableByUser(userId: string, productIds: string[]): Promise<void> {
  if (productIds.length === 0) return;

  if (productIds.length > MAX_PRODUCT_TAGS_PER_CONTENT) {
    throw new BadRequestError(`You can tag up to ${MAX_PRODUCT_TAGS_PER_CONTENT} products.`);
  }

  const uniqueIds = Array.from(new Set(productIds));
  if (uniqueIds.length !== productIds.length) {
    throw new BadRequestError("Duplicate product tags are not allowed.");
  }

  const products = await prisma.product.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true, status: true, sellerProfile: { select: { userId: true } } },
  });

  if (products.length !== uniqueIds.length) {
    throw new NotFoundError("One or more tagged products could not be found.");
  }
  if (products.some((p) => p.sellerProfile.userId !== userId)) {
    throw new ForbiddenError("You can only tag your own products.");
  }
  if (products.some((p) => p.status !== "ACTIVE")) {
    throw new BadRequestError("Only active products can be tagged.");
  }
}
