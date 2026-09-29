import React from "react";
import { cn } from "@/lib/utils";

interface FuelBarProps {
  consumedLiters: number;
  totalQuotaLiters: number;
  showText?: boolean;
  className?: string;
}

export function FuelBar({
  consumedLiters,
  totalQuotaLiters,
  showText = true,
  className,
}: FuelBarProps) {
  const percentUsed = Math.min(100, Math.round((consumedLiters / Math.max(1, totalQuotaLiters)) * 100));
  const remainingLiters = Math.max(0, totalQuotaLiters - consumedLiters);

  let barColor = "bg-emerald-500";
  let textColor = "text-emerald-600 dark:text-emerald-400";

  if (percentUsed >= 85) {
    barColor = "bg-rose-500";
    textColor = "text-rose-600 dark:text-rose-400";
  } else if (percentUsed >= 65) {
    barColor = "bg-amber-500";
    textColor = "text-amber-600 dark:text-amber-400";
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0">
        <div
          className={cn("h-full rounded-full transition-all duration-300", barColor)}
          style={{ width: `${percentUsed}%` }}
        />
      </div>
      {showText && (
        <span className={cn("text-[10px] font-mono font-medium whitespace-nowrap", textColor)}>
          {remainingLiters}L left ({100 - percentUsed}%)
        </span>
      )}
    </div>
  );
}
