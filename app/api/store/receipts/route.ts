import { requireStoreManager } from "@/lib/api/guard";
import { StoreService } from "@/lib/services/store-service";
import { apiSuccess, apiError } from "@/lib/api/response";
import type { ConfirmReceiptRequest } from "@/lib/types/store-api";

/**
 * GET /api/store/receipts
 * Retrieves delivered orders pending receipt confirmation for the authenticated store manager's outlet.
 */
export async function GET(request: Request) {
  const auth = await requireStoreManager(request);
  if (auth instanceof Response) {
    return auth;
  }

  try {
    const receipts = await StoreService.getStoreReceipts(auth.outletId);
    return apiSuccess(receipts);
  } catch (error) {
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to retrieve pending receipts",
      500
    );
  }
}

/**
 * POST /api/store/receipts
 * Signs off on a delivered order (ACCEPTED_IN_FULL or REPORT_DISCREPANCY).
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
  const decision = payload.decision;
  const receiverNotes = payload.receiverNotes;

  if (typeof orderId !== "string" || orderId.trim() === "") {
    return apiError("VALIDATION_ERROR", "orderId is required", 400);
  }

  if (decision !== "ACCEPTED_IN_FULL" && decision !== "REPORT_DISCREPANCY") {
    return apiError(
      "VALIDATION_ERROR",
      "decision must be 'ACCEPTED_IN_FULL' or 'REPORT_DISCREPANCY'",
      400
    );
  }

  if (receiverNotes !== undefined && typeof receiverNotes !== "string") {
    return apiError("VALIDATION_ERROR", "receiverNotes must be a string", 400);
  }

  const receiptData: ConfirmReceiptRequest = {
    orderId: orderId.trim(),
    decision,
    receiverNotes: typeof receiverNotes === "string" ? receiverNotes.trim() : undefined,
  };

  try {
    const result = await StoreService.confirmStoreReceipt(
      auth.outletId,
      auth.userId,
      receiptData
    );

    return apiSuccess(result, 200);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_ORDER_STATE") {
        return apiError(
          "INVALID_ORDER_STATE",
          "Order is not in a valid state for receipt confirmation",
          400
        );
      }
      if (error.message === "NOT_FOUND") {
        return apiError("NOT_FOUND", "Order not found", 404);
      }
    }

    return apiError(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to confirm receipt",
      500
    );
  }
}
