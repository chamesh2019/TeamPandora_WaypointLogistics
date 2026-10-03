"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

export type StopStatus = "done" | "current" | "upcoming";

export interface StopNumberCellProps {
  n: number;
  status: StopStatus;
  className?: string;
}

export function StopNumberCell({ n, status, className }: StopNumberCellProps) {
  const colorMap: Record<StopStatus, string> = {
    done: "bg-[rgba(16,185,129,.15)] text-[#10B981]",
    current: "bg-[#F5C542] text-[#0D1C2A]",
    upcoming: "bg-[#F5F6FB] dark:bg-[#1C1C38] text-[#7B7B9D]",
  };

  return (
    <span
      className={cn(
        "inline-grid place-items-center w-7 h-7 rounded-full text-[9px] font-extrabold flex-shrink-0",
        colorMap[status],
        className
      )}
    >
      {status === "done" ? <Check className="w-3 h-3" /> : n}
    </span>
  );
}
