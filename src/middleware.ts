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
];

// Auth routes where authenticated users should be redirected away
const authRoutes = ["/login", "/register", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  let isAuthenticated = false;

  if (sessionCookie) {
    try {
      await jwtVerify(sessionCookie, getAuthSecret());
      isAuthenticated = true;
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
