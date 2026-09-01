import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { AuthenticatedUser } from "@/types/user";
import { SessionPayload } from "@/types/auth";

export const SESSION_COOKIE_NAME = "influstore_session";
const SESSION_EXPIRY = "7d"; // 7 days
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // in seconds

function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "influstore-development-fallback-secret-key-32-chars";
  return new TextEncoder().encode(secret);
}

/**
 * Sign a new JWT session token
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRY)
    .sign(getAuthSecret());
}

/**
 * Verify and decode a JWT session token
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Set the session cookie on the response (for server actions/route handlers)
 */
export async function setSessionCookie(payload: SessionPayload): Promise<string> {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return token;
}

/**
 * Delete the session cookie (logout)
 */
export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Get current session payload from cookies
 */
export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  return verifySessionToken(sessionCookie);
}

/**
 * Retrieve the full authenticated user with their profile from the database
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        profile: {
          select: {
            id: true,
            displayName: true,
            bio: true,
            avatarUrl: true,
            website: true,
            accountType: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error("Error retrieving current user:", error);
    return null;
  }
}
