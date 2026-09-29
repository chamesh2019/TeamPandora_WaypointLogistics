export type Role = "Dispatcher" | "Store Manager" | "Loader" | "Driver";

export type RetailBrand = "Waypoint Fresh" | "Waypoint Style" | "Waypoint Tech";

export type DepotName = "Peliyagoda Distribution Center" | "Kandy Regional Hub";

export type TemperatureRequirement = "ambient" | "chilled" | "frozen";

export type OrderLifecycleState =
  | "Draft"
  | "Submitted"
  | "Confirmed"
  | "Planned"
  | "Loading"
  | "Loaded"
  | "InTransit"
  | "Arrived"
  | "Delivered"
  | "Received"
  | "Deferred"
  | "Disputed"
  | "Failed";

export type TripStatus = "Draft" | "Planned" | "Loading" | "Dispatched" | "Completed" | "Delayed";

export type DockType = "rear_dock" | "street" | "mall_bay";

export interface UserAccount {
  username: string;
  name: string;
  role: Role;
  initials: string;
  location: string;
  firstLogin?: boolean;
}

export interface MetricStat {
  label: string;
  value: string | number;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  note?: string;
  tone?: "green" | "blue" | "purple" | "orange" | "indigo" | "red" | "yellow";
  bars?: number[];
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  storeName: string;
  brand: RetailBrand;
  temp: TemperatureRequirement;
  cartons: number;
  weightKg: number;
  volumeM3: number;
  deliveryDate: string;
  status: OrderLifecycleState;
  isAfterCutoff?: boolean;
  priorityBoost?: boolean;
  assignedTripId?: string | null;
}

export interface VehicleAsset {
  id: string;
  plateNumber: string;
  model: string;
  homeDepot: DepotName;
  type: "truck" | "van";
  isReefer: boolean;
  maxWeightKg: number;
  maxVolumeM3: number;
  currentWeightKg: number;
  currentVolumeM3: number;
  weeklyFuelQuotaLiters: number;
  fuelConsumedLiters: number;
  status: "available" | "in_transit" | "maintenance" | "loading";
  driverName?: string;
}

export interface TripRouteLeg {
  stopNumber: number;
  storeName: string;
  brand: RetailBrand;
  address: string;
  dockType: DockType;
  deliveryWindow: string;
  eta: string;
  status: "pending" | "current" | "completed" | "delayed";
  orders: OrderItem[];
  proofOfDelivery?: {
    receivedBy: string;
    timestamp: string;
    signatureUrl?: string;
    discrepancyNotes?: string;
  };
}

export interface TripPlan {
  id: string;
  tripNumber: string;
  brand: RetailBrand;
  depot: DepotName;
  district: string;
  vehicleId: string;
  vehiclePlate: string;
  driverName: string;
  status: TripStatus;
  scheduledDeparture: string;
  legs: TripRouteLeg[];
  utilizationWeightPercent: number;
  utilizationVolumePercent: number;
}

export interface DockManifestItem {
  id: string;
  orderNumber: string;
  sku: string;
  description: string;
  cartonCount: number;
  stopSequence: number; // reverse sequence
  storeName: string;
  temp: TemperatureRequirement;
  checked: boolean;
  hasException?: boolean;
  exceptionNotes?: string;
}

export interface DisputeClaim {
  id: string;
  orderNumber: string;
  storeName: string;
  defectCategory: "damaged" | "short_delivery" | "wrong_product" | "temperature_breach";
  affectedUnits: number;
  status: "Open" | "Under Review" | "Credited" | "Rejected";
  photoEvidenceUrl?: string;
  createdAt: string;
  notes?: string;
}
