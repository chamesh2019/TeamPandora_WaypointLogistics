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
