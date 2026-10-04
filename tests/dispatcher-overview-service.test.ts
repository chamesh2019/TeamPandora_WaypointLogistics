import { describe, it, expect } from "vitest";
import { DispatcherService } from "../lib/services/dispatcher-service";

describe("DispatcherService.getOverview", () => {
  it("retrieves operational KPIs, order planning queue, exceptions, and metadata", async () => {
    const data = await DispatcherService.getOverview();

    expect(data).toBeDefined();

    // 1. KPIs
    expect(data.kpis).toBeDefined();
    expect(data.kpis.confirmedOrders).toBeDefined();
    expect(typeof data.kpis.confirmedOrders.count).toBe("number");
    expect(data.kpis.confirmedOrders.trendNote).toMatch(/since 06:00/);
    expect(data.kpis.confirmedOrders.bars).toHaveLength(10);

    expect(data.kpis.activeFleet).toBeDefined();
    expect(typeof data.kpis.activeFleet.activeCount).toBe("number");
    expect(typeof data.kpis.activeFleet.totalCount).toBe("number");
    expect(data.kpis.activeFleet.bars).toHaveLength(10);

    expect(data.kpis.lateRisk).toBeDefined();
    expect(typeof data.kpis.lateRisk.count).toBe("number");
    expect(data.kpis.lateRisk.bars).toHaveLength(10);

    expect(data.kpis.cutoffTimer).toBeDefined();
    expect(typeof data.kpis.cutoffTimer.formattedTimeLeft).toBe("string");
    expect(typeof data.kpis.cutoffTimer.isAfterCutoff).toBe("boolean");
    expect(data.kpis.cutoffTimer.bars).toHaveLength(10);

    // 2. Order planning queue
    expect(Array.isArray(data.queue)).toBe(true);
    expect(data.queue.length).toBeGreaterThan(0);
    const order = data.queue[0];
    expect(order).toHaveProperty("id");
    expect(order).toHaveProperty("outlet");
    expect(order).toHaveProperty("brand");
    expect(["Fresh", "Style", "Tech"]).toContain(order.brand);
    expect(order).toHaveProperty("district");
    expect(order).toHaveProperty("temperature");
    expect(order).toHaveProperty("weight");
    expect(order).toHaveProperty("volume");
    expect(order).toHaveProperty("priority");
    expect(["High", "Medium", "Low"]).toContain(order.priority);

    // 3. Live exceptions
    expect(Array.isArray(data.exceptions)).toBe(true);
    expect(data.exceptions.length).toBeGreaterThanOrEqual(4);
    const exc = data.exceptions[0];
    expect(exc).toHaveProperty("id");
    expect(exc).toHaveProperty("title");
    expect(exc).toHaveProperty("subtitle");
    expect(exc).toHaveProperty("severity");
    expect(["Critical", "High", "Medium"]).toContain(exc.severity);

    // 4. Meta depots and vehicles
    expect(Array.isArray(data.depots)).toBe(true);
    expect(data.depots.length).toBeGreaterThan(0);
    expect(Array.isArray(data.vehicles)).toBe(true);
    expect(data.vehicles.length).toBeGreaterThan(0);
    expect(Array.isArray(data.districts)).toBe(true);
    expect(data.districts.length).toBeGreaterThan(0);
  });

  it("filters overview by depotId when specified", async () => {
    const data = await DispatcherService.getOverview({ depotId: "PELIYAGODA" });
    expect(data).toBeDefined();
    expect(data.kpis).toBeDefined();
    expect(data.queue.length).toBeGreaterThan(0);
  });
});
