import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { dispatcherNavItems } from "../components/layout/dispatcher-nav";
import { resolveActiveHref } from "../components/layout/header";

describe("Dispatcher Navigation Refinement", () => {
  it("correctly resolves activeHref with exact match taking precedence over prefix match", () => {
    expect(resolveActiveHref("/dispatcher", dispatcherNavItems)).toBe("/dispatcher");
    expect(resolveActiveHref("/dispatcher/orders", dispatcherNavItems)).toBe("/dispatcher/orders");
    expect(resolveActiveHref("/dispatcher/trip-planning", dispatcherNavItems)).toBe("/dispatcher/trip-planning");
    expect(resolveActiveHref("/dispatcher/orders/sub-order-1", dispatcherNavItems)).toBe("/dispatcher/orders");
    expect(resolveActiveHref("/dispatcher/unknown", dispatcherNavItems)).toBe("/dispatcher");
  });
  it("defines all 10 dispatcher navigation items with proper hrefs, icons, and badge counts", () => {
    expect(dispatcherNavItems).toHaveLength(10);

    const expected = [
      { name: "Overview", href: "/dispatcher" },
      { name: "Orders", href: "/dispatcher/orders", count: 12 },
      { name: "Allocation", href: "/dispatcher/allocation" },
      { name: "Trip planning", href: "/dispatcher/trip-planning" },
      { name: "Fleet", href: "/dispatcher/fleet" },
      { name: "Live Routes", href: "/dispatcher/live-routes" },
      { name: "Exceptions", href: "/dispatcher/exceptions", count: 3 },
      { name: "Users", href: "/dispatcher/users" },
      { name: "Reports", href: "/dispatcher/reports" },
      { name: "Forecast", href: "/dispatcher/forecast" },
    ];

    expected.forEach((exp, idx) => {
      expect(dispatcherNavItems[idx].name).toBe(exp.name);
      expect(dispatcherNavItems[idx].href).toBe(exp.href);
      expect(dispatcherNavItems[idx].icon).toBeDefined();
      if (exp.count !== undefined) {
        expect(dispatcherNavItems[idx].count).toBe(exp.count);
      }
    });
  });

  it("app/dispatcher/layout.tsx exists and renders Header with dispatcherNavItems", () => {
    const layoutPath = path.resolve(__dirname, "../app/dispatcher/layout.tsx");
    expect(fs.existsSync(layoutPath)).toBe(true);

    const content = fs.readFileSync(layoutPath, "utf-8");
    expect(content).toContain("Header");
    expect(content).toContain("dispatcherNavItems");
    expect(content).toContain('homeHref="/dispatcher"');
  });

  it("ensures none of the 10 dispatcher pages contain the legacy custom inlined header", () => {
    const pages = [
      "app/dispatcher/page.tsx",
      "app/dispatcher/orders/page.tsx",
      "app/dispatcher/allocation/page.tsx",
      "app/dispatcher/trip-planning/page.tsx",
      "app/dispatcher/fleet/page.tsx",
      "app/dispatcher/live-routes/page.tsx",
      "app/dispatcher/exceptions/page.tsx",
      "app/dispatcher/users/page.tsx",
      "app/dispatcher/reports/page.tsx",
      "app/dispatcher/forecast/page.tsx",
    ];

    pages.forEach((pageRel) => {
      const pagePath = path.resolve(__dirname, "..", pageRel);
      const content = fs.readFileSync(pagePath, "utf-8");
      expect(content).not.toContain('header className="sticky top-0 z-50 bg-[#0F1928]');
      expect(content).not.toContain('Demo Mode: Simulation active');
    });
  });
});
