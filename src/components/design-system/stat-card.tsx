import React from "react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  note?: string;
  tone?: "green" | "blue" | "purple" | "orange" | "indigo" | "red" | "yellow";
  trend?: {
    up?: boolean;
    text: string;
  };
  bars?: number[];
  className?: string;
}

export function StatCard({
  icon,
  label,
  value,
  note,
  tone = "green",
  trend,
  bars = [40, 65, 50, 80, 70, 95, 88],
  className,
}: StatCardProps) {
  const toneMap = {
    green: {
      icon: "text-[#10B981] bg-[rgba(16,185,129,.12)]",
      note: "text-[#10B981]",
      bar: "bg-[rgba(16,185,129,.2)]",
      barActive: "bg-[#10B981]",
    },
    blue: {
      icon: "text-[#4B8EF5] bg-[rgba(75,142,245,.12)]",
      note: "text-[#4B8EF5]",
      bar: "bg-[rgba(75,142,245,.2)]",
      barActive: "bg-[#4B8EF5]",
    },
    purple: {
      icon: "text-[#7C3AED] bg-[rgba(124,58,237,.12)]",
      note: "text-[#7C3AED]",
      bar: "bg-[rgba(124,58,237,.2)]",
      barActive: "bg-[#7C3AED]",
    },
    orange: {
      icon: "text-[#F59E0B] bg-[rgba(245,158,11,.12)]",
      note: "text-[#F59E0B]",
      bar: "bg-[rgba(245,158,11,.2)]",
      barActive: "bg-[#F59E0B]",
    },
    indigo: {
      icon: "text-[#6366F1] bg-[rgba(99,102,241,.12)]",
      note: "text-[#6366F1]",
      bar: "bg-[rgba(99,102,241,.2)]",
      barActive: "bg-[#6366F1]",
    },
    red: {
      icon: "text-[#EF4444] bg-[rgba(239,68,68,.12)]",
      note: "text-[#EF4444]",
      bar: "bg-[rgba(239,68,68,.2)]",
      barActive: "bg-[#EF4444]",
    },
    yellow: {
      icon: "text-[#9A7000] dark:text-[#F5C542] bg-[rgba(245,197,66,.14)]",
      note: "text-[#9A7000] dark:text-[#F5C542]",
      bar: "bg-[rgba(245,197,66,.2)]",
      barActive: "bg-[#F5C542]",
    },
  }[tone];

  return (
    <div
      className={cn(
        "relative rounded-[14px] p-[22px] bg-white dark:bg-[#121620] border border-black/[0.07] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(15,16,32,0.07),0_0_0_1px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_28px_rgba(15,16,32,0.1)] hover:-translate-y-[2px] transition-all duration-200 overflow-hidden font-sans",
        className
      )}
    >
      {/* Header: Label & Icon */}
      <div className="flex items-start justify-between mb-3.5">
        <span className="text-[11px] font-medium text-[#7B7B9D] dark:text-slate-400">
          {label}
        </span>
        {icon && (
          <div
            className={cn(
              "w-9 h-9 rounded-[10px] grid place-items-center flex-shrink-0 text-sm",
              toneMap.icon
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="text-[30px] font-extrabold tracking-[-0.04em] text-[#0F1020] dark:text-white leading-none mb-1.5 font-sans">
        {value}
      </div>

      {/* Trend or Note */}
      {trend && (
        <div className="flex items-center gap-1.5 text-[10px] font-semibold">
          <span
            className={cn(
              trend.up === true
                ? "text-[#10B981]"
                : trend.up === false
                ? "text-[#EF4444]"
                : "text-[#7B7B9D]"
            )}
          >
            {trend.up ? "▲" : trend.up === false ? "▼" : "•"} {trend.text}
          </span>
        </div>
      )}

      {note && (
        <div className={cn("text-[9px] font-semibold mt-1", toneMap.note)}>
          {note}
        </div>
      )}

      {/* Mini Sparkline Chart */}
      {bars && bars.length > 0 && (
        <div className="mt-3.5 h-[44px] flex items-end gap-[3px]">
          {bars.map((h, idx) => {
            const isLast = idx === bars.length - 1;
            return (
              <div
                key={idx}
                className={cn(
                  "flex-1 rounded-t-[3px] transition-[height] duration-300",
                  isLast ? toneMap.barActive : toneMap.bar
                )}
                style={{ height: `${Math.max(12, h)}%` }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
