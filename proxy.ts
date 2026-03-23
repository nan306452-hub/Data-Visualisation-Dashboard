import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const authCookie = request.cookies.get("auth")?.value;

  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const isLoginRoute = request.nextUrl.pathname.startsWith("/login");

  if (isDashboardRoute && authCookie !== "true") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoginRoute && authCookie === "true") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};