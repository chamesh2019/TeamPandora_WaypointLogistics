import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Store Receipts Page Live Integration", () => {
  const pagePath = path.resolve(__dirname, "../app/store/receipts/page.tsx");
  const code = fs.readFileSync(pagePath, "utf-8");

  it("fetches pending receipts from /api/store/receipts instead of static pendingReceipts", () => {
    expect(code).toContain("/api/store/receipts");
    expect(code).not.toMatch(/const pendingReceipts\s*=\s*\[\s*\{\s*id:\s*"ORD-250611-1842"/);
  });

  it("handles loading and empty states for the receipts view", () => {
    expect(code).toMatch(/loading|isLoading/i);
    expect(code).toMatch(/No pending receipts|No deliveries awaiting sign-off/i);
  });

  it("provides confirmation sign-off mechanism supporting ACCEPTED_IN_FULL and REPORT_DISCREPANCY", () => {
    const modalPath = path.resolve(
      __dirname,
      "../app/store/receipts/confirm-receipt-modal.tsx"
    );
    const modalCode = fs.readFileSync(modalPath, "utf-8");
    expect(code).toContain("ConfirmReceiptModal");
    expect(modalCode).toMatch(/ACCEPTED_IN_FULL/);
    expect(modalCode).toMatch(/REPORT_DISCREPANCY/);
  });

  it("dynamically computes pending sign-off count from live receipts data", () => {
    expect(code).toMatch(/receipts\.length|pendingCount/);
  });
});
