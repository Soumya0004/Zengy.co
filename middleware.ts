import { auth } from "@/auth";
import { NextResponse } from "next/server";

const adminRoutes = ["/admin"]; // startsWith will handle sub-paths
const adminApiRoutes = ["/api/admin"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;
  const role = user?.role;

  const isAdminRoute = adminRoutes.some((route) => nextUrl.pathname.startsWith(route));
  const isAdminApiRoute = adminApiRoutes.some((route) => nextUrl.pathname.startsWith(route));
  
  // 1. Redirect Admin to Dashboard if they are on the Homepage or Login
  // This ensures that as soon as they login, they get "pushed" to /admin
  const isPublicRoute = nextUrl.pathname === "/" || nextUrl.pathname === "/login";
  
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