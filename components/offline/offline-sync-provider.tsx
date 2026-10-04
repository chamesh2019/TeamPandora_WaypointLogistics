"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { OfflineStore } from "@/lib/offline/offline-store";
import { performOfflineSync, type SyncResult } from "@/lib/offline/use-offline-sync";

export interface OfflineSyncContextValue {
  isOnline: boolean;
  pendingCount: number;
  syncStatus: "idle" | "syncing" | "offline" | "error";
  lastSyncTime: string | null;
  syncNow: () => Promise<SyncResult>;
}

const OfflineSyncContext = createContext<OfflineSyncContextValue>({
  isOnline: true,
  pendingCount: 0,
  syncStatus: "idle",
  lastSyncTime: null,
  syncNow: async () => ({ status: "idle", syncedCount: 0, rejectedCount: 0 }),
});

export function useOfflineSync(): OfflineSyncContextValue {
  return useContext(OfflineSyncContext);
}

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "offline" | "error">("idle");
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const isSyncingRef = useRef(false);

  // Updates pending count from storage
  const refreshPendingCount = useCallback(() => {
    const queue = OfflineStore.getQueue();
    setPendingCount(queue.length);
  }, []);

  // Triggers synchronization
  const syncNow = useCallback(async (): Promise<SyncResult> => {
    if (isSyncingRef.current) {
      return { status: "syncing", syncedCount: 0, rejectedCount: 0 } as SyncResult;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOnline(false);
      setSyncStatus("offline");
      refreshPendingCount();
      return { status: "offline", syncedCount: 0, rejectedCount: 0 };
    }

    isSyncingRef.current = true;
    setSyncStatus("syncing");

    try {
      const result = await performOfflineSync();
      refreshPendingCount();

      if (result.status === "success") {
        setSyncStatus("idle");
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } else if (result.status === "offline") {
        setIsOnline(false);
        setSyncStatus("offline");
      } else if (result.status === "error") {
        setSyncStatus("error");
      } else {
        setSyncStatus("idle");
      }
      return result;
    } catch {
      setSyncStatus("error");
      return { status: "error", syncedCount: 0, rejectedCount: 0 };
    } finally {
      isSyncingRef.current = false;
    }
  }, [refreshPendingCount]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);
    refreshPendingCount();

    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus("idle");
      // Immediate sync when back online
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus("offline");
    };

    const handleQueueChanged = (e: Event) => {
      const custom = e as CustomEvent<{ count: number }>;
      if (typeof custom.detail?.count === "number") {
        setPendingCount(custom.detail.count);
      } else {
        refreshPendingCount();
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("waypoint:offline-queue-changed", handleQueueChanged);

    // Automated 10-second sync loop
    const syncInterval = window.setInterval(() => {
      if (navigator.onLine) {
        const queue = OfflineStore.getQueue();
        if (queue.length > 0) {
          syncNow();
        }
      }
    }, 10000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("waypoint:offline-queue-changed", handleQueueChanged);
      window.clearInterval(syncInterval);
    };
  }, [refreshPendingCount, syncNow]);

  return (
    <OfflineSyncContext.Provider
      value={{
        isOnline,
        pendingCount,
        syncStatus,
        lastSyncTime,
        syncNow,
      }}
    >
      {children}
    </OfflineSyncContext.Provider>
  );
}
