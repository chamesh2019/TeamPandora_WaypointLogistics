import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getOverview } from "../app/api/store/overview/route";
import { GET as getDeferrals } from "../app/api/store/deferrals/route";
import { GET as getReports } from "../app/api/store/reports/route";
import * as guard from "../lib/api/guard";
import { StoreService } from "../lib/services/store-service";
import { apiError } from "../lib/api/response";
import type { StoreAuthContext } from "../lib/types/store-api";

describe("Store Overview, Deferrals & Reports Routes", () => {
  const mockAuth: StoreAuthContext = {
    userId: "u1",
    username: "store1",
    role: "store_manager",
    outletId: "OUT001",
    brandId: "BRAND_FRESH",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------
  // GET /api/store/overview
  // -------------------------------------------------------------
  describe("GET /api/store/overview", () => {
    it("returns auth guard error response when unauthorized", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(
        apiError("UNAUTHORIZED", "Unauthorized: Valid session required", 401)
      );

      const res = await getOverview(new Request("http://localhost:3000/api/store/overview"));
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("GET /api/store/overview returns aggregated dashboard", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);
      vi.spyOn(StoreService, "getStoreOverview").mockResolvedValue({
        kpis: {
          activeOrdersCount: 2,
          nextArrival: null,
          pendingReceiptsCount: 1,
          activeDisputesCount: 0,
        },
        alerts: [],
        recentOrders: [],
      });

      const res = await getOverview(new Request("http://localhost:3000/api/store/overview"));
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.kpis.activeOrdersCount).toBe(2);
    });

    it("returns 500 when StoreService.getStoreOverview throws", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);
      vi.spyOn(StoreService, "getStoreOverview").mockRejectedValue(
        new Error("Database connection failure")
      );

      const res = await getOverview(new Request("http://localhost:3000/api/store/overview"));
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INTERNAL_SERVER_ERROR");
    });
  });

  // -------------------------------------------------------------
  // GET /api/store/deferrals
  // -------------------------------------------------------------
  describe("GET /api/store/deferrals", () => {
    it("returns auth guard error response when unauthorized", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(
        apiError("FORBIDDEN_ROLE", "Forbidden: Access requires store_manager or dispatcher role", 403)
      );

      const res = await getDeferrals(new Request("http://localhost:3000/api/store/deferrals"));
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("FORBIDDEN_ROLE");
    });

    it("GET /api/store/deferrals returns deferral notices", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);
      vi.spyOn(StoreService, "getStoreDeferrals").mockResolvedValue([
        {
          deferralId: "DEF-001",
          orderId: "ORD-001",
          outletId: "OUT001",
          orderDate: "2026-10-01",
          tempRequirement: "ambient",
          orderUnits: 50,
          orderWeightKg: 500,
          orderVolumeM3: 5,
          reasonCode: "CAPACITY_WEIGHT_EXCEEDED",
          reasonNotes: "Vehicle weight limit reached",
          priorityBoost: 2,
          recordedAt: "2026-10-01T14:00:00Z",
          consecutiveSkips: 1,
        },
      ]);

      const res = await getDeferrals(new Request("http://localhost:3000/api/store/deferrals"));
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data).toHaveLength(1);
      expect(json.data[0].deferralId).toBe("DEF-001");
      expect(json.data[0].reasonCode).toBe("CAPACITY_WEIGHT_EXCEEDED");
    });

    it("returns 500 when StoreService.getStoreDeferrals throws", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);
      vi.spyOn(StoreService, "getStoreDeferrals").mockRejectedValue(
        new Error("Database connection failure")
      );

      const res = await getDeferrals(new Request("http://localhost:3000/api/store/deferrals"));
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INTERNAL_SERVER_ERROR");
    });
  });

  // -------------------------------------------------------------
  // GET /api/store/reports
  // -------------------------------------------------------------
  describe("GET /api/store/reports", () => {
    it("returns auth guard error response when unauthorized", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(
        apiError("UNAUTHORIZED", "Unauthorized: Valid session required", 401)
      );

      const res = await getReports(new Request("http://localhost:3000/api/store/reports"));
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("GET /api/store/reports returns fulfillment and volume metrics for range=30d", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);
      const reportsSpy = vi.spyOn(StoreService, "getStoreReports").mockResolvedValue({
        fulfillmentRate: 95.0,
        onTimeRate: 92.0,
        totalCartonsDelivered: 1200,
        totalVolumeDeliveredM3: 50,
        disputeRate: 1.2,
        consecutiveSkips: 0,
        weeklyTrends: [],
      });

      const res = await getReports(new Request("http://localhost:3000/api/store/reports?range=30d"));
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.fulfillmentRate).toBe(95.0);
      expect(reportsSpy).toHaveBeenCalledWith("OUT001", 30);
    });

    it("GET /api/store/reports handles range=7d", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);
      const reportsSpy = vi.spyOn(StoreService, "getStoreReports").mockResolvedValue({
        fulfillmentRate: 100,
        onTimeRate: 100,
        totalCartonsDelivered: 300,
        totalVolumeDeliveredM3: 12,
        disputeRate: 0,
        consecutiveSkips: 0,
        weeklyTrends: [],
      });

      const res = await getReports(new Request("http://localhost:3000/api/store/reports?range=7d"));
      expect(res.status).toBe(200);
      expect(reportsSpy).toHaveBeenCalledWith("OUT001", 7);
    });

    it("GET /api/store/reports handles range=90d", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);
      const reportsSpy = vi.spyOn(StoreService, "getStoreReports").mockResolvedValue({
        fulfillmentRate: 90,
        onTimeRate: 88,
        totalCartonsDelivered: 3500,
        totalVolumeDeliveredM3: 150,
        disputeRate: 2.5,
        consecutiveSkips: 1,
        weeklyTrends: [],
      });

      const res = await getReports(new Request("http://localhost:3000/api/store/reports?range=90d"));
      expect(res.status).toBe(200);
      expect(reportsSpy).toHaveBeenCalledWith("OUT001", 90);
    });

    it("GET /api/store/reports defaults to 30d when range is not provided or invalid", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);
      const reportsSpy = vi.spyOn(StoreService, "getStoreReports").mockResolvedValue({
        fulfillmentRate: 95.0,
        onTimeRate: 92.0,
        totalCartonsDelivered: 1200,
        totalVolumeDeliveredM3: 50,
        disputeRate: 1.2,
        consecutiveSkips: 0,
        weeklyTrends: [],
      });

      // No range param
      const res1 = await getReports(new Request("http://localhost:3000/api/store/reports"));
      expect(res1.status).toBe(200);
      expect(reportsSpy).toHaveBeenCalledWith("OUT001", 30);

      // Invalid range param
      const res2 = await getReports(new Request("http://localhost:3000/api/store/reports?range=invalid"));
      expect(res2.status).toBe(200);
      expect(reportsSpy).toHaveBeenCalledWith("OUT001", 30);
    });

    it("returns 500 when StoreService.getStoreReports throws", async () => {
      vi.spyOn(guard, "requireStoreManager").mockResolvedValue(mockAuth);
      vi.spyOn(StoreService, "getStoreReports").mockRejectedValue(
        new Error("Database connection failure")
      );

      const res = await getReports(new Request("http://localhost:3000/api/store/reports?range=30d"));
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INTERNAL_SERVER_ERROR");
    });
  });
});
