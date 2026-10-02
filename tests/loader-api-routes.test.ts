import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getOverview } from "@/app/api/loader/overview/route";
import { GET as getTrips } from "@/app/api/loader/trips/route";
import { GET as getManifest } from "@/app/api/loader/manifests/[id]/route";
import { POST as verifyManifest } from "@/app/api/loader/manifests/[id]/verify/route";
import { GET as getExceptions, POST as reportException } from "@/app/api/loader/exceptions/route";
import { requireLoader } from "@/lib/api/guard";
import { LoaderService } from "@/lib/services/loader-service";

vi.mock("@/lib/api/guard", () => ({
  requireLoader: vi.fn(),
}));

vi.mock("@/lib/services/loader-service", () => ({
  LoaderService: {
    getOverview: vi.fn(),
    getActiveTrips: vi.fn(),
    getTripManifest: vi.fn(),
    verifyManifest: vi.fn(),
    getExceptions: vi.fn(),
    reportException: vi.fn(),
  },
}));

describe("Loader REST API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireLoader).mockResolvedValue({
      userId: "usr-load-001",
      username: "Sunil Jayasinghe",
      role: "loader",
      depotId: "PELIYAGODA",
    });
  });

  it("GET /api/loader/overview returns 200 with overview data", async () => {
    vi.mocked(LoaderService.getOverview).mockResolvedValueOnce({
      depotId: "PELIYAGODA",
      activeBaysCount: 4,
      loadingBaysCount: 2,
      cartonsStaged: 284,
      cartonsVerifiedPct: 86,
      departureEtaMin: 38,
      shortfallRatePct: 1.2,
      activeAssignments: [],
      recentAlerts: [],
    });

    const res = await getOverview(new Request("http://localhost:3000/api/loader/overview"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.activeBaysCount).toBe(4);
  });

  it("GET /api/loader/trips returns 200 with active trips list", async () => {
    vi.mocked(LoaderService.getActiveTrips).mockResolvedValueOnce([
      {
        tripId: "TRP-250613-01",
        vehicleId: "WP NC-4872",
        vehicleType: "Reefer · Chilled",
        route: "Colombo South Route",
        driver: "Nimal Perera",
        stops: 12,
        cartons: 104,
        departure: "03:30",
        status: "Loading",
        progress: 68,
        bay: "A-01",
      },
    ]);

    const res = await getTrips(new Request("http://localhost:3000/api/loader/trips"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].tripId).toBe("TRP-250613-01");
  });

  it("GET /api/loader/manifests/[id] returns 200 with reverse LIFO sequence", async () => {
    vi.mocked(LoaderService.getTripManifest).mockResolvedValueOnce({
      tripId: "TRP-250613-11",
      manifestId: "MAN-001",
      vehicleId: "WP NC-4872",
      driverName: "Nimal Perera",
      bayNumber: "A-01",
      status: "LOADING",
      stops: [
        {
          stopId: "STP-06",
          stopSequence: 6,
          loadSequence: 1,
          outletId: "OUT006",
          outletName: "Nugegoda Fresh",
          cartonsCount: 18,
          weightKg: 324,
          tempRequirement: "CHILLED",
          dockType: "rear_dock",
          isVerified: false,
          hasShortfall: false,
        },
      ],
      temperatureBreakdown: { chilledCartons: 18, ambientCartons: 0 },
    });

    const res = await getManifest(
      new Request("http://localhost:3000/api/loader/manifests/TRP-250613-11"),
      { params: Promise.resolve({ id: "TRP-250613-11" }) }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.stops[0].loadSequence).toBe(1);
  });

  it("POST /api/loader/manifests/[id]/verify signs off manifest and returns 200", async () => {
    vi.mocked(LoaderService.verifyManifest).mockResolvedValueOnce({
      success: true,
      manifestId: "MAN-TRP-250613-11",
      status: "VERIFIED",
    });

    const res = await verifyManifest(
      new Request("http://localhost:3000/api/loader/manifests/TRP-250613-11/verify", {
        method: "POST",
      }),
      { params: Promise.resolve({ id: "TRP-250613-11" }) }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("VERIFIED");
  });

  it("GET /api/loader/exceptions returns 200 with list of exceptions", async () => {
    vi.mocked(LoaderService.getExceptions).mockResolvedValueOnce([
      {
        exceptionId: "LEX-001",
        tripId: "TRP-250613-11",
        orderId: "ORD-001",
        exceptionType: "MISSING_STOCK",
        quantityShort: 6,
        status: "PENDING",
        createdAt: "2026-10-02T10:00:00Z",
      },
    ]);

    const res = await getExceptions(new Request("http://localhost:3000/api/loader/exceptions"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
  });

  it("POST /api/loader/exceptions validates input and returns 201", async () => {
    vi.mocked(LoaderService.reportException).mockResolvedValueOnce({
      exceptionId: "LEX-001",
      tripId: "TRP-250613-11",
      vehicleId: "WP NC-4872",
      orderId: "ORD-001",
      storeName: "Pettah Fresh",
      itemName: "Anchor Butter 500g",
      skuCode: "SKU-001",
      exceptionType: "MISSING_STOCK",
      quantityShort: 6,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    });

    const req = new Request("http://localhost:3000/api/loader/exceptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tripId: "TRP-250613-11",
        orderId: "ORD-001",
        exceptionType: "MISSING_STOCK",
        quantityShort: 6,
      }),
    });

    const res = await reportException(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.quantityShort).toBe(6);
  });

  it("POST /api/loader/exceptions rejects invalid quantityShort with 400", async () => {
    const req = new Request("http://localhost:3000/api/loader/exceptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tripId: "TRP-250613-11",
        orderId: "ORD-001",
        exceptionType: "MISSING_STOCK",
        quantityShort: -3,
      }),
    });

    const res = await reportException(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("INVALID_QUANTITY");
  });

  it("POST /api/loader/manifests/[id]/verify rejects trip belonging to another depot with 403", async () => {
    vi.mocked(LoaderService.verifyManifest).mockResolvedValueOnce({
      success: false,
      manifestId: "MAN-TRP-KANDY-01",
      status: "FORBIDDEN_DEPOT",
    });

    const res = await verifyManifest(
      new Request("http://localhost:3000/api/loader/manifests/TRP-KANDY-01/verify", {
        method: "POST",
      }),
      { params: Promise.resolve({ id: "TRP-KANDY-01" }) }
    );
    expect(res.status).toBe(403);
  });
});
