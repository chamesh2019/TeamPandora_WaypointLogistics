import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Store Overview Page Live Integration", () => {
  const pagePath = path.resolve(__dirname, "../app/store/page.tsx");
  const code = fs.readFileSync(pagePath, "utf-8");

  const receiptsPagePath = path.resolve(__dirname, "../app/store/receipts/page.tsx");
  const receiptsCode = fs.readFileSync(receiptsPagePath, "utf-8");

  it("fetches dashboard data from /api/store/overview and /api/store/receipts", () => {
    expect(code).toContain("/api/store/overview");
    expect(code).toContain("/api/store/receipts");
    expect(code).not.toContain('value="07:35"\n              note="Arriving in 42 minutes"');
    expect(code).not.toContain("ORD-250611-1842");
  });

  it("handles loading, empty, and error states dynamically", () => {
    expect(code).toMatch(/loading|isLoading/i);
    expect(code).toMatch(/error/i);
    expect(code).toMatch(/No scheduled deliveries|All assigned trips/i);
    expect(code).toMatch(/No pending receipts|All caught up/i);
  });

  it("links the receipt button to open the receipt in the receipts tab with orderId", () => {
    expect(code).toContain("/store/receipts?orderId=");
    expect(code).toContain("Review receipt");
  });

  it("receipts page reads query orderId and automatically opens the receipt review modal", () => {
    expect(receiptsCode).toContain("useSearchParams");
    expect(receiptsCode).toContain("queryOrderId");
    expect(receiptsCode).toContain("setReviewReceipt");
    expect(receiptsCode).toContain("Suspense");
  });
});
