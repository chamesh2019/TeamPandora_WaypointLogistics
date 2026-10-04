import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const ROLE_PERMITTED_ROUTES: Record<string, string[]> = {
  dispatcher: ["/dispatcher", "/control-tower", "/fleet", "/trips", "/orders", "/exceptions", "/allocation", "/trip-planning", "/users", "/reports", "/forecast", "/profile"],
  loader: ["/loader", "/dock", "/loading", "/manifest", "/profile"],
  driver: ["/driver", "/route", "/pod", "/profile"],
  store_manager: ["/store", "/receiving", "/disputes", "/profile"],
};

export function isPublicPath(pathname: string): boolean {
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/.well-known") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return true;
  }
  return false;
}

export function isAuthorizedForPath(role: string, pathname: string): boolean {
  const allowedPrefixes = ROLE_PERMITTED_ROUTES[role] || [];
  return allowedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

const AUTH_COOKIES_TO_CLEAR = [
  "better-auth.session_token",
  "better-auth.session_data",
  "better-auth.dont_remember",
  "better-auth.account_data",
  "__Secure-better-auth.session_token",
  "__Secure-better-auth.session_data",
  "__Secure-better-auth.dont_remember",
  "__Secure-better-auth.account_data",
];

interface ProxyUser {
  id?: string;
  role?: string;
  [key: string]: unknown;
}

interface ProxySessionResult {
  user?: ProxyUser | null;
  session?: unknown;
}

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }


  let sessionRes: ProxySessionResult | null = null;
  try {
    sessionRes = await auth.api.getSession({
      headers: req.headers,
    });
  } catch {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!sessionRes || !sessionRes.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = sessionRes.user.role;
  if (!userRole || !isAuthorizedForPath(userRole, pathname)) {
    try {
      await auth.api.signOut({
        headers: req.headers,
      });
    } catch {
      // Gracefully continue even if sign-out API throws
    }

    const loginUrl = new URL("/login", req.url);
    const response = NextResponse.redirect(loginUrl);

    for (const cookieName of AUTH_COOKIES_TO_CLEAR) {
      response.cookies.delete(cookieName);
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|\\.well-known|.*\\.[\\w]+$).*)",
  ],
};
