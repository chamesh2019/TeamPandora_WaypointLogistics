"use client";

import React, { useState, useCallback } from "react";
import { cn } from "../../lib/utils";

export interface SyncBadgeProps {
  syncing?: boolean;
  syncedLabel?: string;
  syncingLabel?: string;
  onClick?: () => void;
  className?: string;
}

export function SyncBadge({
  syncing = false,
  syncedLabel = "Saved locally",
  syncingLabel = "Synchronizing\u2026",
  onClick,
  className,
}: SyncBadgeProps) {
  return (
    <span
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
        "text-[9px] font-bold uppercase tracking-[0.07em]",
        "bg-[rgba(16,185,129,.1)] border border-[rgba(16,185,129,.2)] text-[#10B981]",
        onClick && "cursor-pointer select-none hover:bg-[rgba(16,185,129,.15)] transition-colors",
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full bg-[#10B981]",
          syncing ? "animate-ping" : "animate-pulse"
        )}
      />
      <span>{syncing ? syncingLabel : syncedLabel}</span>
    </span>
  );
}

export function SyncBadgeToggle({
  onSync,
  syncedLabel,
  syncingLabel,
  className,
}: {
  onSync?: () => void;
  syncedLabel?: string;
  syncingLabel?: string;
  className?: string;
}) {
  const [syncing, setSyncing] = useState(false);

  const trigger = useCallback(() => {
    if (syncing) return;
    setSyncing(true);
    onSync?.();
    window.setTimeout(() => setSyncing(false), 2200);
  }, [syncing, onSync]);

  return (
    <SyncBadge
      syncing={syncing}
      syncedLabel={syncedLabel}
      syncingLabel={syncingLabel}
      onClick={trigger}
      className={className}
    />
  );
}
