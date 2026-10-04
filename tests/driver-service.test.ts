import { describe, it, expect, vi, beforeEach } from "vitest";
import { DriverService } from "@/lib/services/driver-service";
import { pool } from "@/lib/db";

vi.mock("@/lib/db", () => {
  const query = vi.fn();
  const connect = vi.fn().mockResolvedValue({
    query: vi.fn(),
    release: vi.fn(),
  });
  return { pool: { query, connect } };
});

describe("DriverService Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getActiveTrip", () => {
    it("returns formatted active trip when trip exists", async () => {
      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [
          {
            trip_id: "TRP-20261001-01",
            trip_number: 1,
            depot_id: "PELIYAGODA",
            depot_name: "Peliyagoda CDC",
            vehicle_id: "VEH001",
            vehicle_type: "truck",
            vehicle_temp: "reefer",
            brand_id: "BRAND_FRESH",
            district_id: "Colombo",
            total_orders_count: 3,
            total_weight_kg: "1250.00",
            total_volume_m3: "8.500",
            planned_departure_time: "04:00:00",
            planned_return_time: "11:30:00",
            actual_departure_time: null,
            odometer_start_km: null,
            trip_status: "LOADING",
            driver_name: "Nimal Fernando",
          },
        ],
      } as any);

      vi.mocked(pool.query).mockResolvedValueOnce({
        rows: [{ total_stops: 3, completed_stops: 1 }],
      } as any);

      const res = await DriverService.getActiveTrip("usr-driv-001");
      expect(res).not.toBeNull();
      expect(res?.hasActiveTrip).toBe(true);
      expect(res?.trip?.tripId).toBe("TRP-20261001-01");
      expect(res?.trip?.stopsTotal).toBe(3);
      expect(res?.trip?.stopsCompleted).toBe(1);
      expect(res?.trip?.stopsRemaining).toBe(2);
    });

    it("returns fallback offline mock when database throws", async () => {
      vi.mocked(pool.query).mockRejectedValueOnce(new Error("Database offline"));

      const res = await DriverService.getActiveTrip("usr-driv-001");
      expect(res).not.toBeNull();
      expect(res?.hasActiveTrip).toBe(true);
      expect(res?.driverName).toBeDefined();
    });
  });

  describe("recordDeparture", () => {
    it("rejects non-positive odometer reading", async () => {
      await expect(
        DriverService.recordDeparture("TRP-20261001-01", "usr-driv-001", {
          tripId: "TRP-20261001-01",
          odometerStartKm: 0,
        })
      ).rejects.toThrow("Odometer reading must be greater than zero");
    });

    it("records departure and updates status to IN_TRANSIT", async () => {
      const mockClient = {
        query: vi.fn().mockResolvedValue({ rowCount: 1 }),
        release: vi.fn(),
      };
      vi.mocked(pool.connect).mockResolvedValueOnce(mockClient as any);

      const result = await DriverService.recordDeparture("TRP-20261001-01", "usr-driv-001", {
        tripId: "TRP-20261001-01",
        odometerStartKm: 48500,
        clientTimestamp: "2026-10-01T04:05:00.000Z",
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe("IN_TRANSIT");
      expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
      expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe("recordArrival", () => {
    it("records stop arrival and detects lateness against window", async () => {
      const mockClient = {
        query: vi.fn()
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({
            rows: [
              {
                trip_id: "TRP-20261001-01",
                order_id: "ORD-001",
                outlet_id: "OUT001",
                status: "PENDING",
                window_close_time: "05:00:00",
              },
            ],
          })
          .mockResolvedValueOnce({ rowCount: 1 }) // UPDATE trip_stops
          .mockResolvedValueOnce({ rowCount: 1 }) // UPDATE orders
          .mockResolvedValueOnce({}), // COMMIT
        release: vi.fn(),
      };
      vi.mocked(pool.connect).mockResolvedValueOnce(mockClient as any);

      const res = await DriverService.recordArrival("STP-001", "usr-driv-001", {
        latitude: 6.9344,
        longitude: 79.8512,
        clientTimestamp: "2026-10-01T05:15:00.000Z", // 05:15 > 05:00 close window -> isLate true
      });

      expect(res.stopId).toBe("STP-001");
      expect(res.status).toBe("ARRIVED");
      expect(res.isLate).toBe(true);
    });
  });

  describe("submitPod", () => {
    it("validates recipient name length", async () => {
      await expect(
        DriverService.submitPod("STP-001", "usr-driv-001", {
          recipientName: "A",
          signatureUrl: "data:image/svg+xml;base64,...",
        })
      ).rejects.toThrow("Recipient name must be at least 2 characters");
    });

    it("inserts POD and marks stop and order as DELIVERED", async () => {
      const mockClient = {
        query: vi.fn()
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({
            rows: [
              {
                trip_id: "TRP-20261001-01",
                order_id: "ORD-001",
                status: "ARRIVED",
                actual_arrival_time: "2026-10-01T05:00:00.000Z",
              },
            ],
          })
          .mockResolvedValueOnce({ rowCount: 1 }) // INSERT proof_of_deliveries
          .mockResolvedValueOnce({ rowCount: 1 }) // UPDATE trip_stops
          .mockResolvedValueOnce({ rowCount: 1 }) // UPDATE orders
          .mockResolvedValueOnce({ rows: [{ pending_stops: 0 }] }) // CHECK all stops done
          .mockResolvedValueOnce({ rowCount: 1 }) // UPDATE trips COMPLETED
          .mockResolvedValueOnce({}), // COMMIT
        release: vi.fn(),
      };
      vi.mocked(pool.connect).mockResolvedValueOnce(mockClient as any);

      const res = await DriverService.submitPod("STP-001", "usr-driv-001", {
        recipientName: "Suresh Wickramasinghe",
        recipientTitle: "Store Manager",
        signatureUrl: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
        notes: "Goods received intact",
        clientTimestamp: "2026-10-01T05:25:00.000Z",
      });

      expect(res.stopId).toBe("STP-001");
      expect(res.status).toBe("DELIVERED");
      expect(res.podId).toBeDefined();
    });
  });

  describe("recordStopFailure", () => {
    it("requires reason notes of at least 10 characters", async () => {
      await expect(
        DriverService.recordStopFailure("STP-001", "usr-driv-001", {
          reasonCode: "OUTLET_CLOSED",
          driverNotes: "Too short",
        })
      ).rejects.toThrow("Reason notes must be at least 10 characters");
    });

    it("records failure and inserts deferral", async () => {
      const mockClient = {
        query: vi.fn()
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({
            rows: [
              {
                trip_id: "TRP-20261001-01",
                order_id: "ORD-001",
                outlet_id: "OUT001",
                plan_id: "PLAN-001",
              },
            ],
          })
          .mockResolvedValueOnce({ rowCount: 1 }) // UPDATE trip_stops
          .mockResolvedValueOnce({ rowCount: 1 }) // UPDATE orders
          .mockResolvedValueOnce({ rowCount: 1 }) // INSERT deferrals
          .mockResolvedValueOnce({}), // COMMIT
        release: vi.fn(),
      };
      vi.mocked(pool.connect).mockResolvedValueOnce(mockClient as any);

      const res = await DriverService.recordStopFailure("STP-001", "usr-driv-001", {
        reasonCode: "OUTLET_CLOSED",
        driverNotes: "Store gate is locked and phone is unanswered",
        clientTimestamp: "2026-10-01T05:30:00.000Z",
      });

      expect(res.stopId).toBe("STP-001");
      expect(res.status).toBe("FAILED");
      expect(res.deferralId).toBeDefined();
    });
  });

  describe("syncOfflineQueue", () => {
    it("idempotently reconciles batched events", async () => {
      const mockClient = {
        query: vi.fn().mockResolvedValue({ rowCount: 1 }),
        release: vi.fn(),
      };
      vi.mocked(pool.connect).mockResolvedValueOnce(mockClient as any);

      const res = await DriverService.syncOfflineQueue("usr-driv-001", [
        {
          eventId: "evt-001",
          tripId: "TRP-20261001-01",
          eventType: "ARRIVE_STOP",
          clientTimestamp: "2026-10-01T05:00:00.000Z",
          payload: { stopId: "STP-001" },
        },
      ]);

      expect(res.syncedCount).toBe(1);
      expect(res.reconciliationStatus).toBe("RECONCILED");
    });
  });
});
