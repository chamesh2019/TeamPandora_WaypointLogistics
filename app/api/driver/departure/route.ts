import { requireDriver } from "@/lib/api/guard";
import { DriverService } from "@/lib/services/driver-service";
import { apiSuccess, apiError } from "@/lib/api/response";
import type { TripDepartureInput } from "@/lib/types/driver-api";

/**
 * POST /api/driver/departure
 * Records vehicle departure from depot gate and starting odometer [FORM-DRV-01].
 */
export async function POST(request: Request) {
  const auth = await requireDriver(request);
  if (auth instanceof Response) {
    return auth;
  }

  let body: TripDepartureInput;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", "Invalid JSON request body", 400);
  }

  if (!body.tripId || typeof body.tripId !== "string") {
    return apiError("INVALID_PARAMETERS", "tripId is required", 400);
  }

  if (typeof body.odometerStartKm !== "number" || body.odometerStartKm <= 0) {
    return apiError(
      "INVALID_PARAMETERS",
      "odometerStartKm must be a number greater than 0",
      400
    );
  }

  try {
    const result = await DriverService.recordDeparture(
      body.tripId,
      auth.driverId,
      body
    );
    return apiSuccess(result);
  } catch (error) {
    return apiError(
      "DEPARTURE_FAILED",
      error instanceof Error ? error.message : "Failed to record departure",
      400
    );
  }
}
