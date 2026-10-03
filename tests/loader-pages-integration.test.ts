import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Loader Pages Live API Integration", () => {
  const loaderPagePath = path.resolve(__dirname, "../app/loader/page.tsx");
  const loaderCode = fs.readFileSync(loaderPagePath, "utf-8");

  const activeTripsPath = path.resolve(__dirname, "../app/loader/activeTrips/page.tsx");
  const activeTripsCode = fs.readFileSync(activeTripsPath, "utf-8");

  const manifestsPath = path.resolve(__dirname, "../app/loader/manifests/page.tsx");
  const manifestsCode = fs.readFileSync(manifestsPath, "utf-8");

  const shortfailsPath = path.resolve(__dirname, "../app/loader/shortfails/page.tsx");
  const shortfailsCode = fs.readFileSync(shortfailsPath, "utf-8");

  const shortfallFormPath = path.resolve(__dirname, "../app/loader/shortfails/report-shortfall-form.tsx");
  const shortfallFormCode = fs.readFileSync(shortfallFormPath, "utf-8");

  const reportsPath = path.resolve(__dirname, "../app/loader/reports/page.tsx");
  const reportsCode = fs.readFileSync(reportsPath, "utf-8");

  it("Loader Overview page fetches live overview, trips, and manifest data", () => {
    expect(loaderCode).toContain("/api/loader/overview");
    expect(loaderCode).toContain("/api/loader/trips");
    expect(loaderCode).toContain("/api/loader/manifests/");
    expect(loaderCode).not.toContain('const manifestStops = [');
  });

  it("Loader Overview page supports complete loading verification and shortfall modal", () => {
    expect(loaderCode).toContain("/verify");
    expect(loaderCode).toContain("<ReportShortfallForm");
    expect(loaderCode).toContain("handleCompleteLoading");
  });

  it("Active Trips page fetches live trips from /api/loader/trips and links to manifests", () => {
    expect(activeTripsCode).toContain("/api/loader/trips");
    expect(activeTripsCode).toContain("/loader/manifests?tripId=");
    expect(activeTripsCode).not.toMatch(/const trips\s*=\s*\[\s*\{\s*id:\s*"TRP-250614-01"/);
  });

  it("Loading Manifests page fetches live manifest data and supports trip switching", () => {
    expect(manifestsCode).toContain("/api/loader/manifests/");
    expect(manifestsCode).toContain("/api/loader/trips");
    expect(manifestsCode).toContain("/verify");
    expect(manifestsCode).not.toContain('const manifestStops = [');
  });

  it("Shortfalls page fetches live exceptions and connects to modal form", () => {
    expect(shortfailsCode).toContain("/api/loader/exceptions");
    expect(shortfailsCode).toContain("<ReportShortfallForm");
    expect(shortfailsCode).not.toMatch(/const shortfallEntries\s*=\s*\[\s*\{\s*id:\s*"WPF-CHKN-FRZ-24"/);
  });

  it("ReportShortfallForm fetches active trips and POSTs to /api/loader/exceptions", () => {
    expect(shortfallFormCode).toContain("/api/loader/trips");
    expect(shortfallFormCode).toContain("/api/loader/exceptions");
    expect(shortfallFormCode).toContain("POST");
  });

  it("Loader Reports page fetches live reports from /api/loader/reports", () => {
    expect(reportsCode).toContain("/api/loader/reports");
    expect(reportsCode).toContain("cartonsLoadedThisWeek");
    expect(reportsCode).toContain("weeklyLoadingData");
  });
});
