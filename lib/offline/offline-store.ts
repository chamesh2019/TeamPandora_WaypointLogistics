import type {
  OfflineEventDto,
  DriverStopDto,
  DriverActiveTripDto,
  DriverCurrentStopDto,
} from "@/lib/types/driver-api";

const STORAGE_KEYS = {
  QUEUE: "waypoint_offline_event_queue",
  ACTIVE_TRIP: "waypoint_driver_active_trip",
  STOPS: "waypoint_driver_stops",
  CURRENT_STOP: "waypoint_driver_current_stop",
  POD_CACHE: "waypoint_driver_pod_cache",
  LOADER_MANIFESTS: "waypoint_loader_manifests",
} as const;

function isClient(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export class OfflineStore {
  static readonly KEYS = STORAGE_KEYS;

  /**
   * Enqueues an offline action into durable storage.
   */
  static enqueueEvent(event: OfflineEventDto): void {
    if (!isClient()) return;
    try {
      const queue = this.getQueue();
      // Prevent duplicate event IDs
      const filtered = queue.filter((e) => e.eventId !== event.eventId);
      filtered.push(event);
      localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent("waypoint:offline-queue-changed", { detail: { count: filtered.length } }));
    } catch (err) {
      console.error("[OfflineStore] Failed to enqueue event:", err);
    }
  }

  /**
   * Retrieves all pending events waiting to be synchronized.
   */
  static getQueue(): OfflineEventDto[] {
    if (!isClient()) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.QUEUE);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Removes successfully synced events from the queue.
   */
  static removeEvents(eventIds: string[]): void {
    if (!isClient() || !eventIds || eventIds.length === 0) return;
    try {
      const queue = this.getQueue();
      const idSet = new Set(eventIds);
      const remaining = queue.filter((e) => !idSet.has(e.eventId));
      localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(remaining));
      window.dispatchEvent(new CustomEvent("waypoint:offline-queue-changed", { detail: { count: remaining.length } }));
    } catch (err) {
      console.error("[OfflineStore] Failed to remove events:", err);
    }
  }

  /**
   * Clears the entire offline queue.
   */
  static clearQueue(): void {
    if (!isClient()) return;
    localStorage.removeItem(STORAGE_KEYS.QUEUE);
    window.dispatchEvent(new CustomEvent("waypoint:offline-queue-changed", { detail: { count: 0 } }));
  }

  /**
   * Caches an operational data snapshot (active trip, stops, PODs).
   */
  static cacheData<T>(key: string, data: T): void {
    if (!isClient()) return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.error(`[OfflineStore] Failed to cache data for key ${key}:`, err);
    }
  }

  /**
   * Retrieves a cached operational data snapshot.
   */
  static getCachedData<T>(key: string): T | null {
    if (!isClient()) return null;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  /**
   * Clears a specific cached data key.
   */
  static clearData(key: string): void {
    if (!isClient()) return;
    localStorage.removeItem(key);
  }

  /**
   * Optimistically records a stop arrival check-in offline and enqueues event.
   */
  static recordOfflineArrival(tripId: string, stopId: string, clientTimestamp?: string): void {
    const timestamp = clientTimestamp || new Date().toISOString();

    // 1. Enqueue sync event
    this.enqueueEvent({
      eventId: `EVT-ARR-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tripId,
      eventType: "ARRIVE_STOP",
      clientTimestamp: timestamp,
      payload: { stopId },
    });

    // 2. Optimistically update cached stops
    const stops = this.getCachedData<DriverStopDto[]>(STORAGE_KEYS.STOPS);
    if (stops) {
      const updated = stops.map((s) =>
        s.stopId === stopId
          ? {
              ...s,
              status: "ARRIVED",
              actualArrivalTime: timestamp,
            }
          : s
      );
      this.cacheData(STORAGE_KEYS.STOPS, updated);
    }

    // 3. Update current stop cache
    const current = this.getCachedData<DriverCurrentStopDto>(STORAGE_KEYS.CURRENT_STOP);
    if (current?.currentStop?.stopId === stopId) {
      this.cacheData(STORAGE_KEYS.CURRENT_STOP, {
        ...current,
        currentStop: {
          ...current.currentStop,
          status: "ARRIVED",
          actualArrivalTime: timestamp,
        },
      });
    }
  }

  /**
   * Optimistically records a Proof of Delivery offline and enqueues event.
   */
  static recordOfflinePod(input: {
    tripId: string;
    stopId: string;
    recipientName: string;
    recipientTitle?: string;
    signatureUrl: string;
    photoUrls?: string[];
    notes?: string;
    cartons?: number;
    clientTimestamp?: string;
  }): void {
    const timestamp = input.clientTimestamp || new Date().toISOString();
    const podId = `POD-OFFLINE-${Date.now()}`;

    // 1. Enqueue sync event
    this.enqueueEvent({
      eventId: `EVT-POD-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tripId: input.tripId,
      eventType: "SUBMIT_POD",
      clientTimestamp: timestamp,
      payload: {
        stopId: input.stopId,
        recipientName: input.recipientName,
        recipientTitle: input.recipientTitle,
        signatureUrl: input.signatureUrl,
        photoUrls: input.photoUrls || [],
        notes: input.notes,
      },
    });

    // 2. Optimistically update cached stops
    const stops = this.getCachedData<DriverStopDto[]>(STORAGE_KEYS.STOPS);
    let completedStopItem: DriverStopDto | null = null;
    if (stops) {
      const updated = stops.map((s) => {
        if (s.stopId === input.stopId) {
          completedStopItem = {
            ...s,
            status: "DELIVERED",
            actualDepartTime: timestamp,
            deliveredAt: timestamp,
            recipientName: input.recipientName,
            signatureUrl: input.signatureUrl,
            podId,
          };
          return completedStopItem;
        }
        return s;
      });
      this.cacheData(STORAGE_KEYS.STOPS, updated);
    }

    // 3. Append to cached POD archive
    const podCache = this.getCachedData<DriverStopDto[]>(STORAGE_KEYS.POD_CACHE) || [];
    if (completedStopItem) {
      const filtered = podCache.filter((p) => p.stopId !== input.stopId);
      filtered.unshift(completedStopItem);
      this.cacheData(STORAGE_KEYS.POD_CACHE, filtered);
    }

    // 4. Advance cached current stop
    const current = this.getCachedData<DriverCurrentStopDto>(STORAGE_KEYS.CURRENT_STOP);
    if (current && stops) {
      const pendingStops = stops.filter((s) => s.status === "PENDING" && s.stopId !== input.stopId);
      const nextActive = pendingStops[0] || null;
      const followingStop = pendingStops[1] || null;
      const completedCount = (current.completedStopsCount || 0) + 1;
      const remainingCount = Math.max(0, (current.remainingStopsCount || 1) - 1);

      this.cacheData(STORAGE_KEYS.CURRENT_STOP, {
        tripId: input.tripId,
        currentStop: nextActive,
        nextStop: followingStop,
        completedStopsCount: completedCount,
        remainingStopsCount: remainingCount,
      });
    }

    // 5. Update active trip progress counts
    const active = this.getCachedData<DriverActiveTripDto>(STORAGE_KEYS.ACTIVE_TRIP);
    if (active?.trip) {
      const total = active.trip.stopsTotal || 1;
      const done = Math.min(total, (active.trip.stopsCompleted || 0) + 1);
      this.cacheData(STORAGE_KEYS.ACTIVE_TRIP, {
        ...active,
        trip: {
          ...active.trip,
          stopsCompleted: done,
          stopsRemaining: Math.max(0, total - done),
          status: done >= total ? "COMPLETED" : active.trip.status,
        },
      });
    }
  }

  /**
   * Optimistically records an on-site failure exception offline and enqueues event.
   */
  static recordOfflineFailure(input: {
    tripId: string;
    stopId: string;
    reasonCode: string;
    driverNotes: string;
    photoUrls?: string[];
    clientTimestamp?: string;
  }): void {
    const timestamp = input.clientTimestamp || new Date().toISOString();

    // 1. Enqueue sync event
    this.enqueueEvent({
      eventId: `EVT-FAIL-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tripId: input.tripId,
      eventType: "FAIL_STOP",
      clientTimestamp: timestamp,
      payload: {
        stopId: input.stopId,
        reasonCode: input.reasonCode,
        driverNotes: input.driverNotes,
        photoUrls: input.photoUrls || [],
      },
    });

    // 2. Mark stop FAILED in cached stops
    const stops = this.getCachedData<DriverStopDto[]>(STORAGE_KEYS.STOPS);
    if (stops) {
      const updated = stops.map((s) =>
        s.stopId === input.stopId
          ? {
              ...s,
              status: "FAILED",
              actualDepartTime: timestamp,
            }
          : s
      );
      this.cacheData(STORAGE_KEYS.STOPS, updated);
    }

    // 3. Advance current stop
    const current = this.getCachedData<DriverCurrentStopDto>(STORAGE_KEYS.CURRENT_STOP);
    if (current && stops) {
      const pendingStops = stops.filter((s) => s.status === "PENDING" && s.stopId !== input.stopId);
      this.cacheData(STORAGE_KEYS.CURRENT_STOP, {
        ...current,
        currentStop: pendingStops[0] || null,
        nextStop: pendingStops[1] || null,
        completedStopsCount: (current.completedStopsCount || 0) + 1,
        remainingStopsCount: Math.max(0, (current.remainingStopsCount || 1) - 1),
      });
    }
  }

  /**
   * Optimistically records trip departure sign-off offline and enqueues event.
   */
  static recordOfflineDeparture(input: {
    tripId: string;
    odometerStartKm: number;
    clientTimestamp?: string;
  }): void {
    const timestamp = input.clientTimestamp || new Date().toISOString();

    // 1. Enqueue sync event
    this.enqueueEvent({
      eventId: `EVT-DEP-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tripId: input.tripId,
      eventType: "DEPART_DEPOT",
      clientTimestamp: timestamp,
      payload: {
        tripId: input.tripId,
        odometerStartKm: input.odometerStartKm,
      },
    });

    // 2. Update cached active trip
    const active = this.getCachedData<DriverActiveTripDto>(STORAGE_KEYS.ACTIVE_TRIP);
    if (active?.trip) {
      this.cacheData(STORAGE_KEYS.ACTIVE_TRIP, {
        ...active,
        trip: {
          ...active.trip,
          status: "IN_TRANSIT",
          actualDepartureTime: timestamp,
          odometerStartKm: input.odometerStartKm,
          statusNote: "Running on schedule",
        },
      });
    }
  }
}
