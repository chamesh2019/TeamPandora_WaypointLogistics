import { describe, it, expect, beforeEach, vi } from "vitest";
import { OfflineStore } from "@/lib/offline/offline-store";
import type { OfflineEventDto, DriverStopDto, DriverActiveTripDto } from "@/lib/types/driver-api";

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
});

describe("OfflineStore", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("enqueues and retrieves offline events in order", () => {
    const event1: OfflineEventDto = {
      eventId: "EVT-1",
      tripId: "TRP-100",
      eventType: "ARRIVE_STOP",
      clientTimestamp: "2026-10-04T07:00:00.000Z",
      payload: { stopId: "STP-001" },
    };

    const event2: OfflineEventDto = {
      eventId: "EVT-2",
      tripId: "TRP-100",
      eventType: "SUBMIT_POD",
      clientTimestamp: "2026-10-04T07:10:00.000Z",
      payload: { stopId: "STP-001", recipientName: "Sunil" },
    };

    OfflineStore.enqueueEvent(event1);
    OfflineStore.enqueueEvent(event2);

    const queue = OfflineStore.getQueue();
    expect(queue).toHaveLength(2);
    expect(queue[0].eventId).toBe("EVT-1");
    expect(queue[1].eventId).toBe("EVT-2");
  });

  it("removes specified event IDs from the queue", () => {
    OfflineStore.enqueueEvent({
      eventId: "EVT-1",
      tripId: "TRP-100",
      eventType: "ARRIVE_STOP",
      clientTimestamp: new Date().toISOString(),
      payload: {},
    });
    OfflineStore.enqueueEvent({
      eventId: "EVT-2",
      tripId: "TRP-100",
      eventType: "SUBMIT_POD",
      clientTimestamp: new Date().toISOString(),
      payload: {},
    });

    OfflineStore.removeEvents(["EVT-1"]);

    const queue = OfflineStore.getQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].eventId).toBe("EVT-2");
  });

  it("caches and retrieves operational data across reloads", () => {
    const mockTrip: DriverActiveTripDto = {
      driverId: "usr-driv-001",
      driverName: "Nimal Fernando",
      hasActiveTrip: true,
      trip: {
        tripId: "TRP-20261001-01",
        tripNumber: 1,
        depotId: "PELIYAGODA",
        depotName: "Peliyagoda Distribution Center",
        vehicleId: "VEH003",
        vehicleType: "truck",
        vehicleTemp: "reefer",
        brandId: "FRESH",
        districtId: "Colombo",
        totalOrdersCount: 2,
        totalWeightKg: 1000,
        totalVolumeM3: 5,
        plannedDepartureTime: "04:00:00",
        plannedReturnTime: "08:00:00",
        actualDepartureTime: null,
        odometerStartKm: null,
        status: "LOADING",
        stopsTotal: 2,
        stopsCompleted: 0,
        stopsRemaining: 2,
      },
    };

    OfflineStore.cacheData(OfflineStore.KEYS.ACTIVE_TRIP, mockTrip);
    const cached = OfflineStore.getCachedData<DriverActiveTripDto>(OfflineStore.KEYS.ACTIVE_TRIP);
    expect(cached).toEqual(mockTrip);
  });

  it("optimistically marks a stop as arrived in cached data and enqueues event", () => {
    const mockStops: DriverStopDto[] = [
      {
        stopId: "STP-001",
        stopSequence: 1,
        orderId: "ORD-001",
        outletId: "OUT001",
        outletName: "Pettah Fresh",
        address: "Colombo",
        brandId: "FRESH",
        districtId: "Colombo",
        dockType: "street",
        parkingConstraint: "normal",
        windowOpenTime: "04:00:00",
        windowCloseTime: "08:00:00",
        contactName: "Manager",
        contactPhone: "0771234567",
        plannedArrivalTime: "04:30:00",
        actualArrivalTime: null,
        actualDepartTime: null,
        actualServiceMin: null,
        isLate: false,
        status: "PENDING",
        cartons: 10,
        weightKg: 180,
        volumeM3: 1,
        tempClass: "ambient",
      },
    ];

    OfflineStore.cacheData(OfflineStore.KEYS.STOPS, mockStops);
    OfflineStore.recordOfflineArrival("TRP-100", "STP-001");

    // Check event enqueued
    const queue = OfflineStore.getQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].eventType).toBe("ARRIVE_STOP");
    expect(queue[0].payload.stopId).toBe("STP-001");

    // Check cached stops updated
    const updatedStops = OfflineStore.getCachedData<DriverStopDto[]>(OfflineStore.KEYS.STOPS);
    expect(updatedStops?.[0].status).toBe("ARRIVED");
    expect(updatedStops?.[0].actualArrivalTime).toBeDefined();
  });

  it("optimistically marks a stop as delivered and stores in POD cache", () => {
    const mockStops: DriverStopDto[] = [
      {
        stopId: "STP-001",
        stopSequence: 1,
        orderId: "ORD-001",
        outletId: "OUT001",
        outletName: "Pettah Fresh",
        address: "Colombo",
        brandId: "FRESH",
        districtId: "Colombo",
        dockType: "street",
        parkingConstraint: "normal",
        windowOpenTime: "04:00:00",
        windowCloseTime: "08:00:00",
        contactName: "Manager",
        contactPhone: "0771234567",
        plannedArrivalTime: "04:30:00",
        isLate: false,
        status: "ARRIVED",
        cartons: 10,
        weightKg: 180,
        volumeM3: 1,
        tempClass: "ambient",
      },
    ];

    OfflineStore.cacheData(OfflineStore.KEYS.STOPS, mockStops);

    OfflineStore.recordOfflinePod({
      tripId: "TRP-100",
      stopId: "STP-001",
      recipientName: "Kamal Perera",
      signatureUrl: "data:image/svg+xml;base64,PHN2Zz5zaWc8L3N2Zz4=",
      notes: "Received cleanly",
    });

    const queue = OfflineStore.getQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].eventType).toBe("SUBMIT_POD");

    // Check cached stops updated
    const updatedStops = OfflineStore.getCachedData<DriverStopDto[]>(OfflineStore.KEYS.STOPS);
    expect(updatedStops?.[0].status).toBe("DELIVERED");

    // Check POD cache updated
    const podCache = OfflineStore.getCachedData<DriverStopDto[]>(OfflineStore.KEYS.POD_CACHE);
    expect(podCache).toHaveLength(1);
    expect(podCache?.[0].recipientName).toBe("Kamal Perera");
    expect(podCache?.[0].status).toBe("DELIVERED");
  });
});
