import { describe, it, expect, vi, beforeEach } from "vitest";
import { proxy, isPublicPath, isAuthorizedForPath } from "@/proxy";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

function mockSession(role: string, id: string = "u-1") {
  return {
    user: {
      id,
      name: "Test User",
      email: `${role}@example.com`,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      role,
    },
    session: {
      id: `s-${id}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: id,
      expiresAt: new Date(Date.now() + 86400000),
      token: "test-token",
    },
  } as unknown as Awaited<ReturnType<typeof auth.api.getSession>>;
}

describe("Proxy Route Protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows public assets and auth endpoints without session", () => {
    expect(isPublicPath("/")).toBe(true);
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/api/auth/sign-in/username")).toBe(true);
    expect(isPublicPath("/api/auth/get-session")).toBe(true);
    expect(isPublicPath("/_next/static/chunk.js")).toBe(true);
  });

  it("identifies protected operational routes", () => {
    expect(isPublicPath("/dispatcher")).toBe(false);
    expect(isPublicPath("/loader")).toBe(false);
    expect(isPublicPath("/driver")).toBe(false);
    expect(isPublicPath("/store")).toBe(false);
  });

  it("evaluates role-based access correctly", () => {
    expect(isAuthorizedForPath("dispatcher", "/dispatcher/control-tower")).toBe(true);
    expect(isAuthorizedForPath("loader", "/dispatcher/control-tower")).toBe(false);
    expect(isAuthorizedForPath("loader", "/loader/dock-manifest")).toBe(true);
    expect(isAuthorizedForPath("driver", "/driver/route-leg")).toBe(true);
    expect(isAuthorizedForPath("store_manager", "/store/receiving")).toBe(true);
  });

  it("redirects unauthenticated requests on protected routes to login", async () => {
    const req = new NextRequest("http://localhost:3000/dispatcher/fleet");
    const response = await proxy(req);
    expect(response).toBeDefined();
    expect(response.status).toBe(307); // NextResponse.redirect default
    expect(response.headers.get("location")).toContain("/login?redirect=%2Fdispatcher%2Ffleet");
  });

  it("redirects requests with invalid/expired session to login", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost:3000/dispatcher/fleet", {
      headers: {
        cookie: "better-auth.session_token=expired-token",
      },
    });
    const response = await proxy(req);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login?redirect=%2Fdispatcher%2Ffleet");
  });

  it("redirects requests when getSession throws an error", async () => {
    vi.mocked(auth.api.getSession).mockRejectedValueOnce(new Error("DB failure"));

    const req = new NextRequest("http://localhost:3000/dispatcher/fleet", {
      headers: {
        cookie: "better-auth.session_token=some-token",
      },
    });
    const response = await proxy(req);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login?redirect=%2Fdispatcher%2Ffleet");
  });

  it("allows unauthenticated requests on public routes through", async () => {
    const req = new NextRequest("http://localhost:3000/login");
    const response = await proxy(req);
    expect(response.status).toBe(200);
  });

  it("allows authenticated requests with authorized role through", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession("dispatcher", "u-1"));

    const req = new NextRequest("http://localhost:3000/dispatcher/fleet", {
      headers: {
        cookie: "better-auth.session_token=valid-token",
      },
    });
    const response = await proxy(req);
    expect(response.status).toBe(200);
  });

  it("logs out user, clears cookies, and redirects to /login when role is not authorized for protected path", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession("loader", "u-2"));
    vi.mocked(auth.api.signOut).mockResolvedValueOnce({
      success: true,
      url: undefined,
      redirect: false,
    });

    const req = new NextRequest("http://localhost:3000/dispatcher/fleet", {
      headers: {
        cookie: "better-auth.session_token=valid-token",
      },
    });
    const response = await proxy(req);

    expect(auth.api.signOut).toHaveBeenCalled();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
    const setCookieHeaders = response.headers.getSetCookie();
    expect(setCookieHeaders.some((c) => c.includes("better-auth.session_token=") && c.includes("Expires=Thu, 01 Jan 1970"))).toBe(true);
  });

  it("handles driver bearer token authorization correctly", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession("driver", "u-3"));

    const req = new NextRequest("http://localhost:3000/driver/route", {
      headers: {
        authorization: "Bearer driver-jwt-token",
      },
    });
    const response = await proxy(req);
    expect(response.status).toBe(200);
  });
});
