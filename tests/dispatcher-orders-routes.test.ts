/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getDispatcherOrders } from "../app/api/dispatcher/orders/route";
import * as guard from "../lib/api/guard";
import { DispatcherService } from "../lib/services/dispatcher-service";
import { apiError } from "../lib/api/response";
import type { DispatcherAuthContext } from "../lib/types/dispatcher-api";

describe("/api/dispatcher/orders Route Handlers", () => {
  const mockAuthContext: DispatcherAuthContext = {
    userId: "u-disp-1",
    username: "dispatcher1",
    role: "dispatcher",
    depotId: "DEPOT_COLOMBO",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/dispatcher/orders", () => {
    it("returns 401 when authentication fails", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(
        apiError("UNAUTHORIZED", "Unauthorized: Authentication required", 401)
      );

      const req = new Request("http://localhost:3000/api/dispatcher/orders");
      const res = await getDispatcherOrders(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("returns 403 when user does not have dispatcher role", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(
        apiError("FORBIDDEN_ROLE", "Forbidden: Access requires dispatcher role", 403)
      );

      const req = new Request("http://localhost:3000/api/dispatcher/orders");
      const res = await getDispatcherOrders(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("FORBIDDEN_ROLE");
    });

    it("returns 200 with orders list and cutoff summary metrics for authenticated dispatcher", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);
      vi.spyOn(DispatcherService, "getOrders").mockResolvedValue({
        data: {
          orders: [
            {
              id: "ORD-20261001-001",
              orderId: "ORD-20261001-001",
              outletId: "OUT001",
              store: "Colombo Fresh",
              brand: "Fresh",
              district: "Colombo",
              items: 45,
              weight: "850 kg",
              weightKg: 850,
              volume: "4.5 m³",
              volumeM3: 4.5,
              trip: "—",
              tripId: null,
              placed: "01 Oct 10:00",
              createdAt: "2026-10-01T10:00:00Z",
              deliveryDate: "2026-10-01",
              isAfterCutoff: false,
              priorityScore: 10,
              status: "Confirmed",
              lifecycleStatus: "CONFIRMED",
              tempRequirement: "ambient",
            },
          ],
          summary: {
            preCutoffCount: 1,
            postCutoffCount: 0,
            confirmedCount: 1,
            totalOrders: 1,
            cutoffInfo: {
              cutoffHour: 16,
              isAfterCutoff: false,
              hoursRemaining: 4,
              minutesRemaining: 30,
              formattedTimeLeft: "4h 30m remaining",
              bannerText: "Order cutoff: 16:00 today",
              statNoteText: "4h 30m remaining",
            },
          },
        },
        total: 1,
      });

      const req = new Request("http://localhost:3000/api/dispatcher/orders?page=1&pageSize=10");
      const res = await getDispatcherOrders(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.orders).toHaveLength(1);
      expect(json.data.orders[0].id).toBe("ORD-20261001-001");
      expect(json.data.summary.preCutoffCount).toBe(1);
      expect(json.meta.total).toBe(1);
      expect(json.meta.page).toBe(1);
    });

    it("parses filters and forwards them to DispatcherService", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);
      const serviceSpy = vi.spyOn(DispatcherService, "getOrders").mockResolvedValue({
        data: {
          orders: [],
          summary: {
            preCutoffCount: 0,
            postCutoffCount: 0,
            confirmedCount: 0,
            totalOrders: 0,
            cutoffInfo: {
              cutoffHour: 16,
              isAfterCutoff: false,
              hoursRemaining: 2,
              minutesRemaining: 0,
              formattedTimeLeft: "2h remaining",
              bannerText: "",
              statNoteText: "",
            },
          },
        },
        total: 0,
      });

      const req = new Request(
        "http://localhost:3000/api/dispatcher/orders?status=Pending&brand=Fresh&district=Colombo&search=ORD-001&date=2026-10-01&page=2&pageSize=25"
      );
      await getDispatcherOrders(req);

      expect(serviceSpy).toHaveBeenCalledWith({
        status: "Pending",
        brand: "Fresh",
        district: "Colombo",
        search: "ORD-001",
        date: "2026-10-01",
        page: 2,
        pageSize: 25,
      });
    });

    it("returns 400 when date parameter has invalid format", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);

      const req = new Request("http://localhost:3000/api/dispatcher/orders?date=invalid-date");
      const res = await getDispatcherOrders(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 500 when DispatcherService throws an unexpected error", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);
      vi.spyOn(DispatcherService, "getOrders").mockRejectedValue(new Error("Database connection dropped"));

      const req = new Request("http://localhost:3000/api/dispatcher/orders");
      const res = await getDispatcherOrders(req);
      expect(res.status).toBe(500);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INTERNAL_SERVER_ERROR");
      expect(json.error.message).toContain("Database connection dropped");
    });
  });
});
