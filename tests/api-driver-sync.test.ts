import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getPod } from "@/app/api/driver/pod/route";
import { GET as getExceptions, POST as postException } from "@/app/api/driver/exceptions/route";
import { POST as postSync } from "@/app/api/driver/sync/route";
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
    getCompletedDeliveries: vi.fn(),
    getExceptions: vi.fn(),
    reportException: vi.fn(),
    syncOfflineQueue: vi.fn(),
  },
}));

describe("Driver POD Archive, Exceptions & Offline Sync Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/driver/pod", () => {
    it("returns list of completed deliveries", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: "usr-driv-001", role: "driver" },
        session: { id: "sess-1" },
      } as any);

      vi.mocked(DriverService.getCompletedDeliveries).mockResolvedValueOnce([
        {
          stopId: "STP-001",
          stopSequence: 1,
          orderId: "ORD-001",
          outletId: "OUT001",
          outletName: "Pettah Fresh",
          address: "Manning Market Road",
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
          podId: "POD-001",
          deliveredAt: "2026-10-01T04:20:00Z",
          recipientName: "Ruwan S.",
          signatureUrl: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
        },
      ]);

      const req = new Request("http://localhost:3000/api/driver/pod");
      const res = await getPod(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.length).toBe(1);
      expect(body.data[0].podId).toBe("POD-001");
    });
  });

  describe("GET and POST /api/driver/exceptions", () => {
    it("returns exceptions list", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: "usr-driv-001", role: "driver" },
        session: { id: "sess-1" },
      } as any);

      vi.mocked(DriverService.getExceptions).mockResolvedValueOnce([
        {
          exceptionId: "EXC-001",
          tripId: "TRP-001",
          storeName: "Maradana Fresh",
          reasonCode: "Store closed",
          reasonNotes: "Shutter locked",
          status: "Resolved",
          createdAt: "05:14",
        },
      ]);

      const req = new Request("http://localhost:3000/api/driver/exceptions");
      const res = await getExceptions(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.length).toBe(1);
    });

    it("logs exception and returns 200", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: "usr-driv-001", role: "driver" },
        session: { id: "sess-1" },
      } as any);

      vi.mocked(DriverService.reportException).mockResolvedValueOnce({
        exceptionId: "DEF-001",
      });

      const req = new Request("http://localhost:3000/api/driver/exceptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reasonCode: "Store closed",
          driverNotes: "Store gate was locked on arrival",
        }),
      });

      const res = await postException(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.exceptionId).toBe("DEF-001");
    });
  });

  describe("POST /api/driver/sync", () => {
    it("synchronizes batched offline events", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: "usr-driv-001", role: "driver" },
        session: { id: "sess-1" },
      } as any);

      vi.mocked(DriverService.syncOfflineQueue).mockResolvedValueOnce({
        syncedCount: 2,
        rejectedCount: 0,
        reconciliationStatus: "RECONCILED",
      });

      const req = new Request("http://localhost:3000/api/driver/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          events: [
            {
              eventId: "evt-1",
              tripId: "TRP-001",
              eventType: "ARRIVE_STOP",
              clientTimestamp: "2026-10-01T05:00:00Z",
              payload: { stopId: "STP-001" },
            },
          ],
        }),
      });

      const res = await postSync(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.syncedCount).toBe(2);
      expect(body.data.reconciliationStatus).toBe("RECONCILED");
    });
  });
});
