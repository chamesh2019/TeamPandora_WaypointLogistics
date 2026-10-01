import { requireStoreManager } from "@/lib/api/guard";
import { StoreService } from "@/lib/services/store-service";
import { apiSuccess, apiError } from "@/lib/api/response";
import type { CreateDisputeRequest, DisputeType } from "@/lib/types/store-api";

const VALID_DISPUTE_TYPES: DisputeType[] = [
  "DAMAGED",
  "SHORT_DELIVERY",
  "WRONG_PRODUCT",
  "TEMPERATURE_BREACH",
];

/**
 * GET /api/store/claims
 * Retrieves filed disputes and claims for the authenticated store manager's outlet.
 */
export async function GET(request: Request) {
  const auth = await requireStoreManager(request);
  if (auth instanceof Response) {
    return auth;
  }

  try {
    const claims = await StoreService.getStoreClaims(auth.outletId);
    return apiSuccess(claims);
  } catch (error) {
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to retrieve claims",
      500
    );
  }
}

/**
 * POST /api/store/claims
 * Files a new claim/dispute against an order.
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
  const orderId = payload.orderId;
  const itemId = payload.itemId;
  const disputeType = payload.disputeType;
  const unitsAffected = payload.unitsAffected;
  const storeNotes = payload.storeNotes;
  const evidencePhotoUrls = payload.evidencePhotoUrls;

  if (typeof orderId !== "string" || orderId.trim() === "") {
    return apiError("VALIDATION_ERROR", "orderId is required", 400);
  }

  if (itemId !== undefined && typeof itemId !== "string") {
    return apiError("VALIDATION_ERROR", "itemId must be a string", 400);
  }

  if (
    typeof disputeType !== "string" ||
    !VALID_DISPUTE_TYPES.includes(disputeType as DisputeType)
  ) {
    return apiError("VALIDATION_ERROR", "Valid disputeType is required", 400);
  }

  if (
    typeof unitsAffected !== "number" ||
    isNaN(unitsAffected) ||
    unitsAffected <= 0
  ) {
    return apiError(
      "VALIDATION_ERROR",
      "unitsAffected must be a positive number",
      400
    );
  }

  if (typeof storeNotes !== "string" || storeNotes.trim() === "") {
    return apiError("VALIDATION_ERROR", "storeNotes is required", 400);
  }

  if (
    evidencePhotoUrls !== undefined &&
    (!Array.isArray(evidencePhotoUrls) ||
      !evidencePhotoUrls.every((url) => typeof url === "string"))
  ) {
    return apiError(
      "VALIDATION_ERROR",
      "evidencePhotoUrls must be an array of strings",
      400
    );
  }

  const claimData: CreateDisputeRequest = {
    orderId: orderId.trim(),
    itemId: typeof itemId === "string" ? itemId.trim() : undefined,
    disputeType: disputeType as DisputeType,
    unitsAffected,
    storeNotes: storeNotes.trim(),
    evidencePhotoUrls: Array.isArray(evidencePhotoUrls) ? evidencePhotoUrls : undefined,
  };

  try {
    const dispute = await StoreService.createStoreClaim(
      auth.outletId,
      auth.userId,
      claimData
    );

    return apiSuccess(dispute, 201);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_ORDER_STATE") {
        return apiError(
          "INVALID_ORDER_STATE",
          "Order is not in a valid state for filing a claim",
          400
        );
      }
      if (error.message === "INVALID_UNITS_AFFECTED") {
        return apiError(
          "VALIDATION_ERROR",
          "unitsAffected must be greater than zero",
          400
        );
      }
      if (error.message === "NOT_FOUND") {
        return apiError("NOT_FOUND", "Order not found", 404);
      }
    }

    return apiError(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to create claim",
      500
    );
  }
}
