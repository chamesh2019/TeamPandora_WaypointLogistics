/**
 * Store Manager REST API Types and Data Transfer Objects (DTOs)
 * Waypoint Group Retail Distribution Platform
 */

export type OrderLifecycleStatus =
  | "SUBMITTED"
  | "CONFIRMED"
  | "PLANNED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "RECEIVED"
  | "DEFERRED"
  | "DISPUTED"
  | "FAILED";

export interface StoreAuthContext {
  userId: string;
  username: string;
  role: string;
  outletId: string;
  brandId: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    timestamp: string;
    notice?: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface StoreOrderSummaryDto {
  orderId: string;
  outletId: string;
  brandId: string;
  orderDate: string;
  createdAt: string;
  isAfterCutoff: boolean;
  tempRequirement: "ambient" | "chilled";
  orderUnits: number;
  orderWeightKg: number;
  orderVolumeM3: number;
  lifecycleStatus: OrderLifecycleStatus;
  consecutiveSkips: number;
  dispatchDate: string | null;
}

export interface StoreOverviewDto {
  kpis: {
    activeOrdersCount: number;
    nextArrival: {
      orderId: string;
      vehicleId: string;
      vehicleType: "truck" | "van";
      driverName: string;
      driverPhone: string;
      eta: string;
      isLate: boolean;
      status: string;
    } | null;
    pendingReceiptsCount: number;
    activeDisputesCount: number;
  };
  alerts: Array<{
    id: string;
    type: "info" | "warning" | "alert";
    message: string;
    link?: string;
    createdAt: string;
  }>;
  recentOrders: StoreOrderSummaryDto[];
}

export interface StoreOrderItemDto {
  skuCode: string;
  productName: string;
  quantity: number;
  unitWeightKg: number;
  unitVolumeM3: number;
  isChilled?: boolean;
}

export interface CreateOrderRequest {
  deliveryDate: string;
  tempRequirement: "ambient" | "chilled";
  orderUnits: number;
  orderWeightKg: number;
  orderVolumeM3: number;
  notes?: string;
  items?: StoreOrderItemDto[];
}

export interface CreatedOrderDto {
  orderId: string;
  outletId: string;
  deliveryDate: string;
  dispatchDate: string;
  tempRequirement: "ambient" | "chilled";
  orderUnits: number;
  orderWeightKg: number;
  orderVolumeM3: number;
  lifecycleStatus: OrderLifecycleStatus;
  isAfterCutoff: boolean;
  notice?: string;
}

export interface StoreOrderDetailDto extends StoreOrderSummaryDto {
  notes?: string;
  items: Array<{
    itemId: string;
    skuCode: string;
    productName: string;
    quantityOrdered: number;
    quantityLoaded: number | null;
    quantityDelivered: number | null;
    quantityReceived: number | null;
    unitWeightKg: number;
    unitVolumeM3: number;
    isChilled: boolean;
  }>;
  tripInfo?: {
    tripId: string;
    tripNumber: number;
    vehicleId: string;
    driverName: string;
    driverPhone: string;
    plannedArrivalTime: string;
    lifecycleStatus: string;
  } | null;
}

export interface StoreOrderFilters {
  status?: OrderLifecycleStatus;
  temp?: "ambient" | "chilled";
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface IncomingDeliveryDto {
  orderId: string;
  orderDate: string;
  lifecycleStatus: OrderLifecycleStatus;
  tripId: string;
  tripNumber: number;
  tripStatus: string;
  vehicleId: string;
  vehicleType: "truck" | "van";
  vehicleTemp: "reefer" | "ambient";
  driverName: string;
  driverPhone: string;
  plannedArrivalTime: string;
  actualArrivalTime: string | null;
  isLate: boolean;
  lateAlert: boolean;
}

export interface PendingReceiptDto {
  orderId: string;
  outletId: string;
  orderDate: string;
  podId: string;
  deliveredAt: string;
  recipientName: string;
  signatureUrl: string;
  photoUrls: string[];
  driverNotes: string | null;
  driverName: string;
}

export interface ConfirmReceiptRequest {
  orderId: string;
  decision: "ACCEPTED_IN_FULL" | "REPORT_DISCREPANCY";
  receiverNotes?: string;
}

export type DisputeType =
  | "DAMAGED"
  | "SHORT_DELIVERY"
  | "WRONG_PRODUCT"
  | "TEMPERATURE_BREACH";

export type DisputeResolutionStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "CREDITED"
  | "REJECTED";

export interface StoreDisputeDto {
  disputeId: string;
  orderId: string;
  itemId: string | null;
  disputeType: DisputeType;
  unitsAffected: number;
  storeNotes: string;
  evidencePhotoUrls: string[];
  resolutionStatus: DisputeResolutionStatus;
  resolutionNotes: string | null;
  resolvedAt: string | null;
  createdAt: string;
  reportedByName: string;
}

export interface CreateDisputeRequest {
  orderId: string;
  itemId?: string;
  disputeType: DisputeType;
  unitsAffected: number;
  storeNotes: string;
  evidencePhotoUrls?: string[];
}

export interface StoreDeferralDto {
  deferralId: string;
  orderId: string;
  outletId: string;
  orderDate: string;
  tempRequirement: "ambient" | "chilled";
  orderUnits: number;
  orderWeightKg: number;
  orderVolumeM3: number;
  reasonCode: string;
  reasonNotes: string | null;
  priorityBoost: number;
  recordedAt: string;
  consecutiveSkips: number;
}

export interface StoreReportsDto {
  fulfillmentRate: number;
  onTimeRate: number;
  totalCartonsDelivered: number;
  totalVolumeDeliveredM3: number;
  disputeRate: number;
  consecutiveSkips: number;
  weeklyTrends: Array<{
    weekLabel: string;
    ordersPlaced: number;
    ordersServed: number;
    ordersDeferred: number;
    volumeM3: number;
  }>;
}
