import React from "react";
import { cn } from "../../lib/utils";

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[14px] bg-white dark:bg-[#121620] border border-black/[0.07] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(15,16,32,0.07),0_0_0_1px_rgba(0,0,0,0.04)] overflow-hidden font-sans",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  subtitle,
  badge,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between min-h-[60px] px-5 py-3.5 border-b border-black/[0.07] dark:border-white/[0.08]",
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <div>
          <div className="text-[13px] font-bold text-[#0F1020] dark:text-white leading-tight">
            {title}
          </div>
          {subtitle && (
            <div className="text-[10px] text-[#7B7B9D] dark:text-slate-400 mt-0.5">
              {subtitle}
            </div>
          )}
        </div>
        {badge}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CountPill({
  count,
  tone = "red",
  className,
}: {
  count: number | string;
  tone?: "red" | "green" | "blue" | "orange";
  className?: string;
}) {
  const toneMap = {
    red: "text-[#EF4444] bg-[rgba(239,68,68,.12)]",
    green: "text-[#10B981] bg-[rgba(16,185,129,.12)]",
    blue: "text-[#4B8EF5] bg-[rgba(75,142,245,.12)]",
    orange: "text-[#F59E0B] bg-[rgba(245,158,11,.12)]",
  }[tone];

  return (
    <span
      className={cn(
        "grid place-items-center min-w-[22px] h-[22px] px-1.5 rounded-[7px] text-[9px] font-bold",
        toneMap,
        className
      )}
    >
      {count}
    </span>
  );
}

export function DarkSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[18px] bg-[#141425] text-white/90 border border-white/[0.08] shadow-[0_4px_32px_rgba(0,0,0,0.3)] overflow-hidden font-sans",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DarkSectionHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-[22px] py-[18px] border-b border-white/[0.08]",
        className
      )}
    >
      <div>
        <div className="text-[14px] font-bold text-white leading-tight">{title}</div>
        {subtitle && (
          <div className="text-[10px] text-[rgba(148,148,190,0.75)] mt-0.5">
            {subtitle}
          </div>
        )}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}

export function DarkRow({
  avatarText,
  title,
  subtitle,
  value,
  badge,
  isSelected,
  onClick,
  className,
}: {
  avatarText?: string;
  title: string;
  subtitle: string;
  value?: string | number;
  badge?: React.ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-5 py-3 border-b border-white/[0.08] transition-colors cursor-pointer",
        isSelected
          ? "bg-[rgba(245,197,66,0.1)] border-l-[3px] border-l-[#F5C542]"
          : "hover:bg-white/[0.04]",
        className
      )}
    >
      {avatarText && (
        <div className="w-[34px] h-[34px] rounded-full grid place-items-center text-[11px] font-bold bg-white/10 text-white flex-shrink-0">
          {avatarText}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold text-white truncate">{title}</div>
        <div className="text-[9px] text-[rgba(148,148,190,0.75)] truncate">{subtitle}</div>
      </div>
      {badge}
      {value && (
        <div className="text-[13px] font-extrabold text-white text-right font-mono">
          {value}
        </div>
      )}
    </div>
  );
}
