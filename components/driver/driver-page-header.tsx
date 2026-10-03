import React, { type ReactNode } from "react";

export interface DriverPageHeaderProps {
  title: ReactNode;
  subtitle: ReactNode;
  roleBadge?: ReactNode;
  children?: ReactNode;
}

export function DriverPageHeader({
  title,
  subtitle,
  roleBadge,
  children,
}: DriverPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        {roleBadge}
        <h1 className="text-2xl font-bold tracking-tight text-[#0F1020] dark:text-white mt-1">
          {title}
        </h1>
        <p className="text-sm text-[#7B7B9D] dark:text-white/60 mt-1">
          {subtitle}
        </p>
      </div>
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
}
