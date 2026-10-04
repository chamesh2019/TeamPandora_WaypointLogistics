import { describe, it, expect } from "vitest";
import { ROLE_PERMITTED_ROUTES, isPublicPath } from "@/proxy";

describe("Auth Integration Smoke Suite", () => {
  it("verifies public and operational route configuration", () => {
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/api/auth/sign-in/username")).toBe(true);
    expect(ROLE_PERMITTED_ROUTES.dispatcher).toContain("/dispatcher");
    expect(ROLE_PERMITTED_ROUTES.loader).toContain("/loader");
    expect(ROLE_PERMITTED_ROUTES.driver).toContain("/driver");
    expect(ROLE_PERMITTED_ROUTES.store_manager).toContain("/store");
  });
});
