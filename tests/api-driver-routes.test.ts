import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getActiveTrip } from "@/app/api/driver/active-trip/route";
import { POST as postDeparture } from "@/app/api/driver/departure/route";
import { GET as getStops } from "@/app/api/driver/stops/route";
import { GET as getCurrentStop } from "@/app/api/driver/stops/current/route";
import { DriverService } from "@/lib/services/driver-service";
import { auth } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("@/lib/services/driver-service", () => ({
  DriverService: {
    getActiveTrip: vi.fn(),
    recordDeparture: vi.fn(),
    getStops: vi.fn(),
    getCurrentStop: vi.fn(),
  },
}));

describe("Driver Core API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/driver/active-trip", () => {
    it("returns 401 when unauthorized", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as any);
      const req = new Request("http://localhost:3000/api/driver/active-trip");
      const res = await getActiveTrip(req);
      expect(res.status).toBe(401);
    });

    it("returns active trip data with 200", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: "usr-driv-001", role: "driver", name: "Nimal Fernando" },
        session: { id: "sess-1" },
      } as any);

      vi.mocked(DriverService.getActiveTrip).mockResolvedValueOnce({
        driverId: "usr-driv-001",
        driverName: "Nimal Fernando",
        hasActiveTrip: true,
        trip: {
          tripId: "TRP-20261001-01",
          tripNumber: 1,
          depotId: "PELIYAGODA",
          depotName: "Peliyagoda CDC",
          vehicleId: "VEH001",
          vehicleType: "truck",
          vehicleTemp: "reefer",
          brandId: "BRAND_FRESH",
          districtId: "Colombo",
          totalOrdersCount: 4,
          totalWeightKg: 1200,
          totalVolumeM3: 8,
          plannedDepartureTime: "04:00:00",
          plannedReturnTime: "11:30:00",
          status: "IN_TRANSIT",
          stopsTotal: 4,
          stopsCompleted: 1,
          stopsRemaining: 3,
        },
      });

      const req = new Request("http://localhost:3000/api/driver/active-trip");
      const res = await getActiveTrip(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.trip.tripId).toBe("TRP-20261001-01");
    });
  });

  describe("POST /api/driver/departure", () => {
    it("validates odometerStartKm and records departure", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: "usr-driv-001", role: "driver" },
        session: { id: "sess-1" },
      } as any);

      vi.mocked(DriverService.recordDeparture).mockResolvedValueOnce({
        success: true,
        tripId: "TRP-20261001-01",
        status: "IN_TRANSIT",
      });

      const req = new Request("http://localhost:3000/api/driver/departure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: "TRP-20261001-01",
          odometerStartKm: 48900,
        }),
      });

      const res = await postDeparture(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.status).toBe("IN_TRANSIT");
    });

    it("rejects missing or zero odometer", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: "usr-driv-001", role: "driver" },
        session: { id: "sess-1" },
      } as any);

      const req = new Request("http://localhost:3000/api/driver/departure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: "TRP-20261001-01",
          odometerStartKm: 0,
        }),
      });

      const res = await postDeparture(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("INVALID_PARAMETERS");
    });
  });

  describe("GET /api/driver/stops", () => {
    it("returns sequenced stops for trip", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: "usr-driv-001", role: "driver" },
        session: { id: "sess-1" },
      } as any);

      vi.mocked(DriverService.getActiveTrip).mockResolvedValueOnce({
        driverId: "usr-driv-001",
        driverName: "Nimal",
        hasActiveTrip: true,
        trip: { tripId: "TRP-20261001-01" } as any,
      });

      vi.mocked(DriverService.getStops).mockResolvedValueOnce([
        {
          stopId: "STP-001",
          stopSequence: 1,
          orderId: "ORD-001",
          outletId: "OUT001",
          outletName: "Pettah Fresh",
          address: "Manning Market",
          brandId: "BRAND_FRESH",
          districtId: "Colombo",
          dockType: "Front",
          parkingConstraint: "normal",
          windowOpenTime: "04:00:00",
          windowCloseTime: "05:00:00",
          contactName: "Manager",
          contactPhone: "+94 77 111 2222",
          plannedArrivalTime: "04:12:00",
          isLate: false,
          status: "DELIVERED",
          cartons: 14,
          weightKg: 250,
          volumeM3: 1.8,
          tempClass: "ambient",
        },
      ]);

      const req = new Request("http://localhost:3000/api/driver/stops");
      const res = await getStops(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.stops.length).toBe(1);
    });
  });

  describe("GET /api/driver/stops/current", () => {
    it("returns current active stop", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: "usr-driv-001", role: "driver" },
        session: { id: "sess-1" },
      } as any);

      vi.mocked(DriverService.getActiveTrip).mockResolvedValueOnce({
        driverId: "usr-driv-001",
        driverName: "Nimal",
        hasActiveTrip: true,
        trip: { tripId: "TRP-20261001-01" } as any,
      });

      vi.mocked(DriverService.getCurrentStop).mockResolvedValueOnce({
        tripId: "TRP-20261001-01",
        currentStop: {
          stopId: "STP-004",
          stopSequence: 4,
          outletName: "Cargills Nugegoda",
        } as any,
        nextStop: null,
        completedStopsCount: 3,
        remainingStopsCount: 1,
      });

      const req = new Request("http://localhost:3000/api/driver/stops/current");
      const res = await getCurrentStop(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.currentStop.stopId).toBe("STP-004");
    });
  });
});
