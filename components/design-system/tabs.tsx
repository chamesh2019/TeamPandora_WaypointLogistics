import React from "react";
import { cn } from "../../lib/utils";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export function LightTabs({
  tabs,
  activeTab,
  onSelect,
  className,
}: {
  tabs: TabItem[];
  activeTab: string;
  onSelect: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex p-[3px] rounded-lg bg-[#F5F6FB] dark:bg-[#1C1C38] border border-black/[0.07] dark:border-white/[0.08]",
        className
      )}
    >
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={cn(
              "min-h-[27px] px-2.5 rounded-[6px] text-[10px] font-semibold transition-all duration-150 border-none cursor-pointer flex items-center gap-1.5",
              isSelected
                ? "bg-white dark:bg-[#121620] text-[#0F1020] dark:text-white shadow-[0_1px_4px_rgba(15,16,32,0.1)]"
                : "bg-transparent text-[#7B7B9D] dark:text-slate-400 hover:text-[#0F1020] dark:hover:text-white"
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[8px] font-bold",
                  isSelected
                    ? "bg-black/[0.06] dark:bg-white/10 text-current"
                    : "bg-black/[0.04] text-slate-400"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function DarkTabs({
  tabs,
  activeTab,
  onSelect,
  className,
}: {
  tabs: TabItem[];
  activeTab: string;
  onSelect: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-[2px] p-[3px] bg-white/[0.06] rounded-full border border-white/5",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={cn(
              "px-3.5 py-1 rounded-full text-[11px] font-semibold transition-colors duration-150 border-none cursor-pointer flex items-center gap-1.5 whitespace-nowrap",
              isActive
                ? "bg-[#F5C542] text-[#0F1928] font-bold shadow-sm"
                : "bg-transparent text-[rgba(148,148,190,0.75)] hover:text-white"
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="text-[9px] font-extrabold opacity-80">({tab.count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function FilterTabs({
  tabs,
  activeTab,
  onSelect,
  className,
}: {
  tabs: TabItem[];
  activeTab: string;
  onSelect: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex flex-wrap gap-[3px]", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={cn(
              "min-h-[27px] px-2.5 rounded-[7px] text-[10px] font-semibold transition-colors duration-150 border-none cursor-pointer",
              isActive
                ? "text-[#6366F1] bg-[rgba(99,102,241,0.12)] font-bold"
                : "text-[#7B7B9D] bg-transparent hover:text-[#0F1020] hover:bg-[#F5F6FB]"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
