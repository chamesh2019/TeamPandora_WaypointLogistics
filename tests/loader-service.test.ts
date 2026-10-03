import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoaderService } from "@/lib/services/loader-service";
import { pool } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  pool: {
    query: vi.fn(),
  },
}));

describe("LoaderService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retrieves loader overview for depot", async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({
      rows: [
        {
          trip_id: "TRP-250613-01",
          depot_id: "PELIYAGODA",
          vehicle_id: "WP NC-4872",
          total_orders_count: 6,
          total_weight_kg: "1872.00",
          total_volume_m3: "8.500",
          manifest_status: "LOADING",
        },
      ],
    } as any);

    const overview = await LoaderService.getOverview("PELIYAGODA");
    expect(overview).toBeDefined();
    expect(overview.depotId).toBe("PELIYAGODA");
    expect(overview.activeAssignments.length).toBeGreaterThan(0);
  });

  it("retrieves reverse LIFO trip manifest sorted by load_sequence", async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({
      rows: [
        {
          trip_id: "TRP-250613-11",
          vehicle_id: "WP NC-4872",
          manifest_id: "MAN-001",
          manifest_status: "LOADING",
          load_sequence: 1,
          stop_sequence: 6,
          stop_id: "STP-06",
          outlet_id: "OUT006",
          outlet_name: "Nugegoda Fresh",
          order_units: 18,
          order_weight_kg: "324.00",
          temp_requirement: "CHILLED",
        },
        {
          trip_id: "TRP-250613-11",
          vehicle_id: "WP NC-4872",
          manifest_id: "MAN-001",
          manifest_status: "LOADING",
          load_sequence: 6,
          stop_sequence: 1,
          stop_id: "STP-01",
          outlet_id: "OUT001",
          outlet_name: "Pettah Fresh",
          order_units: 14,
          order_weight_kg: "252.00",
          temp_requirement: "AMBIENT",
        },
      ],
    } as any);

    const manifest = await LoaderService.getTripManifest("TRP-250613-11");
    expect(manifest).not.toBeNull();
    expect(manifest?.stops[0].loadSequence).toBe(1);
    expect(manifest?.stops[0].stopSequence).toBe(6); // Final delivery stop loaded first!
  });

  it("reports loading exception and records to database", async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({
      rows: [
        {
          exception_id: "LEX-TEST-001",
          trip_id: "TRP-250613-11",
          order_id: "ORD-001",
          exception_type: "MISSING_STOCK",
          quantity_short: 4,
          resolution: "PENDING",
          created_at: new Date().toISOString(),
        },
      ],
    } as any);

    const result = await LoaderService.reportException(
      {
        tripId: "TRP-250613-11",
        orderId: "ORD-001",
        exceptionType: "MISSING_STOCK",
        quantityShort: 4,
      },
      "usr-load-001"
    );

    expect(result.exceptionId).toBe("LEX-TEST-001");
    expect(result.quantityShort).toBe(4);
  });

  it("prevents duplicate stops when multiple exceptions exist for the same order", async () => {
    vi.mocked(pool.query).mockResolvedValueOnce({
      rows: [
        {
          trip_id: "TRP-250613-11",
          vehicle_id: "WP NC-4872",
          manifest_id: "MAN-001",
          manifest_status: "LOADING",
          load_sequence: 1,
          stop_sequence: 1,
          stop_id: "STP-01",
          outlet_id: "OUT001",
          outlet_name: "Pettah Fresh",
          order_units: 14,
          order_weight_kg: "252.00",
          temp_requirement: "AMBIENT",
          loading_check_status: "SHORTFALL_FLAGGED",
        },
      ],
    } as any);

    const manifest = await LoaderService.getTripManifest("TRP-250613-11", "PELIYAGODA");
    expect(manifest).not.toBeNull();
    expect(manifest?.stops).toHaveLength(1);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT DISTINCT order_id"),
      expect.arrayContaining(["TRP-250613-11"])
    );
  });
});
