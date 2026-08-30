import { getCurrentUser } from "@/lib/auth/session";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import { AuthenticatedUser } from "@/types/user";

/**
 * The single source of truth for "is this request an admin?" — every
 * admin API route and every admin page must call this. It always does a
 * fresh DB-backed lookup via getCurrentUser() rather than trusting a
 * role claim embedded in the (potentially stale, up to 7 days old)
 * session JWT. Never rely on hiding UI elements, and never check
 * something like `user.email === "..."` client-side — this is the
 * server-side gate that actually matters.
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError("Unauthorized. Please log in.");
  }
  if (user.role !== "ADMIN") {
    throw new ForbiddenError("Admin access required.");
  }
  return user;
}
