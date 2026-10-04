import { requireDriver } from "@/lib/api/guard";
import { DriverService } from "@/lib/services/driver-service";
import { apiSuccess, apiError } from "@/lib/api/response";
import type { StopFailureInput } from "@/lib/types/driver-api";

/**
 * GET /api/driver/exceptions
 * Returns past delivery exceptions and deferrals.
 */
export async function GET(request: Request) {
  const auth = await requireDriver(request);
  if (auth instanceof Response) {
    return auth;
  }

  const { searchParams } = new URL(request.url);
  const tripId = searchParams.get("tripId") || searchParams.get("trip_id") || undefined;

  try {
    const list = await DriverService.getExceptions(auth.driverId, tripId);
    return apiSuccess(list);
  } catch (error) {
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to retrieve exceptions",
      500
    );
  }
}

/**
 * POST /api/driver/exceptions
 * Logs an on-road exception or delivery incident.
 */
export async function POST(request: Request) {
  const auth = await requireDriver(request);
  if (auth instanceof Response) {
    return auth;
  }

  let body: StopFailureInput & { tripId?: string; orderId?: string; outletId?: string };
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", "Invalid JSON request body", 400);
  }

  if (!body.driverNotes || body.driverNotes.trim() === "") {
    return apiError("INVALID_PARAMETERS", "driverNotes description is required", 400);
  }

  try {
    const result = await DriverService.reportException(auth.driverId, body);
    return apiSuccess(result);
  } catch (error) {
    return apiError(
      "REPORT_EXCEPTION_FAILED",
      error instanceof Error ? error.message : "Failed to report exception",
      400
    );
  }
}
