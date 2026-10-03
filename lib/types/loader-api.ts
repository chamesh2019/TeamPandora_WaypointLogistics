/**
 * Loader Role API DTOs and Data Models
 */

export interface LoaderAuthContext {
  userId: string;
  username: string;
  role: string;
  depotId: string;
}

export interface DockAssignmentItem {
  bay: string;
  vehicle: string;
  dest: string;
  status: "Loading" | "Staging" | "Complete" | string;
  progress: number;
  tripId?: string;
}

export interface LoaderAlertItem {
  title: string;
  copy: string;
  meta: string;
  type?: "temperature" | "pallet" | "general" | string;
}

export interface LoaderOverviewDto {
  depotId: string;
  activeBaysCount: number;
  loadingBaysCount: number;
  cartonsStaged: number;
  cartonsVerifiedPct: number;
  departureEtaMin: number;
  shortfallRatePct: number;
  activeAssignments: DockAssignmentItem[];
  recentAlerts: LoaderAlertItem[];
}

export interface LoaderTripSummary {
  tripId: string;
  vehicleId: string;
  vehicleType: string;
  vehicleTemp?: string;
  route: string;
  driver: string;
  stops: number;
  cartons: number;
  departure: string;
  status: "Loading" | "Staging" | "Pending" | "Complete" | string;
  progress: number;
  bay: string;
  brandId?: string;
  districtId?: string;
  totalWeightKg?: number;
  totalVolumeM3?: number;
}

export interface LoaderManifestStop {
  stopId: string;
  stopSequence: number;
  loadSequence: number; // 1 = first to load (Stop N in delivery), N = last to load (Stop 1 in delivery)
  outletId: string;
  outletName: string;
  cartonsCount: number;
  weightKg: number;
  tempRequirement: "CHILLED" | "AMBIENT" | string;
  dockType?: string;
  locationHint?: string;
  isVerified: boolean;
  hasShortfall: boolean;
}

export interface LoaderManifestDto {
  tripId: string;
  manifestId: string;
  vehicleId: string;
  vehicleType?: string;
  driverName: string;
  bayNumber: string;
  departureTime?: string;
  status: "QUEUED" | "LOADING" | "VERIFIED" | "FLAGGED" | "COMPLETED" | string;
  stops: LoaderManifestStop[];
  temperatureBreakdown: {
    chilledCartons: number;
    ambientCartons: number;
  };
}

export type LoadExceptionType =
  | "MISSING_STOCK"
  | "DAMAGED_CARTON"
  | "TEMPERATURE_NONCOMPLIANT"
  | "OVERWEIGHT_PALLET";

export interface LoaderExceptionDto {
  exceptionId: string;
  tripId: string;
  vehicleId?: string;
  orderId: string;
  storeName?: string;
  itemName?: string;
  skuCode?: string;
  exceptionType: LoadExceptionType | string;
  quantityShort: number;
  status: "PENDING" | "RESOLVED" | "SUBSTITUTED" | string;
  createdAt: string;
}

export interface ReportExceptionInput {
  tripId: string;
  orderId: string;
  itemId?: string;
  exceptionType: LoadExceptionType | string;
  quantityShort: number;
  notes?: string;
}

export interface VerifyManifestInput {
  tripId: string;
  stopIds?: string[];
}
