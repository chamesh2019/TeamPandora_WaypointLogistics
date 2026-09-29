import React from "react";
import { cn } from "@/lib/utils";

export interface DonutSegment {
  label: string;
  sublabel?: string;
  value: string | number;
  color: string;
}

export function DonutGauge({
  percentage = 82,
  title = "82%",
  subtitle = "Readiness",
  segments = [
    { label: "Waypoint Fresh", sublabel: "Cold-chain Verified", value: "88%", color: "#F5C542" },
    { label: "Waypoint Style", sublabel: "Staged Bay 2", value: "79%", color: "#4B8EF5" },
    { label: "Waypoint Tech", sublabel: "Dock Cleared", value: "74%", color: "#7C3AED" },
  ],
  className,
}: {
  percentage?: number;
  title?: string;
  subtitle?: string;
  segments?: DonutSegment[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center gap-6 p-5 rounded-[14px] bg-white dark:bg-[#121620] border border-black/[0.07] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(15,16,32,0.07)]",
        className
      )}
    >
      {/* 126x126px Conic Donut Gauge */}
      <div
        className="relative w-[126px] h-[126px] rounded-full grid place-items-center flex-shrink-0"
        style={{
          background: `conic-gradient(#F5C542 0% ${percentage}%, rgba(15, 16, 32, 0.08) ${percentage}% 100%)`,
        }}
      >
        {/* 90px Inner Cutout */}
        <div className="absolute w-[90px] h-[90px] rounded-full bg-white dark:bg-[#121620] grid place-items-center shadow-inner">
          <div className="text-center">
            <span className="block text-[21px] font-extrabold tracking-tight text-[#0F1020] dark:text-white leading-none font-sans">
              {title}
            </span>
            <span className="block text-[8px] font-bold text-[#7B7B9D] dark:text-slate-400 uppercase tracking-widest mt-0.5">
              {subtitle}
            </span>
          </div>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 w-full grid gap-2.5">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-[7px] h-[7px] rounded-full flex-shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <div>
                <div className="text-[10px] font-bold text-[#0F1020] dark:text-white leading-none">
                  {seg.label}
                </div>
                {seg.sublabel && (
                  <div className="text-[8px] text-[#7B7B9D] dark:text-slate-400 mt-0.5">
                    {seg.sublabel}
                  </div>
                )}
              </div>
            </div>
            <span className="text-[11px] font-mono font-extrabold text-[#0F1020] dark:text-white">
              {seg.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
