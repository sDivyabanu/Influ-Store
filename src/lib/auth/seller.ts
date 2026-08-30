import { getCurrentUser } from "@/lib/auth/session";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import { AuthenticatedUser } from "@/types/user";

/**
 * The single source of truth for "is this request an approved seller?" —
 * every seller management API route and page must call this. Always a
 * fresh DB-backed lookup via getCurrentUser(), never a trusted claim
 * from the browser. Mirrors lib/auth/admin.ts's requireAdmin().
 *
 * Deliberately SELLER-only (no ADMIN bypass): store/product management
 * is a distinct surface from Phase 5's admin verification tooling, and
 * blurring the two would widen the authorization surface without a
 * concrete Phase 6 need for it.
 */
export async function requireSeller(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError("Unauthorized. Please log in.");
  }
  if (user.role !== "SELLER") {
    throw new ForbiddenError("An approved seller account is required.");
  }
  return user;
}
