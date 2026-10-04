import { requireDriver } from "@/lib/api/guard";
import { DriverService } from "@/lib/services/driver-service";
import { apiSuccess, apiError } from "@/lib/api/response";
import type { StopFailureInput } from "@/lib/types/driver-api";

/**
 * POST /api/driver/stops/[id]/fail
 * Stop Delivery Failure Exception Form [FORM-DRV-04].
 */
export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const auth = await requireDriver(request);
  if (auth instanceof Response) {
    return auth;
  }

  const { id: stopId } = await props.params;
  if (!stopId) {
    return apiError("INVALID_PARAMETERS", "Missing stopId parameter", 400);
  }

  let body: StopFailureInput;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", "Invalid JSON request body", 400);
  }

  if (!body.reasonCode || body.reasonCode.trim() === "") {
    return apiError("INVALID_PARAMETERS", "reasonCode is required", 400);
  }

  if (!body.driverNotes || body.driverNotes.trim().length < 10) {
    return apiError(
      "INVALID_PARAMETERS",
      "driverNotes is required and must be at least 10 characters",
      400
    );
  }

  try {
    const result = await DriverService.recordStopFailure(
      stopId,
      auth.driverId,
      body
    );
    return apiSuccess(result);
  } catch (error) {
    return apiError(
      "FAILURE_RECORDING_FAILED",
      error instanceof Error ? error.message : "Failed to record stop failure",
      400
    );
  }
}
