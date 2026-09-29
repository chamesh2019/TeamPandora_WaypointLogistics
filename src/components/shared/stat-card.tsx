import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface StatCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  note?: string;
  trend?: {
    direction: "up" | "down" | "neutral";
    label: string;
  };
  tone?: "green" | "blue" | "purple" | "orange" | "indigo" | "red" | "yellow";
  bars?: number[];
  className?: string;
}

export function StatCard({
  icon,
  label,
  value,
  note,
  trend,
  tone = "indigo",
  bars = [45, 60, 52, 78, 68, 92, 85],
  className,
}: StatCardProps) {
  const toneClasses = {
    green: {
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      barBg: "bg-emerald-500/20",
      barActive: "bg-emerald-500",
      noteText: "text-emerald-600 dark:text-emerald-400",
    },
    blue: {
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      barBg: "bg-blue-500/20",
      barActive: "bg-blue-500",
      noteText: "text-blue-600 dark:text-blue-400",
    },
    purple: {
      iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      barBg: "bg-purple-500/20",
      barActive: "bg-purple-500",
      noteText: "text-purple-600 dark:text-purple-400",
    },
    orange: {
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      barBg: "bg-amber-500/20",
      barActive: "bg-amber-500",
      noteText: "text-amber-600 dark:text-amber-400",
    },
    indigo: {
      iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      barBg: "bg-indigo-500/20",
      barActive: "bg-indigo-500",
      noteText: "text-indigo-600 dark:text-indigo-400",
    },
    red: {
      iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      barBg: "bg-rose-500/20",
      barActive: "bg-rose-500",
      noteText: "text-rose-600 dark:text-rose-400",
    },
    yellow: {
      iconBg: "bg-amber-400/15 text-amber-700 dark:text-amber-300",
      barBg: "bg-amber-400/20",
      barActive: "bg-amber-400",
      noteText: "text-amber-700 dark:text-amber-300",
    },
  }[tone];

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-[#121620] border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-200",
        className
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide">
            {label}
          </span>
          {icon && (
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105",
                toneClasses.iconBg
              )}
            >
              {icon}
            </div>
          )}
        </div>

        <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1.5 font-sans">
          {value}
        </div>

        {trend && (
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {trend.direction === "up" && (
              <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {trend.label}
              </span>
            )}
            {trend.direction === "down" && (
              <span className="inline-flex items-center text-rose-600 dark:text-rose-400">
                <ArrowDownRight className="w-3.5 h-3.5" />
                {trend.label}
              </span>
            )}
            {trend.direction === "neutral" && (
              <span className="inline-flex items-center text-slate-500">
                <Minus className="w-3.5 h-3.5" />
                {trend.label}
              </span>
            )}
          </div>
        )}

        {note && (
          <div className={cn("text-[11px] font-medium mt-1", toneClasses.noteText)}>
            {note}
          </div>
        )}
      </div>

      {/* Mini sparkline bar chart */}
      {bars && bars.length > 0 && (
        <div className="flex items-end gap-1.5 h-10 mt-4 pt-2 border-t border-slate-100 dark:border-white/5">
          {bars.map((height, i) => {
            const isLast = i === bars.length - 1;
            return (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-t-sm transition-all duration-300",
                  isLast ? toneClasses.barActive : toneClasses.barBg
                )}
                style={{ height: `${Math.max(12, height)}%` }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
