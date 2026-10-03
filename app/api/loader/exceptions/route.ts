import { requireLoader } from "@/lib/api/guard";
import { LoaderService } from "@/lib/services/loader-service";
import { apiSuccess, apiError } from "@/lib/api/response";

/**
 * GET /api/loader/exceptions
 * Returns loading exceptions and shortfalls for the loader's depot.
 */
export async function GET(request: Request) {
  const auth = await requireLoader(request);
  if (auth instanceof Response) {
    return auth;
  }

  try {
    const exceptions = await LoaderService.getExceptions(auth.depotId);
    return apiSuccess(exceptions);
  } catch (error) {
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to retrieve exceptions",
      500
    );
  }
}

/**
 * POST /api/loader/exceptions
 * Logs a loading exception (shortfall, damaged stock, temperature breach).
 */
export async function POST(request: Request) {
  const auth = await requireLoader(request);
  if (auth instanceof Response) {
    return auth;
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Invalid request body JSON", 400);
  }

  const {
    tripId,
    orderId,
    exceptionType,
    quantityShort,
    itemId,
    sku,
    skuCode,
    reason,
    notes,
  } = body || {};

  if (!tripId || (!orderId && !sku && !skuCode) || (!exceptionType && !reason)) {
    return apiError(
      "MISSING_REQUIRED_FIELDS",
      "tripId, orderId (or sku), and exceptionType (or reason) are required",
      400
    );
  }

  const qty = Number(quantityShort);
  if (isNaN(qty) || qty <= 0) {
    return apiError(
      "INVALID_QUANTITY",
      "quantityShort must be a positive number",
      400
    );
  }

  try {
    const exception = await LoaderService.reportException(
      {
        tripId,
        orderId,
        itemId,
        skuCode: skuCode || sku,
        sku: sku || skuCode,
        exceptionType: exceptionType || reason,
        reason,
        quantityShort: qty,
        notes,
      },
      auth.userId
    );

    return apiSuccess(exception, 201);
  } catch (error) {
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to record loading exception",
      500
    );
  }
}
