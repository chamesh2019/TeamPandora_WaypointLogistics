import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as postArrive } from "@/app/api/driver/stops/[id]/arrive/route";
import { POST as postPod } from "@/app/api/driver/stops/[id]/pod/route";
import { POST as postFail } from "@/app/api/driver/stops/[id]/fail/route";
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
    recordArrival: vi.fn(),
    submitPod: vi.fn(),
    recordStopFailure: vi.fn(),
  },
}));

describe("Driver Stop Action Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/driver/stops/[id]/arrive", () => {
    it("records arrival and returns 200", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: "usr-driv-001", role: "driver" },
        session: { id: "sess-1" },
      } as any);

      vi.mocked(DriverService.recordArrival).mockResolvedValueOnce({
        stopId: "STP-001",
        status: "ARRIVED",
        isLate: false,
      });

      const req = new Request("http://localhost:3000/api/driver/stops/STP-001/arrive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: 6.9344,
          longitude: 79.8512,
        }),
      });

      const res = await postArrive(req, { params: Promise.resolve({ id: "STP-001" }) });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.status).toBe("ARRIVED");
    });
  });

  describe("POST /api/driver/stops/[id]/pod", () => {
    it("submits POD and returns 200", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: "usr-driv-001", role: "driver" },
        session: { id: "sess-1" },
      } as any);

      vi.mocked(DriverService.submitPod).mockResolvedValueOnce({
        podId: "POD-20261001-01",
        stopId: "STP-001",
        status: "DELIVERED",
      });

      const req = new Request("http://localhost:3000/api/driver/stops/STP-001/pod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: "Suresh Wickramasinghe",
          signatureUrl: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
          notes: "Received in good order",
        }),
      });

      const res = await postPod(req, { params: Promise.resolve({ id: "STP-001" }) });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.status).toBe("DELIVERED");
      expect(body.data.podId).toBe("POD-20261001-01");
    });

    it("rejects when recipient name is missing", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: "usr-driv-001", role: "driver" },
        session: { id: "sess-1" },
      } as any);

      const req = new Request("http://localhost:3000/api/driver/stops/STP-001/pod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: "",
          signatureUrl: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
        }),
      });

      const res = await postPod(req, { params: Promise.resolve({ id: "STP-001" }) });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("INVALID_PARAMETERS");
    });
  });

  describe("POST /api/driver/stops/[id]/fail", () => {
    it("records delivery failure and returns 200", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: "usr-driv-001", role: "driver" },
        session: { id: "sess-1" },
      } as any);

      vi.mocked(DriverService.recordStopFailure).mockResolvedValueOnce({
        stopId: "STP-001",
        deferralId: "DEF-20261001-01",
        status: "FAILED",
      });

      const req = new Request("http://localhost:3000/api/driver/stops/STP-001/fail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reasonCode: "OUTLET_CLOSED",
          driverNotes: "Outlet shutter is locked and contact is unreachable",
        }),
      });

      const res = await postFail(req, { params: Promise.resolve({ id: "STP-001" }) });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.status).toBe("FAILED");
      expect(body.data.deferralId).toBe("DEF-20261001-01");
    });

    it("rejects when reason notes are too short", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: "usr-driv-001", role: "driver" },
        session: { id: "sess-1" },
      } as any);

      const req = new Request("http://localhost:3000/api/driver/stops/STP-001/fail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reasonCode: "OUTLET_CLOSED",
          driverNotes: "closed",
        }),
      });

      const res = await postFail(req, { params: Promise.resolve({ id: "STP-001" }) });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("INVALID_PARAMETERS");
    });
  });
});
