/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getAllocationQueue } from "../app/api/dispatcher/allocation/route";
import { POST as commitAllocationTrip } from "../app/api/dispatcher/allocation/commit/route";
import { GET as getDispatcherTrips } from "../app/api/dispatcher/trips/route";
import { POST as publishPlan } from "../app/api/dispatcher/plans/publish/route";
import * as guard from "../lib/api/guard";
import { pool } from "../lib/db";
import { DispatcherService } from "../lib/services/dispatcher-service";
import { apiError } from "../lib/api/response";
import type { DispatcherAuthContext } from "../lib/types/dispatcher-api";

describe("Dispatcher Allocation & Trips Routes", () => {
  const mockAuthContext: DispatcherAuthContext = {
    userId: "usr-disp-001",
    username: "dispatcher1",
    role: "dispatcher",
    depotId: "PELIYAGODA",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/dispatcher/allocation", () => {
    it("returns 401 when unauthenticated", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(
        apiError("UNAUTHORIZED", "Unauthorized: Authentication required", 401)
      );

      const req = new Request("http://localhost:3000/api/dispatcher/allocation");
      const res = await getAllocationQueue(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("returns 403 when user is not dispatcher or admin", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(
        apiError("FORBIDDEN_ROLE", "Forbidden: Access requires dispatcher role", 403)
      );

      const req = new Request("http://localhost:3000/api/dispatcher/allocation");
      const res = await getAllocationQueue(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("FORBIDDEN_ROLE");
    });

    it("returns 200 with allocation queue, vehicles, drivers and summary", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);
      vi.spyOn(DispatcherService, "getAllocationQueue").mockResolvedValue({
        orders: [
          {
            id: "ORD-001",
            orderId: "ORD-001",
            store: "Colombo Fresh",
            brand: "Fresh",
            district: "Colombo",
            weightKg: 500,
            volumeM3: 4.5,
            temperature: "Chilled",
            priority: "high",
            priorityScore: 8.5,
            parkingConstraint: "normal",
            dockType: "rear_dock",
            lifecycleStatus: "CONFIRMED",
          },
        ],
        vehicles: [
          {
            id: "VEH001",
            name: "VEH001 · Truck Reefer 5.0T",
            type: "truck",
            temp: "reefer",
            isReefer: true,
            maxWeightKg: 5000,
            maxVolumeM3: 26,
            depotId: "PELIYAGODA",
            status: "available",
          },
        ],
        drivers: [
          {
            id: "d1",
            name: "Nimal Fernando",
            username: "nimal",
          },
        ],
        summary: {
          totalUnallocated: 1,
          chilledCount: 1,
          ambientCount: 0,
          totalWeightKg: 500,
          totalVolumeM3: 4.5,
        },
      });

      const req = new Request("http://localhost:3000/api/dispatcher/allocation?temp=Chilled");
      const res = await getAllocationQueue(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.orders).toHaveLength(1);
      expect(json.data.vehicles).toHaveLength(1);
      expect(json.data.drivers).toHaveLength(1);
      expect(json.data.summary.totalUnallocated).toBe(1);
    });

    it("returns 500 if service throws", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);
      vi.spyOn(DispatcherService, "getAllocationQueue").mockRejectedValue(new Error("Database failure"));

      const req = new Request("http://localhost:3000/api/dispatcher/allocation");
      const res = await getAllocationQueue(req);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.message).toBe("Database failure");
    });
  });

  describe("POST /api/dispatcher/allocation/commit", () => {
    it("returns 401 when unauthenticated", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(
        apiError("UNAUTHORIZED", "Unauthorized: Authentication required", 401)
      );

      const req = new Request("http://localhost:3000/api/dispatcher/allocation/commit", {
        method: "POST",
        body: JSON.stringify({
          vehicleId: "VEH001",
          driverId: "d1",
          tripNumber: 1,
          orderIds: ["ORD-001"],
        }),
      });
      const res = await commitAllocationTrip(req);
      expect(res.status).toBe(401);
    });

    it("returns 400 when orderIds is empty or invalid", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);

      const req = new Request("http://localhost:3000/api/dispatcher/allocation/commit", {
        method: "POST",
        body: JSON.stringify({
          vehicleId: "VEH001",
          driverId: "d1",
          tripNumber: 1,
          orderIds: [],
        }),
      });
      const res = await commitAllocationTrip(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.code).toBe("INVALID_ORDERS");
    });

    it("returns 400 when vehicleId or driverId is missing", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);

      const req = new Request("http://localhost:3000/api/dispatcher/allocation/commit", {
        method: "POST",
        body: JSON.stringify({
          vehicleId: "",
          driverId: "d1",
          tripNumber: 1,
          orderIds: ["ORD-001"],
        }),
      });
      const res = await commitAllocationTrip(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.code).toBe("INVALID_VEHICLE");
    });

    it("returns 400 when tripNumber is not 1 or 2", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);

      const req = new Request("http://localhost:3000/api/dispatcher/allocation/commit", {
        method: "POST",
        body: JSON.stringify({
          vehicleId: "VEH001",
          driverId: "d1",
          tripNumber: 3,
          orderIds: ["ORD-001"],
        }),
      });
      const res = await commitAllocationTrip(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.code).toBe("INVALID_TRIP_NUMBER");
    });

    it("returns 422 when allocation constraint fails", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);
      vi.spyOn(DispatcherService, "commitTripAssignment").mockRejectedValue(
        new Error("Chilled orders require a reefer vehicle")
      );

      const req = new Request("http://localhost:3000/api/dispatcher/allocation/commit", {
        method: "POST",
        body: JSON.stringify({
          vehicleId: "VEH002",
          driverId: "d1",
          tripNumber: 1,
          orderIds: ["ORD-001"],
        }),
      });
      const res = await commitAllocationTrip(req);
      expect(res.status).toBe(422);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("ALLOCATION_ERROR");
      expect(json.error.message).toContain("Chilled orders require a reefer vehicle");
    });

    it("returns 200 on successful trip allocation commit", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);
      vi.spyOn(DispatcherService, "commitTripAssignment").mockResolvedValue({
        tripId: "TRIP-20261001-VEH001-T1",
        planId: "PLAN-20261001-PELIYAGODA",
        vehicleId: "VEH001",
        driverId: "d1",
        tripNumber: 1,
        ordersCount: 2,
        totalWeightKg: 1200,
        totalVolumeM3: 9.5,
      });

      const req = new Request("http://localhost:3000/api/dispatcher/allocation/commit", {
        method: "POST",
        body: JSON.stringify({
          vehicleId: "VEH001",
          driverId: "d1",
          tripNumber: 1,
          orderIds: ["ORD-001", "ORD-002"],
        }),
      });
      const res = await commitAllocationTrip(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.tripId).toBe("TRIP-20261001-VEH001-T1");
      expect(json.data.ordersCount).toBe(2);
    });
  });

  describe("GET /api/dispatcher/trips", () => {
    it("returns 401 when unauthenticated", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(
        apiError("UNAUTHORIZED", "Unauthorized: Authentication required", 401)
      );

      const req = new Request("http://localhost:3000/api/dispatcher/trips");
      const res = await getDispatcherTrips(req);
      expect(res.status).toBe(401);
    });

    it("returns 200 with list of trips for authenticated dispatcher", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);
      vi.spyOn(DispatcherService, "getTrips").mockResolvedValue([
        {
          id: "TRP-01",
          tripId: "TRP-01",
          planId: "PLAN-01",
          status: "PLANNED",
          tripNumber: 1,
          currentVol: 18.5,
          maxVol: 24,
          currentWeightKg: 3500,
          maxWeightKg: 5000,
          depot: "PELIYAGODA",
          brand: "Fresh",
          district: "Colombo",
          vehicleId: "VEH001",
          vehiclePlate: "VEH001",
          driverId: "d1",
          driverName: "Nimal Fernando",
          orders: [
            {
              id: "ORD-001",
              orderId: "ORD-001",
              storeName: "Nugegoda Fresh",
              outletId: "OUT001",
              itemsCount: 25,
              volumeM3: 4.5,
              weightKg: 500,
              stopSequence: 1,
              loadSequence: 1,
            },
          ],
        },
      ]);

      const req = new Request("http://localhost:3000/api/dispatcher/trips?status=PLANNED");
      const res = await getDispatcherTrips(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.trips).toHaveLength(1);
      expect(json.data.trips[0].tripId).toBe("TRP-01");
    });
  });

  describe("POST /api/dispatcher/plans/publish", () => {
    it("returns 401 when unauthenticated", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(
        apiError("UNAUTHORIZED", "Unauthorized: Authentication required", 401)
      );

      const req = new Request("http://localhost:3000/api/dispatcher/plans/publish", {
        method: "POST",
        body: JSON.stringify({}),
      });
      const res = await publishPlan(req);
      expect(res.status).toBe(401);
    });

    it("returns 400 when plan_id or plan_date is missing", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);

      const req = new Request("http://localhost:3000/api/dispatcher/plans/publish", {
        method: "POST",
        body: JSON.stringify({
          plan_id: "",
          plan_date: "",
        }),
      });
      const res = await publishPlan(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.code).toBe("INVALID_REQUEST");
    });

    it("successfully publishes plan and queries real outlet_id for stops and deferrals", async () => {
      vi.spyOn(guard, "requireDispatcher").mockResolvedValue(mockAuthContext);

      const queryCalls: { sql: string; params?: any[] }[] = [];
      const mockClient = {
        query: vi.fn().mockImplementation((sql: string, params?: any[]) => {
          queryCalls.push({ sql, params });
          if (sql.includes("SELECT order_id, outlet_id FROM orders")) {
            return Promise.resolve({
              rows: [
                { order_id: "ORD-001", outlet_id: "OUT004" },
                { order_id: "ORD-002", outlet_id: "OUT005" },
              ],
            });
          }
          if (sql.includes("SELECT outlet_id FROM outlets")) {
            return Promise.resolve({
              rows: [{ outlet_id: "OUT001" }],
            });
          }
          if (sql.includes("SELECT assigned_driver_id FROM vehicles")) {
            return Promise.resolve({
              rows: [{ assigned_driver_id: "usr-driv-001" }],
            });
          }
          return Promise.resolve({ rows: [], rowCount: 1 });
        }),
        release: vi.fn(),
      };
      vi.spyOn(pool, "connect").mockResolvedValue(mockClient as any);

      const req = new Request("http://localhost:3000/api/dispatcher/plans/publish", {
        method: "POST",
        body: JSON.stringify({
          plan_id: "PLAN-20261001-PELIYAGODA",
          plan_date: "2026-10-01",
          depot_id: "PELIYAGODA",
          trips: [
            {
              vehicle_id: "VEH001",
              trip_number: 1,
              brand: "FRESH",
              district: "Colombo",
              depot: "PELIYAGODA",
              duration_minutes: 90,
              total_weight_kg: 500,
              total_volume_m3: 3.5,
              stops: [
                {
                  order_id: "ORD-001",
                  outlet_id: "ORD-001", // Notice: faulty order_id passed as outlet_id!
                },
              ],
            },
          ],
          deferred: [
            {
              order_id: "ORD-002",
              outlet_id: "ORD-002", // Faulty outlet_id
              reason_code: "CAPACITY_WEIGHT",
              notes: "Weight exceeded",
            },
          ],
        }),
      });

      const res = await publishPlan(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.plan_id).toBe("PLAN-20261001-PELIYAGODA");
      expect(mockClient.release).toHaveBeenCalled();

      // Verify trip_stops insert used OUT004 (from orders table lookup), NOT ORD-001!
      const stopInsert = queryCalls.find((c) => c.sql.includes("INSERT INTO trip_stops"));
      expect(stopInsert).toBeDefined();
      // stopInsert params: [stopId, tripId, stop.order_id, outletIdToInsert, ...]
      expect(stopInsert?.params?.[2]).toBe("ORD-001");
      expect(stopInsert?.params?.[3]).toBe("OUT004"); // Resolved correctly from DB!

      // Verify deferrals insert used OUT005 (from orders table lookup), NOT ORD-002!
      const defInsert = queryCalls.find((c) => c.sql.includes("INSERT INTO deferrals"));
      expect(defInsert).toBeDefined();
      expect(defInsert?.params?.[2]).toBe("ORD-002");
      expect(defInsert?.params?.[3]).toBe("OUT005"); // Resolved correctly from DB!
    });
  });
});
