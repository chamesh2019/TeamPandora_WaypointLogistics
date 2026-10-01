import { describe, it, expect } from "vitest";
import { getCutoffInfo } from "../lib/utils/cutoff";

describe("Cutoff Countdown Utility", () => {
  it("calculates remaining time before 16:00 in Asia/Colombo", () => {
    // 09:15 Colombo time (03:45 UTC)
    const morning = new Date("2026-10-01T03:45:00Z");
    const info = getCutoffInfo(morning);
    expect(info.isAfterCutoff).toBe(false);
    expect(info.hoursRemaining).toBe(6);
    expect(info.minutesRemaining).toBe(45);
    expect(info.formattedTimeLeft).toBe("6h 45m remaining");
    expect(info.bannerText).toContain("Cutoff: 16:00 today · 6h 45m remaining");
    expect(info.statNoteText).toBe("Today · 6h 45m left");
  });

  it("handles 1 minute before cutoff (15:59 Colombo time)", () => {
    // 15:59 Colombo time (10:29 UTC)
    const almostCutoff = new Date("2026-10-01T10:29:00Z");
    const info = getCutoffInfo(almostCutoff);
    expect(info.isAfterCutoff).toBe(false);
    expect(info.hoursRemaining).toBe(0);
    expect(info.minutesRemaining).toBe(1);
    expect(info.formattedTimeLeft).toBe("1m remaining");
    expect(info.statNoteText).toBe("Today · 1m left");
  });

  it("detects after cutoff (16:00 Colombo time and later)", () => {
    // 16:00 Colombo time (10:30 UTC)
    const atCutoff = new Date("2026-10-01T10:30:00Z");
    const info = getCutoffInfo(atCutoff);
    expect(info.isAfterCutoff).toBe(true);
    expect(info.hoursRemaining).toBe(0);
    expect(info.minutesRemaining).toBe(0);
    expect(info.bannerText).toContain("Cutoff passed (16:00) · Next run rollover");
    expect(info.statNoteText).toBe("Passed · Next cycle");
  });

  it("handles late evening after cutoff (21:30 Colombo time)", () => {
    // 21:30 Colombo time (16:00 UTC)
    const evening = new Date("2026-10-01T16:00:00Z");
    const info = getCutoffInfo(evening);
    expect(info.isAfterCutoff).toBe(true);
    expect(info.bannerText).toContain("Cutoff passed (16:00)");
  });
});
