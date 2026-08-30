import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "influstore_session";

function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "influstore-development-fallback-secret-key-32-chars";
  return new TextEncoder().encode(secret);
}

// Protected route prefixes that require an authenticated session
const protectedRoutes = [
  "/settings",
  "/api/profile",
  "/saved",
  "/api/saved",
  "/create-post",
  "/create-reel",
  "/seller",
  "/api/seller",
  "/admin",
  "/api/admin",
];

// Route prefixes that require the ADMIN role, on top of authentication.
// This is a fast UX redirect ONLY — the authoritative check is
// requireAdmin() (src/lib/auth/admin.ts), which every admin page/route
// re-verifies server-side against the database. Never rely on this
// middleware check alone: the JWT's role claim can be up to 7 days stale.
const adminOnlyRoutes = ["/admin", "/api/admin"];

// Auth routes where authenticated users should be redirected away
const authRoutes = ["/login", "/register", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  let isAuthenticated = false;
  let role: string | undefined;

  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, getAuthSecret());
      isAuthenticated = true;
      role = typeof payload.role === "string" ? payload.role : undefined;
    } catch {
      isAuthenticated = false;
    }
  }

  // 1. If user is authenticated and tries to visit /login, /register, redirect to /home
  if (isAuthenticated && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // 2. If user is NOT authenticated and tries to visit a protected route
  if (!isAuthenticated && protectedRoutes.some((route) => pathname.startsWith(route))) {
    // For API routes, return JSON 401 Unauthorized
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // For web pages, redirect to /login with callbackUrl
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Authenticated but non-admin users hitting /admin* pages get bounced
  // immediately (nice UX, avoids a flash of admin UI). /api/admin/* is left
  // to return its own 403 from requireAdmin() so callers get a JSON body.
  if (
    isAuthenticated &&
    role !== "ADMIN" &&
    adminOnlyRoutes.some((route) => pathname.startsWith(route)) &&
    !pathname.startsWith("/api/")
  ) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, svgs, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
