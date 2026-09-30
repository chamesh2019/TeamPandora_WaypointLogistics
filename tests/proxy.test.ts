import { describe, it, expect } from "vitest";
import { proxy, isPublicPath, isAuthorizedForPath } from "@/proxy";
import { NextRequest } from "next/server";

describe("Proxy Route Protection", () => {
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

  it("allows unauthenticated requests on public routes through", async () => {
    const req = new NextRequest("http://localhost:3000/login");
    const response = await proxy(req);
    expect(response.status).toBe(200);
  });
});
