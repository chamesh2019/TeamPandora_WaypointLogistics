import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Login Page Component Structure & Logic", () => {
  const loginPagePath = path.resolve(__dirname, "../app/login/page.tsx");

  it("implements Figma 1:1 login layout with client auth SDK", () => {
    const code = fs.readFileSync(loginPagePath, "utf-8");
    
    // Client component declaration
    expect(code).toContain('"use client"');

    // Branding & visual assets
    expect(code).toContain("LogisticsIllustration");
    expect(code).toContain("Waypoint Control");
    expect(code).toContain("Intelligent");
    expect(code).toContain("logistics");

    // Form inputs and controls
    expect(code).toContain("signIn.username");
    expect(code).toContain("useRouter");
    expect(code).toContain("useSearchParams");
    expect(code).toContain("showPass");
    expect(code).toContain("remember");

    // Demo role quick chips
    expect(code).toContain("dispatcher");
    expect(code).toContain("loader");
    expect(code).toContain("driver");
    expect(code).toContain("store_manager");

    // Offline internet requirement guard
    expect(code).toContain("Internet Connection Required");
    expect(code).toContain("isOffline");
    expect(code).toContain("Waiting for internet connection...");
  });
});
