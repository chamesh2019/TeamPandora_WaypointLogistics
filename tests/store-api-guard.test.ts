/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { requireStoreManager } from "../lib/api/guard";
import { auth } from "../lib/auth";
import { pool } from "../lib/db";

describe("Store Auth Guard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 401 when session is missing", async () => {
    vi.spyOn(auth.api, "getSession").mockResolvedValue(null as any);
    const req = new Request("http://localhost:3000/api/store/orders");
    const result = await requireStoreManager(req);
    expect(result instanceof Response).toBe(true);
    if (result instanceof Response) {
      expect(result.status).toBe(401);
      const body = await result.json();
      expect(body.error.code).toBe("UNAUTHORIZED");
    }
  });

  it("returns 401 when session user is missing or getSession throws", async () => {
    vi.spyOn(auth.api, "getSession").mockRejectedValue(new Error("Session error"));
    const req = new Request("http://localhost:3000/api/store/orders");
    const result = await requireStoreManager(req);
    expect(result instanceof Response).toBe(true);
    if (result instanceof Response) {
      expect(result.status).toBe(401);
      const body = await result.json();
      expect(body.error.code).toBe("UNAUTHORIZED");
    }
  });

  it("returns 403 when user role is driver and no outlet assigned", async () => {
    vi.spyOn(auth.api, "getSession").mockResolvedValue({
      user: { id: "u1", role: "driver", outletId: undefined },
      session: { id: "s1" },
    } as any);
    const req = new Request("http://localhost:3000/api/store/orders");
    const result = await requireStoreManager(req);
    expect(result instanceof Response).toBe(true);
    if (result instanceof Response) {
      expect(result.status).toBe(403);
      const body = await result.json();
      expect(body.error.code).toBe("FORBIDDEN_ROLE");
    }
  });

  it("returns 403 when user role is unauthorized even with outlet assigned", async () => {
    vi.spyOn(auth.api, "getSession").mockResolvedValue({
      user: { id: "u2", role: "loader", outletId: "OUT001" },
      session: { id: "s2" },
    } as any);
    const req = new Request("http://localhost:3000/api/store/orders");
    const result = await requireStoreManager(req);
    expect(result instanceof Response).toBe(true);
    if (result instanceof Response) {
      expect(result.status).toBe(403);
      const body = await result.json();
      expect(body.error.code).toBe("FORBIDDEN_ROLE");
    }
  });

  it("returns 403 when store_manager has no assigned outlet", async () => {
    vi.spyOn(auth.api, "getSession").mockResolvedValue({
      user: { id: "usr-stor-002", role: "store_manager", outletId: undefined },
      session: { id: "s2" },
    } as any);
    const req = new Request("http://localhost:3000/api/store/orders");
    const result = await requireStoreManager(req);
    expect(result instanceof Response).toBe(true);
    if (result instanceof Response) {
      expect(result.status).toBe(403);
      const body = await result.json();
      expect(body.error.code).toBe("MISSING_OUTLET");
    }
  });

  it("returns StoreAuthContext when user is store_manager with outlet", async () => {
    vi.spyOn(auth.api, "getSession").mockResolvedValue({
      user: { id: "usr-stor-001", role: "store_manager", outletId: "OUT001", name: "Store Mgr" },
      session: { id: "s1" },
    } as any);
    const req = new Request("http://localhost:3000/api/store/orders");
    const result = await requireStoreManager(req);
    expect(result instanceof Response).toBe(false);
    expect(result).toHaveProperty("outletId", "OUT001");
    expect(result).toHaveProperty("role", "store_manager");
    expect(result).toHaveProperty("userId", "usr-stor-001");
    expect(result).toHaveProperty("username", "Store Mgr");
    expect(result).toHaveProperty("brandId", "BRAND_FRESH");
  });

  it("allows dispatcher to access store scoped by query param outletId", async () => {
    vi.spyOn(auth.api, "getSession").mockResolvedValue({
      user: { id: "usr-disp-001", role: "dispatcher", username: "dispatcher_user" },
      session: { id: "s3" },
    } as any);
    const req = new Request("http://localhost:3000/api/store/orders?outletId=OUT081");
    const result = await requireStoreManager(req);
    expect(result instanceof Response).toBe(false);
    expect(result).toHaveProperty("outletId", "OUT081");
    expect(result).toHaveProperty("role", "dispatcher");
    expect(result).toHaveProperty("brandId", "BRAND_STYLE");
  });

  it("allows dispatcher to access store scoped by x-outlet-id header", async () => {
    vi.spyOn(auth.api, "getSession").mockResolvedValue({
      user: { id: "usr-disp-001", role: "dispatcher", username: "dispatcher_user" },
      session: { id: "s3" },
    } as any);
    const req = new Request("http://localhost:3000/api/store/orders", {
      headers: { "x-outlet-id": "OUT106" },
    });
    const result = await requireStoreManager(req);
    expect(result instanceof Response).toBe(false);
    expect(result).toHaveProperty("outletId", "OUT106");
    expect(result).toHaveProperty("role", "dispatcher");
    expect(result).toHaveProperty("brandId", "BRAND_TECH");
  });

  it("returns 403 for dispatcher when outlet is not provided", async () => {
    vi.spyOn(auth.api, "getSession").mockResolvedValue({
      user: { id: "usr-disp-001", role: "dispatcher", username: "dispatcher_user" },
      session: { id: "s3" },
    } as any);
    const req = new Request("http://localhost:3000/api/store/orders");
    const result = await requireStoreManager(req);
    expect(result instanceof Response).toBe(true);
    if (result instanceof Response) {
      expect(result.status).toBe(403);
      const body = await result.json();
      expect(body.error.code).toBe("MISSING_OUTLET");
    }
  });

  it("overrides dispatcher default outletId when query param outletId is provided", async () => {
    vi.spyOn(auth.api, "getSession").mockResolvedValue({
      user: { id: "usr-disp-001", role: "dispatcher", username: "dispatcher_user", outletId: "OUT001" },
      session: { id: "s3" },
    } as any);
    const req = new Request("http://localhost:3000/api/store/orders?outletId=OUT050");
    const result = await requireStoreManager(req);
    expect(result instanceof Response).toBe(false);
    expect(result).toHaveProperty("outletId", "OUT050");
    expect(result).toHaveProperty("role", "dispatcher");
  });

  it("resolves brandId from database when pool.query returns a row", async () => {
    vi.spyOn(auth.api, "getSession").mockResolvedValue({
      user: { id: "usr-stor-003", role: "store_manager", outletId: "CUSTOM_OUT" },
      session: { id: "s4" },
    } as any);
    vi.spyOn(pool, "query").mockResolvedValue({
      rows: [{ brand_id: "TECH" }],
      rowCount: 1,
    } as any);

    const req = new Request("http://localhost:3000/api/store/orders");
    const result = await requireStoreManager(req);
    expect(result instanceof Response).toBe(false);
    expect(result).toHaveProperty("brandId", "BRAND_TECH");
  });
});
