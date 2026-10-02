import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { isPublicPath, isAuthorizedForPath } from "@/proxy";

describe("Loader Page & Components Verification", () => {
  const loaderPagePath = path.resolve(__dirname, "../app/loader/page.tsx");
  const globalsCssPath = path.resolve(__dirname, "../app/globals.css");

  it("verifies loader route protection and role authorization", () => {
    expect(isPublicPath("/loader")).toBe(false);
    expect(isAuthorizedForPath("loader", "/loader")).toBe(true);
    expect(isAuthorizedForPath("dispatcher", "/loader")).toBe(false);
  });

  it("verifies app/loader/page.tsx imports and orchestrates all 5 Figma loader views", () => {
    const pageCode = fs.readFileSync(loaderPagePath, "utf-8");
    expect(pageCode).toContain("TopNav");
    expect(pageCode).toContain("LoaderOverview");
    expect(pageCode).toContain("ActiveTrips");
    expect(pageCode).toContain("Manifests");
    expect(pageCode).toContain("Shortfalls");
    expect(pageCode).toContain("Reports");
    expect(pageCode).toContain("currentRole=\"Loader\"");
  });

  it("verifies globals.css includes loader and design system CSS tokens", () => {
    const css = fs.readFileSync(globalsCssPath, "utf-8");
    expect(css).toContain(".app-shell");
    expect(css).toContain(".topnav");
    expect(css).toContain(".plan-detail");
    expect(css).toContain(".stat-card");
    expect(css).toContain(".toast");
    expect(css).toContain(".data-table");
  });

  it("verifies loader views reuse design-system components and dynamic auth session", () => {
    const pageCode = fs.readFileSync(loaderPagePath, "utf-8");
    expect(pageCode).toContain("useSession");
    expect(pageCode).toContain("signOut");

    const overviewCode = fs.readFileSync(path.resolve(__dirname, "../components/loader/overview.tsx"), "utf-8");
    expect(overviewCode).toContain("StatCard");
    expect(overviewCode).toContain("Button");
    expect(overviewCode).toContain("StatusBadge");

    const activeTripsCode = fs.readFileSync(path.resolve(__dirname, "../components/loader/active-trips.tsx"), "utf-8");
    expect(activeTripsCode).toContain("StatCard");
    expect(activeTripsCode).toContain("Button");
    expect(activeTripsCode).toContain("StatusBadge");

    const manifestsCode = fs.readFileSync(path.resolve(__dirname, "../components/loader/manifests.tsx"), "utf-8");
    expect(manifestsCode).toContain("StatCard");
    expect(manifestsCode).toContain("Button");

    const shortfallsCode = fs.readFileSync(path.resolve(__dirname, "../components/loader/shortfalls.tsx"), "utf-8");
    expect(shortfallsCode).toContain("StatCard");
    expect(shortfallsCode).toContain("Button");
    expect(shortfallsCode).toContain("StatusBadge");

    const reportsCode = fs.readFileSync(path.resolve(__dirname, "../components/loader/reports.tsx"), "utf-8");
    expect(reportsCode).toContain("StatCard");
    expect(reportsCode).toContain("Button");
  });
});
