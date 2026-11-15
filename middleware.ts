import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import { checkRateLimit } from "./lib/rate-limit";

// Initialize NextAuth with the light, edge-safe config only
const { auth } = NextAuth(authConfig);

const adminRoutes = ["/admin"];
const adminApiRoutes = ["/api/admin"];

export default auth(async (req) => {
  const { nextUrl } = req;
  if (nextUrl.pathname.startsWith("/api/")) {
    const rateLimit = await checkRateLimit(req);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfter),
            "RateLimit-Limit": String(rateLimit.limit),
            "RateLimit-Remaining": "0",
            "RateLimit-Reset": String(rateLimit.retryAfter),
          },
        }
      );
    }
  }

  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;
  const role = user?.role;

  const isAdminRoute = adminRoutes.some((route) => nextUrl.pathname.startsWith(route));
  const isProductWriteApiRoute =
    (nextUrl.pathname === "/api/products" && req.method === "POST") ||
    (nextUrl.pathname.startsWith("/api/products/add/") &&
      req.method === "POST") ||
    (nextUrl.pathname.startsWith("/api/products/update/") &&
      req.method === "PUT") ||
    (nextUrl.pathname === "/api/products/delete" &&
      req.method === "DELETE");
  const isAdminApiRoute =
    adminApiRoutes.some((route) => nextUrl.pathname.startsWith(route)) ||
    isProductWriteApiRoute;
  
  const isPublicRoute = nextUrl.pathname === "/" || nextUrl.pathname === "/login";
  
  // 1. Redirect Admin to Dashboard if they are on the Homepage or Login
  if (isLoggedIn && role === "admin" && isPublicRoute) {
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  // 2. API protection
  if (isAdminApiRoute) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // 3. Page protection
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)"],
};