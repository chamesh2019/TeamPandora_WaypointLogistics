/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getFleet, PATCH as patchFleet } from "../app/api/dispatcher/fleet/route";
import { GET as getFleetKpis } from "../app/api/dispatcher/fleet/kpis/route";
import * as guard from "../lib/api/guard";
import { apiError } from "../lib/api/response";
import type { DispatcherAuthContext } from "../lib/types/dispatcher-api";

describe("/api/dispatcher/fleet and /api/dispatcher/fleet/kpis Route Handlers", () => {
  const mockAuthContext: DispatcherAuthContext = {
    userId: "usr-disp-001",
    username: "dispatcher1",
    role: "dispatcher",
    depotId: "PELIYAGODA",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/dispatcher/fleet", () => {
    it("returns 401 when authentication fails", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(
        apiError("UNAUTHORIZED", "Unauthorized: Authentication required", 401)
      );

      const req = new Request("http://localhost:3000/api/dispatcher/fleet");
      const res = await getFleet(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("returns 403 when user does not have dispatcher role", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(
        apiError("FORBIDDEN_ROLE", "Forbidden: Access requires dispatcher role", 403)
      );

      const req = new Request("http://localhost:3000/api/dispatcher/fleet");
      const res = await getFleet(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("FORBIDDEN_ROLE");
    });

    it("returns 200 with vehicles and kpis for authenticated dispatcher", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);

      const req = new Request("http://localhost:3000/api/dispatcher/fleet?depotId=PELIYAGODA");
      const res = await getFleet(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(json.data.kpis).toBeDefined();
      expect(Array.isArray(json.data.vehicles)).toBe(true);
      expect(Array.isArray(json.data.drivers)).toBe(true);
    });
  });

  describe("PATCH /api/dispatcher/fleet", () => {
    it("returns 400 when vehicleId is missing", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);

      const req = new Request("http://localhost:3000/api/dispatcher/fleet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in_workshop" }),
      });
      const res = await patchFleet(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    it("returns 200 on successful vehicle update", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);

      const req = new Request("http://localhost:3000/api/dispatcher/fleet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId: "VEH014", status: "in_workshop" }),
      });
      const res = await patchFleet(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.vehicleId).toBe("VEH014");
      expect(json.data.status).toBe("in_workshop");

      // Reset back to available
      const resetReq = new Request("http://localhost:3000/api/dispatcher/fleet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId: "VEH014", status: "available" }),
      });
      await patchFleet(resetReq);
    });

    it("returns 400 when attempting to send an active vehicle into workshop", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);

      const req = new Request("http://localhost:3000/api/dispatcher/fleet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId: "VEH001", status: "in_workshop" }),
      });
      const res = await patchFleet(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.message).toMatch(/Cannot send vehicle to workshop/);
    });
  });

  describe("GET /api/dispatcher/fleet/kpis", () => {
    it("returns 200 with 10-day history for all 4 KPIs", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);

      const req = new Request("http://localhost:3000/api/dispatcher/fleet/kpis?depotId=PELIYAGODA");
      const res = await getFleetKpis(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.days).toBe(10);
      expect(json.data.metrics.totalFleet.history.length).toBe(10);
      expect(json.data.metrics.available.history.length).toBe(10);
      expect(json.data.metrics.reeferTrucks.history.length).toBe(10);
      expect(json.data.metrics.inWorkshop.history.length).toBe(10);
    });
  });
});
