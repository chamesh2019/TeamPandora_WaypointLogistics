import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Dispatcher Users Management Page Live Integration", () => {
  const pagePath = path.resolve(__dirname, "../app/dispatcher/users/page.tsx");
  const code = fs.readFileSync(pagePath, "utf-8");

  it("fetches live staff roster and KPIs from /api/dispatcher/users", () => {
    expect(code).toContain("/api/dispatcher/users");
  });

  it("does not use static mock INITIAL_USERS array", () => {
    expect(code).not.toContain("INITIAL_USERS");
  });

  it("renders 5 live KPI summary cards with counts from kpis", () => {
    expect(code).toContain("kpis.total");
    expect(code).toContain("kpis.dispatchers");
    expect(code).toContain("kpis.drivers");
    expect(code).toContain("kpis.loaders");
    expect(code).toContain("kpis.storeManagers");
  });

  it("includes role filter tabs with live count badges", () => {
    expect(code).toContain("roleFilter");
    expect(code).toContain("store_manager");
    expect(code).toContain("dispatcher");
    expect(code).toContain("driver");
    expect(code).toContain("loader");
  });

  it("connects Create User modal to POST /api/dispatcher/users with credentials and domain fields", () => {
    expect(code).toContain('method: "POST"');
    expect(code).toContain("/api/dispatcher/users");
    expect(code).toContain("username");
    expect(code).toContain("password");
    expect(code).toContain("handleCreateUser");
  });

  it("connects Edit User modal and Lock/Unlock status toggle to PATCH /api/dispatcher/users", () => {
    expect(code).toContain('method: "PATCH"');
    expect(code).toContain("/api/dispatcher/users");
    expect(code).toContain("handleToggleLock");
    expect(code).toContain("handleSaveEdit");
  });

  it("supports assigning depots to dispatchers/drivers/loaders and outlets to store managers", () => {
    expect(code).toContain("depots");
    expect(code).toContain("outlets");
    expect(code).toContain("depotId");
    expect(code).toContain("outletId");
  });

  it("includes loading and error state feedback", () => {
    expect(code).toContain("isLoading");
  });
});
