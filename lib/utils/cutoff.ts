/**
 * Cutoff Countdown Utility for Store Orders
 * Operating timezone: Asia/Colombo (UTC+5:30)
 * Daily order cutoff: 16:00 (4:00 PM)
 */

export interface CutoffInfo {
  cutoffHour: number;
  isAfterCutoff: boolean;
  hoursRemaining: number;
  minutesRemaining: number;
  formattedTimeLeft: string;
  bannerText: string;
  statNoteText: string;
}

export function getCutoffInfo(now: Date = new Date()): CutoffInfo {
  const cutoffHour = 16;

  // Format current date in Colombo time (UTC+5:30)
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Colombo",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(now);

  const hourPart = parts.find((p) => p.type === "hour");
  const minutePart = parts.find((p) => p.type === "minute");

  const currentHour = hourPart ? parseInt(hourPart.value, 10) : 0;
  const currentMinute = minutePart ? parseInt(minutePart.value, 10) : 0;

  const currentTotalMinutes = currentHour * 60 + currentMinute;
  const cutoffTotalMinutes = cutoffHour * 60; // 960 minutes

  const isAfterCutoff = currentTotalMinutes >= cutoffTotalMinutes;

  if (isAfterCutoff) {
    return {
      cutoffHour,
      isAfterCutoff: true,
      hoursRemaining: 0,
      minutesRemaining: 0,
      formattedTimeLeft: "0m remaining",
      bannerText: "Cutoff passed (16:00) · Next run rollover",
      statNoteText: "Passed · Next cycle",
    };
  }

  const diffMinutes = cutoffTotalMinutes - currentTotalMinutes;
  const hoursRemaining = Math.floor(diffMinutes / 60);
  const minutesRemaining = diffMinutes % 60;

  const formattedTimeLeft =
    hoursRemaining > 0
      ? `${hoursRemaining}h ${minutesRemaining}m remaining`
      : `${minutesRemaining}m remaining`;

  const bannerText = `Cutoff: 16:00 today · ${formattedTimeLeft}`;
  const statNoteText =
    hoursRemaining > 0
      ? `Today · ${hoursRemaining}h ${minutesRemaining}m left`
      : `Today · ${minutesRemaining}m left`;

  return {
    cutoffHour,
    isAfterCutoff: false,
    hoursRemaining,
    minutesRemaining,
    formattedTimeLeft,
    bannerText,
    statNoteText,
  };
}
