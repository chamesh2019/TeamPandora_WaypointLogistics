import React from "react";
import { cn } from "@/lib/utils";

export function FuelBar({
  percentage = 68,
  litersRemaining,
  showLabel = true,
  className,
}: {
  percentage?: number;
  litersRemaining?: number;
  showLabel?: boolean;
  className?: string;
}) {
  let barColor = "bg-[#10B981]";
  let textColor = "text-[#10B981]";

  if (percentage <= 25) {
    barColor = "bg-[#EF4444]";
    textColor = "text-[#EF4444]";
  } else if (percentage <= 50) {
    barColor = "bg-[#F59E0B]";
    textColor = "text-[#F59E0B]";
  }

  return (
    <div className={cn("inline-flex items-center gap-[7px] whitespace-nowrap", className)}>
      <div className="flex-shrink-0 w-[52px] h-[4px] rounded-full bg-[#F5F6FB] dark:bg-white/10 overflow-hidden">
        <span
          className={cn("block h-full rounded-full transition-all duration-300", barColor)}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn("text-[9px] font-mono font-bold", textColor)}>
          {litersRemaining !== undefined ? `${litersRemaining}L (${percentage}%)` : `${percentage}%`}
        </span>
      )}
    </div>
  );
}
