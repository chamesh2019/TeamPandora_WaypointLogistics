/**
 * Driver Role API DTOs and Data Models
 */

export interface DriverAuthContext {
  userId: string;
  username: string;
  role: string;
  depotId?: string;
  driverId: string;
}

export interface DriverTripSummary {
  tripId: string;
  tripNumber: number;
  depotId: string;
  depotName: string;
  vehicleId: string;
  vehicleType: string;
  vehicleTemp: string;
  brandId: string;
  districtId: string;
  totalOrdersCount: number;
  totalWeightKg: number;
  totalVolumeM3: number;
  plannedDepartureTime: string;
  plannedReturnTime: string;
  actualDepartureTime?: string | null;
  odometerStartKm?: number | null;
  status: "PLANNED" | "LOADING" | "IN_TRANSIT" | "COMPLETED" | "CANCELLED" | string;
  stopsTotal: number;
  stopsCompleted: number;
  stopsRemaining: number;
  statusNote?: string;
}

export interface DriverActiveTripDto {
  driverId: string;
  driverName: string;
  hasActiveTrip: boolean;
  trip: DriverTripSummary | null;
}

export interface DriverStopDto {
  tripId?: string;
  stopId: string;
  stopSequence: number;
  orderId: string;
  outletId: string;
  outletName: string;
  address: string;
  brandId: string;
  districtId: string;
  dockType: string;
  parkingConstraint: string;
  windowOpenTime: string;
  windowCloseTime: string;
  contactName: string;
  contactPhone: string;
  plannedArrivalTime: string;
  actualArrivalTime?: string | null;
  actualDepartTime?: string | null;
  actualServiceMin?: number | null;
  isLate: boolean;
  status: "PENDING" | "ARRIVED" | "DELIVERED" | "PARTIAL" | "FAILED" | "SKIPPED" | string;
  cartons: number;
  cartonsType?: string;
  weightKg: number;
  volumeM3: number;
  tempClass: "chilled" | "ambient" | string;
  podId?: string | null;
  deliveredAt?: string | null;
  recipientName?: string | null;
  signatureUrl?: string | null;
}

export interface DriverCurrentStopDto {
  tripId: string;
  currentStop: DriverStopDto | null;
  nextStop: DriverStopDto | null;
  remainingStopsCount: number;
  completedStopsCount: number;
}

export interface TripDepartureInput {
  tripId: string;
  odometerStartKm: number;
  clientTimestamp?: string;
}

export interface StopArrivalInput {
  latitude?: number;
  longitude?: number;
  clientTimestamp?: string;
}

export interface SubmitPodInput {
  recipientName: string;
  recipientTitle?: string;
  signatureUrl: string;
  photoUrls?: string[];
  latitude?: number;
  longitude?: number;
  notes?: string;
  clientTimestamp?: string;
}

export interface StopFailureInput {
  reasonCode: string;
  driverNotes: string;
  photoUrls?: string[];
  clientTimestamp?: string;
}

export interface DriverExceptionItemDto {
  exceptionId: string;
  tripId?: string;
  stopId?: string;
  outletId?: string;
  storeName?: string;
  reasonCode: string;
  reasonNotes: string;
  status: "Open" | "Resolved";
  createdAt: string;
}

export interface OfflineEventDto {
  eventId: string;
  tripId: string;
  eventType: "DEPART_DEPOT" | "ARRIVE_STOP" | "SUBMIT_POD" | "FAIL_STOP" | string;
  clientTimestamp: string;
  payload: Record<string, unknown>;
}

export interface OfflineSyncResponseDto {
  syncedCount: number;
  rejectedCount: number;
  reconciliationStatus: "RECONCILED" | "PARTIAL" | "FAILED";
  results?: Array<{ eventId: string; status: "APPLIED" | "CONFLICT_RESOLVED" | "REJECTED"; message?: string }>;
}
