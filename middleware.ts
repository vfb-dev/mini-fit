import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token");

  const isAuthPage = request.nextUrl.pathname === "/login";

  // User not authenticated
  if (!accessToken && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // User authenticated and trying to access login
  if (accessToken && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login"],
};
