import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Dispatcher Allocation Page Live Integration", () => {
  const pagePath = path.resolve(__dirname, "../app/dispatcher/allocation/page.tsx");
  const code = fs.readFileSync(pagePath, "utf-8");

  it("fetches live allocation queue from /api/dispatcher/allocation", () => {
    expect(code).toContain("/api/dispatcher/allocation");
  });

  it("connects auto-allocation to the AI solver endpoint /api/dispatcher/allocate", () => {
    expect(code).toContain("/api/dispatcher/allocate");
  });

  it("connects commit assignment to /api/dispatcher/allocation/commit", () => {
    expect(code).toContain("/api/dispatcher/allocation/commit");
  });

  it("utilizes predefined design-system components instead of raw elements", () => {
    expect(code).toContain("Button");
    expect(code).toContain("FilterTabs");
    expect(code).toContain("BrandTag");
    expect(code).toContain("Panel");
  });

  it("includes constraint checks for brand/district homogeneity, reefer, and capacities", () => {
    expect(code).toContain("isBrandHomogeneous");
    expect(code).toContain("isDistrictHomogeneous");
    expect(code).toContain("isReeferValid");
    expect(code).toContain("isWeightValid");
    expect(code).toContain("isVolumeValid");
  });

  it("does not render static dummy mock data before loading actual data", () => {
    expect(code).not.toContain("FALLBACK_QUEUE");
    expect(code).not.toContain("INITIAL_QUEUE");
    expect(code).toContain("Loading unallocated orders...");
  });
});

