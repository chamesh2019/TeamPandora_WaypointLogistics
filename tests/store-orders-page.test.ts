import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Store Orders Page Live Integration", () => {
  const pagePath = path.resolve(__dirname, "../app/store/orders/page.tsx");
  const code = fs.readFileSync(pagePath, "utf-8");

  it("fetches orders from /api/store/orders instead of using static orderRows", () => {
    expect(code).toContain("/api/store/orders");
    expect(code).not.toMatch(/const orderRows\s*=\s*\[\s*\{\s*id:\s*"ORD-250614-2901"/);
  });

  it("passes onSuccess callback to PlaceOrderForm to trigger reload", () => {
    expect(code).toMatch(/<PlaceOrderForm[\s\S]*?onSuccess=/);
  });

  it("uses dynamic cutoff utility for the Order Cutoff stat card", () => {
    expect(code).toContain("getCutoffInfo");
    expect(code).not.toContain('note="Today · 2h 14m left"');
  });

  it("handles loading and empty states for the order table", () => {
    expect(code).toMatch(/loading|isLoading/i);
    expect(code).toMatch(/No orders found|No orders placed yet/i);
  });
});
