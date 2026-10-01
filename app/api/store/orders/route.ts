import { requireStoreManager } from "@/lib/api/guard";
import { StoreService } from "@/lib/services/store-service";
import { apiSuccess, apiError } from "@/lib/api/response";
import type {
  CreateOrderRequest,
  StoreOrderFilters,
  OrderLifecycleStatus,
} from "@/lib/types/store-api";

const VALID_LIFECYCLE_STATUSES: OrderLifecycleStatus[] = [
  "SUBMITTED",
  "CONFIRMED",
  "PLANNED",
  "IN_TRANSIT",
  "DELIVERED",
  "RECEIVED",
  "DEFERRED",
  "DISPUTED",
  "FAILED",
];

/**
 * GET /api/store/orders
 * Retrieves filtered, paginated order history for the authenticated store manager's outlet.
 */
export async function GET(request: Request) {
  const auth = await requireStoreManager(request);
  if (auth instanceof Response) {
    return auth;
  }

  try {
    const url = new URL(request.url, "http://localhost:3000");
    const searchParams = url.searchParams;

    const statusParam = searchParams.get("status");
    const tempParam = searchParams.get("temp");
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const pageRaw = searchParams.get("page");
    const pageSizeRaw = searchParams.get("pageSize");

    const parsedPage = pageRaw ? parseInt(pageRaw, 10) : 1;
    const parsedPageSize = pageSizeRaw ? parseInt(pageSizeRaw, 10) : 20;

    const page = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    const pageSize =
      isNaN(parsedPageSize) || parsedPageSize < 1
        ? 20
        : Math.min(100, parsedPageSize);

    const status =
      statusParam && VALID_LIFECYCLE_STATUSES.includes(statusParam as OrderLifecycleStatus)
        ? (statusParam as OrderLifecycleStatus)
        : undefined;

    const temp =
      tempParam === "ambient" || tempParam === "chilled" ? tempParam : undefined;

    const filters: StoreOrderFilters = {
      status,
      temp,
      startDate,
      endDate,
      page,
      pageSize,
    };

    const result = await StoreService.getStoreOrders(auth.outletId, filters);

    return apiSuccess(result.orders, 200, {
      page,
      pageSize,
      total: result.total,
    });
  } catch (error) {
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to retrieve orders",
      500
    );
  }
}

/**
 * POST /api/store/orders
 * Creates a new order for the authenticated store manager's outlet.
 */
export async function POST(request: Request) {
  const auth = await requireStoreManager(request);
  if (auth instanceof Response) {
    return auth;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("VALIDATION_ERROR", "Invalid JSON payload", 400);
  }

  if (!body || typeof body !== "object") {
    return apiError("VALIDATION_ERROR", "Request body must be an object", 400);
  }

  const payload = body as Record<string, unknown>;
  const deliveryDate = payload.deliveryDate;
  const tempRequirement = payload.tempRequirement;
  const orderUnits = payload.orderUnits;
  const orderWeightKg = payload.orderWeightKg;
  const orderVolumeM3 = payload.orderVolumeM3;
  const notes = payload.notes;
  const items = payload.items;

  if (
    typeof deliveryDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(deliveryDate.trim())
  ) {
    return apiError(
      "VALIDATION_ERROR",
      "Valid deliveryDate (YYYY-MM-DD) is required",
      400
    );
  }

  if (tempRequirement !== "ambient" && tempRequirement !== "chilled") {
    return apiError(
      "VALIDATION_ERROR",
      "tempRequirement must be 'ambient' or 'chilled'",
      400
    );
  }

  if (
    typeof orderUnits !== "number" ||
    isNaN(orderUnits) ||
    orderUnits <= 0
  ) {
    return apiError(
      "VALIDATION_ERROR",
      "orderUnits must be a positive number",
      400
    );
  }

  if (
    typeof orderWeightKg !== "number" ||
    isNaN(orderWeightKg) ||
    orderWeightKg <= 0
  ) {
    return apiError(
      "VALIDATION_ERROR",
      "orderWeightKg must be a positive number",
      400
    );
  }

  if (
    typeof orderVolumeM3 !== "number" ||
    isNaN(orderVolumeM3) ||
    orderVolumeM3 <= 0
  ) {
    return apiError(
      "VALIDATION_ERROR",
      "orderVolumeM3 must be a positive number",
      400
    );
  }

  if (notes !== undefined && typeof notes !== "string") {
    return apiError("VALIDATION_ERROR", "notes must be a string", 400);
  }

  if (items !== undefined && !Array.isArray(items)) {
    return apiError("VALIDATION_ERROR", "items must be an array", 400);
  }

  const orderData: CreateOrderRequest = {
    deliveryDate: deliveryDate.trim(),
    tempRequirement,
    orderUnits,
    orderWeightKg,
    orderVolumeM3,
    notes: typeof notes === "string" ? notes.trim() : undefined,
    items: Array.isArray(items) ? items : undefined,
  };

  try {
    const createdOrder = await StoreService.createStoreOrder(
      auth.outletId,
      auth.brandId,
      orderData
    );

    return apiSuccess(
      createdOrder,
      201,
      createdOrder.notice ? { notice: createdOrder.notice } : undefined
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "CHILLED_NOT_ALLOWED") {
        return apiError(
          "CHILLED_NOT_ALLOWED",
          "Only Waypoint Fresh outlets are permitted to order chilled goods.",
          400
        );
      }
      if (error.message === "ORDER_ALREADY_EXISTS") {
        return apiError(
          "ORDER_ALREADY_EXISTS",
          "An active order already exists for this delivery date and temperature requirement.",
          409
        );
      }
    }

    return apiError(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to create order",
      500
    );
  }
}
