"use client";

import React from "react";
import { cn } from "../../lib/utils";

export type DeliveryBadgeVariant =
  | "delivered"
  | "in-progress"
  | "upcoming"
  | "resolved"
  | "open"
  | "synced";

const variantMap: Record<
  DeliveryBadgeVariant,
  { bg: string; text: string; dot: string; label: string }
> = {
  delivered: {
    bg: "bg-[rgba(16,185,129,.12)] border border-emerald-500/20",
    text: "text-[#10B981]",
    dot: "bg-[#10B981]",
    label: "Delivered",
  },
  "in-progress": {
    bg: "bg-[rgba(245,197,66,.14)] border border-[#F5C542]/30",
    text: "text-[#D4A200] dark:text-[#F5C542]",
    dot: "bg-[#F5C542]",
    label: "In progress",
  },
  upcoming: {
    bg: "bg-[rgba(245,158,11,.1)] border border-amber-500/20",
    text: "text-[#F59E0B]",
    dot: "bg-[#F59E0B]",
    label: "Upcoming",
  },
  resolved: {
    bg: "bg-[rgba(16,185,129,.12)] border border-emerald-500/20",
    text: "text-[#10B981]",
    dot: "bg-[#10B981]",
    label: "Resolved",
  },
  open: {
    bg: "bg-[rgba(239,68,68,.1)] border border-rose-500/20",
    text: "text-[#EF4444]",
    dot: "bg-[#EF4444]",
    label: "Open",
  },
  synced: {
    bg: "bg-[rgba(16,185,129,.1)] border border-emerald-500/20",
    text: "text-[#10B981]",
    dot: "bg-[#10B981]",
    label: "Synced",
  },
};

export interface DriverBadgeProps {
  variant: DeliveryBadgeVariant;
  label?: string;
  showDot?: boolean;
  className?: string;
}

export function DriverBadge({
  variant,
  label,
  showDot = true,
  className,
}: DriverBadgeProps) {
  const v = variantMap[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full",
        "text-[8px] font-bold uppercase tracking-wider whitespace-nowrap",
        v.bg,
        v.text,
        className
      )}
    >
      {showDot && <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", v.dot)} />}
      {label ?? v.label}
    </span>
  );
}
