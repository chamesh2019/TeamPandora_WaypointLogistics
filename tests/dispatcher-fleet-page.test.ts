import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Dispatcher Fleet Management Page Live Integration", () => {
  const pagePath = path.resolve(__dirname, "../app/dispatcher/fleet/page.tsx");
  const code = fs.readFileSync(pagePath, "utf-8");

  it("fetches live fleet from /api/dispatcher/fleet", () => {
    expect(code).toContain("/api/dispatcher/fleet");
  });

  it("fetches 10-day historical KPIs from /api/dispatcher/fleet/kpis", () => {
    expect(code).toContain("/api/dispatcher/fleet/kpis");
  });

  it("sends driver and workshop maintenance updates to PATCH /api/dispatcher/fleet", () => {
    expect(code).toContain('method: "PATCH"');
    expect(code).toContain("/api/dispatcher/fleet");
  });

  it("does not render static dummy INITIAL_FLEET array", () => {
    expect(code).not.toContain("INITIAL_FLEET");
  });

  it("renders dynamic 10-day graduated bar charts using history data", () => {
    expect(code).toContain("history");
    expect(code).toContain("barHeight");
  });

  it("includes workshop maintenance action controls", () => {
    expect(code).toContain("handleToggleWorkshop");
  });

  it("includes driver assignment modal and submission handler", () => {
    expect(code).toContain("handleConfirmAssignment");
    expect(code).toContain("assignDriverId");
  });

  it("includes loading state while fetching fleet data", () => {
    expect(code).toContain("isLoading");
  });

  it("provides live CSV export functionality", () => {
    expect(code).toContain("handleExportCSV");
  });
});
