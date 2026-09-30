import React from "react";
import { cn } from "../../lib/utils";
import type { OrderLifecycleState, TripStatus } from "../../lib/types";

type BadgeStatus = OrderLifecycleState | TripStatus | "unsent" | "viewed" | "active" | "done" | "pending";

interface StatusBadgeProps {
  status: BadgeStatus | string;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, className, showDot = true }: StatusBadgeProps) {
  const norm = status.toLowerCase();

  let colorClasses = "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300";
  let dotColor = "bg-slate-400";

  if (["delivered", "received", "completed", "done"].includes(norm)) {
    colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40";
    dotColor = "bg-emerald-500";
  } else if (["planned", "viewed"].includes(norm)) {
    colorClasses = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40";
    dotColor = "bg-blue-500";
  } else if (["dispatched", "intransit", "loading"].includes(norm)) {
    colorClasses = "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40";
    dotColor = "bg-purple-500 animate-pulse";
  } else if (["pending", "submitted", "active"].includes(norm)) {
    colorClasses = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40";
    dotColor = "bg-amber-500";
  } else if (["deferred", "disputed", "failed", "delayed", "unsent"].includes(norm)) {
    colorClasses = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40";
    dotColor = "bg-rose-500";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border transition-colors",
        colorClasses,
        className
      )}
    >
      {showDot && <span className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />}
      <span>{status}</span>
    </span>
  );
}
