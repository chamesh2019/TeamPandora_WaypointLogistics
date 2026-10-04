import { describe, it, expect } from "vitest";
import { getSampleOrdersAndItemsSql } from "@/scripts/seed-master-data";

describe("Driver Seed Data", () => {
  it("includes active trip and sequenced stops for usr-driv-001", () => {
    const sql = getSampleOrdersAndItemsSql();
    expect(sql).toContain("TRP-20261001-01");
    expect(sql).toContain("usr-driv-001");
    expect(sql).toContain("VEH001");
    expect(sql).toContain("STP-20261001-01");
    expect(sql).toContain("POD-20261001-044000");
  });
});
