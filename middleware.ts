import { auth } from "@/auth";
import { NextResponse } from "next/server";

const adminRoutes = [
  "/admin",
  "/admin/products",
  "/admin/orders",
  "/admin/users",
];

const adminApiRoutes = [
  "/api/admin",
  // "/api/admin/orders",
  "/api/admin/users",
];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;

  const isAdminRoute = adminRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  const isAdminApiRoute = adminApiRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // ✅ API protection
  if (isAdminApiRoute) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }
  }

  // ✅ Page protection
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL("/login", nextUrl)
      );
    }

    if (user?.role !== "admin") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)",
  ],
};