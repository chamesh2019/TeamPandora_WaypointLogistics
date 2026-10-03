import type { CutoffInfo } from "../utils/cutoff";

export type DispatcherOrderStatus =
  | "All"
  | "Pending"
  | "Confirmed"
  | "Planned"
  | "Dispatched"
  | "Delivered"
  | "Deferred";

export interface DispatcherOrderDto {
  id: string;
  orderId: string;
  outletId: string;
  store: string;
  brand: "Fresh" | "Style" | "Tech";
  district: string;
  items: number;
  weight: string;
  weightKg: number;
  volume: string;
  volumeM3: number;
  trip: string;
  tripId: string | null;
  placed: string;
  createdAt: string;
  deliveryDate: string;
  isAfterCutoff: boolean;
  priorityScore: number;
  status: DispatcherOrderStatus;
  lifecycleStatus: string;
  tempRequirement: "chilled" | "ambient";
}

export interface DispatcherOrdersSummaryDto {
  preCutoffCount: number;
  postCutoffCount: number;
  confirmedCount: number;
  totalOrders: number;
  cutoffInfo: CutoffInfo;
}

export interface DispatcherOrdersResponseData {
  orders: DispatcherOrderDto[];
  summary: DispatcherOrdersSummaryDto;
}

export interface DispatcherOrderFilters {
  status?: string;
  brand?: string;
  district?: string;
  search?: string;
  date?: string;
  page?: number;
  pageSize?: number;
}

export interface DispatcherAuthContext {
  userId: string;
  username: string;
  role: string;
  depotId?: string;
}

export interface AllocationOrderItemDto {
  id: string;
  orderId: string;
  store: string;
  brand: "Fresh" | "Style" | "Tech";
  district: string;
  weightKg: number;
  volumeM3: number;
  temperature: "Chilled" | "Ambient";
  priority: "high" | "medium" | "low";
  priorityScore: number;
  parkingConstraint: string;
  dockType: string;
  lifecycleStatus: string;
}

export interface AllocationVehicleDto {
  id: string;
  name: string;
  type: "truck" | "van";
  temp: "reefer" | "ambient";
  isReefer: boolean;
  maxWeightKg: number;
  maxVolumeM3: number;
  depotId: string;
  status: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
}

export interface AllocationDriverDto {
  id: string;
  name: string;
  username: string;
  phone?: string;
}

export interface AllocationQueueSummaryDto {
  totalUnallocated: number;
  chilledCount: number;
  ambientCount: number;
  totalWeightKg: number;
  totalVolumeM3: number;
}

export interface AllocationQueueResponseData {
  orders: AllocationOrderItemDto[];
  vehicles: AllocationVehicleDto[];
  drivers: AllocationDriverDto[];
  summary: AllocationQueueSummaryDto;
}

export interface CommitAllocationTripPayload {
  planDate?: string;
  depotId?: string;
  vehicleId: string;
  driverId: string;
  tripNumber: 1 | 2;
  orderIds: string[];
}

export interface CommitAllocationTripResult {
  tripId: string;
  planId: string;
  vehicleId: string;
  driverId: string;
  tripNumber: number;
  ordersCount: number;
  totalWeightKg: number;
  totalVolumeM3: number;
}

export interface DispatcherTripOrderDto {
  id: string;
  orderId: string;
  storeName: string;
  outletId: string;
  itemsCount: number;
  volumeM3: number;
  weightKg: number;
  stopSequence: number;
  loadSequence: number;
}

export interface DispatcherTripDto {
  id: string;
  tripId: string;
  planId: string;
  status: "Draft" | "Incomplete" | "Finalized" | "PLANNED" | "LOADING" | "IN_TRANSIT" | "COMPLETED";
  tripNumber: number;
  currentVol: number;
  maxVol: number;
  currentWeightKg: number;
  maxWeightKg: number;
  depot: string;
  brand: "Fresh" | "Style" | "Tech";
  district: string;
  vehicleId: string;
  vehiclePlate: string;
  driverId: string;
  driverName: string;
  orders: DispatcherTripOrderDto[];
}

export * from "./dispatcher-fleet";
export * from "./dispatcher-users";

