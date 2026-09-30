import React from "react";
import { cn } from "../../lib/utils";
import type { RetailBrand } from "../../lib/types";

interface BrandTagProps {
  brand: RetailBrand | string;
  className?: string;
}

export function BrandTag({ brand, className }: BrandTagProps) {
  let styleClasses = "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200";

  if (brand.includes("Fresh")) {
    styleClasses = "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40";
  } else if (brand.includes("Style")) {
    styleClasses = "bg-pink-50 text-pink-700 border-pink-200/80 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800/40";
  } else if (brand.includes("Tech")) {
    styleClasses = "bg-cyan-50 text-cyan-700 border-cyan-200/80 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/40";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-tight border",
        styleClasses,
        className
      )}
    >
      {brand}
    </span>
  );
}
