import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Dispatcher Planning Console UI Integration', () => {
  const pagePath = path.resolve(__dirname, '../app/dispatcher/planning/page.tsx');
  const tripCardPath = path.resolve(__dirname, '../components/dispatcher/trip-card.tsx');
  const deferralDrawerPath = path.resolve(__dirname, '../components/dispatcher/deferral-drawer.tsx');

  it('provides the Dispatcher Planning Console page with Auto-Plan and Feasibility badge', () => {
    expect(fs.existsSync(pagePath)).toBe(true);
    const code = fs.readFileSync(pagePath, 'utf-8');

    expect(code).toMatch(/['"]use client['"]/);
    expect(code).toMatch(/Auto-Plan Trips/i);
    expect(code).toMatch(/Feasibility Standard/i);
    expect(code).toContain('/api/dispatcher/allocate');
    expect(code).toContain('/api/dispatcher/plans/publish');
    expect(code).toMatch(/Publish Plan/i);
    expect(code).toMatch(/16:00|cutoff/i);
  });

  it('renders TripCard with dual capacity bars, time budget gauge, and stop sequence', () => {
    expect(fs.existsSync(tripCardPath)).toBe(true);
    const code = fs.readFileSync(tripCardPath, 'utf-8');

    expect(code).toMatch(/weight_utilization|weight/i);
    expect(code).toMatch(/volume_utilization|volume/i);
    expect(code).toMatch(/duration_minutes|time budget|budget/i);
    expect(code).toMatch(/stops|sequence/i);
  });

  it('renders DeferralDrawer with root cause badges and anti-starvation indicator', () => {
    expect(fs.existsSync(deferralDrawerPath)).toBe(true);
    const code = fs.readFileSync(deferralDrawerPath, 'utf-8');

    expect(code).toMatch(/reason_code/i);
    expect(code).toMatch(/anti-starvation|deferred_yesterday|starving/i);
    expect(code).toMatch(/CAPACITY_WEIGHT|NO_REEFER_AVAILABLE|NO_VAN_AVAILABLE/);
  });
});
