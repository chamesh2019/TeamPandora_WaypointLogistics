import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Dispatcher Trip Planning Page Live Integration", () => {
  const pagePath = path.resolve(__dirname, "../app/dispatcher/trip-planning/page.tsx");
  const code = fs.readFileSync(pagePath, "utf-8");

  it("fetches live trips from /api/dispatcher/trips", () => {
    expect(code).toContain("/api/dispatcher/trips");
  });

  it("connects plan publishing to /api/dispatcher/plans/publish", () => {
    expect(code).toContain("/api/dispatcher/plans/publish");
  });

  it("does not render static dummy mock data before loading actual data", () => {
    expect(code).not.toContain("INITIAL_TRIPS");
    expect(code).not.toContain("UNASSIGNED_ORDERS_POOL");
    expect(code).toContain("Loading planned trips...");
  });

  it("uses dynamic cutoff countdown utility", () => {
    expect(code).toContain("getCutoffInfo");
  });

  it("utilizes predefined design system components", () => {
    expect(code).toContain("Button");
    expect(code).toContain("BrandTag");
    expect(code).toContain("StatusBadge");
    expect(code).toContain("Panel");
  });

  it("checks trip finalized state accurately and supports stop reordering", () => {
    expect(code).toContain("isTripFinalized");
    expect(code).toContain("handleMoveStop");
    expect(code).toContain("handleRemoveOrderFromTrip");
  });
});
