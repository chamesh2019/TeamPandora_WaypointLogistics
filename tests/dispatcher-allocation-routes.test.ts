/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getAllocationQueue } from "../app/api/dispatcher/allocation/route";
import { POST as commitAllocationTrip } from "../app/api/dispatcher/allocation/commit/route";
import { GET as getDispatcherTrips } from "../app/api/dispatcher/trips/route";
import * as guard from "../lib/api/guard";
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
});
