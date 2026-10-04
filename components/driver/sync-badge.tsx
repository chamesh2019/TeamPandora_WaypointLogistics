"use client";

import React, { useState, useCallback } from "react";
import { cn } from "../../lib/utils";
import { useOfflineSync } from "../offline/offline-sync-provider";

export interface SyncBadgeProps {
  syncing?: boolean;
  syncedLabel?: string;
  syncingLabel?: string;
  onClick?: () => void;
  className?: string;
}

export function SyncBadge({
  syncing: propSyncing,
  syncedLabel,
  syncingLabel = "Synchronizing\u2026",
  onClick,
  className,
}: SyncBadgeProps) {
  const syncContext = useOfflineSync();
  const isSyncing = propSyncing !== undefined ? propSyncing : syncContext.syncStatus === "syncing";
  const isOnline = syncContext.isOnline;
  const pendingCount = syncContext.pendingCount;

  let label = syncedLabel;
  let tone: "emerald" | "amber" | "blue" = "emerald";

  if (isSyncing) {
    label = syncingLabel;
    tone = "blue";
  } else if (!isOnline) {
    label = pendingCount > 0 ? `Offline (${pendingCount} pending)` : "Offline (Local mode)";
    tone = "amber";
  } else if (pendingCount > 0) {
    label = `${pendingCount} pending sync`;
    tone = "amber";
  } else if (!label) {
    label = "All synced";
    tone = "emerald";
  }

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      syncContext.syncNow();
    }
  };

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      title="Click to trigger sync"
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
        "text-[9px] font-bold uppercase tracking-[0.07em] transition-colors cursor-pointer select-none",
        tone === "emerald" &&
          "bg-[rgba(16,185,129,.1)] border border-[rgba(16,185,129,.2)] text-[#10B981] hover:bg-[rgba(16,185,129,.18)]",
        tone === "amber" &&
          "bg-[rgba(245,158,11,.12)] border border-[rgba(245,158,11,.25)] text-[#F59E0B] hover:bg-[rgba(245,158,11,.2)]",
        tone === "blue" &&
          "bg-[rgba(59,130,246,.12)] border border-[rgba(59,130,246,.25)] text-[#3B82F6] hover:bg-[rgba(59,130,246,.2)]",
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          tone === "emerald" && "bg-[#10B981]",
          tone === "amber" && "bg-[#F59E0B]",
          tone === "blue" && "bg-[#3B82F6]",
          isSyncing ? "animate-ping" : "animate-pulse"
        )}
      />
      <span>{label}</span>
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
