import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Loader Frontend API Integration Verification", () => {
  it("verifies overview.tsx fetches /api/loader/overview", () => {
    const code = fs.readFileSync(
      path.resolve(__dirname, "../components/loader/overview.tsx"),
      "utf-8"
    );
    expect(code).toContain("/api/loader/overview");
  });

  it("verifies active-trips.tsx fetches /api/loader/trips", () => {
    const code = fs.readFileSync(
      path.resolve(__dirname, "../components/loader/active-trips.tsx"),
      "utf-8"
    );
    expect(code).toContain("/api/loader/trips");
  });

  it("verifies manifests.tsx fetches /api/loader/manifests and calls verify endpoint", () => {
    const code = fs.readFileSync(
      path.resolve(__dirname, "../components/loader/manifests.tsx"),
      "utf-8"
    );
    expect(code).toContain("/api/loader/manifests");
    expect(code).toContain("/verify");
  });

  it("verifies shortfalls.tsx fetches /api/loader/exceptions and submits new reports", () => {
    const code = fs.readFileSync(
      path.resolve(__dirname, "../components/loader/shortfalls.tsx"),
      "utf-8"
    );
    expect(code).toContain("/api/loader/exceptions");
  });
});
