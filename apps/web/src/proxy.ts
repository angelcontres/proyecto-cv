import { NextRequest, NextResponse } from "next/server";
import { EDGE_SESSION_COOKIE_NAME, isValidEdgeSessionCookie } from "@cv/api-auth/edge";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedPage = pathname.startsWith("/admin") || pathname.startsWith("/studio");

  if (!isProtectedPage) {
    return NextResponse.next();
  }

  const token = request.cookies.get(EDGE_SESSION_COOKIE_NAME)?.value;
  const valid = await isValidEdgeSessionCookie(token);

  if (!valid) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/studio/:path*"],
};
