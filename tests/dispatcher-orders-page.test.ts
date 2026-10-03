import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Dispatcher Orders Page Live Integration", () => {
  const pagePath = path.resolve(__dirname, "../app/dispatcher/orders/page.tsx");
  const code = fs.readFileSync(pagePath, "utf-8");

  it("fetches orders from /api/dispatcher/orders instead of using static INITIAL_ORDERS", () => {
    expect(code).toContain("/api/dispatcher/orders");
    expect(code).not.toMatch(/const INITIAL_ORDERS\s*:\s*OrderItem\[\]\s*=\s*\[/);
  });

  it("uses dynamic cutoff utility for the Order Cutoff summary banner", () => {
    expect(code).toContain("getCutoffInfo");
    expect(code).not.toContain("Order cutoff: 16:00 today - 2h 14m remaining");
  });

  it("utilizes predefined design-system components instead of ad-hoc elements", () => {
    expect(code).toContain("Button");
    expect(code).toContain("BrandTag");
    expect(code).toContain("StatusBadge");
    expect(code).toContain("FilterTabs");
  });

  it("handles loading and empty states for the order table", () => {
    expect(code).toMatch(/loading|isLoading/i);
    expect(code).toMatch(/No orders found/i);
  });
});
