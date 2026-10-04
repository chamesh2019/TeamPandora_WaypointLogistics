/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getOverview } from "../app/api/dispatcher/overview/route";
import * as guard from "../lib/api/guard";
import { apiError } from "../lib/api/response";
import type { DispatcherAuthContext } from "../lib/types/dispatcher-api";

describe("GET /api/dispatcher/overview Route Handler", () => {
  const mockAuthContext: DispatcherAuthContext = {
    userId: "usr-disp-001",
    username: "dispatcher1",
    role: "dispatcher",
    depotId: "PELIYAGODA",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 401 when authentication fails", async () => {
    vi.spyOn(guard, "requireDispatcher").mockResolvedValue(
      apiError("UNAUTHORIZED", "Unauthorized: Authentication required", 401)
    );

    const req = new Request("http://localhost:3000/api/dispatcher/overview");
    const res = await getOverview(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 403 when user does not have dispatcher role", async () => {
    vi.spyOn(guard, "requireDispatcher").mockResolvedValue(
      apiError("FORBIDDEN_ROLE", "Forbidden: Access requires dispatcher role", 403)
    );

    const req = new Request("http://localhost:3000/api/dispatcher/overview");
    const res = await getOverview(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("FORBIDDEN_ROLE");
  });

  it("returns 200 with kpis, queue, exceptions, and metadata for authenticated dispatcher", async () => {
    vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);

    const req = new Request("http://localhost:3000/api/dispatcher/overview?depotId=PELIYAGODA");
    const res = await getOverview(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(json.data.kpis).toBeDefined();
    expect(json.data.kpis.confirmedOrders).toBeDefined();
    expect(json.data.kpis.activeFleet).toBeDefined();
    expect(json.data.kpis.lateRisk).toBeDefined();
    expect(json.data.kpis.cutoffTimer).toBeDefined();
    expect(Array.isArray(json.data.queue)).toBe(true);
    expect(Array.isArray(json.data.exceptions)).toBe(true);
    expect(Array.isArray(json.data.depots)).toBe(true);
    expect(Array.isArray(json.data.vehicles)).toBe(true);
  });
});
