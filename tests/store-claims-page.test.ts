import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Store Claims Page Live Integration", () => {
  const pagePath = path.resolve(__dirname, "../app/store/claims/page.tsx");
  const code = fs.readFileSync(pagePath, "utf-8");

  it("fetches claims from /api/store/claims instead of using static claimHistory", () => {
    expect(code).toContain("/api/store/claims");
    expect(code).not.toMatch(/const claimHistory\s*=\s*\[\s*\{\s*id:\s*"CLM-25601-0004"/);
  });

  it("passes onSuccess callback to NewClaimForm to trigger reload", () => {
    expect(code).toMatch(/<NewClaimForm[\s\S]*?onSuccess=/);
  });

  it("handles loading and empty states for the claims table", () => {
    expect(code).toMatch(/loading|isLoading/i);
    expect(code).toMatch(/No claims found|No claims filed yet/i);
  });

  it("computes dynamic open claims and status badges from API data", () => {
    expect(code).toMatch(/resolutionStatus|disputeType/);
    expect(code).toContain("SHORT_DELIVERY");
  });
});
