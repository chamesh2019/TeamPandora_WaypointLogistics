import { OfflineStore } from "./offline-store";
import type { OfflineEventDto, OfflineSyncResponseDto } from "@/lib/types/driver-api";

export interface SyncResult {
  status: "idle" | "success" | "offline" | "error" | "syncing";
  syncedCount: number;
  rejectedCount: number;
  error?: string;
}

/**
 * Performs a single synchronization cycle against POST /api/driver/sync.
 */
export async function performOfflineSync(): Promise<SyncResult> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { status: "offline", syncedCount: 0, rejectedCount: 0 };
  }

  const queue = OfflineStore.getQueue();
  if (!queue || queue.length === 0) {
    return { status: "idle", syncedCount: 0, rejectedCount: 0 };
  }

  try {
    const res = await fetch("/api/driver/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: queue }),
    });

    if (!res.ok) {
      return { status: "error", syncedCount: 0, rejectedCount: 0, error: `HTTP ${res.status}` };
    }

    const json = (await res.json()) as { success: boolean; data?: OfflineSyncResponseDto; error?: { message: string } };

    if (!json.success || !json.data) {
      return {
        status: "error",
        syncedCount: 0,
        rejectedCount: 0,
        error: json.error?.message || "Sync returned failure",
      };
    }

    const { syncedCount, rejectedCount, results } = json.data;

    // Remove successfully applied or conflict-resolved events from local storage
    if (Array.isArray(results) && results.length > 0) {
      const appliedIds = results
        .filter((r) => r.status === "APPLIED" || r.status === "CONFLICT_RESOLVED")
        .map((r) => r.eventId);
      OfflineStore.removeEvents(appliedIds);
    } else if (syncedCount > 0) {
      const allSentIds = queue.map((e) => e.eventId);
      OfflineStore.removeEvents(allSentIds);
    }

    // Fire client notification so UI components know database state updated
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("waypoint:synced", { detail: json.data }));
    }

    return {
      status: "success",
      syncedCount,
      rejectedCount,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Sync network error";
    return {
      status: "error",
      syncedCount: 0,
      rejectedCount: 0,
      error: msg,
    };
  }
}
