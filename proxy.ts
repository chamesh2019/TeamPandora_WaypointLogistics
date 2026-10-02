import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export const ROLE_PERMITTED_ROUTES: Record<string, string[]> = {
  dispatcher: ["/dispatcher", "/control-tower", "/fleet", "/trips", "/orders", "/exceptions"],
  loader: ["/loader", "/dock", "/loading", "/manifest"],
  driver: ["/driver", "/route", "/pod"],
  store_manager: ["/store", "/receiving", "/disputes"],
};

export function isPublicPath(pathname: string): boolean {
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return true;
  }
  return false;
}

export function isAuthorizedForPath(role: string, pathname: string): boolean {
  const allowedPrefixes = ROLE_PERMITTED_ROUTES[role] || [];
  return allowedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(req);

  // If no session token found in cookies, check Authorization header (e.g., driver bearer token)
  const authHeader = req.headers.get("authorization");
  const hasBearerToken = authHeader && authHeader.startsWith("Bearer ");

  if (!sessionCookie && !hasBearerToken) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
