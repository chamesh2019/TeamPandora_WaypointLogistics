import React from "react";
import { cn } from "../../lib/utils";

export type FigmaBadgeStatus =
  | "pending"
  | "planned"
  | "draft"
  | "dispatched"
  | "delivered"
  | "incomplete"
  | "open"
  | "escalated"
  | "resolved"
  | "substituted"
  | "active"
  | "unsent"
  | "viewed"
  | "finalized"
  | "published";

export interface StatusBadgeProps {
  status: FigmaBadgeStatus | string;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, className, showDot = true }: StatusBadgeProps) {
  const s = status.toLowerCase() as FigmaBadgeStatus;

  // 1:1 match with Figma index.css .badge.* rules
  let colorClasses = "bg-slate-100 text-slate-700 border-slate-200/80";
  let dotColor = "bg-slate-400";

  switch (s) {
    case "pending":
    case "open":
      colorClasses = "bg-[rgba(245,158,11,.12)] text-[#F59E0B] border-amber-500/20";
      dotColor = "bg-[#F59E0B]";
      break;
    case "planned":
    case "draft":
    case "viewed":
    case "substituted":
      colorClasses = "bg-[rgba(75,142,245,.12)] text-[#4B8EF5] border-blue-500/20";
      dotColor = "bg-[#4B8EF5]";
      break;
    case "dispatched":
    case "escalated":
      colorClasses = "bg-[rgba(124,58,237,.12)] text-[#7C3AED] border-purple-500/20";
      dotColor = "bg-[#7C3AED]";
      break;
    case "delivered":
    case "resolved":
    case "finalized":
    case "published":
      colorClasses = "bg-[rgba(16,185,129,.12)] text-[#10B981] border-emerald-500/20";
      dotColor = "bg-[#10B981]";
      break;
    case "incomplete":
    case "unsent":
      colorClasses = "bg-[rgba(239,68,68,.12)] text-[#EF4444] border-rose-500/20";
      dotColor = "bg-[#EF4444]";
      break;
    case "active":
      colorClasses = "bg-[rgba(245,197,66,.18)] text-[#D4A200] dark:text-[#F5C542] border-[#F5C542]/30";
      dotColor = "bg-[#F5C542]";
      break;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border whitespace-nowrap",
        colorClasses,
        className
      )}
    >
      {showDot && <span className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />}
      <span>{status}</span>
    </span>
  );
}

export function BrandTag({
  brand,
  className,
}: {
  brand: "Waypoint Fresh" | "Waypoint Style" | "Waypoint Tech" | string;
  className?: string;
}) {
  const b = brand.toLowerCase();
  let brandStyles = "bg-slate-100 text-slate-800";

  if (b.includes("fresh")) {
    brandStyles = "bg-[rgba(16,185,129,.12)] text-[#10B981]";
  } else if (b.includes("style")) {
    brandStyles = "bg-[rgba(75,142,245,.12)] text-[#4B8EF5]";
  } else if (b.includes("tech")) {
    brandStyles = "bg-[rgba(124,58,237,.12)] text-[#7C3AED]";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-[5px] text-[9px] font-bold uppercase tracking-tight",
        brandStyles,
        className
      )}
    >
      {brand}
    </span>
  );
}

export function RoleHeaderBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(245,197,66,.14)] border border-[rgba(245,197,66,.2)] text-[#9A7000] dark:text-[#F5C542] text-[9px] font-bold uppercase tracking-[0.1em]",
        className
      )}
    >
      {children}
    </span>
  );
}

export function CutoffChip({
  text = "Daily Cutoff 16:00",
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-bold text-[#10B981] bg-[rgba(16,185,129,.12)]",
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      <span>{text}</span>
    </span>
  );
}

export function KpiChip({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/[0.07] dark:border-white/10 bg-white dark:bg-[#121620] text-[11px] font-semibold text-[#0F1020] dark:text-white shadow-sm whitespace-nowrap",
        className
      )}
    >
      <span className="text-[#7B7B9D]">{label}:</span>
      <strong className="font-extrabold">{value}</strong>
    </span>
  );
}
