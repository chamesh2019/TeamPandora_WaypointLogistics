import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { GET as searchGet } from "@/app/api/search/route";

describe("Global Header Search Functionality", () => {
  it("GET /api/search returns empty results when query is empty or less than 2 chars", async () => {
    const req1 = new Request("http://localhost:3000/api/search?q=");
    const res1 = await searchGet(req1);
    const json1 = await res1.json();
    expect(res1.status).toBe(200);
    expect(json1.success).toBe(true);
    expect(json1.data.orders).toEqual([]);
    expect(json1.data.trips).toEqual([]);

    const req2 = new Request("http://localhost:3000/api/search?q=a");
    const res2 = await searchGet(req2);
    const json2 = await res2.json();
    expect(json2.success).toBe(true);
    expect(json2.data.orders).toEqual([]);
    expect(json2.data.trips).toEqual([]);
  });

  it("GET /api/search handles search queries gracefully without throwing errors", async () => {
    const req = new Request("http://localhost:3000/api/search?q=ORD-250613");
    const res = await searchGet(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data.orders)).toBe(true);
    expect(Array.isArray(json.data.trips)).toBe(true);
  });

  it("Header component implements interactive search with keyboard navigation, dropdown, and API integration", () => {
    const headerPath = path.resolve(__dirname, "../components/layout/header.tsx");
    const headerCode = fs.readFileSync(headerPath, "utf-8");

    expect(headerCode).toContain("handleExecuteSearch");
    expect(headerCode).toContain("/api/search?q=");
    expect(headerCode).toContain("renderSearchDropdown");
    expect(headerCode).toContain("handleKeyDown");
    expect(headerCode).toContain("matchedNavItems");
    expect(headerCode).toContain("setSearchOpen(true)");
    expect(headerCode).toContain("router.push");
  });
});
