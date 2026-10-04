import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Dispatcher Overview Page Integration & Live Routes Removal", () => {
  const pagePath = path.resolve(__dirname, "../app/dispatcher/page.tsx");
  const code = fs.readFileSync(pagePath, "utf-8");

  it("fetches dashboard overview data from /api/dispatcher/overview", () => {
    expect(code).toContain("/api/dispatcher/overview");
  });

  it("removes the live routes / live operations map component", () => {
    expect(code).not.toContain("MAP_VEHICLES");
    expect(code).not.toContain("selectedVehicle");
    expect(code).not.toContain("Live operations map");
    expect(code).not.toContain("/dispatcher/live-routes");
  });

  it("expands the order planning queue across the full section width", () => {
    expect(code).toContain("Order planning queue");
    // Order planning queue should not be constrained to lg:col-span-7 beside a live routes map
    expect(code).not.toContain("lg:col-span-7");
  });

  it("dynamically displays current user greeting and session information", () => {
    expect(code).toContain("useSession");
  });

  it("renders live KPI metrics from the backend API", () => {
    expect(code).toContain("confirmedOrders");
    expect(code).toContain("activeFleet");
    expect(code).toContain("lateRisk");
    expect(code).toContain("cutoffTimer");
  });

  it("supports auto-planning and order allocation interactions", () => {
    expect(code).toContain("handleAutoPlan");
    expect(code).toContain("/api/dispatcher/allocate");
  });

  it("populates the Create Trip modal with dynamic depot and vehicle options", () => {
    expect(code).toContain("newTripData");
    expect(code).toContain("isCreateTripOpen");
  });
});
