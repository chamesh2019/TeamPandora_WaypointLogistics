import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { OfflineStore } from "@/lib/offline/offline-store";
import { performOfflineSync } from "@/lib/offline/use-offline-sync";

const storage: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => storage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    storage[key] = String(value);
  }),
  removeItem: vi.fn((key: string) => {
    delete storage[key];
  }),
  clear: vi.fn(() => {
    for (const key of Object.keys(storage)) {
      delete storage[key];
    }
  }),
};

vi.stubGlobal("localStorage", localStorageMock);
vi.stubGlobal("window", {
  localStorage: localStorageMock,
  dispatchEvent: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
});

describe("performOfflineSync", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.stubGlobal("navigator", { onLine: true });
    vi.clearAllMocks();
  });

  it("skips sync when the device is offline", async () => {
    vi.stubGlobal("navigator", { onLine: false });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await performOfflineSync();
    expect(result.status).toBe("offline");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("skips sync when the queue is empty", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await performOfflineSync();
    expect(result.status).toBe("idle");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts queued events to /api/driver/sync and removes synced events", async () => {
    OfflineStore.enqueueEvent({
      eventId: "EVT-SYNC-1",
      tripId: "TRP-100",
      eventType: "ARRIVE_STOP",
      clientTimestamp: new Date().toISOString(),
      payload: { stopId: "STP-001" },
    });

    const mockResponse = {
      ok: true,
      json: async () => ({
        success: true,
        data: {
          syncedCount: 1,
          rejectedCount: 0,
          reconciliationStatus: "RECONCILED",
          results: [{ eventId: "EVT-SYNC-1", status: "APPLIED" }],
        },
      }),
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    const result = await performOfflineSync();
    expect(result.status).toBe("success");
    expect(result.syncedCount).toBe(1);

    // Verify queue is now empty
    const remainingQueue = OfflineStore.getQueue();
    expect(remainingQueue).toHaveLength(0);
  });

  it("handles fetch failure gracefully and keeps events in queue", async () => {
    OfflineStore.enqueueEvent({
      eventId: "EVT-FAIL-1",
      tripId: "TRP-100",
      eventType: "ARRIVE_STOP",
      clientTimestamp: new Date().toISOString(),
      payload: { stopId: "STP-001" },
    });

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network dropout")));

    const result = await performOfflineSync();
    expect(result.status).toBe("error");

    // Queue must retain the event for the next 10s retry
    const remainingQueue = OfflineStore.getQueue();
    expect(remainingQueue).toHaveLength(1);
    expect(remainingQueue[0].eventId).toBe("EVT-FAIL-1");
  });
});
